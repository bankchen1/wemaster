import {
  Controller,
  Post,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import Stripe from 'stripe';
import { PaymentService } from './payment.service';
import { WithdrawalService } from './withdrawal.service';
import { LoggerService } from '../logger/logger.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly withdrawalService: WithdrawalService,
    private readonly logger: LoggerService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      // 验证 webhook 签名
      const event = this.stripe.webhooks.constructEvent(
        request.rawBody,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );

      this.logger.log('StripeWebhook', {
        type: event.type,
        id: event.id,
      });

      // 根据事件类型处理
      switch (event.type) {
        // 支付相关事件
        case 'payment_intent.succeeded':
        case 'payment_intent.payment_failed':
          await this.paymentService.handleStripeWebhook(event);
          break;

        // 提现相关事件
        case 'payout.paid':
        case 'payout.failed':
          await this.withdrawalService.handlePayoutWebhook(event);
          break;

        // 账户相关事件
        case 'account.updated':
          await this.handleAccountUpdate(event.data.object as Stripe.Account);
          break;

        default:
          this.logger.log('StripeWebhook', {
            message: 'Unhandled event type',
            type: event.type,
          });
      }

      return { received: true };
    } catch (error) {
      this.logger.error('StripeWebhook', {
        message: 'Failed to handle webhook',
        error,
      });
      throw error;
    }
  }

  // 处理账户更新事件
  private async handleAccountUpdate(account: Stripe.Account) {
    try {
      const tutorAccount = await this.prisma.stripeTutorAccount.findUnique({
        where: { stripeAccountId: account.id },
      });

      if (!tutorAccount) return;

      // 更新账户状态
      let status: string;
      if (account.charges_enabled && account.payouts_enabled) {
        status = 'verified';
      } else if (account.requirements?.currently_due?.length > 0) {
        status = 'pending_verification';
      } else {
        status = 'rejected';
      }

      await this.prisma.stripeTutorAccount.update({
        where: { stripeAccountId: account.id },
        data: { status },
      });

      // 发送通知
      if (status === 'verified') {
        await this.notificationService.sendToUser(tutorAccount.tutorId, {
          type: 'ACCOUNT_VERIFIED',
          title: '账户验证成功',
          message: '您的提现账户已验证成功，现在可以申请提现了',
        });
      } else if (status === 'rejected') {
        await this.notificationService.sendToUser(tutorAccount.tutorId, {
          type: 'ACCOUNT_REJECTED',
          title: '账户验证失败',
          message: '您的提现账户验证失败，请检查并更新您的账户信息',
        });
      }
    } catch (error) {
      this.logger.error('StripeWebhook', {
        message: 'Failed to handle account update',
        error,
        accountId: account.id,
      });
      throw error;
    }
  }
}
