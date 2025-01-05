import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WithdrawalService } from './withdrawal.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { LoggerService } from '../logger/logger.service';
import Stripe from 'stripe';

jest.mock('stripe');

describe('WithdrawalService', () => {
  let service: WithdrawalService;
  let prisma: PrismaService;
  let stripe: jest.Mocked<Stripe>;

  const mockPrismaService = {
    stripeTutorAccount: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    withdrawal: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationService = {
    sendToUser: jest.fn(),
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
        WithdrawalService,
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

    service = module.get<WithdrawalService>(WithdrawalService);
    prisma = module.get<PrismaService>(PrismaService);
    stripe = module.get(Stripe) as jest.Mocked<Stripe>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTutorAccount', () => {
    const mockTutor = {
      id: 'tutor-1',
      email: 'tutor@example.com',
      name: 'Test Tutor',
    };

    it('should create tutor account successfully', async () => {
      stripe.accounts.create.mockResolvedValue({
        id: 'acct_123',
        charges_enabled: false,
        payouts_enabled: false,
      } as any);

      const result = await service.createTutorAccount(mockTutor);

      expect(result.stripeAccountId).toBe('acct_123');
      expect(stripe.accounts.create).toHaveBeenCalledWith({
        type: 'express',
        country: 'CN',
        email: mockTutor.email,
        business_type: 'individual',
        capabilities: {
          transfers: { requested: true },
        },
      });

      expect(mockPrismaService.stripeTutorAccount.create).toHaveBeenCalledWith({
        data: {
          tutorId: mockTutor.id,
          stripeAccountId: 'acct_123',
          status: 'pending_verification',
        },
      });
    });
  });

  describe('getAccountLink', () => {
    it('should generate account link successfully', async () => {
      mockPrismaService.stripeTutorAccount.findUnique.mockResolvedValue({
        stripeAccountId: 'acct_123',
      });

      stripe.accountLinks.create.mockResolvedValue({
        url: 'https://stripe.com/setup',
      } as any);

      const result = await service.getAccountLink('tutor-1', 'https://example.com');

      expect(result.url).toBe('https://stripe.com/setup');
      expect(stripe.accountLinks.create).toHaveBeenCalledWith({
        account: 'acct_123',
        refresh_url: 'https://example.com',
        return_url: 'https://example.com',
        type: 'account_onboarding',
      });
    });
  });

  describe('createWithdrawal', () => {
    const mockAccount = {
      tutorId: 'tutor-1',
      stripeAccountId: 'acct_123',
      status: 'verified',
    };

    it('should create withdrawal successfully', async () => {
      mockPrismaService.stripeTutorAccount.findUnique.mockResolvedValue(mockAccount);
      mockPrismaService.withdrawal.create.mockResolvedValue({
        id: 'withdrawal-1',
        amount: 10000,
        status: 'pending',
      });

      stripe.transfers.create.mockResolvedValue({
        id: 'tr_123',
      } as any);

      const result = await service.createWithdrawal('tutor-1', 10000);

      expect(result.id).toBe('withdrawal-1');
      expect(stripe.transfers.create).toHaveBeenCalledWith({
        amount: 10000,
        currency: 'cny',
        destination: 'acct_123',
      });
    });

    it('should throw error if account not verified', async () => {
      mockPrismaService.stripeTutorAccount.findUnique.mockResolvedValue({
        ...mockAccount,
        status: 'pending_verification',
      });

      await expect(service.createWithdrawal('tutor-1', 10000)).rejects.toThrow(
        '您的账户尚未完成验证',
      );
    });
  });

  describe('getEarningStats', () => {
    it('should return earning stats correctly', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([
        { amount: 10000, status: 'completed' },
        { amount: 20000, status: 'completed' },
      ]);

      mockPrismaService.withdrawal.findMany.mockResolvedValue([
        { amount: 5000, status: 'completed' },
        { amount: 10000, status: 'completed' },
      ]);

      const result = await service.getEarningStats('tutor-1');

      expect(result).toEqual({
        totalEarnings: 30000,
        totalWithdrawn: 15000,
        balance: 15000,
        paymentsCount: 2,
        withdrawalsCount: 2,
      });
    });
  });

  describe('handlePayoutWebhook', () => {
    const mockEvent = {
      type: 'payout.paid',
      data: {
        object: {
          id: 'po_123',
          amount: 10000,
          destination: 'acct_123',
        },
      },
    } as Stripe.Event;

    it('should handle successful payout', async () => {
      mockPrismaService.withdrawal.findMany.mockResolvedValue([
        { id: 'withdrawal-1', status: 'pending' },
      ]);

      await service.handlePayoutWebhook(mockEvent);

      expect(mockPrismaService.withdrawal.update).toHaveBeenCalledWith({
        where: { id: 'withdrawal-1' },
        data: {
          status: 'completed',
          completedAt: expect.any(Date),
        },
      });

      expect(mockNotificationService.sendToUser).toHaveBeenCalled();
    });
  });
});
