import { Test, TestingModule } from '@nestjs/testing';
import { TutorApplicationController } from '../tutor-application.controller';
import { TutorApplicationService } from '../tutor-application.service';
import { CreateTutorApplicationDto } from '../dto/create-tutor-application.dto';
import { ApplicationStatus } from '../tutor-application.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { RolesGuard } from '../../auth/roles.guard';

describe('TutorApplicationController', () => {
  let controller: TutorApplicationController;
  let service: TutorApplicationService;

  const mockTutorApplicationService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByUser: jest.fn(),
    review: jest.fn(),
    getPendingApplications: jest.fn(),
    getApplicationStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorApplicationController],
      providers: [
        {
          provide: TutorApplicationService,
          useValue: mockTutorApplicationService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TutorApplicationController>(TutorApplicationController);
    service = module.get<TutorApplicationService>(TutorApplicationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUser = { id: 'test-user-id', role: 'user' };
    const mockDto: CreateTutorApplicationDto = {
      name: 'Test Tutor',
      title: 'Senior Teacher',
      introduction: 'Test introduction',
      languages: ['en', 'zh'],
      education: [
        {
          degree: 'Bachelor',
          school: 'Test University',
          major: 'Education',
          graduationYear: 2020,
        },
      ],
      certificates: [],
      experience: [
        {
          title: 'Teacher',
          company: 'Test School',
          startDate: new Date(),
          description: 'Teaching experience',
        },
      ],
      pricing: {
        regular: { price: 100, duration: 60 },
        trial: { price: 50, duration: 30 },
        group: {
          price: 80,
          duration: 60,
          minStudents: 2,
          maxStudents: 6,
        },
      },
      availability: {
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '18:00' },
      },
      subjects: ['math', 'physics'],
    };

    it('should create application successfully', async () => {
      const mockApplication = { id: 'test-id', ...mockDto };
      mockTutorApplicationService.create.mockResolvedValue(mockApplication);

      const result = await controller.create(mockUser, mockDto);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, mockDto);
      expect(result).toEqual(mockApplication);
    });

    it('should handle validation errors', async () => {
      const invalidDto = { ...mockDto, languages: [] }; // Invalid: empty languages array
      await expect(controller.create(mockUser, invalidDto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    const mockUser = { id: 'test-user-id', role: 'user' };
    const mockApplication = {
      id: 'test-id',
      userId: 'test-user-id',
      status: ApplicationStatus.PENDING,
    };

    it('should return application if user is owner', async () => {
      mockTutorApplicationService.findOne.mockResolvedValue(mockApplication);

      const result = await controller.findOne(mockUser, 'test-id');
      expect(result).toEqual(mockApplication);
    });

    it('should return application if user is admin', async () => {
      const adminUser = { id: 'admin-id', role: 'admin' };
      mockTutorApplicationService.findOne.mockResolvedValue(mockApplication);

      const result = await controller.findOne(adminUser, 'test-id');
      expect(result).toEqual(mockApplication);
    });

    it('should throw ForbiddenException if user is not owner or admin', async () => {
      const otherUser = { id: 'other-id', role: 'user' };
      mockTutorApplicationService.findOne.mockResolvedValue(mockApplication);

      await expect(controller.findOne(otherUser, 'test-id')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if application not found', async () => {
      mockTutorApplicationService.findOne.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.findOne(mockUser, 'test-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('review', () => {
    const mockAdmin = { id: 'admin-id', role: 'admin' };
    const mockReviewDto = {
      status: ApplicationStatus.APPROVED,
      notes: 'Approved',
    };

    it('should allow admin to review application', async () => {
      const mockApplication = {
        id: 'test-id',
        status: ApplicationStatus.APPROVED,
      };
      mockTutorApplicationService.review.mockResolvedValue(mockApplication);

      const result = await controller.review(
        mockAdmin,
        'test-id',
        mockReviewDto,
      );

      expect(service.review).toHaveBeenCalledWith(
        'test-id',
        mockAdmin.id,
        mockReviewDto.status,
        mockReviewDto.notes,
      );
      expect(result).toEqual(mockApplication);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const mockUser = { id: 'user-id', role: 'user' };

      await expect(
        controller.review(mockUser, 'test-id', mockReviewDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getPendingApplications', () => {
    const mockAdmin = { id: 'admin-id', role: 'admin' };

    it('should return pending applications for admin', async () => {
      const mockResult = {
        applications: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockTutorApplicationService.getPendingApplications.mockResolvedValue(
        mockResult,
      );

      const result = await controller.getPendingApplications(mockAdmin, 1, 10);
      expect(result).toEqual(mockResult);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const mockUser = { id: 'user-id', role: 'user' };

      await expect(
        controller.getPendingApplications(mockUser, 1, 10),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getApplicationStatistics', () => {
    const mockAdmin = { id: 'admin-id', role: 'admin' };

    it('should return statistics for admin', async () => {
      const mockStats = {
        [ApplicationStatus.PENDING]: 5,
        [ApplicationStatus.APPROVED]: 3,
        [ApplicationStatus.REJECTED]: 2,
      };
      mockTutorApplicationService.getApplicationStatistics.mockResolvedValue(
        mockStats,
      );

      const result = await controller.getApplicationStatistics(mockAdmin);
      expect(result).toEqual(mockStats);
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const mockUser = { id: 'user-id', role: 'user' };

      await expect(
        controller.getApplicationStatistics(mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
