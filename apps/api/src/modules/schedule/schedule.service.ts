import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { Schedule } from './schedule.entity'
import { TimezoneService } from '../timezone/timezone.service'
import { NotificationService } from '../notification/notification.service'
import { LoggerService } from '../logger/logger.service'
import { RedisService } from '../redis/redis.service'

export interface ScheduleReminder {
  scheduleId: string
  userId: string
  type: 'student' | 'tutor'
  time: Date
  timezone: string
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectQueue('schedule') private scheduleQueue: Queue,
    private timezoneService: TimezoneService,
    private notificationService: NotificationService,
    private loggerService: LoggerService,
    private redisService: RedisService
  ) {}

  async createSchedule(data: Partial<Schedule>): Promise<Schedule> {
    const schedule = this.scheduleRepository.create(data)
    await this.scheduleRepository.save(schedule)
    await this.scheduleReminders(schedule)
    return schedule
  }

  private async scheduleReminders(schedule: Schedule) {
    // 为学生和导师设置不同的提醒时间
    const reminderTimes = [
      { minutes: 24 * 60, type: 'day' }, // 24小时前
      { minutes: 60, type: 'hour' }, // 1小时前
      { minutes: 15, type: 'immediate' } // 15分钟前
    ]

    for (const { minutes, type } of reminderTimes) {
      // 学生的提醒
      const studentReminder: ScheduleReminder = {
        scheduleId: schedule.id,
        userId: schedule.studentId,
        type: 'student',
        time: new Date(schedule.startTime.getTime() - minutes * 60000),
        timezone: schedule.studentTimezone
      }

      // 导师的提醒
      const tutorReminder: ScheduleReminder = {
        scheduleId: schedule.id,
        userId: schedule.tutorId,
        type: 'tutor',
        time: new Date(schedule.startTime.getTime() - minutes * 60000),
        timezone: schedule.tutorTimezone
      }

      await this.scheduleQueue.add(
        'reminder',
        studentReminder,
        {
          jobId: `${schedule.id}-student-${type}`,
          delay: studentReminder.time.getTime() - Date.now()
        }
      )

      await this.scheduleQueue.add(
        'reminder',
        tutorReminder,
        {
          jobId: `${schedule.id}-tutor-${type}`,
          delay: tutorReminder.time.getTime() - Date.now()
        }
      )
    }
  }

  async updateSchedule(id: string, data: Partial<Schedule>): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } })
    if (!schedule) {
      throw new Error('Schedule not found')
    }

    // 如果时间改变了，需要重新安排提醒
    if (data.startTime && data.startTime !== schedule.startTime) {
      await this.removeScheduleReminders(schedule.id)
    }

    Object.assign(schedule, data)
    await this.scheduleRepository.save(schedule)

    if (data.startTime) {
      await this.scheduleReminders(schedule)
    }

    return schedule
  }

  private async removeScheduleReminders(scheduleId: string) {
    const jobs = await this.scheduleQueue.getJobs(['delayed'])
    for (const job of jobs) {
      if (job.data.scheduleId === scheduleId) {
        await job.remove()
      }
    }
  }

  async cancelSchedule(id: string): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } })
    if (!schedule) {
      throw new Error('Schedule not found')
    }

    schedule.status = 'cancelled'
    await this.scheduleRepository.save(schedule)
    await this.removeScheduleReminders(id)

    // 发送取消通知
    await this.notificationService.sendScheduleCancellation({
      scheduleId: id,
      studentId: schedule.studentId,
      tutorId: schedule.tutorId,
      startTime: schedule.startTime,
      studentTimezone: schedule.studentTimezone,
      tutorTimezone: schedule.tutorTimezone
    })
  }

  async getUpcomingSchedules(
    userId: string,
    userType: 'student' | 'tutor',
    options: {
      startDate?: Date
      endDate?: Date
      status?: string[]
      timezone?: string
    } = {}
  ): Promise<Schedule[]> {
    const queryBuilder = this.scheduleRepository
      .createQueryBuilder('schedule')
      .where(userType === 'student' ? 
        { studentId: userId } : 
        { tutorId: userId }
      )

    if (options.startDate) {
      queryBuilder.andWhere('schedule.startTime >= :startDate', {
        startDate: options.startDate
      })
    }

    if (options.endDate) {
      queryBuilder.andWhere('schedule.startTime <= :endDate', {
        endDate: options.endDate
      })
    }

    if (options.status?.length) {
      queryBuilder.andWhere('schedule.status IN (:...status)', {
        status: options.status
      })
    }

    const schedules = await queryBuilder
      .orderBy('schedule.startTime', 'ASC')
      .getMany()

    // 如果指定了时区，转换时间
    if (options.timezone) {
      return Promise.all(
        schedules.map(async schedule => ({
          ...schedule,
          startTime: await this.timezoneService.convertTime(
            schedule.startTime,
            schedule.timezone,
            options.timezone
          ),
          endTime: await this.timezoneService.convertTime(
            schedule.endTime,
            schedule.timezone,
            options.timezone
          )
        }))
      )
    }

    return schedules
  }

  async getScheduleConflicts(
    tutorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Schedule[]> {
    return this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.tutorId = :tutorId', { tutorId })
      .andWhere('schedule.status != :status', { status: 'cancelled' })
      .andWhere(
        '(schedule.startTime, schedule.endTime) OVERLAPS (:startTime, :endTime)',
        { startTime, endTime }
      )
      .getMany()
  }

  async getScheduleAvailability(
    tutorId: string,
    startDate: Date,
    endDate: Date,
    timezone: string
  ): Promise<Array<{ start: Date; end: Date; available: boolean }>> {
    // 获取导师的可用时间槽
    const slots = await this.timezoneService.generateTimeSlots(
      startDate,
      endDate,
      60, // 默认1小时
      timezone
    )

    // 获取已有的预约
    const schedules = await this.getScheduleConflicts(
      tutorId,
      startDate,
      endDate
    )

    // 标记每个时间槽的可用性
    return slots.map(slot => ({
      ...slot,
      available: !schedules.some(schedule =>
        this.isTimeOverlap(
          slot.start,
          slot.end,
          schedule.startTime,
          schedule.endTime
        )
      )
    }))
  }

  private isTimeOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && start2 < end1
  }
}
