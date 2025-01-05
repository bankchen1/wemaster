import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { LoggerService } from '../logger/logger.service';
import Stripe from 'stripe';

jest.mock('stripe');

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;
  let stripe: jest.Mocked<Stripe>;

  const mockPrismaService = {
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockNotificationService = {
    sendPaymentSuccessNotification: jest.fn(),
    sendPaymentFailureNotification: jest.fn(),
    sendRefundNotification: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'test-secret-key';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
    stripe = module.get(Stripe) as jest.Mocked<Stripe>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    const mockBooking = {
      id: 'booking-1',
      tutorId: 'tutor-1',
      studentId: 'student-1',
      course: {
        id: 'course-1',
        price: 100,
      },
      tutor: {
        id: 'tutor-1',
      },
    };

    it('should create payment intent successfully', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123',
      } as any);

      const result = await service.createPaymentIntent('booking-1', 'student-1');

      expect(result.clientSecret).toBe('secret_123');
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 10000, // $100 in cents
        currency: 'cny',
        metadata: {
          bookingId: 'booking-1',
          userId: 'student-1',
          tutorId: 'tutor-1',
          courseId: 'course-1',
        },
      });
    });

    it('should throw error if booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent('booking-1', 'student-1'),
      ).rejects.toThrow('课程预约不存在');
    });
  });

  describe('handleStripeWebhook', () => {
    const mockPaymentIntent = {
      id: 'pi_123',
      metadata: {
        bookingId: 'booking-1',
      },
    } as Stripe.PaymentIntent;

    const mockPayment = {
      id: 'payment-1',
      bookingId: 'booking-1',
      status: 'pending',
    };

    describe('payment_intent.succeeded', () => {
      it('should handle successful payment', async () => {
        mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
        mockPrismaService.booking.findUnique.mockResolvedValue({
          id: 'booking-1',
          tutor: { id: 'tutor-1' },
          student: { id: 'student-1' },
        });

        await service.handleStripeWebhook({
          type: 'payment_intent.succeeded',
          data: { object: mockPaymentIntent },
        } as Stripe.Event);

        expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment-1' },
          data: {
            status: 'completed',
            completedAt: expect.any(Date),
          },
        });

        expect(mockNotificationService.sendPaymentSuccessNotification).toHaveBeenCalled();
      });
    });

    describe('payment_intent.payment_failed', () => {
      it('should handle failed payment', async () => {
        mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
        mockPrismaService.booking.findUnique.mockResolvedValue({
          id: 'booking-1',
          tutor: { id: 'tutor-1' },
          student: { id: 'student-1' },
        });

        await service.handleStripeWebhook({
          type: 'payment_intent.payment_failed',
          data: {
            object: {
              ...mockPaymentIntent,
              last_payment_error: { message: 'Card declined' },
            },
          },
        } as Stripe.Event);

        expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment-1' },
          data: {
            status: 'failed',
            error: 'Card declined',
          },
        });

        expect(mockNotificationService.sendPaymentFailureNotification).toHaveBeenCalled();
      });
    });
  });

  describe('processRefund', () => {
    const mockPayment = {
      id: 'payment-1',
      bookingId: 'booking-1',
      status: 'completed',
      amount: 10000,
      paymentIntentId: 'pi_123',
    };

    const mockBooking = {
      id: 'booking-1',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      tutor: { id: 'tutor-1' },
      student: { id: 'student-1' },
    };

    it('should process full refund successfully', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      stripe.refunds.create.mockResolvedValue({ id: 're_123' } as any);

      await service.processRefund('booking-1', 'Student requested');

      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 10000,
        metadata: {
          reason: 'Student requested',
          bookingId: 'booking-1',
        },
      });

      expect(mockNotificationService.sendRefundNotification).toHaveBeenCalled();
    });

    it('should throw error if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.processRefund('booking-1', 'Student requested'),
      ).rejects.toThrow('找不到相关支付记录或支付未完成');
    });
  });
});
