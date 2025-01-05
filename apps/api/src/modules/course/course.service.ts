import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Course } from './course.entity'
import { Tutor } from '../tutor/tutor.entity'
import { Schedule } from '../schedule/schedule.entity'
import { CreateCourseDto, UpdateCourseDto } from './course.dto'
import { FileService } from '../file/file.service'

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Tutor)
    private tutorRepository: Repository<Tutor>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    private fileService: FileService
  ) {}

  async create(tutorId: string, createCourseDto: CreateCourseDto) {
    const tutor = await this.tutorRepository.findOne({
      where: { id: tutorId }
    })

    if (!tutor) {
      throw new NotFoundException('导师不存在')
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      tutor,
      stats: {
        totalStudents: 0,
        totalSessions: 0,
        averageRating: 0,
        reviewCount: 0
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

  async getStats(id: string) {
    const course = await this.findOne(id)
    
    const schedules = await this.scheduleRepository.find({
      where: { course: { id } },
      relations: ['student', 'payment']
    })

    const completedSchedules = schedules.filter(s => s.status === 'completed')
    const totalRevenue = completedSchedules.reduce((acc, s) => acc + s.payment.amount, 0)

    return {
      ...course.stats,
      totalRevenue,
      completionRate: (completedSchedules.length / schedules.length) * 100
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
