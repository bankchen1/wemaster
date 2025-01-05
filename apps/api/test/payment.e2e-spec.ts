import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import Stripe from 'stripe';

jest.mock('stripe');

describe('Payment (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let stripe: jest.Mocked<Stripe>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'student',
  };

  const mockBooking = {
    id: 'booking-1',
    tutorId: 'tutor-1',
    studentId: mockUser.id,
    price: 10000,
    status: 'pending',
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
    await prisma.booking.create({
      data: mockBooking,
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({
      where: { id: mockBooking.id },
    });
    await app.close();
  });

  describe('/api/payments/intents (POST)', () => {
    beforeEach(() => {
      stripe.paymentIntents.create.mockResolvedValue({
        client_secret: 'test_client_secret',
      } as any);
    });

    it('should create a payment intent', () => {
      return request(app.getHttpServer())
        .post('/api/payments/intents')
        .send({ bookingId: mockBooking.id })
        .expect(201)
        .expect(res => {
          expect(res.body.data).toHaveProperty('clientSecret');
          expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
            expect.objectContaining({
              amount: mockBooking.price,
              currency: 'cny',
              metadata: {
                bookingId: mockBooking.id,
                userId: mockUser.id,
              },
            }),
          );
        });
    });

    it('should fail with invalid booking id', () => {
      return request(app.getHttpServer())
        .post('/api/payments/intents')
        .send({ bookingId: 'invalid-id' })
        .expect(404)
        .expect(res => {
          expect(res.body.message).toBe('Booking not found');
        });
    });
  });

  describe('/api/payments/refunds (POST)', () => {
    const mockPayment = {
      id: 'payment-1',
      bookingId: mockBooking.id,
      amount: mockBooking.price,
      status: 'completed',
      paymentIntentId: 'pi_test',
    };

    beforeEach(async () => {
      await prisma.payment.create({
        data: mockPayment,
      });

      stripe.refunds.create.mockResolvedValue({
        id: 're_test',
        status: 'succeeded',
      } as any);
    });

    afterEach(async () => {
      await prisma.payment.deleteMany({
        where: { id: mockPayment.id },
      });
    });

    it('should create a refund', () => {
      return request(app.getHttpServer())
        .post('/api/payments/refunds')
        .send({
          bookingId: mockBooking.id,
          reason: 'customer_requested',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.status).toBe('pending');
          expect(stripe.refunds.create).toHaveBeenCalledWith(
            expect.objectContaining({
              payment_intent: mockPayment.paymentIntentId,
              amount: mockPayment.amount,
            }),
          );
        });
    });

    it('should fail with invalid booking id', () => {
      return request(app.getHttpServer())
        .post('/api/payments/refunds')
        .send({
          bookingId: 'invalid-id',
          reason: 'customer_requested',
        })
        .expect(404)
        .expect(res => {
          expect(res.body.message).toBe('Payment not found');
        });
    });
  });

  describe('/api/payments/webhook (POST)', () => {
    const mockEvent = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test',
          metadata: {
            bookingId: mockBooking.id,
          },
        },
      },
    } as Stripe.Event;

    beforeEach(() => {
      stripe.webhooks.constructEvent.mockReturnValue(mockEvent);
    });

    it('should handle webhook event', () => {
      return request(app.getHttpServer())
        .post('/api/payments/webhook')
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
        .post('/api/payments/webhook')
        .set('stripe-signature', 'invalid_signature')
        .send(mockEvent)
        .expect(400)
        .expect(res => {
          expect(res.body.message).toBe('Invalid signature');
        });
    });
  });
});
