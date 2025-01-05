import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import Stripe from 'stripe';

jest.mock('stripe');

describe('Withdrawal (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stripe: jest.Mocked<Stripe>;

  const mockUser = {
    id: 'tutor-1',
    email: 'tutor@example.com',
    role: 'tutor',
  };

  const mockAccount = {
    tutorId: mockUser.id,
    stripeAccountId: 'acct_test',
    status: 'verified',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
        getRequest: () => ({ user: mockUser }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    stripe = app.get(Stripe) as jest.Mocked<Stripe>;

    app.setGlobalPrefix('api');
    await app.init();

    // 创建测试数据
    await prisma.stripeTutorAccount.create({
      data: mockAccount,
    });
  });

  afterAll(async () => {
    await prisma.stripeTutorAccount.deleteMany({
      where: { tutorId: mockUser.id },
    });
    await app.close();
  });

  describe('/api/withdrawals/accounts (POST)', () => {
    beforeEach(() => {
      stripe.accounts.create.mockResolvedValue({
        id: 'acct_test_new',
      } as any);
    });

    it('should create a Stripe account', () => {
      return request(app.getHttpServer())
        .post('/api/withdrawals/accounts')
        .expect(201)
        .expect(res => {
          expect(res.body.data).toHaveProperty('stripeAccountId');
          expect(res.body.data.status).toBe('pending_verification');
          expect(stripe.accounts.create).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'express',
              email: mockUser.email,
            }),
          );
        });
    });
  });

  describe('/api/withdrawals/accounts/links (POST)', () => {
    beforeEach(() => {
      stripe.accountLinks.create.mockResolvedValue({
        url: 'https://stripe.com/setup',
      } as any);
    });

    it('should create an account link', () => {
      return request(app.getHttpServer())
        .post('/api/withdrawals/accounts/links')
        .send({ returnUrl: 'https://example.com' })
        .expect(200)
        .expect(res => {
          expect(res.body.data).toHaveProperty('url');
          expect(stripe.accountLinks.create).toHaveBeenCalledWith(
            expect.objectContaining({
              account: mockAccount.stripeAccountId,
              type: 'account_onboarding',
            }),
          );
        });
    });
  });

  describe('/api/withdrawals (POST)', () => {
    beforeEach(() => {
      stripe.transfers.create.mockResolvedValue({
        id: 'tr_test',
      } as any);
    });

    it('should create a withdrawal', () => {
      return request(app.getHttpServer())
        .post('/api/withdrawals')
        .send({ amount: 10000 })
        .expect(201)
        .expect(res => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.status).toBe('pending');
          expect(res.body.data.amount).toBe(10000);
          expect(stripe.transfers.create).toHaveBeenCalledWith(
            expect.objectContaining({
              amount: 10000,
              currency: 'cny',
              destination: mockAccount.stripeAccountId,
            }),
          );
        });
    });

    it('should fail with insufficient balance', () => {
      return request(app.getHttpServer())
        .post('/api/withdrawals')
        .send({ amount: 1000000 })
        .expect(400)
        .expect(res => {
          expect(res.body.message).toBe('余额不足');
        });
    });
  });

  describe('/api/withdrawals/stats (GET)', () => {
    beforeEach(async () => {
      // 创建测试数据
      await prisma.payment.createMany({
        data: [
          {
            id: 'payment-1',
            tutorId: mockUser.id,
            amount: 10000,
            status: 'completed',
          },
          {
            id: 'payment-2',
            tutorId: mockUser.id,
            amount: 20000,
            status: 'completed',
          },
        ],
      });

      await prisma.withdrawal.createMany({
        data: [
          {
            id: 'withdrawal-1',
            tutorId: mockUser.id,
            amount: 5000,
            status: 'completed',
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.payment.deleteMany({
        where: { tutorId: mockUser.id },
      });
      await prisma.withdrawal.deleteMany({
        where: { tutorId: mockUser.id },
      });
    });

    it('should get earning stats', () => {
      return request(app.getHttpServer())
        .get('/api/withdrawals/stats')
        .expect(200)
        .expect(res => {
          expect(res.body.data).toEqual({
            totalEarnings: 30000,
            totalWithdrawn: 5000,
            balance: 25000,
            paymentsCount: 2,
            withdrawalsCount: 1,
          });
        });
    });
  });

  describe('/api/withdrawals/webhook (POST)', () => {
    const mockEvent = {
      type: 'payout.paid',
      data: {
        object: {
          id: 'po_test',
          destination: mockAccount.stripeAccountId,
        },
      },
    } as Stripe.Event;

    beforeEach(() => {
      stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
    });

    it('should handle webhook event', () => {
      return request(app.getHttpServer())
        .post('/api/withdrawals/webhook')
        .set('stripe-signature', 'test_signature')
        .send(mockEvent)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual({ received: true });
        });
    });

    it('should fail with invalid signature', () => {
      stripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      return request(app.getHttpServer())
        .post('/api/withdrawals/webhook')
        .set('stripe-signature', 'invalid_signature')
        .send(mockEvent)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toBe('Invalid signature');
        });
    });
  });
});
