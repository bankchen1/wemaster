export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  livekit: {
    apiUrl: process.env.LIVEKIT_API_URL,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
  },
  stripe: {
    publicKey: process.env.STRIPE_PUBLIC_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    platformFee: 0.15, // 15% 平台费用
  },
  app: {
    url: process.env.APP_URL,
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
  },
});
