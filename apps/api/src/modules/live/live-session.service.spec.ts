import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LiveSessionService } from './live-session.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { LoggerService } from '../logger/logger.service';

describe('LiveSessionService', () => {
  let service: LiveSessionService;
  let prisma: PrismaService;
  let notification: NotificationService;

  const mockPrismaService = {
    liveSession: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    sessionEvent: {
      create: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
    },
  };

  const mockNotificationService = {
    sendToUser: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'LIVEKIT_API_URL':
          return 'https://livekit.example.com';
        case 'LIVEKIT_API_KEY':
          return 'test-api-key';
        case 'LIVEKIT_API_SECRET':
          return 'test-api-secret';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveSessionService,
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

    service = module.get<LiveSessionService>(LiveSessionService);
    prisma = module.get<PrismaService>(PrismaService);
    notification = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createClassroom', () => {
    const mockBooking = {
      id: 'booking-1',
      tutorId: 'tutor-1',
      studentId: 'student-1',
      startTime: new Date(),
      endTime: new Date(),
      tutor: {
        id: 'tutor-1',
        email: 'tutor@example.com',
      },
      student: {
        id: 'student-1',
        email: 'student@example.com',
      },
    };

    const mockSession = {
      id: 'session-1',
      bookingId: 'booking-1',
      roomName: 'class_booking-1',
      status: 'created',
      tutorId: 'tutor-1',
      studentId: 'student-1',
    };

    it('should create a classroom successfully', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.liveSession.create.mockResolvedValue(mockSession);

      const result = await service.createClassroom('booking-1');

      expect(result).toBeDefined();
      expect(result.session).toEqual(mockSession);
      expect(result.tutorToken).toBeDefined();
      expect(result.studentToken).toBeDefined();

      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        include: {
          tutor: true,
          student: true,
        },
      });

      expect(mockNotificationService.sendToUser).toHaveBeenCalledTimes(2);
    });

    it('should throw error if booking not found', async () => {
      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.createClassroom('booking-1')).rejects.toThrow(
        'Booking not found',
      );
    });
  });

  describe('startSession', () => {
    const mockSession = {
      id: 'session-1',
      tutorId: 'tutor-1',
      studentId: 'student-1',
      booking: {
        tutor: { id: 'tutor-1' },
        student: { id: 'student-1' },
      },
    };

    it('should start session successfully', async () => {
      mockPrismaService.liveSession.update.mockResolvedValue(mockSession);

      const result = await service.startSession('session-1');

      expect(result).toEqual(mockSession);
      expect(mockPrismaService.liveSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          status: 'active',
          actualStartTime: expect.any(Date),
        },
        include: {
          booking: {
            include: {
              tutor: true,
              student: true,
            },
          },
        },
      });

      expect(mockNotificationService.sendToUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('endSession', () => {
    const mockSession = {
      id: 'session-1',
      roomName: 'room-1',
      tutorId: 'tutor-1',
      studentId: 'student-1',
      booking: {
        tutor: { id: 'tutor-1' },
        student: { id: 'student-1' },
      },
    };

    it('should end session successfully', async () => {
      mockPrismaService.liveSession.update.mockResolvedValue(mockSession);

      const result = await service.endSession('session-1');

      expect(result).toEqual(mockSession);
      expect(mockPrismaService.liveSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          status: 'completed',
          actualEndTime: expect.any(Date),
        },
        include: {
          booking: {
            include: {
              tutor: true,
              student: true,
            },
          },
        },
      });

      expect(mockNotificationService.sendToUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('logSessionEvent', () => {
    const mockEvent = {
      type: 'chat' as const,
      action: 'message_sent',
      userId: 'user-1',
      metadata: { content: 'Hello' },
    };

    it('should log session event successfully', async () => {
      mockPrismaService.sessionEvent.create.mockResolvedValue({
        id: 'event-1',
        ...mockEvent,
      });

      await service.logSessionEvent('session-1', mockEvent);

      expect(mockPrismaService.sessionEvent.create).toHaveBeenCalledWith({
        data: {
          sessionId: 'session-1',
          ...mockEvent,
        },
      });
    });
  });
});
