import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, FindOptionsWhere } from 'typeorm'
import { TutorApplication, ApplicationStatus } from './tutor-application.entity'
import { CreateTutorApplicationDto } from './dto/create-tutor-application.dto'
import { NotificationService } from '../notification/notification.service'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class TutorApplicationService {
  constructor(
    @InjectRepository(TutorApplication)
    private applicationRepository: Repository<TutorApplication>,
    private notificationService: NotificationService,
    private logger: LoggerService
  ) {}

  async submitApplication(userId: string, dto: CreateTutorApplicationDto): Promise<TutorApplication> {
    // 检查是否已有待审核或已通过的申请
    const existingApplication = await this.applicationRepository.findOne({
      where: [
        { userId, status: ApplicationStatus.PENDING },
        { userId, status: ApplicationStatus.APPROVED }
      ]
    })

    if (existingApplication) {
      throw new ConflictException('您已有一个待审核或已通过的申请')
    }

    const application = this.applicationRepository.create({
      userId,
      ...dto,
      status: ApplicationStatus.PENDING
    })

    await this.applicationRepository.save(application)

    // 发送通知给管理员
    await this.notificationService.sendToAdmins({
      type: 'NEW_TUTOR_APPLICATION',
      title: '新导师申请',
      message: `${dto.name} 提交了导师申请，请及时审核`,
      data: { applicationId: application.id }
    })

    this.logger.info('New tutor application created', {
      userId,
      applicationId: application.id
    })

    return application
  }

  async getAllApplications({
    status,
    page = 1,
    limit = 10,
    search
  }: {
    status?: ApplicationStatus
    page?: number
    limit?: number
    search?: string
  }) {
    const where: FindOptionsWhere<TutorApplication> = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.name = Like(`%${search}%`)
    }

    const [applications, total] = await this.applicationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user']
    })

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async getApplicationStats() {
    const stats = await this.applicationRepository
      .createQueryBuilder('application')
      .select('application.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('application.status')
      .getRawMany()

    const result = {
      total: 0,
      [ApplicationStatus.PENDING]: 0,
      [ApplicationStatus.APPROVED]: 0,
      [ApplicationStatus.REJECTED]: 0
    }

    stats.forEach(({ status, count }) => {
      result[status] = parseInt(count)
      result.total += parseInt(count)
    })

    return result
  }

  async getApplicationById(id: string): Promise<TutorApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['user']
    })

    if (!application) {
      throw new NotFoundException('申请不存在')
    }

    return application
  }

  async getUserApplications(userId: string): Promise<TutorApplication[]> {
    return this.applicationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    })
  }

  async reviewApplication(
    id: string,
    {
      status,
      notes,
      reviewedBy
    }: {
      status: ApplicationStatus
      notes: string
      reviewedBy: string
    }
  ): Promise<TutorApplication> {
    const application = await this.getApplicationById(id)

    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictException('该申请已被审核')
    }

    application.status = status
    application.reviewedBy = reviewedBy
    application.reviewNotes = notes
    application.reviewedAt = new Date()

    await this.applicationRepository.save(application)

    // 发送通知给申请人
    const message = status === ApplicationStatus.APPROVED
      ? '恭喜！您的导师申请已通过审核'
      : `很抱歉，您的导师申请未通过审核${notes ? `。原因：${notes}` : ''}`

    await this.notificationService.sendToUser(application.userId, {
      type: 'TUTOR_APPLICATION_REVIEWED',
      title: '导师申请审核结果',
      message,
      data: { applicationId: id, status }
    })

    this.logger.info('Tutor application reviewed', {
      applicationId: id,
      reviewedBy,
      status,
      notes
    })

    return application
  }
}
