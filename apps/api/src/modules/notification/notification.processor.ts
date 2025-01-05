import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { EmailService } from '../email/email.service'
import { PushService } from '../push/push.service'
import { WebSocketGateway } from '../websocket/websocket.gateway'
import { LoggerService } from '../logger/logger.service'

interface NotificationJob {
  notificationId: string
  userId: string
  type: string
  content: any
  channels: string[]
}

@Processor('notification')
export class NotificationProcessor {
  constructor(
    private emailService: EmailService,
    private pushService: PushService,
    private webSocketGateway: WebSocketGateway,
    private loggerService: LoggerService
  ) {}

  @Process('send')
  async handleSend(job: Job<NotificationJob>) {
    const { userId, type, content, channels } = job.data
    const errors = []

    try {
      // 并行发送所有通知
      await Promise.all(
        channels.map(async channel => {
          try {
            switch (channel) {
              case 'email':
                await this.sendEmail(userId, type, content)
                break
              case 'push':
                await this.sendPushNotification(userId, type, content)
                break
              case 'websocket':
                await this.sendWebSocketNotification(userId, type, content)
                break
              default:
                this.loggerService.warn(
                  'notification',
                  `Unknown notification channel: ${channel}`
                )
            }
          } catch (error) {
            errors.push({
              channel,
              error: error.message
            })
            this.loggerService.error(
              'notification',
              `Failed to send ${channel} notification: ${error.message}`,
              error.stack
            )
          }
        })
      )

      if (errors.length > 0) {
        throw new Error(
          `Failed to send notifications through some channels: ${JSON.stringify(
            errors
          )}`
        )
      }

      this.loggerService.log(
        'notification',
        `Successfully sent notification ${job.id} to user ${userId}`
      )
    } catch (error) {
      this.loggerService.error(
        'notification',
        `Failed to process notification job: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  private async sendEmail(userId: string, type: string, content: any) {
    const templates = {
      schedule_reminder: 'schedule-reminder',
      schedule_cancellation: 'schedule-cancellation',
      schedule_change: 'schedule-change',
      payment_success: 'payment-success',
      payment_failed: 'payment-failed'
    }

    const template = templates[type] || 'default'
    await this.emailService.sendTemplateEmail({
      to: userId,
      template,
      data: content
    })
  }

  private async sendPushNotification(userId: string, type: string, content: any) {
    const titles = {
      schedule_reminder: 'Class Reminder',
      schedule_cancellation: 'Class Cancelled',
      schedule_change: 'Schedule Changed',
      payment_success: 'Payment Successful',
      payment_failed: 'Payment Failed'
    }

    await this.pushService.sendNotification({
      userId,
      title: titles[type] || 'Notification',
      body: this.formatNotificationBody(type, content),
      data: content
    })
  }

  private async sendWebSocketNotification(
    userId: string,
    type: string,
    content: any
  ) {
    await this.webSocketGateway.sendToUser(userId, {
      type,
      data: content
    })
  }

  private formatNotificationBody(type: string, content: any): string {
    switch (type) {
      case 'schedule_reminder':
        return `Your class is starting at ${content.startTime}`
      case 'schedule_cancellation':
        return `Your class scheduled for ${content.startTime} has been cancelled`
      case 'schedule_change':
        return `Your class schedule has been changed to ${content.newStartTime}`
      case 'payment_success':
        return `Payment of ${content.amount} has been successfully processed`
      case 'payment_failed':
        return `Payment of ${content.amount} has failed`
      default:
        return 'You have a new notification'
    }
  }

  @Process('cleanup')
  async handleCleanup(job: Job) {
    try {
      // 清理过期的通知
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // TODO: 实现清理逻辑

      this.loggerService.log(
        'notification',
        'Cleaned up expired notifications'
      )
    } catch (error) {
      this.loggerService.error(
        'notification',
        `Failed to clean up notifications: ${error.message}`,
        error.stack
      )
      throw error
    }
  }
}
