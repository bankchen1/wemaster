import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { LoggerService } from '../logger/logger.service';
import Stripe from 'stripe';

@Injectable()
export class WithdrawalService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  // 创建导师 Stripe 账户
  async createTutorAccount(tutorId: string, country: string) {
    try {
      const tutor = await this.prisma.user.findUnique({
        where: { id: tutorId },
      });

      if (!tutor) {
        throw new BadRequestException('导师不存在');
      }

      // 创建 Stripe Connected Account
      const account = await this.stripe.accounts.create({
        type: 'express',
        country,
        email: tutor.email,
        capabilities: {
          transfers: { requested: true },
        },
      });

      // 保存账户信息
      await this.prisma.stripeTutorAccount.create({
        data: {
          tutorId,
          stripeAccountId: account.id,
          country,
          status: 'pending_verification',
          payoutSchedule: 'weekly',
        },
      });

      // 创建账户链接
      const accountLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${this.configService.get('APP_URL')}/tutor/account/refresh`,
        return_url: `${this.configService.get('APP_URL')}/tutor/account/complete`,
        type: 'account_onboarding',
      });

      return { accountLink: accountLink.url };
    } catch (error) {
      this.logger.error('WithdrawalService', {
        message: 'Failed to create tutor account',
        error,
        tutorId,
      });
      throw error;
    }
  }

  // 获取导师账户状态
  async getTutorAccountStatus(tutorId: string) {
    try {
      const account = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      if (!account) {
        return null;
      }

      const stripeAccount = await this.stripe.accounts.retrieve(account.stripeAccountId);

      return {
        status: account.status,
        payoutSchedule: account.payoutSchedule,
        requirements: stripeAccount.requirements,
        payoutsEnabled: stripeAccount.payouts_enabled,
        chargesEnabled: stripeAccount.charges_enabled,
      };
    } catch (error) {
      this.logger.error('WithdrawalService', {
        message: 'Failed to get tutor account status',
        error,
        tutorId,
      });
      throw error;
    }
  }

  // 更新提现计划
  async updatePayoutSchedule(tutorId: string, schedule: 'daily' | 'weekly' | 'monthly') {
    try {
      const account = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      if (!account) {
        throw new BadRequestException('导师账户不存在');
      }

      await this.stripe.accounts.update(account.stripeAccountId, {
        settings: {
          payouts: {
            schedule: {
              interval: schedule,
            },
          },
        },
      });

      await this.prisma.stripeTutorAccount.update({
        where: { tutorId },
        data: { payoutSchedule: schedule },
      });

      return { success: true };
    } catch (error) {
      this.logger.error('WithdrawalService', {
        message: 'Failed to update payout schedule',
        error,
        tutorId,
      });
      throw error;
    }
  }

  // 创建提现请求
  async createWithdrawal(tutorId: string, amount: number) {
    try {
      const account = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      if (!account) {
        throw new BadRequestException('导师账户不存在');
      }

      if (account.status !== 'verified') {
        throw new BadRequestException('账户尚未验证');
      }

      // 检查可提现余额
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: account.stripeAccountId,
      });

      const availableAmount = balance.available.reduce(
        (sum, b) => sum + (b.currency === 'cny' ? b.amount : 0),
        0,
      );

      if (amount > availableAmount) {
        throw new BadRequestException('可提现余额不足');
      }

      // 创建提现
      const payout = await this.stripe.payouts.create(
        {
          amount,
          currency: 'cny',
        },
        {
          stripeAccount: account.stripeAccountId,
        },
      );

      // 记录提现请求
      const withdrawal = await this.prisma.withdrawal.create({
        data: {
          tutorId,
          amount,
          status: 'pending',
          stripePayoutId: payout.id,
        },
      });

      // 发送通知
      await this.notificationService.sendToUser(tutorId, {
        type: 'WITHDRAWAL_CREATED',
        title: '提现申请已提交',
        message: `您申请提现 ¥${(amount / 100).toFixed(2)} 元，预计 1-3 个工作日到账`,
      });

      return withdrawal;
    } catch (error) {
      this.logger.error('WithdrawalService', {
        message: 'Failed to create withdrawal',
        error,
        tutorId,
      });
      throw error;
    }
  }

  // 处理 Stripe Payout Webhook
  async handlePayoutWebhook(event: Stripe.Event) {
    try {
      const payout = event.data.object as Stripe.Payout;

      const withdrawal = await this.prisma.withdrawal.findUnique({
        where: { stripePayoutId: payout.id },
        include: { tutor: true },
      });

      if (!withdrawal) return;

      switch (event.type) {
        case 'payout.paid':
          await this.prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: { status: 'succeeded' },
          });

          await this.notificationService.sendToUser(withdrawal.tutorId, {
            type: 'WITHDRAWAL_SUCCEEDED',
            title: '提现成功',
            message: `您申请的 ¥${(withdrawal.amount / 100).toFixed(2)} 元提现已到账`,
          });
          break;

        case 'payout.failed':
          await this.prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: { status: 'failed' },
          });

          await this.notificationService.sendToUser(withdrawal.tutorId, {
            type: 'WITHDRAWAL_FAILED',
            title: '提现失败',
            message: `您申请的 ¥${(withdrawal.amount / 100).toFixed(2)} 元提现失败，请检查您的银行账户信息`,
          });
          break;
      }
    } catch (error) {
      this.logger.error('WithdrawalService', {
        message: 'Failed to handle payout webhook',
        error,
        event,
      });
      throw error;
    }
  }

  // 获取提现历史
  async getWithdrawalHistory(tutorId: string) {
    try {
      const withdrawals = await this.prisma.withdrawal.findMany({
        where: { tutorId },
        orderBy: { createdAt: 'desc' },
      });

      return withdrawals.map(w => ({
        ...w,
        amount: w.amount / 100,
      }));
    } catch (error) {
      this.logger.error('WithdrawalService', {
        message: 'Failed to get withdrawal history',
        error,
        tutorId,
      });
      throw error;
    }
  }

  // 获取收入统计
  async getEarningStats(tutorId: string, period: 'week' | 'month' | 'year') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      const payments = await this.prisma.payment.findMany({
        where: {
          tutorId,
          status: 'succeeded',
          createdAt: { gte: startDate },
        },
      });

      const withdrawals = await this.prisma.withdrawal.findMany({
        where: {
          tutorId,
          status: 'succeeded',
          createdAt: { gte: startDate },
        },
      });

      const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

      return {
        totalEarnings: totalEarnings / 100,
        totalWithdrawn: totalWithdrawn / 100,
        balance: (totalEarnings - totalWithdrawn) / 100,
        paymentsCount: payments.length,
        withdrawalsCount: withdrawals.length,
      };
    } catch (error) {
      this.logger.error('WithdrawalService', {
        message: 'Failed to get earning stats',
        error,
        tutorId,
      });
      throw error;
    }
  }
}
