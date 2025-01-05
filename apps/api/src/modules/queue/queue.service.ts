import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Bull from 'bull'
import { LoggerService } from '../logger/logger.service'
import { RedisService } from '../redis/redis.service'
import { NotificationService } from '../notification/notification.service'
import { FileService } from '../file/file.service'

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private queues: Map<string, Bull.Queue> = new Map()

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
    private redisService: RedisService,
    private notificationService: NotificationService,
    private fileService: FileService
  ) {}

  async onModuleInit() {
    // 初始化队列
    this.initializeQueues()
    // 设置处理器
    this.setupProcessors()
  }

  async onModuleDestroy() {
    // 关闭所有队列
    for (const [name, queue] of this.queues) {
      await queue.close()
    }
  }

  private initializeQueues() {
    // 通知队列
    this.queues.set(
      'notifications',
      new Bull('notifications', {
        redis: {
          host: this.configService.get('REDIS_HOST'),
          port: this.configService.get('REDIS_PORT'),
          password: this.configService.get('REDIS_PASSWORD')
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: true
        }
      })
    )

    // 文件处理队列
    this.queues.set(
      'file-processing',
      new Bull('file-processing', {
        redis: {
          host: this.configService.get('REDIS_HOST'),
          port: this.configService.get('REDIS_PORT'),
          password: this.configService.get('REDIS_PASSWORD')
        },
        defaultJobOptions: {
          attempts: 2,
          timeout: 300000, // 5分钟超时
          removeOnComplete: true
        }
      })
    )

    // 邮件队列
    this.queues.set(
      'emails',
      new Bull('emails', {
        redis: {
          host: this.configService.get('REDIS_HOST'),
          port: this.configService.get('REDIS_PORT'),
          password: this.configService.get('REDIS_PASSWORD')
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'fixed',
            delay: 5000
          },
          removeOnComplete: true
        }
      })
    )

    // 课程提醒队列
    this.queues.set(
      'schedule-reminders',
      new Bull('schedule-reminders', {
        redis: {
          host: this.configService.get('REDIS_HOST'),
          port: this.configService.get('REDIS_PORT'),
          password: this.configService.get('REDIS_PASSWORD')
        },
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: true
        }
      })
    )
  }

  private setupProcessors() {
    // 通知处理器
    this.queues.get('notifications').process(async (job) => {
      const { type, data } = job.data
      try {
        switch (type) {
          case 'schedule':
            await this.notificationService.sendScheduleNotification(data)
            break
          case 'payment':
            await this.notificationService.sendPaymentSuccessNotification(data)
            break
          case 'refund':
            await this.notificationService.sendRefundNotification(data.schedule, data.amount)
            break
          case 'comment':
            await this.notificationService.sendCommentNotification(data.comment, data.targetUserId)
            break
          default:
            throw new Error(`Unknown notification type: ${type}`)
        }
      } catch (error) {
        this.loggerService.error('queue-processor', {
          queue: 'notifications',
          jobId: job.id,
          error: error.message
        })
        throw error
      }
    })

    // 文件处理器
    this.queues.get('file-processing').process(async (job) => {
      const { type, file, options } = job.data
      try {
        switch (type) {
          case 'video':
            return await this.fileService.uploadVideo(file, options.folder)
          case 'image':
            return await this.fileService.uploadImage(file, options.folder, options)
          case 'document':
            return await this.fileService.uploadDocument(file, options.folder)
          default:
            throw new Error(`Unknown file type: ${type}`)
        }
      } catch (error) {
        this.loggerService.error('queue-processor', {
          queue: 'file-processing',
          jobId: job.id,
          error: error.message
        })
        throw error
      }
    })

    // 邮件处理器
    this.queues.get('emails').process(async (job) => {
      const { template, data, recipient } = job.data
      try {
        // 实现邮件发送逻辑
        await this.sendEmail(template, data, recipient)
      } catch (error) {
        this.loggerService.error('queue-processor', {
          queue: 'emails',
          jobId: job.id,
          error: error.message
        })
        throw error
      }
    })

    // 课程提醒处理器
    this.queues.get('schedule-reminders').process(async (job) => {
      const { schedule } = job.data
      try {
        await this.notificationService.sendScheduleReminder(schedule)
      } catch (error) {
        this.loggerService.error('queue-processor', {
          queue: 'schedule-reminders',
          jobId: job.id,
          error: error.message
        })
        throw error
      }
    })
  }

  // 添加通知任务
  async addNotificationJob(
    type: string,
    data: any,
    options: Bull.JobOptions = {}
  ): Promise<void> {
    await this.queues.get('notifications').add({ type, data }, options)
  }

  // 添加文件处理任务
  async addFileProcessingJob(
    type: string,
    file: Express.Multer.File,
    options: any = {}
  ): Promise<Bull.Job> {
    return this.queues.get('file-processing').add({ type, file, options })
  }

  // 添加邮件任务
  async addEmailJob(
    template: string,
    data: any,
    recipient: string,
    options: Bull.JobOptions = {}
  ): Promise<void> {
    await this.queues.get('emails').add({ template, data, recipient }, options)
  }

  // 添加课程提醒任务
  async addScheduleReminderJob(
    schedule: any,
    reminderTime: Date
  ): Promise<void> {
    const delay = reminderTime.getTime() - Date.now()
    if (delay > 0) {
      await this.queues.get('schedule-reminders').add(
        { schedule },
        { delay }
      )
    }
  }

  // 获取队列统计信息
  async getQueueStats(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    const [
      jobCounts,
      completedCount,
      failedCount,
      delayedCount,
      activeCount,
      waitingCount
    ] = await Promise.all([
      queue.getJobCounts(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getActiveCount(),
      queue.getWaitingCount()
    ])

    return {
      jobCounts,
      completedCount,
      failedCount,
      delayedCount,
      activeCount,
      waitingCount
    }
  }

  // 清理队列
  async cleanQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`)
    }

    await queue.clean(0, 'completed')
    await queue.clean(0, 'failed')
  }

  private async sendEmail(
    template: string,
    data: any,
    recipient: string
  ): Promise<void> {
    // 实现邮件发送逻辑
    // 这里需要集成具体的邮件服务提供商
  }
}
