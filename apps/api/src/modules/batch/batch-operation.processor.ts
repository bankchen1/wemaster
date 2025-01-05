import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review } from '../review/review.entity'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { Booking } from '../booking/booking.entity'
import { User } from '../user/user.entity'
import { NotificationService } from '../notification/notification.service'
import { MonitoringService } from '../monitoring/monitoring.service'
import { CacheService } from '../cache/cache.service'
import * as ExcelJS from 'exceljs'
import * as csv from 'fast-csv'
import { createObjectCsvWriter } from 'csv-writer'

@Processor('batch-operations')
@Injectable()
export class BatchOperationProcessor {
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
    private cacheService: CacheService
  ) {}

  @Process('send-notifications')
  async handleSendNotifications(job: Job) {
    const { notifications } = job.data

    try {
      // 分批处理通知，每批100条
      const batchSize = 100
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize)
        await Promise.all(
          batch.map(notification =>
            this.notificationService.sendNotification(notification)
          )
        )
        await this.monitoringService.incrementCounter(
          'notifications_sent',
          batch.length
        )
      }
    } catch (error) {
      console.error('Failed to send notifications:', error)
      throw error
    }
  }

  @Process('update-rating')
  async handleUpdateRating(job: Job) {
    const { tutorId } = job.data

    try {
      const reviews = await this.reviewRepo.find({
        where: { tutorId }
      })

      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      )
      const averageRating = totalRating / reviews.length

      await this.tutorProfileRepo.update(tutorId, {
        rating: averageRating,
        totalReviews: reviews.length
      })

      await this.cacheService.delByPattern(`tutor:${tutorId}:*`)
    } catch (error) {
      console.error('Failed to update rating:', error)
      throw error
    }
  }

  @Process('process-expired-booking')
  async handleExpiredBooking(job: Job) {
    const { bookingId } = job.data

    try {
      const booking = await this.bookingRepo.findOne({
        where: { id: bookingId },
        relations: ['user', 'tutor']
      })

      if (!booking) return

      await this.bookingRepo.update(bookingId, {
        status: 'expired'
      })

      // 发送通知
      await this.notificationService.sendNotification({
        userId: booking.userId,
        type: 'BOOKING_EXPIRED',
        title: '预约已过期',
        message: '您的预约已过期，请重新预约',
        data: { bookingId }
      })

      await this.notificationService.sendNotification({
        userId: booking.tutor.userId,
        type: 'BOOKING_EXPIRED',
        title: '预约已过期',
        message: '一个预约已过期',
        data: { bookingId }
      })
    } catch (error) {
      console.error('Failed to process expired booking:', error)
      throw error
    }
  }

  @Process('export-data')
  async handleExportData(job: Job) {
    const { type, filters, format } = job.data

    try {
      let data
      switch (type) {
        case 'reviews':
          data = await this.reviewRepo.find({
            where: filters,
            relations: ['user', 'tutor']
          })
          break
        case 'bookings':
          data = await this.bookingRepo.find({
            where: filters,
            relations: ['user', 'tutor']
          })
          break
        case 'users':
          data = await this.userRepo.find({
            where: filters
          })
          break
      }

      if (format === 'csv') {
        return await this.exportToCsv(data, type)
      } else {
        return await this.exportToExcel(data, type)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  @Process('import-data')
  async handleImportData(job: Job) {
    const { type, data } = job.data

    try {
      switch (type) {
        case 'reviews':
          await this.reviewRepo.save(data)
          break
        case 'bookings':
          await this.bookingRepo.save(data)
          break
        case 'users':
          await this.userRepo.save(data)
          break
      }
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  @Process('send-marketing-emails')
  async handleMarketingEmails(job: Job) {
    const { template, userIds, data } = job.data

    try {
      const users = await this.userRepo.findByIds(userIds)

      // 分批处理邮件发送
      const batchSize = 50
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize)
        await Promise.all(
          batch.map(user =>
            this.notificationService.sendEmail({
              to: user.email,
              template,
              data: { ...data, user }
            })
          )
        )
      }
    } catch (error) {
      console.error('Failed to send marketing emails:', error)
      throw error
    }
  }

  @Process('generate-reports')
  async handleGenerateReports(job: Job) {
    const { type, period, ids } = job.data

    try {
      // 根据不同类型生成不同的报告
      switch (type) {
        case 'tutor':
          // 生成导师报告
          break
        case 'student':
          // 生成学生报告
          break
        case 'platform':
          // 生成平台报告
          break
      }
    } catch (error) {
      console.error('Failed to generate reports:', error)
      throw error
    }
  }

  private async exportToCsv(data: any[], type: string): Promise<string> {
    const csvWriter = createObjectCsvWriter({
      path: `exports/${type}-${Date.now()}.csv`,
      header: Object.keys(data[0]).map(key => ({
        id: key,
        title: key
      }))
    })

    await csvWriter.writeRecords(data)
    return csvWriter.path
  }

  private async exportToExcel(data: any[], type: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(type)

    // 添加表头
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key
    }))

    // 添加数据
    worksheet.addRows(data)

    return await workbook.xlsx.writeBuffer()
  }
}
