import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Review } from '../review/review.entity'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { NotificationService } from '../notification/notification.service'
import { MonitoringService } from '../monitoring/monitoring.service'
import { CacheService } from '../cache/cache.service'
import { Booking } from '../booking/booking.entity'
import { User } from '../user/user.entity'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'

@Injectable()
export class BatchOperationService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(TutorProfile)
    private tutorProfileRepo: Repository<TutorProfile>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationService: NotificationService,
    private monitoringService: MonitoringService,
    private cacheService: CacheService,
    @InjectQueue('batch-operations')
    private batchQueue: Queue
  ) {}

  // 批量发送提醒
  async sendBatchReminders(options: {
    type: 'upcoming-class' | 'review-request' | 'inactive-user'
    userIds?: string[]
    data?: any
  }) {
    const { type, userIds, data } = options

    // 根据不同类型的提醒使用不同的模板
    const templates = {
      'upcoming-class': {
        title: '即将开始的课程提醒',
        message: '您有一节课程将在 {time} 开始'
      },
      'review-request': {
        title: '课程评价提醒',
        message: '您最近完成了一节课程，请对导师进行评价'
      },
      'inactive-user': {
        title: '想你了！',
        message: '好久没见到你了，来看看有什么新课程吧'
      }
    }

    const template = templates[type]
    const notifications = userIds?.map(userId => ({
      userId,
      type,
      title: template.title,
      message: template.message.replace(
        '{time}',
        data?.time || ''
      ),
      data
    }))

    // 使用队列处理批量发送
    await this.batchQueue.add('send-notifications', {
      notifications
    })
  }

  // 批量更新评分
  async updateBatchRatings(tutorIds: string[]) {
    for (const tutorId of tutorIds) {
      await this.batchQueue.add('update-rating', {
        tutorId
      })
    }
  }

  // 批量处理过期预约
  async processExpiredBookings() {
    const expiredBookings = await this.bookingRepo.find({
      where: {
        status: 'pending',
        expiresAt: In([new Date()])
      }
    })

    for (const booking of expiredBookings) {
      await this.batchQueue.add('process-expired-booking', {
        bookingId: booking.id
      })
    }
  }

  // 批量清理缓存
  async cleanupCache(patterns: string[]) {
    for (const pattern of patterns) {
      await this.cacheService.delByPattern(pattern)
    }
  }

  // 批量导出数据
  async exportBatchData(options: {
    type: 'reviews' | 'bookings' | 'users'
    filters: any
    format: 'csv' | 'excel'
  }) {
    return await this.batchQueue.add('export-data', options)
  }

  // 批量导入数据
  async importBatchData(options: {
    type: 'reviews' | 'bookings' | 'users'
    data: any[]
  }) {
    return await this.batchQueue.add('import-data', options)
  }

  // 批量发送营销邮件
  async sendMarketingEmails(options: {
    template: string
    userIds: string[]
    data: any
  }) {
    return await this.batchQueue.add('send-marketing-emails', options)
  }

  // 批量生成报告
  async generateBatchReports(options: {
    type: 'tutor' | 'student' | 'platform'
    period: 'daily' | 'weekly' | 'monthly'
    ids: string[]
  }) {
    return await this.batchQueue.add('generate-reports', options)
  }

  // 批量更新用户状态
  async updateUserStatuses(options: {
    userIds: string[]
    status: string
    reason?: string
  }) {
    return await this.batchQueue.add('update-user-statuses', options)
  }

  // 批量同步数据
  async syncBatchData(options: {
    type: string
    source: string
    target: string
    ids: string[]
  }) {
    return await this.batchQueue.add('sync-data', options)
  }

  // 批量清理数据
  async cleanupBatchData(options: {
    type: string
    before: Date
    condition?: any
  }) {
    return await this.batchQueue.add('cleanup-data', options)
  }
}
