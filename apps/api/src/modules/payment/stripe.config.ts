import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  clientId: process.env.STRIPE_CLIENT_ID,
  platformFeePercent: Number(process.env.STRIPE_PLATFORM_FEE_PERCENT || 15),
  autoPayoutEnabled: process.env.STRIPE_AUTO_PAYOUT_ENABLED === 'true',
  payoutSchedule: process.env.STRIPE_PAYOUT_SCHEDULE || 'daily',
  taxFormTypes: {
    US: 'W9',
    INTL: 'W8BEN',
  },
  supportedPayoutMethods: {
    US: ['bank_account', 'card'],
    SG: ['bank_account', 'paynow'],
    GB: ['bank_account', 'bacs'],
    EU: ['bank_account', 'sepa'],
    AU: ['bank_account', 'becs'],
    CA: ['bank_account', 'eft'],
    HK: ['bank_account', 'fps'],
    JP: ['bank_account', 'furikomi'],
    // 添加更多国家/地区的支付方式
  },
  supportedCurrencies: ['usd', 'eur', 'gbp', 'sgd', 'aud', 'cad', 'hkd', 'jpy'],
}));
