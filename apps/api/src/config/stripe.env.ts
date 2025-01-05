import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  publicKey: process.env.STRIPE_PUBLIC_KEY || 'your_stripe_public_key_here',
  secretKey: process.env.STRIPE_SECRET_KEY || 'your_stripe_secret_key_here',
  connect: {
    clientId: process.env.STRIPE_CLIENT_ID || '',
    platformFeePercent: 15, // 平台抽成比例
  },
  payment: {
    defaultCurrency: 'usd',
    minimumAmount: 1000, // 最小支付金额（美分）
    autoConfirm: true,
  },
  payout: {
    minimumAmount: 5000, // 最小提现金额（美分）
    defaultSchedule: 'weekly',
    defaultWeeklyAnchor: 'monday',
  },
  webhook: {
    secret: process.env.STRIPE_WEBHOOK_SECRET || 'your_stripe_webhook_secret_here',
    tolerance: 300, // webhook 时间戳容差（秒）
  },
}));
