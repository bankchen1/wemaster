import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { Course } from './course.entity'
import { Tutor } from '../tutor/tutor.entity'
import { Schedule } from '../schedule/schedule.entity'
import { CreateCourseDto, UpdateCourseDto } from './course.dto'
import { FileService } from '../file/file.service'
import { PricingService } from '../pricing/pricing.service'
import { CalculatePriceDto, UpdatePriceDto } from './dto/course-price.dto'
import { CourseType } from '@wemaster/shared/types/pricing'

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private fileService: FileService,
    private pricingService: PricingService
  ) {}

  async create(tutorId: string, createCourseDto: CreateCourseDto) {
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId }
    })

    if (!tutor) {
      throw new NotFoundException('导师不存在')
    }

    // 计算课程价格
    const { basePrice, courseType, lessonsCount } = createCourseDto
    const priceInfo = this.pricingService.calculateCoursePrice(basePrice)

    const course = this.courseRepository.create({
      ...createCourseDto,
      tutor,
      basePrice: priceInfo.basePrice,
      platformFee: priceInfo.platformFee,
      displayPrice: priceInfo.totalPrice,
      lessonsCount: courseType === CourseType.LESSONS_PLAN ? lessonsCount : undefined,
      stats: {
        totalStudents: 0,
        totalSessions: 0,
        averageRating: 0,
        reviewCount: 0,
        completedLessons: 0
      }
    })

    return this.courseRepository.save(course)
  }

  async findAll(tutorId: string) {
    return this.courseRepository.find({
      where: { tutor: { id: tutorId } },
      relations: ['reviews']
    })
  }

  async findOne(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['tutor', 'reviews']
    })

    if (!course) {
      throw new NotFoundException('课程不存在')
    }

    return course
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.findOne(id)
    
    // 如果更新了价格相关信息，重新计算价格
    if ('basePrice' in updateCourseDto) {
      const priceInfo = this.pricingService.calculateCoursePrice(updateCourseDto.basePrice)
      Object.assign(updateCourseDto, {
        basePrice: priceInfo.basePrice,
        platformFee: priceInfo.platformFee,
        displayPrice: priceInfo.totalPrice
      })
    }
    
    Object.assign(course, updateCourseDto)
    return this.courseRepository.save(course)
  }

  async uploadMaterial(id: string, file: Express.Multer.File) {
    const course = await this.findOne(id)
    
    const url = await this.fileService.uploadFile(file, 'course-materials')
    const material = {
      name: file.originalname,
      type: file.mimetype,
      url,
      size: file.size
    }

    course.materials = [...course.materials, material]
    return this.courseRepository.save(course)
  }

  async removeMaterial(id: string, materialUrl: string) {
    const course = await this.findOne(id)
    
    await this.fileService.deleteFile(materialUrl)
    course.materials = course.materials.filter(m => m.url !== materialUrl)
    
    return this.courseRepository.save(course)
  }

  async getSchedules(id: string, startDate: Date, endDate: Date) {
    return this.scheduleRepository.find({
      where: {
        course: { id },
        startTime: Between(startDate, endDate)
      },
      relations: ['student']
    })
  }

  async calculatePrice(calculatePriceDto: CalculatePriceDto) {
    const { basePrice, courseType, lessonsCount } = calculatePriceDto

    // 验证课时包必须指定课时数
    if (courseType === CourseType.LESSONS_PLAN && !lessonsCount) {
      throw new BadRequestException('课时包必须指定课时数')
    }

    const priceInfo = this.pricingService.calculateCoursePrice(basePrice)
    
    return {
      ...priceInfo,
      perLessonPrice: courseType === CourseType.LESSONS_PLAN 
        ? priceInfo.totalPrice / lessonsCount 
        : priceInfo.totalPrice
    }
  }

  async updatePrice(id: string, updatePriceDto: UpdatePriceDto) {
    const course = await this.findOne(id)
    
    // 计算新的价格信息
    const priceInfo = this.pricingService.calculateCoursePrice(updatePriceDto.basePrice)
    
    // 更新课程价格信息
    course.basePrice = priceInfo.basePrice
    course.platformFee = priceInfo.platformFee
    course.displayPrice = priceInfo.totalPrice
    
    // 如果是课时包且更新了课时数
    if (course.type === CourseType.LESSONS_PLAN && updatePriceDto.lessonsCount) {
      course.lessonsCount = updatePriceDto.lessonsCount
    }
    
    return this.courseRepository.save(course)
  }

  async getStats(id: string) {
    const course = await this.findOne(id)
    
    const schedules = await this.scheduleRepository.find({
      where: { course: { id } },
      relations: ['student', 'payment']
    })

    const completedSchedules = schedules.filter(s => s.status === 'completed')
    const totalRevenue = completedSchedules.reduce((acc, s) => acc + s.payment.amount, 0)
    const completedLessons = completedSchedules.length

    // 更新已完成课时数
    if (course.stats.completedLessons !== completedLessons) {
      course.stats.completedLessons = completedLessons
      await this.courseRepository.save(course)
    }

    return {
      ...course.stats,
      totalRevenue,
      completionRate: (completedLessons / schedules.length) * 100
    }
  }

  async archive(id: string) {
    const course = await this.findOne(id)
    
    // 检查是否有未完成的课程
    const pendingSchedules = await this.scheduleRepository.count({
      where: {
        course: { id },
        status: 'pending'
      }
    })

    if (pendingSchedules > 0) {
      throw new BadRequestException('存在未完成的课程预约，无法归档')
    }

    course.status = 'archived'
    return this.courseRepository.save(course)
  }
}
