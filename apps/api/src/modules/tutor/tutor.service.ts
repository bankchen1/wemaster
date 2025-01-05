import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, SelectQueryBuilder } from 'typeorm'
import { Tutor } from './tutor.entity'
import { Course } from '../course/course.entity'
import { Schedule } from '../schedule/schedule.entity'
import { CreateTutorDto, UpdateTutorDto, TutorSearchParams, TutorSearchFilters } from './tutor.dto'
import { FileService } from '../file/file.service'
import { NotificationService } from '../notification/notification.service'
import { RedisService } from '../redis/redis.service'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class TutorService {
  constructor(
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private fileService: FileService,
    private notificationService: NotificationService,
    private redisService: RedisService,
    private loggerService: LoggerService
  ) {}

  private createSearchQueryBuilder(filters: TutorSearchFilters): SelectQueryBuilder<Tutor> {
    const queryBuilder = this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.subjects', 'subjects')
      .leftJoinAndSelect('tutor.courses', 'courses')
      .leftJoinAndSelect('tutor.schedule', 'schedule')
      .leftJoinAndSelect('tutor.reviews', 'reviews')

    // 科目筛选
    if (filters.subjects?.length) {
      queryBuilder.andWhere('subjects.id IN (:...subjectIds)', {
        subjectIds: filters.subjects
      })
    }

    // 教学语言筛选
    if (filters.teachingLanguages?.length) {
      queryBuilder.andWhere('tutor.teachingLanguages && ARRAY[:...languages]', {
        languages: filters.teachingLanguages
      })
    }

    // 学历筛选
    if (filters.degree?.length) {
      queryBuilder.andWhere('tutor.degree IN (:...degrees)', {
        degrees: filters.degree
      })
    }

    // 学生水平筛选
    if (filters.studentLevels?.length) {
      queryBuilder.andWhere('tutor.studentLevels && ARRAY[:...levels]', {
        levels: filters.studentLevels
      })
    }

    // 价格区间筛选
    if (filters.priceRange) {
      queryBuilder
        .andWhere('tutor.hourlyRate >= :minPrice', {
          minPrice: filters.priceRange.min
        })
        .andWhere('tutor.hourlyRate <= :maxPrice', {
          maxPrice: filters.priceRange.max
        })
    }

    // 可用时间筛选
    if (filters.availability?.daysOfWeek?.length) {
      queryBuilder
        .andWhere('schedule.dayOfWeek IN (:...days)', {
          days: filters.availability.daysOfWeek
        })
        .andWhere('schedule.isAvailable = true')

      if (filters.availability.timeRange) {
        queryBuilder
          .andWhere('schedule.startTime >= :startTime', {
            startTime: filters.availability.timeRange.startTime
          })
          .andWhere('schedule.endTime <= :endTime', {
            endTime: filters.availability.timeRange.endTime
          })
      }
    }

    // 年龄区间筛选
    if (filters.ageRange) {
      const currentYear = new Date().getFullYear()
      queryBuilder
        .andWhere('EXTRACT(YEAR FROM tutor.dateOfBirth) <= :maxBirthYear', {
          maxBirthYear: currentYear - filters.ageRange.min
        })
        .andWhere('EXTRACT(YEAR FROM tutor.dateOfBirth) >= :minBirthYear', {
          minBirthYear: currentYear - filters.ageRange.max
        })
    }

    // 评分筛选
    if (filters.rating) {
      queryBuilder.andWhere('tutor.averageRating >= :rating', {
        rating: filters.rating
      })
    }

    // 视频课程筛选
    if (filters.hasVideo !== undefined) {
      queryBuilder.andWhere('tutor.hasVideo = :hasVideo', {
        hasVideo: filters.hasVideo
      })
    }

    // 在线状态筛选
    if (filters.isOnline !== undefined) {
      queryBuilder.andWhere('tutor.isOnline = :isOnline', {
        isOnline: filters.isOnline
      })
    }

    // 国家筛选
    if (filters.country) {
      queryBuilder.andWhere('tutor.country = :country', {
        country: filters.country
      })
    }

    // 时区筛选
    if (filters.timezone) {
      queryBuilder.andWhere('tutor.timezone = :timezone', {
        timezone: filters.timezone
      })
    }

    return queryBuilder
  }

  async create(createTutorDto: CreateTutorDto) {
    const tutor = this.tutorRepository.create(createTutorDto)
    await this.tutorRepository.save(tutor)
    
    // 发送欢迎通知
    await this.notificationService.sendWelcomeNotification(tutor)
    
    return tutor
  }

  async findAll(params: TutorSearchParams) {
    const { subjects, languages, rating, price, availability, page = 1, limit = 10 } = params
    
    const queryBuilder = this.tutorRepository.createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.subjects', 'subject')
      .leftJoinAndSelect('tutor.reviews', 'review')

    if (subjects?.length) {
      queryBuilder.andWhere('subject.id IN (:...subjects)', { subjects })
    }

    if (languages?.length) {
      queryBuilder.andWhere('tutor.languages && ARRAY[:...languages]', { languages })
    }

    if (rating) {
      queryBuilder.andWhere('tutor.teachingStats.averageRating >= :rating', { rating })
    }

    if (price) {
      queryBuilder.andWhere('tutor.pricing.regular.price <= :price', { price })
    }

    if (availability) {
      queryBuilder.andWhere('tutor.availability.workingDays @> :days', {
        days: availability.days
      })
    }

    const [tutors, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      tutors,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async searchTutors(
    filters: TutorSearchFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<{ tutors: Tutor[]; total: number }> {
    const queryBuilder = this.createSearchQueryBuilder(filters)

    const [tutors, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { tutors, total }
  }

  async findOne(id: string) {
    const tutor = await this.tutorRepository.findOne({
      where: { id },
      relations: ['subjects', 'courses', 'reviews']
    })

    if (!tutor) {
      throw new NotFoundException('导师不存在')
    }

    return tutor
  }

  async update(id: string, updateTutorDto: UpdateTutorDto) {
    const tutor = await this.findOne(id)
    Object.assign(tutor, updateTutorDto)
    return this.tutorRepository.save(tutor)
  }

  async updateAvailability(id: string, availability: any) {
    const tutor = await this.findOne(id)
    tutor.availability = availability
    return this.tutorRepository.save(tutor)
  }

  async uploadGallery(id: string, files: Express.Multer.File[]) {
    const tutor = await this.findOne(id)
    
    const gallery = await Promise.all(
      files.map(async file => {
        const url = await this.fileService.uploadFile(file, 'gallery')
        return {
          type: file.mimetype.startsWith('image/') ? 'image' : 'video',
          url,
          thumbnail: file.mimetype.startsWith('video/') 
            ? await this.fileService.generateThumbnail(url)
            : undefined
        }
      })
    )

    tutor.gallery = [...tutor.gallery, ...gallery]
    return this.tutorRepository.save(tutor)
  }

  async getSchedule(id: string, startDate: Date, endDate: Date) {
    const schedules = await this.scheduleRepository.find({
      where: {
        tutor: { id },
        startTime: Between(startDate, endDate)
      },
      relations: ['course', 'student']
    })

    return schedules
  }

  async getEarnings(id: string, period: 'week' | 'month' | 'year') {
    const tutor = await this.findOne(id)
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    const schedules = await this.scheduleRepository.find({
      where: {
        tutor: { id },
        status: 'completed',
        startTime: Between(startDate, new Date())
      },
      relations: ['payment']
    })

    const earnings = schedules.reduce((acc, schedule) => {
      return acc + schedule.payment.amount
    }, 0)

    const stats = {
      total: earnings,
      period,
      completedClasses: schedules.length,
      averagePerClass: earnings / schedules.length || 0
    }

    return stats
  }

  async getReviews(id: string, page = 1, limit = 10) {
    const [reviews, total] = await this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.reviews', 'review')
      .leftJoinAndSelect('review.student', 'student')
      .where('tutor.id = :id', { id })
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      reviews: reviews[0]?.reviews || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getPopularTutors(limit: number = 10): Promise<Tutor[]> {
    const cacheKey = `popular-tutors:${limit}`
    const cached = await this.redisService.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    const tutors = await this.tutorRepository
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.reviews', 'reviews')
      .addSelect('COUNT(reviews.id)', 'reviewCount')
      .addSelect('AVG(reviews.rating)', 'averageRating')
      .groupBy('tutor.id')
      .orderBy('averageRating', 'DESC')
      .addOrderBy('reviewCount', 'DESC')
      .take(limit)
      .getMany()

    await this.redisService.set(
      cacheKey,
      JSON.stringify(tutors),
      60 * 60 // 1小时缓存
    )

    return tutors
  }

  async getRecommendedTutors(
    userId: string,
    limit: number = 10
  ): Promise<Tutor[]> {
    // 基于用户历史行为和偏好的推荐算法
    // TODO: 实现推荐逻辑
    return this.getPopularTutors(limit)
  }

  async getTutorsBySubject(
    subjectId: string,
    filters: Partial<TutorSearchFilters> = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ tutors: Tutor[]; total: number }> {
    const queryBuilder = this.createSearchQueryBuilder({
      ...filters,
      subjects: [subjectId]
    })

    const [tutors, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { tutors, total }
  }

  async getTutorAvailability(
    tutorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId },
      relations: ['schedule']
    })

    if (!tutor) {
      throw new NotFoundException('Tutor not found')
    }

    return tutor.schedule.filter(slot => 
      slot.startTime >= startDate && slot.endTime <= endDate
    )
  }
}
