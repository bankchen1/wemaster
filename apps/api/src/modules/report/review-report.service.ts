import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, In } from 'typeorm'
import { Review } from '../review/review.entity'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { CacheService } from '../cache/cache.service'
import { MonitoringService } from '../monitoring/monitoring.service'
import * as ExcelJS from 'exceljs'
import { format } from 'date-fns'

interface ReportFilter {
  startDate?: Date
  endDate?: Date
  minRating?: number
  maxRating?: number
  tags?: string[]
  hasReply?: boolean
  isAnonymous?: boolean
}

interface ReportData {
  reviews: Review[]
  summary: {
    totalReviews: number
    averageRating: number
    responseRate: number
    averageResponseTime: number
    ratingDistribution: { [key: number]: number }
    topTags: { tag: string; count: number }[]
  }
}

@Injectable()
export class ReviewReportService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(TutorProfile)
    private tutorProfileRepo: Repository<TutorProfile>,
    private cacheService: CacheService,
    private monitoringService: MonitoringService
  ) {}

  async generateReport(
    tutorId: string,
    filter: ReportFilter
  ): Promise<ReportData> {
    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.tutorId = :tutorId', { tutorId })

    // 应用筛选条件
    if (filter.startDate) {
      queryBuilder.andWhere('review.createdAt >= :startDate', {
        startDate: filter.startDate
      })
    }

    if (filter.endDate) {
      queryBuilder.andWhere('review.createdAt <= :endDate', {
        endDate: filter.endDate
      })
    }

    if (filter.minRating) {
      queryBuilder.andWhere('review.rating >= :minRating', {
        minRating: filter.minRating
      })
    }

    if (filter.maxRating) {
      queryBuilder.andWhere('review.rating <= :maxRating', {
        maxRating: filter.maxRating
      })
    }

    if (filter.tags && filter.tags.length > 0) {
      queryBuilder.andWhere('review.tags && ARRAY[:...tags]', {
        tags: filter.tags
      })
    }

    if (filter.hasReply !== undefined) {
      if (filter.hasReply) {
        queryBuilder.andWhere('review.tutorReply IS NOT NULL')
      } else {
        queryBuilder.andWhere('review.tutorReply IS NULL')
      }
    }

    if (filter.isAnonymous !== undefined) {
      queryBuilder.andWhere('review.isAnonymous = :isAnonymous', {
        isAnonymous: filter.isAnonymous
      })
    }

    const reviews = await queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .getMany()

    // 计算统计数据
    const summary = this.calculateSummary(reviews)

    return {
      reviews,
      summary
    }
  }

  private calculateSummary(reviews: Review[]) {
    const totalReviews = reviews.length
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

    const repliedReviews = reviews.filter(review => review.tutorReply)
    const responseRate = (repliedReviews.length / totalReviews) * 100

    const responseTimes = repliedReviews
      .map(review => {
        const replyTime =
          new Date(review.tutorReplyAt!).getTime() -
          new Date(review.createdAt).getTime()
        return replyTime / (1000 * 60 * 60)
      })
      .filter(time => time > 0)

    const averageResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) /
      responseTimes.length

    // 计算评分分布
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1
      return dist
    }, {} as { [key: number]: number })

    // 统计标签
    const tagCounts = new Map<string, number>()
    reviews.forEach(review => {
      if (!review.tags) return
      review.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalReviews,
      averageRating,
      responseRate,
      averageResponseTime,
      ratingDistribution,
      topTags
    }
  }

  async exportToExcel(
    tutorId: string,
    filter: ReportFilter
  ): Promise<Buffer> {
    const { reviews, summary } = await this.generateReport(tutorId, filter)

    const workbook = new ExcelJS.Workbook()

    // 评价列表工作表
    const reviewsSheet = workbook.addWorksheet('Reviews')
    reviewsSheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Student', key: 'student', width: 20 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Content', key: 'content', width: 50 },
      { header: 'Tags', key: 'tags', width: 20 },
      { header: 'Reply', key: 'reply', width: 50 },
      { header: 'Reply Time', key: 'replyTime', width: 20 }
    ]

    reviews.forEach(review => {
      reviewsSheet.addRow({
        date: format(new Date(review.createdAt), 'yyyy-MM-dd HH:mm'),
        student: review.isAnonymous
          ? 'Anonymous'
          : review.user.fullName,
        rating: review.rating,
        content: review.content,
        tags: review.tags ? review.tags.join(', ') : '',
        reply: review.tutorReply || '',
        replyTime: review.tutorReplyAt
          ? format(new Date(review.tutorReplyAt), 'yyyy-MM-dd HH:mm')
          : ''
      })
    })

    // 统计数据工作表
    const summarySheet = workbook.addWorksheet('Summary')
    summarySheet.addRow(['Total Reviews', summary.totalReviews])
    summarySheet.addRow([
      'Average Rating',
      summary.averageRating.toFixed(2)
    ])
    summarySheet.addRow([
      'Response Rate',
      `${summary.responseRate.toFixed(2)}%`
    ])
    summarySheet.addRow([
      'Average Response Time',
      `${summary.averageResponseTime.toFixed(2)} hours`
    ])

    summarySheet.addRow([])
    summarySheet.addRow(['Rating Distribution'])
    Object.entries(summary.ratingDistribution).forEach(([rating, count]) => {
      summarySheet.addRow([`${rating} Stars`, count])
    })

    summarySheet.addRow([])
    summarySheet.addRow(['Top Tags'])
    summary.topTags.forEach(({ tag, count }) => {
      summarySheet.addRow([tag, count])
    })

    // 设置样式
    reviewsSheet.getRow(1).font = { bold: true }
    summarySheet.getColumn(1).font = { bold: true }

    // 导出为 Buffer
    return await workbook.xlsx.writeBuffer()
  }

  async exportToPdf(
    tutorId: string,
    filter: ReportFilter
  ): Promise<Buffer> {
    const { reviews, summary } = await this.generateReport(tutorId, filter)

    // 使用 PDFKit 或其他 PDF 生成库
    // 这里省略具体实现
    throw new Error('PDF export not implemented yet')
  }

  // 自动生成每周/每月报告
  async generatePeriodicReport(
    tutorId: string,
    period: 'weekly' | 'monthly'
  ) {
    const endDate = new Date()
    const startDate = new Date()

    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7)
    } else {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    const filter: ReportFilter = {
      startDate,
      endDate
    }

    const report = await this.generateReport(tutorId, filter)

    // 可以在这里添加发送邮件或通知的逻辑
    return report
  }
}
