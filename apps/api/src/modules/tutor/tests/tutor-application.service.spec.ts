import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TutorApplicationService } from '../tutor-application.service'
import { TutorApplication, ApplicationStatus } from '../tutor-application.entity'
import { NotificationService } from '../../notification/notification.service'
import { LoggerService } from '../../logger/logger.service'
import { CreateTutorApplicationDto } from '../dto/create-tutor-application.dto'
import { ConflictException, NotFoundException } from '@nestjs/common'

describe('TutorApplicationService', () => {
  let service: TutorApplicationService
  let repository: Repository<TutorApplication>
  let notificationService: NotificationService
  let loggerService: LoggerService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn()
    }))
  }

  const mockNotificationService = {
    sendToAdmins: jest.fn(),
    sendToUser: jest.fn()
  }

  const mockLoggerService = {
    info: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorApplicationService,
        {
          provide: getRepositoryToken(TutorApplication),
          useValue: mockRepository
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService
        }
      ]
    }).compile()

    service = module.get<TutorApplicationService>(TutorApplicationService)
    repository = module.get<Repository<TutorApplication>>(
      getRepositoryToken(TutorApplication)
    )
    notificationService = module.get<NotificationService>(NotificationService)
    loggerService = module.get<LoggerService>(LoggerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    const userId = 'test-user-id'
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
          graduationYear: 2020
        }
      ],
      certificates: [],
      experience: [
        {
          title: 'Teacher',
          company: 'Test School',
          startDate: new Date(),
          description: 'Teaching experience'
        }
      ],
      pricing: {
        regular: { price: 100, duration: 60 },
        trial: { price: 50, duration: 30 },
        group: {
          price: 80,
          duration: 60,
          minStudents: 2,
          maxStudents: 6
        }
      },
      availability: {
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '18:00' }
      },
      subjects: ['math', 'physics']
    }

    it('should create a new application successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null)
      const mockApplication = { id: 'test-id', ...mockDto }
      mockRepository.create.mockReturnValue(mockApplication)
      mockRepository.save.mockResolvedValue(mockApplication)

      const result = await service.create(userId, mockDto)

      expect(repository.findOne).toHaveBeenCalled()
      expect(repository.create).toHaveBeenCalledWith({
        userId,
        ...mockDto
      })
      expect(repository.save).toHaveBeenCalledWith(mockApplication)
      expect(notificationService.sendToAdmins).toHaveBeenCalled()
      expect(loggerService.info).toHaveBeenCalled()
      expect(result).toEqual(mockApplication)
    })

    it('should throw ConflictException if user has pending application', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'existing-id' })

      await expect(service.create(userId, mockDto)).rejects.toThrow(
        ConflictException
      )
    })
  })

  describe('findOne', () => {
    it('should return application if found', async () => {
      const mockApplication = { id: 'test-id' }
      mockRepository.findOne.mockResolvedValue(mockApplication)

      const result = await service.findOne('test-id')
      expect(result).toEqual(mockApplication)
    })

    it('should throw NotFoundException if application not found', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.findOne('test-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('review', () => {
    const mockApplication = {
      id: 'test-id',
      userId: 'test-user-id',
      status: ApplicationStatus.PENDING
    }

    it('should update application status and send notification', async () => {
      mockRepository.findOne.mockResolvedValue(mockApplication)
      mockRepository.save.mockResolvedValue({
        ...mockApplication,
        status: ApplicationStatus.APPROVED
      })

      const result = await service.review(
        'test-id',
        'reviewer-id',
        ApplicationStatus.APPROVED,
        'Approved'
      )

      expect(repository.save).toHaveBeenCalled()
      expect(notificationService.sendToUser).toHaveBeenCalled()
      expect(loggerService.info).toHaveBeenCalled()
      expect(result.status).toBe(ApplicationStatus.APPROVED)
    })
  })

  describe('getApplicationStatistics', () => {
    it('should return statistics with all status counts', async () => {
      const mockStats = [
        { status: ApplicationStatus.PENDING, count: '5' },
        { status: ApplicationStatus.APPROVED, count: '3' }
      ]
      mockRepository.createQueryBuilder().getRawMany.mockResolvedValue(mockStats)

      const result = await service.getApplicationStatistics()

      expect(result).toEqual({
        [ApplicationStatus.PENDING]: 5,
        [ApplicationStatus.APPROVED]: 3,
        [ApplicationStatus.REJECTED]: 0
      })
    })
  })
})
