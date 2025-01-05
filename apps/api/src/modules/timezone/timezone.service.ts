import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { RedisService } from '../redis/redis.service'

export interface TimezoneInfo {
  id: string
  name: string
  offset: string
  abbr: string
  isDST: boolean
}

@Injectable()
export class TimezoneService {
  private timezones: Map<string, TimezoneInfo>

  constructor(private redisService: RedisService) {
    this.initializeTimezones()
  }

  private async initializeTimezones() {
    const cached = await this.redisService.get('timezones:list')
    if (cached) {
      this.timezones = new Map(JSON.parse(cached))
      return
    }

    this.timezones = new Map()
    DateTime.ZONE_NAMES.forEach(zoneName => {
      const now = DateTime.now().setZone(zoneName)
      const info: TimezoneInfo = {
        id: zoneName,
        name: this.formatTimezoneName(zoneName),
        offset: now.toFormat('ZZ'),
        abbr: now.toFormat('ZZZZ'),
        isDST: now.isInDST
      }
      this.timezones.set(zoneName, info)
    })

    // Cache for 24 hours
    await this.redisService.set(
      'timezones:list',
      JSON.stringify(Array.from(this.timezones.entries())),
      24 * 60 * 60
    )
  }

  private formatTimezoneName(zoneName: string): string {
    return zoneName.replace(/_/g, ' ').replace(/\//g, ' / ')
  }

  async getAllTimezones(): Promise<TimezoneInfo[]> {
    return Array.from(this.timezones.values())
  }

  async convertTime(
    time: Date | string,
    fromZone: string,
    toZone: string
  ): Promise<Date> {
    const dt = DateTime.fromISO(time.toString(), { zone: fromZone })
    return dt.setZone(toZone).toJSDate()
  }

  async getLocalTime(timezone: string): Promise<Date> {
    return DateTime.now().setZone(timezone).toJSDate()
  }

  async formatTimeForZone(
    time: Date | string,
    timezone: string,
    format: string = 'yyyy-MM-dd HH:mm:ss'
  ): Promise<string> {
    return DateTime.fromISO(time.toString())
      .setZone(timezone)
      .toFormat(format)
  }

  async getTimezoneOffset(timezone: string): Promise<number> {
    return DateTime.now().setZone(timezone).offset
  }

  async isValidTimezone(timezone: string): Promise<boolean> {
    return this.timezones.has(timezone)
  }

  async getTimezoneSuggestions(query: string): Promise<TimezoneInfo[]> {
    const normalizedQuery = query.toLowerCase()
    return Array.from(this.timezones.values()).filter(
      tz =>
        tz.name.toLowerCase().includes(normalizedQuery) ||
        tz.id.toLowerCase().includes(normalizedQuery) ||
        tz.abbr.toLowerCase().includes(normalizedQuery)
    )
  }

  async getCommonTimezones(): Promise<TimezoneInfo[]> {
    const commonZones = [
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Australia/Sydney',
      'Pacific/Auckland'
    ]
    return commonZones.map(zone => this.timezones.get(zone)).filter(Boolean)
  }

  async getNextScheduleTime(
    baseTime: Date | string,
    recurrence: {
      frequency: 'daily' | 'weekly' | 'monthly'
      interval?: number
      daysOfWeek?: number[]
      timeOfDay: string // HH:mm format
    },
    timezone: string
  ): Promise<Date> {
    let dt = DateTime.fromISO(baseTime.toString()).setZone(timezone)
    const [hours, minutes] = recurrence.timeOfDay.split(':').map(Number)

    switch (recurrence.frequency) {
      case 'daily':
        dt = dt.set({ hour: hours, minute: minutes })
        if (dt < DateTime.now()) {
          dt = dt.plus({ days: recurrence.interval || 1 })
        }
        break

      case 'weekly':
        if (recurrence.daysOfWeek?.length) {
          const currentDayOfWeek = dt.weekday
          const nextDay = recurrence.daysOfWeek.find(day => day > currentDayOfWeek)
          if (nextDay) {
            dt = dt.set({ weekday: nextDay, hour: hours, minute: minutes })
          } else {
            dt = dt
              .plus({ weeks: recurrence.interval || 1 })
              .set({ weekday: recurrence.daysOfWeek[0], hour: hours, minute: minutes })
          }
        }
        break

      case 'monthly':
        dt = dt.set({ hour: hours, minute: minutes })
        if (dt < DateTime.now()) {
          dt = dt.plus({ months: recurrence.interval || 1 })
        }
        break
    }

    return dt.toJSDate()
  }

  async generateTimeSlots(
    startTime: Date | string,
    endTime: Date | string,
    duration: number, // in minutes
    timezone: string
  ): Promise<Array<{ start: Date; end: Date }>> {
    let current = DateTime.fromISO(startTime.toString()).setZone(timezone)
    const end = DateTime.fromISO(endTime.toString()).setZone(timezone)
    const slots = []

    while (current < end) {
      const slotEnd = current.plus({ minutes: duration })
      if (slotEnd > end) break

      slots.push({
        start: current.toJSDate(),
        end: slotEnd.toJSDate()
      })

      current = slotEnd
    }

    return slots
  }
}
