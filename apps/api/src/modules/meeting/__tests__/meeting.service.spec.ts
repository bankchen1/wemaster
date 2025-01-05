import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { MeetingService } from '../meeting.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { createMock } from '@golevelup/ts-jest';

describe('MeetingService', () => {
  let service: MeetingService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let cacheService: RedisCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        {
          provide: PrismaService,
          useValue: createMock<PrismaService>({
            meeting: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            meetingParticipant: {
              create: jest.fn(),
            },
            meetingMessage: {
              create: jest.fn(),
            },
          }),
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>({
            sign: jest.fn().mockReturnValue('mock-token'),
          }),
        },
        {
          provide: RedisCacheService,
          useValue: createMock<RedisCacheService>({
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<MeetingService>(MeetingService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    cacheService = module.get<RedisCacheService>(RedisCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMeeting', () => {
    const mockUserId = 'user-1';
    const mockMeetingData = {
      title: 'Test Meeting',
      description: 'Test Description',
      startTime: new Date(),
      duration: 60,
    };

    it('should create a meeting successfully', async () => {
      const mockMeeting = {
        id: 'meeting-1',
        hostId: mockUserId,
        matrixRoomId: 'room-1',
        status: 'scheduled',
        ...mockMeetingData,
      };

      (prismaService.meeting.create as jest.Mock).mockResolvedValue(mockMeeting);

      const result = await service.createMeeting(mockUserId, mockMeetingData);

      expect(result).toHaveProperty('meetingId');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('matrixRoomId');
      expect(prismaService.meeting.create).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should handle errors during meeting creation', async () => {
      (prismaService.meeting.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(service.createMeeting(mockUserId, mockMeetingData)).rejects.toThrow();
    });
  });

  describe('joinMeeting', () => {
    const mockUserId = 'user-1';
    const mockMeetingId = 'meeting-1';

    it('should allow user to join meeting', async () => {
      const mockMeeting = {
        id: mockMeetingId,
        hostId: 'host-1',
        matrixRoomId: 'room-1',
        status: 'scheduled',
      };

      (prismaService.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);

      const result = await service.joinMeeting(mockUserId, mockMeetingId);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('matrixRoomId');
      expect(prismaService.meetingParticipant.create).toHaveBeenCalled();
    });

    it('should handle non-existent meeting', async () => {
      (prismaService.meeting.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.joinMeeting(mockUserId, mockMeetingId)).rejects.toThrow('Meeting not found');
    });
  });

  describe('endMeeting', () => {
    const mockUserId = 'user-1';
    const mockMeetingId = 'meeting-1';

    it('should end meeting successfully', async () => {
      const mockMeeting = {
        id: mockMeetingId,
        hostId: mockUserId,
        matrixRoomId: 'room-1',
        status: 'scheduled',
      };

      (prismaService.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prismaService.meeting.update as jest.Mock).mockResolvedValue({ ...mockMeeting, status: 'ended' });

      const result = await service.endMeeting(mockUserId, mockMeetingId);

      expect(result).toEqual({ success: true });
      expect(prismaService.meeting.update).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should prevent non-host from ending meeting', async () => {
      const mockMeeting = {
        id: mockMeetingId,
        hostId: 'different-user',
        matrixRoomId: 'room-1',
        status: 'scheduled',
      };

      (prismaService.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);

      await expect(service.endMeeting(mockUserId, mockMeetingId)).rejects.toThrow('Unauthorized');
    });
  });

  describe('saveMeetingMessage', () => {
    const mockMeetingId = 'meeting-1';
    const mockMessage = {
      sender: 'user-1',
      content: 'Test message',
      type: 'text',
      timestamp: new Date(),
    };

    it('should save message successfully', async () => {
      await service.saveMeetingMessage(mockMeetingId, mockMessage);

      expect(prismaService.meetingMessage.create).toHaveBeenCalledWith({
        data: {
          meetingId: mockMeetingId,
          senderId: mockMessage.sender,
          content: mockMessage.content,
          type: mockMessage.type,
          timestamp: expect.any(Date),
        },
      });
    });
  });
});
