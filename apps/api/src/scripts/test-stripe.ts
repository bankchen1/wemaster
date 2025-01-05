import Stripe from 'stripe';
import { stripeConfig } from '../config/stripe.env';

async function testStripeConnection() {
  try {
    const stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    // 1. 测试基本连接
    console.log('Testing Stripe connection...');
    const balance = await stripe.balance.retrieve();
    console.log('✅ Connection successful');
    console.log('Current balance:', balance);

    // 2. 测试创建客户
    console.log('\nTesting customer creation...');
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      description: 'Test Customer',
    });
    console.log('✅ Customer created:', customer.id);

    // 3. 测试支付意向
    console.log('\nTesting payment intent creation...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: 'usd',
      customer: customer.id,
      payment_method_types: ['card'],
    });
    console.log('✅ Payment intent created:', paymentIntent.id);

    // 4. 测试 Connect 账户创建
    console.log('\nTesting Connect account creation...');
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: 'test.tutor@example.com',
      capabilities: {
        transfers: { requested: true },
      },
    });
    console.log('✅ Connect account created:', account.id);

    // 5. 测试创建账户链接
    console.log('\nTesting account link creation...');
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://example.com/refresh',
      return_url: 'https://example.com/return',
      type: 'account_onboarding',
    });
    console.log('✅ Account link created:', accountLink.url);

    console.log('\n✅ All tests passed successfully!');
  } catch (err) {
    const error = err as Error;
    console.error('\n❌ Test failed:', error.message);
    if ('type' in error) {
      console.error('Error type:', error.type);
    }
    process.exit(1);
  }
}

// 运行测试
testStripeConnection().catch(console.error);
