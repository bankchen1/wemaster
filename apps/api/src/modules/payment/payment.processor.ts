import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentProcessor {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    this.stripe = new Stripe(configService.get('stripe.secretKey'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  // 处理导师账户设置
  async setupTutorAccount({
    tutorId,
    accountDetails,
    bankAccount,
  }: {
    tutorId: string;
    accountDetails: {
      type: 'individual' | 'company';
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      taxId?: string;
      ssnLast4?: string;
      address: {
        line1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
    };
    bankAccount: {
      accountNumber: string;
      routingNumber: string;
      accountHolderName: string;
    };
  }) {
    try {
      // 1. 创建或更新 Connect 账户
      const account = await this.stripe.accounts.create({
        type: 'custom',
        country: accountDetails.address.country,
        business_type: accountDetails.type,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        individual: {
          first_name: accountDetails.firstName,
          last_name: accountDetails.lastName,
          dob: {
            day: parseInt(accountDetails.dateOfBirth.split('-')[2]),
            month: parseInt(accountDetails.dateOfBirth.split('-')[1]),
            year: parseInt(accountDetails.dateOfBirth.split('-')[0]),
          },
          address: {
            line1: accountDetails.address.line1,
            city: accountDetails.address.city,
            state: accountDetails.address.state,
            postal_code: accountDetails.address.postal_code,
            country: accountDetails.address.country,
          },
          ssn_last_4: accountDetails.ssnLast4,
          tax_id: accountDetails.taxId,
        },
        business_profile: {
          mcc: '8299', // 教育服务
          url: `${this.configService.get('APP_URL')}/tutors/${tutorId}`,
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'weekly',
              weekly_anchor: 'monday',
            },
          },
        },
        metadata: { tutorId },
      });

      // 2. 添加银行账户
      await this.stripe.accounts.createExternalAccount(account.id, {
        external_account: {
          object: 'bank_account',
          country: accountDetails.address.country,
          currency: 'usd',
          account_number: bankAccount.accountNumber,
          routing_number: bankAccount.routingNumber,
          account_holder_name: bankAccount.accountHolderName,
          account_holder_type: accountDetails.type,
        },
      });

      // 3. 更新数据库
      await this.prisma.stripeTutorAccount.create({
        data: {
          tutorId,
          stripeAccountId: account.id,
          country: accountDetails.address.country,
          payoutSchedule: 'weekly',
          status: 'pending_verification',
        },
      });

      // 4. 发送通知
      await this.notificationService.sendToUser(tutorId, {
        type: 'ACCOUNT_SETUP',
        title: '账户设置完成',
        message: '您的收款账户已设置完成，我们将在1-2个工作日内完成验证',
      });

      return account;
    } catch (error) {
      this.logger.error('Failed to setup tutor account', error);
      throw error;
    }
  }

  // 处理学生支付
  async processPayment({
    studentId,
    tutorId,
    bookingId,
    amount,
    paymentMethod,
  }: {
    studentId: string;
    tutorId: string;
    bookingId: string;
    amount: number;
    paymentMethod: {
      type: 'card';
      card: {
        number: string;
        expMonth: number;
        expYear: number;
        cvc: string;
      };
    };
  }) {
    try {
      // 1. 获取或创建客户
      const customer = await this.getOrCreateCustomer(studentId);

      // 2. 创建支付方式
      const paymentMethodId = await this.createPaymentMethod(paymentMethod);

      // 3. 关联支付方式到客户
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // 4. 获取导师账户
      const tutorAccount = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      if (!tutorAccount) {
        throw new Error('Tutor account not found');
      }

      // 5. 创建支付意向
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customer.id,
        payment_method: paymentMethodId,
        confirm: true,
        transfer_data: {
          destination: tutorAccount.stripeAccountId,
        },
        metadata: {
          bookingId,
          studentId,
          tutorId,
        },
      });

      // 6. 更新数据库
      await this.prisma.payment.create({
        data: {
          bookingId,
          studentId,
          tutorId,
          amount,
          status: paymentIntent.status,
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      // 7. 发送通知
      if (paymentIntent.status === 'succeeded') {
        await this.notificationService.sendToUser(tutorId, {
          type: 'PAYMENT_RECEIVED',
          title: '收到新付款',
          message: `您收到了一笔 $${(amount / 100).toFixed(2)} 的付款`,
        });
      }

      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to process payment', error);
      throw error;
    }
  }

  // 处理提现请求
  async processWithdrawal({
    tutorId,
    amount,
  }: {
    tutorId: string;
    amount: number;
  }) {
    try {
      const tutorAccount = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      if (!tutorAccount) {
        throw new Error('Tutor account not found');
      }

      // 1. 获取可用余额
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: tutorAccount.stripeAccountId,
      });

      const availableAmount = balance.available[0]?.amount || 0;
      if (amount > availableAmount) {
        throw new Error('Insufficient funds');
      }

      // 2. 创建提现
      const payout = await this.stripe.payouts.create(
        {
          amount,
          currency: 'usd',
        },
        {
          stripeAccount: tutorAccount.stripeAccountId,
        }
      );

      // 3. 更新数据库
      await this.prisma.withdrawal.create({
        data: {
          tutorId,
          amount,
          status: payout.status,
          stripePayoutId: payout.id,
        },
      });

      // 4. 发送通知
      await this.notificationService.sendToUser(tutorId, {
        type: 'WITHDRAWAL_INITIATED',
        title: '提现申请已提交',
        message: `您的 $${(amount / 100).toFixed(2)} 提现申请已提交，资金将在1-3个工作日内到账`,
      });

      return payout;
    } catch (error) {
      this.logger.error('Failed to process withdrawal', error);
      throw error;
    }
  }

  // 获取或创建客户
  private async getOrCreateCustomer(userId: string) {
    const existingCustomer = await this.prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      return this.stripe.customers.retrieve(existingCustomer.stripeCustomerId);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: { userId },
    });

    await this.prisma.stripeCustomer.create({
      data: {
        userId,
        stripeCustomerId: customer.id,
      },
    });

    return customer;
  }

  // 创建支付方式
  private async createPaymentMethod(paymentMethod: {
    type: 'card';
    card: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
    };
  }) {
    const { id } = await this.stripe.paymentMethods.create({
      type: paymentMethod.type,
      card: {
        number: paymentMethod.card.number,
        exp_month: paymentMethod.card.expMonth,
        exp_year: paymentMethod.card.expYear,
        cvc: paymentMethod.card.cvc,
      },
    });

    return id;
  }
}
