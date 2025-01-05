import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  // 创建支付意向
  async createPaymentIntent({
    amount,
    currency = 'usd',
    customerId,
    paymentMethodTypes = ['card'],
    metadata = {},
  }: {
    amount: number;
    currency?: string;
    customerId: string;
    paymentMethodTypes?: Stripe.PaymentIntentCreateParams.PaymentMethodType[];
    metadata?: Record<string, string>;
  }) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        payment_method_types: paymentMethodTypes,
        metadata,
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      throw error;
    }
  }

  // 创建或获取客户
  async getOrCreateCustomer(userId: string, email: string) {
    try {
      // 查找现有客户
      const existingCustomer = await this.prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (existingCustomer) {
        return existingCustomer.stripeCustomerId;
      }

      // 创建新客户
      const customer = await this.stripe.customers.create({
        email,
        metadata: { userId },
      });

      // 保存客户信息
      await this.prisma.stripeCustomer.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
        },
      });

      return customer.id;
    } catch (error) {
      this.logger.error('Failed to get or create customer', error);
      throw error;
    }
  }

  // 创建 Connect 账户（用于导师提现）
  async createConnectAccount(tutorId: string, email: string, country: string) {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        metadata: { tutorId },
      });

      // 保存账户信息
      await this.prisma.stripeTutorAccount.create({
        data: {
          tutorId,
          stripeAccountId: account.id,
        },
      });

      // 创建账户链接
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${this.configService.get('APP_URL')}/tutor/stripe/refresh`,
        return_url: `${this.configService.get('APP_URL')}/tutor/stripe/return`,
        type: 'account_onboarding',
      });

      return accountLink;
    } catch (error) {
      this.logger.error('Failed to create connect account', error);
      throw error;
    }
  }

  // 处理导师提现
  async createTransfer({
    amount,
    tutorId,
    currency = 'usd',
    metadata = {},
  }: {
    amount: number;
    tutorId: string;
    currency?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const tutorAccount = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      if (!tutorAccount) {
        throw new Error('Tutor stripe account not found');
      }

      const transfer = await this.stripe.transfers.create({
        amount,
        currency,
        destination: tutorAccount.stripeAccountId,
        metadata,
      });

      return transfer;
    } catch (error) {
      this.logger.error('Failed to create transfer', error);
      throw error;
    }
  }

  // 处理支付成功回调
  async handlePaymentSuccess(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { metadata } = paymentIntent;

    try {
      // 更新订单状态
      await this.prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: { status: 'succeeded' },
      });

      // 如果是课程预约，更新预约状态
      if (metadata.bookingId) {
        await this.prisma.booking.update({
          where: { id: metadata.bookingId },
          data: { status: 'confirmed' },
        });

        // 发送通知
        await this.notificationService.sendToUser(metadata.tutorId, {
          type: 'BOOKING_PAID',
          title: '新预约',
          message: '您有一个新的付费预约，请及时确认',
        });
      }
    } catch (error) {
      this.logger.error('Failed to handle payment success', error);
      throw error;
    }
  }

  // 处理退款
  async createRefund(paymentIntentId: string, amount?: number) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
      });

      return refund;
    } catch (error) {
      this.logger.error('Failed to create refund', error);
      throw error;
    }
  }

  // 获取账户余额
  async getAccountBalance(tutorId: string) {
    try {
      const tutorAccount = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      if (!tutorAccount) {
        throw new Error('Tutor stripe account not found');
      }

      const balance = await this.stripe.balance.retrieve({
        stripeAccount: tutorAccount.stripeAccountId,
      });

      return balance;
    } catch (error) {
      this.logger.error('Failed to get account balance', error);
      throw error;
    }
  }

  // 处理支付方式
  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // 设为默认支付方式
      await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      this.logger.error('Failed to attach payment method', error);
      throw error;
    }
  }

  // 获取支付方式列表
  async listPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      this.logger.error('Failed to list payment methods', error);
      throw error;
    }
  }
}
