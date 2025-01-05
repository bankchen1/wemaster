import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { NotificationService } from '../notification/notification.service'
import { TimezoneService } from '../timezone/timezone.service'
import { LoggerService } from '../logger/logger.service'
import { ScheduleReminder } from './schedule.service'

@Processor('schedule')
export class ScheduleProcessor {
  constructor(
    private notificationService: NotificationService,
    private timezoneService: TimezoneService,
    private loggerService: LoggerService
  ) {}

  @Process('reminder')
  async handleReminder(job: Job<ScheduleReminder>) {
    try {
      const { scheduleId, userId, type, time, timezone } = job.data

      // 转换为用户时区的时间
      const localTime = await this.timezoneService.formatTimeForZone(
        time,
        timezone,
        'yyyy-MM-dd HH:mm:ss'
      )

      // 根据提醒类型发送不同的通知
      if (type === 'student') {
        await this.notificationService.sendStudentReminder({
          scheduleId,
          studentId: userId,
          startTime: localTime,
          timezone
        })
      } else {
        await this.notificationService.sendTutorReminder({
          scheduleId,
          tutorId: userId,
          startTime: localTime,
          timezone
        })
      }

      this.loggerService.log(
        'schedule',
        `Sent ${type} reminder for schedule ${scheduleId}`
      )
    } catch (error) {
      this.loggerService.error(
        'schedule',
        `Failed to process reminder: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  @Process('scheduleCleanup')
  async handleScheduleCleanup(job: Job) {
    try {
      // 清理过期的日程
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // TODO: 实现清理逻辑
      this.loggerService.log(
        'schedule',
        'Cleaned up expired schedules'
      )
    } catch (error) {
      this.loggerService.error(
        'schedule',
        `Failed to clean up schedules: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  @Process('scheduleSync')
  async handleScheduleSync(job: Job) {
    try {
      // 同步外部日历
      // TODO: 实现日历同步逻辑
      this.loggerService.log(
        'schedule',
        'Synced schedules with external calendars'
      )
    } catch (error) {
      this.loggerService.error(
        'schedule',
        `Failed to sync schedules: ${error.message}`,
        error.stack
      )
      throw error
    }
  }
}
