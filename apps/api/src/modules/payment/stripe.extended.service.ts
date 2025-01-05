import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeExtendedService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeExtendedService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(configService.get('stripe.secretKey'), {
      apiVersion: '2023-10-16',
    });
  }

  // 创建或更新 Connect 账户
  async createOrUpdateConnectAccount({
    tutorId,
    email,
    country,
    businessType = 'individual',
    payoutSchedule,
    taxInfo,
  }: {
    tutorId: string;
    email: string;
    country: string;
    businessType?: 'individual' | 'company';
    payoutSchedule?: {
      interval: 'manual' | 'daily' | 'weekly' | 'monthly';
      weeklyAnchor?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
      monthlyAnchor?: number;
    };
    taxInfo?: {
      type: 'W9' | 'W8BEN';
      taxId?: string;
      ssnLast4?: string;
    };
  }) {
    try {
      const existingAccount = await this.prisma.stripeTutorAccount.findUnique({
        where: { tutorId },
      });

      let stripeAccount: Stripe.Account;

      if (existingAccount) {
        // 更新现有账户
        stripeAccount = await this.stripe.accounts.update(
          existingAccount.stripeAccountId,
          {
            email,
            business_type: businessType,
            settings: {
              payouts: {
                schedule: {
                  interval: payoutSchedule?.interval || 'daily',
                  weekly_anchor: payoutSchedule?.weeklyAnchor,
                  monthly_anchor: payoutSchedule?.monthlyAnchor,
                },
              },
            },
          }
        );
      } else {
        // 创建新账户
        stripeAccount = await this.stripe.accounts.create({
          type: 'express',
          country,
          email,
          business_type: businessType,
          capabilities: {
            transfers: { requested: true },
            tax_reporting_us_1099_k: { requested: true },
          },
          settings: {
            payouts: {
              schedule: {
                interval: payoutSchedule?.interval || 'daily',
                weekly_anchor: payoutSchedule?.weeklyAnchor,
                monthly_anchor: payoutSchedule?.monthlyAnchor,
              },
            },
          },
          metadata: { tutorId },
        });

        // 保存账户信息
        await this.prisma.stripeTutorAccount.create({
          data: {
            tutorId,
            stripeAccountId: stripeAccount.id,
            country,
            payoutSchedule: payoutSchedule?.interval || 'daily',
          },
        });
      }

      // 如果提供了税务信息，更新税务设置
      if (taxInfo) {
        await this.updateTaxInfo(stripeAccount.id, taxInfo);
      }

      return stripeAccount;
    } catch (error) {
      this.logger.error('Failed to create or update connect account', error);
      throw error;
    }
  }

  // 更新税务信息
  private async updateTaxInfo(
    accountId: string,
    taxInfo: {
      type: 'W9' | 'W8BEN';
      taxId?: string;
      ssnLast4?: string;
    }
  ) {
    try {
      const account = await this.stripe.accounts.update(accountId, {
        tax_info: {
          type: taxInfo.type === 'W9' ? 'us' : 'non_us',
          tax_id: taxInfo.taxId,
        },
        individual: taxInfo.ssnLast4
          ? {
              ssn_last_4: taxInfo.ssnLast4,
            }
          : undefined,
      });

      return account;
    } catch (error) {
      this.logger.error('Failed to update tax info', error);
      throw error;
    }
  }

  // 获取 1099-K 表格
  async get1099KForm(accountId: string, year: number) {
    try {
      const reportingForms = await this.stripe.reporting.reportRuns.create({
        report_type: '1099_k',
        parameters: {
          interval_start: new Date(`${year}-01-01`).getTime() / 1000,
          interval_end: new Date(`${year}-12-31`).getTime() / 1000,
          connected_account: accountId,
        },
      });

      return reportingForms;
    } catch (error) {
      this.logger.error('Failed to get 1099-K form', error);
      throw error;
    }
  }

  // 设置自动提现
  async configureAutoPayout(accountId: string, enabled: boolean, schedule?: {
    interval: 'daily' | 'weekly' | 'monthly';
    weeklyAnchor?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    monthlyAnchor?: number;
  }) {
    try {
      const account = await this.stripe.accounts.update(accountId, {
        settings: {
          payouts: {
            schedule: enabled
              ? {
                  interval: schedule?.interval || 'daily',
                  weekly_anchor: schedule?.weeklyAnchor,
                  monthly_anchor: schedule?.monthlyAnchor,
                }
              : { interval: 'manual' },
          },
        },
      });

      return account;
    } catch (error) {
      this.logger.error('Failed to configure auto payout', error);
      throw error;
    }
  }

  // 获取支持的提现方式
  async getSupportedPayoutMethods(country: string) {
    const supportedMethods = this.configService.get(
      `stripe.supportedPayoutMethods.${country}`
    ) || ['bank_account'];

    return supportedMethods;
  }

  // 添加提现方式
  async addPayoutMethod(accountId: string, {
    type,
    bankAccount,
  }: {
    type: 'bank_account' | 'card';
    bankAccount?: {
      country: string;
      currency: string;
      accountNumber: string;
      routingNumber?: string;
      accountHolderName: string;
      accountHolderType: 'individual' | 'company';
    };
  }) {
    try {
      if (type === 'bank_account' && bankAccount) {
        const externalAccount = await this.stripe.accounts.createExternalAccount(
          accountId,
          {
            external_account: {
              object: 'bank_account',
              country: bankAccount.country,
              currency: bankAccount.currency,
              account_number: bankAccount.accountNumber,
              routing_number: bankAccount.routingNumber,
              account_holder_name: bankAccount.accountHolderName,
              account_holder_type: bankAccount.accountHolderType,
            },
          }
        );

        return externalAccount;
      }

      throw new Error('Unsupported payout method type');
    } catch (error) {
      this.logger.error('Failed to add payout method', error);
      throw error;
    }
  }

  // 获取账户状态和合规要求
  async getAccountRequirements(accountId: string) {
    try {
      const account = await this.stripe.accounts.retrieve(accountId);
      return {
        requirements: account.requirements,
        payouts_enabled: account.payouts_enabled,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
      };
    } catch (error) {
      this.logger.error('Failed to get account requirements', error);
      throw error;
    }
  }
}
