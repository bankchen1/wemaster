import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { Notification } from './notification.entity'
import { NotificationPreferences } from './notification-preferences.entity'
import { NotificationStats } from './notification-stats.entity'
import { EmailService } from '../email/email.service'
import { PushService } from '../push/push.service'
import { TimezoneService } from '../timezone/timezone.service'
import { LoggerService } from '../logger/logger.service'
import { CacheService } from '../cache/cache.service'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreferences)
    private preferencesRepository: Repository<NotificationPreferences>,
    @InjectRepository(NotificationStats)
    private statsRepository: Repository<NotificationStats>,
    @InjectQueue('notification') private notificationQueue: Queue,
    private emailService: EmailService,
    private pushService: PushService,
    private timezoneService: TimezoneService,
    private loggerService: LoggerService,
    private cacheService: CacheService
  ) {}

  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const cacheKey = `notification_preferences:${userId}`
    const cached = await this.cacheService.get(cacheKey)
    if (cached) {
      return cached
    }

    let preferences = await this.preferencesRepository.findOne({
      where: { userId }
    })

    if (!preferences) {
      preferences = this.preferencesRepository.create({ userId })
      await this.preferencesRepository.save(preferences)
    }

    await this.cacheService.set(cacheKey, preferences, 3600) // 1 hour cache
    return preferences
  }

  async updateUserPreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const preferences = await this.getUserPreferences(userId)
    Object.assign(preferences, updates)
    await this.preferencesRepository.save(preferences)
    
    const cacheKey = `notification_preferences:${userId}`
    await this.cacheService.del(cacheKey)
    
    return preferences
  }

  async shouldSendNotification(
    userId: string,
    type: string,
    channel: string
  ): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId)
    const { quiet_hours } = preferences.settings
    
    if (quiet_hours.enabled) {
      const userTime = await this.timezoneService.getUserTime(
        userId,
        preferences.settings.timezone
      )
      const currentHour = userTime.getHours()
      const startHour = parseInt(quiet_hours.start.split(':')[0])
      const endHour = parseInt(quiet_hours.end.split(':')[0])
      
      if (
        (startHour > endHour &&
          (currentHour >= startHour || currentHour < endHour)) ||
        (startHour < endHour &&
          currentHour >= startHour &&
          currentHour < endHour)
      ) {
        return false
      }
    }

    return preferences.preferences[channel]?.[type] ?? false
  }

  async trackNotification(
    userId: string,
    type: string,
    channel: string,
    success: boolean = true
  ): Promise<void> {
    let stats = await this.statsRepository.findOne({
      where: { userId }
    })

    if (!stats) {
      stats = this.statsRepository.create({ userId })
    }

    stats.stats.total_sent++
    stats.stats.by_channel[channel] = (stats.stats.by_channel[channel] || 0) + 1
    stats.stats.by_type[type] = (stats.stats.by_type[type] || 0) + 1
    stats.timestamps.last_notification = new Date()

    if (!success) {
      stats.metrics.delivery_success_rate =
        ((stats.stats.total_sent - 1) * stats.metrics.delivery_success_rate +
          0) /
        stats.stats.total_sent
    }

    await this.statsRepository.save(stats)
  }

  async markNotificationRead(
    notificationId: string,
    userId: string
  ): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId }
    })

    if (notification) {
      notification.status = 'read'
      notification.readAt = new Date()
      await this.notificationRepository.save(notification)

      const stats = await this.statsRepository.findOne({
        where: { userId }
      })

      if (stats) {
        stats.stats.total_read++
        stats.timestamps.last_read = new Date()
        stats.metrics.read_rate =
          (stats.stats.total_read / stats.stats.total_sent) * 100

        if (notification.createdAt) {
          const readTime =
            notification.readAt.getTime() - notification.createdAt.getTime()
          stats.metrics.average_read_time =
            (stats.metrics.average_read_time * (stats.stats.total_read - 1) +
              readTime) /
            stats.stats.total_read
        }

        await this.statsRepository.save(stats)
      }
    }
  }

  async trackNotificationClick(
    notificationId: string,
    userId: string
  ): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId }
    })

    if (notification) {
      notification.clicked = true
      notification.clickedAt = new Date()
      await this.notificationRepository.save(notification)

      const stats = await this.statsRepository.findOne({
        where: { userId }
      })

      if (stats) {
        stats.stats.total_clicked++
        stats.timestamps.last_interaction = new Date()
        stats.metrics.click_rate =
          (stats.stats.total_clicked / stats.stats.total_sent) * 100
        await this.statsRepository.save(stats)
      }
    }
  }

  async getNotificationStats(userId: string): Promise<NotificationStats> {
    return this.statsRepository.findOne({
      where: { userId }
    })
  }

  // 课程预约通知
  async sendScheduleNotification(schedule: any): Promise<void> {
    const { student, tutor, course } = schedule

    // 发送给学生
    await this.notificationGateway.sendToUser(student.id, 'schedule-created', {
      type: 'schedule-created',
      scheduleId: schedule.id,
      courseTitle: course.title,
      tutorName: tutor.name,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    })

    // 发送给导师
    await this.notificationGateway.sendToUser(tutor.id, 'new-schedule', {
      type: 'new-schedule',
      scheduleId: schedule.id,
      courseTitle: course.title,
      studentName: student.name,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    })

    this.loggerService.log('notification', {
      action: 'schedule-notification',
      scheduleId: schedule.id,
      studentId: student.id,
      tutorId: tutor.id
    })
  }

  // 课程开始提醒
  async sendScheduleReminder(schedule: any): Promise<void> {
    const { student, tutor, course } = schedule
    const reminderData = {
      type: 'schedule-reminder',
      scheduleId: schedule.id,
      courseTitle: course.title,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      meetingUrl: schedule.meetingUrl
    }

    // 提醒学生
    await this.notificationGateway.sendToUser(student.id, 'schedule-reminder', {
      ...reminderData,
      recipientType: 'student',
      tutorName: tutor.name
    })

    // 提醒导师
    await this.notificationGateway.sendToUser(tutor.id, 'schedule-reminder', {
      ...reminderData,
      recipientType: 'tutor',
      studentName: student.name
    })
  }

  // 支付成功通知
  async sendPaymentSuccessNotification(schedule: any): Promise<void> {
    const { student, tutor, course } = schedule

    // 通知学生
    await this.notificationGateway.sendToUser(student.id, 'payment-success', {
      type: 'payment-success',
      scheduleId: schedule.id,
      courseTitle: course.title,
      amount: course.price,
      tutorName: tutor.name,
      startTime: schedule.startTime
    })

    // 通知导师
    await this.notificationGateway.sendToUser(tutor.id, 'new-payment', {
      type: 'new-payment',
      scheduleId: schedule.id,
      courseTitle: course.title,
      amount: course.price,
      studentName: student.name,
      startTime: schedule.startTime
    })
  }

  // 支付失败通知
  async sendPaymentFailureNotification(schedule: any): Promise<void> {
    const { student, course } = schedule

    await this.notificationGateway.sendToUser(student.id, 'payment-failed', {
      type: 'payment-failed',
      scheduleId: schedule.id,
      courseTitle: course.title,
      amount: course.price
    })
  }

  // 退款通知
  async sendRefundNotification(
    schedule: any,
    refundAmount: number
  ): Promise<void> {
    const { student, tutor, course } = schedule

    // 通知学生
    await this.notificationGateway.sendToUser(student.id, 'refund-processed', {
      type: 'refund-processed',
      scheduleId: schedule.id,
      courseTitle: course.title,
      refundAmount,
      tutorName: tutor.name
    })

    // 通知导师
    await this.notificationGateway.sendToUser(tutor.id, 'refund-processed', {
      type: 'refund-processed',
      scheduleId: schedule.id,
      courseTitle: course.title,
      refundAmount,
      studentName: student.name
    })
  }

  // 课程更新通知
  async sendCourseUpdateNotification(course: any): Promise<void> {
    await this.notificationGateway.sendToCourse(course.id, 'course-updated', {
      type: 'course-updated',
      courseId: course.id,
      title: course.title,
      changes: course.changes // 需要在Course实体中添加changes字段
    })
  }

  // 系统公告
  async sendSystemAnnouncement(
    message: string,
    targetUsers?: string[]
  ): Promise<void> {
    const announcement = {
      type: 'system-announcement',
      message,
      timestamp: new Date()
    }

    if (targetUsers?.length) {
      // 发送给特定用户
      for (const userId of targetUsers) {
        await this.notificationGateway.sendToUser(userId, 'announcement', announcement)
      }
    } else {
      // 广播给所有用户
      await this.notificationGateway.broadcast('announcement', announcement)
    }
  }

  // 评论通知
  async sendCommentNotification(
    comment: any,
    targetUserId: string
  ): Promise<void> {
    await this.notificationGateway.sendToUser(targetUserId, 'new-comment', {
      type: 'new-comment',
      commentId: comment.id,
      content: comment.content,
      authorName: comment.author.name,
      courseTitle: comment.course.title,
      timestamp: comment.createdAt
    })
  }

  // 私信通知
  async sendPrivateMessageNotification(
    message: any,
    targetUserId: string
  ): Promise<void> {
    await this.notificationGateway.sendToUser(targetUserId, 'new-message', {
      type: 'new-message',
      messageId: message.id,
      content: message.content,
      senderName: message.sender.name,
      timestamp: message.createdAt
    })
  }

  async sendScheduleReminderNew(data: {
    userId: string
    scheduleId: string
    type: 'student' | 'tutor'
    time: Date
    timezone: string
  }) {
    const { userId, scheduleId, type, time, timezone } = data

    // 创建通知记录
    const notification = this.notificationRepository.create({
      userId,
      type: 'schedule_reminder',
      content: {
        scheduleId,
        userType: type,
        time: await this.timezoneService.formatTimeForZone(time, timezone)
      },
      status: 'pending'
    })

    await this.notificationRepository.save(notification)

    // 添加到通知队列
    await this.notificationQueue.add(
      'send',
      {
        notificationId: notification.id,
        channels: ['email', 'push', 'websocket']
      },
      {
        delay: time.getTime() - Date.now()
      }
    )

    return notification
  }

  async sendStudentReminderNew(data: {
    scheduleId: string
    studentId: string
    startTime: string
    timezone: string
  }) {
    const { scheduleId, studentId, startTime, timezone } = data

    // 发送邮件通知
    await this.emailService.sendScheduleReminder({
      to: studentId,
      scheduleId,
      startTime,
      timezone,
      template: 'student-reminder'
    })

    // 发送推送通知
    await this.pushService.sendNotification({
      userId: studentId,
      title: 'Upcoming Class Reminder',
      body: `Your class is starting at ${startTime}`,
      data: { scheduleId }
    })

    // 发送WebSocket通知
    await this.sendWebSocketNotification(studentId, {
      type: 'schedule_reminder',
      data: { scheduleId, startTime }
    })
  }

  async sendTutorReminderNew(data: {
    scheduleId: string
    tutorId: string
    startTime: string
    timezone: string
  }) {
    const { scheduleId, tutorId, startTime, timezone } = data

    // 发送邮件通知
    await this.emailService.sendScheduleReminder({
      to: tutorId,
      scheduleId,
      startTime,
      timezone,
      template: 'tutor-reminder'
    })

    // 发送推送通知
    await this.pushService.sendNotification({
      userId: tutorId,
      title: 'Upcoming Class Reminder',
      body: `You have a class starting at ${startTime}`,
      data: { scheduleId }
    })

    // 发送WebSocket通知
    await this.sendWebSocketNotification(tutorId, {
      type: 'schedule_reminder',
      data: { scheduleId, startTime }
    })
  }

  async sendScheduleCancellationNew(data: {
    scheduleId: string
    studentId: string
    tutorId: string
    startTime: Date
    studentTimezone: string
    tutorTimezone: string
  }) {
    const {
      scheduleId,
      studentId,
      tutorId,
      startTime,
      studentTimezone,
      tutorTimezone
    } = data

    // 转换时间到各自的时区
    const studentTime = await this.timezoneService.formatTimeForZone(
      startTime,
      studentTimezone
    )
    const tutorTime = await this.timezoneService.formatTimeForZone(
      startTime,
      tutorTimezone
    )

    // 发送学生通知
    await this.notificationQueue.add('send', {
      userId: studentId,
      type: 'schedule_cancellation',
      content: {
        scheduleId,
        startTime: studentTime,
        timezone: studentTimezone
      },
      channels: ['email', 'push', 'websocket']
    })

    // 发送导师通知
    await this.notificationQueue.add('send', {
      userId: tutorId,
      type: 'schedule_cancellation',
      content: {
        scheduleId,
        startTime: tutorTime,
        timezone: tutorTimezone
      },
      channels: ['email', 'push', 'websocket']
    })
  }

  private async sendWebSocketNotification(userId: string, data: any) {
    // 通过WebSocket网关发送通知
    // TODO: 实现WebSocket发送逻辑
  }

  async getUnreadNotifications(userId: string): Promise<any[]> {
    return this.notificationRepository.find({
      where: {
        userId,
        status: 'unread'
      },
      order: {
        createdAt: 'DESC'
      }
    })
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.update(
      notificationId,
      { status: 'read' }
    )
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: 'unread' },
      { status: 'read' }
    )
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.delete(notificationId)
  }

  async clearOldNotifications(days: number = 30): Promise<void> {
    const date = new Date()
    date.setDate(date.getDate() - days)

    await this.notificationRepository.delete({
      createdAt: { $lt: date }
    })
  }
}
