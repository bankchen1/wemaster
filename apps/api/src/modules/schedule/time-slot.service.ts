import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { DateTime } from 'luxon'
import { TimeSlot, TimeSlotStatus, RecurrenceType } from './time-slot.entity'
import { CacheService } from '../cache/cache.service'
import { TimezoneService } from '../timezone/timezone.service'
import { LoggerService } from '../logger/logger.service'
import { MonitoringService } from '../monitoring/monitoring.service'

@Injectable()
export class TimeSlotService {
  private readonly CACHE_TTL = 3600 // 1小时缓存
  private readonly CACHE_PREFIX = 'timeslot:'

  constructor(
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    private cacheService: CacheService,
    private timezoneService: TimezoneService,
    private loggerService: LoggerService,
    private monitoringService: MonitoringService
  ) {}

  private getCacheKey(type: string, id: string): string {
    return `${this.CACHE_PREFIX}${type}:${id}`
  }

  async generateTimeSlots(params: {
    tutorId: string
    startDate: Date
    endDate: Date
    startTime: string
    endTime: string
    duration: number
    timezone: string
    recurrenceType: RecurrenceType
    daysOfWeek?: number[]
    excludeDates?: string[]
    settings?: Partial<TimeSlot['settings']>
  }): Promise<TimeSlot[]> {
    const startTime = performance.now()
    try {
      const slots = await this._generateTimeSlots(params)
      
      // 记录性能指标
      const duration = performance.now() - startTime
      this.monitoringService.recordScheduleMetric('schedule_slots_created', slots.length)
      this.monitoringService.recordScheduleMetric('schedule_generation_duration', duration)
      
      return slots
    } catch (error) {
      this.loggerService.error(
        'schedule',
        `Error generating time slots: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  private async _generateTimeSlots(params: any): Promise<TimeSlot[]> {
    const {
      tutorId,
      startDate,
      endDate,
      startTime,
      endTime,
      duration,
      timezone,
      recurrenceType,
      daysOfWeek = [],
      excludeDates = [],
      settings = {}
    } = params

    const slots: TimeSlot[] = []
    let currentDate = DateTime.fromJSDate(startDate).setZone(timezone)
    const endDateTime = DateTime.fromJSDate(endDate).setZone(timezone)

    while (currentDate <= endDateTime) {
      if (excludeDates.includes(currentDate.toISODate())) {
        currentDate = currentDate.plus({ days: 1 })
        continue
      }

      if (
        recurrenceType === RecurrenceType.WEEKLY &&
        !daysOfWeek.includes(currentDate.weekday)
      ) {
        currentDate = currentDate.plus({ days: 1 })
        continue
      }

      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)

      let slotStart = currentDate.set({
        hour: startHour,
        minute: startMinute,
        second: 0,
        millisecond: 0
      })

      const dayEnd = currentDate.set({
        hour: endHour,
        minute: endMinute,
        second: 0,
        millisecond: 0
      })

      while (slotStart.plus({ minutes: duration }) <= dayEnd) {
        const slot = this.timeSlotRepository.create({
          tutorId,
          startTime: slotStart.toJSDate(),
          endTime: slotStart.plus({ minutes: duration }).toJSDate(),
          status: TimeSlotStatus.AVAILABLE,
          duration,
          recurrenceType,
          recurrenceRule: {
            daysOfWeek,
            excludeDates,
            timezone
          },
          settings: {
            maxStudents: 1,
            ...settings
          }
        })

        slots.push(slot)
        slotStart = slotStart.plus({ minutes: duration })
      }

      currentDate = currentDate.plus({ days: 1 })
    }

    const savedSlots = await this.timeSlotRepository.save(slots)
    
    // 更新缓存
    const cacheKey = this.getCacheKey('tutor_slots', tutorId)
    await this.cacheService.del(cacheKey)
    
    return savedSlots
  }

  async findAvailableSlots(params: {
    tutorId?: string
    startDate: Date
    endDate: Date
    timezone: string
    duration?: number
    subjects?: string[]
  }): Promise<TimeSlot[]> {
    const startTime = performance.now()
    try {
      // 尝试从缓存获取
      const cacheKey = this.getCacheKey(
        'available_slots',
        `${params.tutorId}_${params.startDate.toISOString()}`
      )
      const cachedSlots = await this.cacheService.get<TimeSlot[]>(cacheKey)
      
      if (cachedSlots) {
        this.monitoringService.recordCacheMetric('cache_hit_count')
        return this.convertTimezone(cachedSlots, params.timezone)
      }
      
      this.monitoringService.recordCacheMetric('cache_miss_count')
      
      const slots = await this._findAvailableSlots(params)
      
      // 缓存结果
      await this.cacheService.set(cacheKey, slots, this.CACHE_TTL)
      
      // 记录性能指标
      const duration = performance.now() - startTime
      this.monitoringService.recordScheduleMetric('schedule_query_duration', duration)
      
      return slots
    } catch (error) {
      this.loggerService.error(
        'schedule',
        `Error finding available slots: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  private async _findAvailableSlots(params: any): Promise<TimeSlot[]> {
    const { tutorId, startDate, endDate, timezone, duration, subjects } = params

    const query = this.timeSlotRepository
      .createQueryBuilder('slot')
      .where('slot.status = :status', { status: TimeSlotStatus.AVAILABLE })
      .andWhere('slot.startTime >= :startDate', { startDate })
      .andWhere('slot.endTime <= :endDate', { endDate })

    if (tutorId) {
      query.andWhere('slot.tutorId = :tutorId', { tutorId })
    }

    if (duration) {
      query.andWhere('slot.duration = :duration', { duration })
    }

    if (subjects && subjects.length > 0) {
      query.andWhere('slot.settings->\'subjects\' ?& array[:subjects]', {
        subjects
      })
    }

    const slots = await query.getMany()
    return this.convertTimezone(slots, timezone)
  }

  private async convertTimezone(slots: TimeSlot[], targetTimezone: string): Promise<TimeSlot[]> {
    return Promise.all(
      slots.map(async slot => ({
        ...slot,
        startTime: await this.timezoneService.convertTime(
          slot.startTime,
          slot.recurrenceRule.timezone,
          targetTimezone
        ),
        endTime: await this.timezoneService.convertTime(
          slot.endTime,
          slot.recurrenceRule.timezone,
          targetTimezone
        )
      }))
    )
  }

  async bookTimeSlot(params: {
    slotId: string
    studentId: string
    timezone: string
  }): Promise<TimeSlot> {
    const startTime = performance.now()
    try {
      const slot = await this._bookTimeSlot(params)
      
      // 记录性能指标
      const duration = performance.now() - startTime
      this.monitoringService.recordScheduleMetric('schedule_booking_duration', duration)
      this.monitoringService.recordScheduleMetric('schedule_slots_booked')
      
      return slot
    } catch (error) {
      if (error instanceof BadRequestException) {
        this.monitoringService.recordScheduleMetric('schedule_conflict_count')
      }
      throw error
    }
  }

  private async _bookTimeSlot(params: any): Promise<TimeSlot> {
    const { slotId, studentId, timezone } = params

    const slot = await this.timeSlotRepository.findOne({
      where: { id: slotId }
    })

    if (!slot) {
      throw new BadRequestException('Time slot not found')
    }

    if (slot.status !== TimeSlotStatus.AVAILABLE) {
      throw new BadRequestException('Time slot is not available')
    }

    if (slot.bookedBy.length >= slot.settings.maxStudents) {
      throw new BadRequestException('Time slot is fully booked')
    }

    if (slot.bookedBy.includes(studentId)) {
      throw new BadRequestException('You have already booked this time slot')
    }

    const conflictSlot = await this.timeSlotRepository.findOne({
      where: {
        bookedBy: [studentId],
        startTime: LessThanOrEqual(slot.endTime),
        endTime: MoreThanOrEqual(slot.startTime),
        status: TimeSlotStatus.BOOKED
      }
    })

    if (conflictSlot) {
      throw new BadRequestException('You have a conflicting booking')
    }

    slot.bookedBy.push(studentId)
    if (slot.bookedBy.length >= slot.settings.maxStudents) {
      slot.status = TimeSlotStatus.BOOKED
    }

    const savedSlot = await this.timeSlotRepository.save(slot)
    
    // 清除相关缓存
    const cacheKeys = [
      this.getCacheKey('slot', slotId),
      this.getCacheKey('student_slots', studentId),
      this.getCacheKey('tutor_slots', slot.tutorId)
    ]
    await Promise.all(cacheKeys.map(key => this.cacheService.del(key)))
    
    return this.convertTimezone([savedSlot], timezone).then(slots => slots[0])
  }

  async cancelTimeSlot(params: {
    slotId: string
    userId: string
    isTutor: boolean
  }): Promise<TimeSlot> {
    const startTime = performance.now()
    try {
      const slot = await this._cancelTimeSlot(params)
      
      // 记录性能指标
      const duration = performance.now() - startTime
      this.monitoringService.recordScheduleMetric('schedule_cancellation_duration', duration)
      this.monitoringService.recordScheduleMetric('schedule_slots_cancelled')
      
      return slot
    } catch (error) {
      throw error
    }
  }

  private async _cancelTimeSlot(params: any): Promise<TimeSlot> {
    const { slotId, userId, isTutor } = params

    const slot = await this.timeSlotRepository.findOne({
      where: { id: slotId }
    })

    if (!slot) {
      throw new BadRequestException('Time slot not found')
    }

    if (isTutor) {
      if (slot.tutorId !== userId) {
        throw new BadRequestException('You can only cancel your own time slots')
      }
      slot.status = TimeSlotStatus.CANCELLED
    } else {
      if (!slot.bookedBy.includes(userId)) {
        throw new BadRequestException('You have not booked this time slot')
      }
      slot.bookedBy = slot.bookedBy.filter(id => id !== userId)
      if (slot.bookedBy.length === 0) {
        slot.status = TimeSlotStatus.AVAILABLE
      }
    }

    const savedSlot = await this.timeSlotRepository.save(slot)
    
    // 清除相关缓存
    const cacheKeys = [
      this.getCacheKey('slot', slotId),
      this.getCacheKey('student_slots', userId),
      this.getCacheKey('tutor_slots', slot.tutorId)
    ]
    await Promise.all(cacheKeys.map(key => this.cacheService.del(key)))
    
    return savedSlot
  }

  async generateRecurringSlots(): Promise<void> {
    const startTime = performance.now()
    try {
      await this._generateRecurringSlots()
      
      // 记录性能指标
      const duration = performance.now() - startTime
      this.monitoringService.recordScheduleMetric('schedule_recurring_generation_duration', duration)
    } catch (error) {
      this.loggerService.error(
        'schedule',
        'Error generating recurring slots',
        error.stack
      )
      throw error
    }
  }

  private async _generateRecurringSlots(): Promise<void> {
    const slots = await this.timeSlotRepository.find({
      where: {
        recurrenceType: [
          RecurrenceType.DAILY,
          RecurrenceType.WEEKLY,
          RecurrenceType.BIWEEKLY,
          RecurrenceType.MONTHLY
        ],
        recurrenceEndDate: MoreThanOrEqual(new Date())
      }
    })

    for (const slot of slots) {
      try {
        const lastGeneration = slot.lastRecurrenceGeneration || slot.startTime
        const now = new Date()

        let nextGeneration = DateTime.fromJSDate(lastGeneration)
        switch (slot.recurrenceType) {
          case RecurrenceType.DAILY:
            nextGeneration = nextGeneration.plus({ days: 1 })
            break
          case RecurrenceType.WEEKLY:
            nextGeneration = nextGeneration.plus({ weeks: 1 })
            break
          case RecurrenceType.BIWEEKLY:
            nextGeneration = nextGeneration.plus({ weeks: 2 })
            break
          case RecurrenceType.MONTHLY:
            nextGeneration = nextGeneration.plus({ months: 1 })
            break
        }

        if (nextGeneration.toJSDate() <= now) {
          await this.generateTimeSlots({
            tutorId: slot.tutorId,
            startDate: nextGeneration.toJSDate(),
            endDate: slot.recurrenceEndDate,
            startTime: nextGeneration.toFormat('HH:mm'),
            endTime: DateTime.fromJSDate(slot.endTime).toFormat('HH:mm'),
            duration: slot.duration,
            timezone: slot.recurrenceRule.timezone,
            recurrenceType: slot.recurrenceType,
            daysOfWeek: slot.recurrenceRule.daysOfWeek,
            excludeDates: slot.recurrenceRule.excludeDates,
            settings: slot.settings
          })

          slot.lastRecurrenceGeneration = nextGeneration.toJSDate()
          await this.timeSlotRepository.save(slot)
        }
      } catch (error) {
        this.loggerService.error(
          'schedule',
          `Failed to generate recurring slots for ${slot.id}: ${error.message}`,
          error.stack
        )
      }
    }
  }
}
