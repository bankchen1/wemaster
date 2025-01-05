import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Review } from '../review/review.entity'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { CacheService } from '../cache/cache.service'
import { MonitoringService } from '../monitoring/monitoring.service'

interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

interface TagAnalytics {
  tag: string
  count: number
  averageRating: number
}

interface TrendData {
  date: string
  averageRating: number
  reviewCount: number
}

@Injectable()
export class ReviewAnalyticsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(TutorProfile)
    private tutorProfileRepo: Repository<TutorProfile>,
    private cacheService: CacheService,
    private monitoringService: MonitoringService
  ) {}

  async getTutorAnalytics(tutorId: string): Promise<{
    ratingDistribution: RatingDistribution[]
    tagAnalytics: TagAnalytics[]
    trends: TrendData[]
    summary: {
      totalReviews: number
      averageRating: number
      responseRate: number
      averageResponseTime: number
    }
  }> {
    const cacheKey = `tutor:${tutorId}:analytics`
    const cached = await this.cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    const [
      ratingDistribution,
      tagAnalytics,
      trends,
      summary
    ] = await Promise.all([
      this.getRatingDistribution(tutorId),
      this.getTagAnalytics(tutorId),
      this.getTrends(tutorId),
      this.getSummary(tutorId)
    ])

    const analytics = {
      ratingDistribution,
      tagAnalytics,
      trends,
      summary
    }

    await this.cacheService.set(cacheKey, analytics, 3600)
    return analytics
  }

  private async getRatingDistribution(
    tutorId: string
  ): Promise<RatingDistribution[]> {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.tutorId = :tutorId', { tutorId })
      .groupBy('review.rating')
      .orderBy('review.rating', 'DESC')
      .getRawMany()

    const total = result.reduce((sum, item) => sum + parseInt(item.count), 0)

    return result.map(item => ({
      rating: parseFloat(item.rating),
      count: parseInt(item.count),
      percentage: (parseInt(item.count) / total) * 100
    }))
  }

  private async getTagAnalytics(tutorId: string): Promise<TagAnalytics[]> {
    const reviews = await this.reviewRepo.find({
      where: { tutorId },
      select: ['tags', 'rating']
    })

    const tagStats = new Map<string, { sum: number; count: number }>()

    reviews.forEach(review => {
      if (!review.tags) return

      review.tags.forEach(tag => {
        const stats = tagStats.get(tag) || { sum: 0, count: 0 }
        stats.sum += review.rating
        stats.count++
        tagStats.set(tag, stats)
      })
    })

    return Array.from(tagStats.entries())
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        averageRating: stats.sum / stats.count
      }))
      .sort((a, b) => b.count - a.count)
  }

  private async getTrends(tutorId: string): Promise<TrendData[]> {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const reviews = await this.reviewRepo
      .createQueryBuilder('review')
      .select('DATE(review.createdAt)', 'date')
      .addSelect('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(*)', 'reviewCount')
      .where('review.tutorId = :tutorId', { tutorId })
      .andWhere('review.createdAt >= :startDate', {
        startDate: sixMonthsAgo
      })
      .groupBy('DATE(review.createdAt)')
      .orderBy('DATE(review.createdAt)', 'ASC')
      .getRawMany()

    return reviews.map(item => ({
      date: item.date,
      averageRating: parseFloat(item.averageRating),
      reviewCount: parseInt(item.reviewCount)
    }))
  }

  private async getSummary(tutorId: string): Promise<{
    totalReviews: number
    averageRating: number
    responseRate: number
    averageResponseTime: number
  }> {
    const reviews = await this.reviewRepo.find({
      where: { tutorId },
      select: ['rating', 'createdAt', 'tutorReply', 'tutorReplyAt']
    })

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
        return replyTime / (1000 * 60 * 60) // 转换为小时
      })
      .filter(time => time > 0)

    const averageResponseTime =
      responseTimes.reduce((sum, time) => sum + time, 0) /
      responseTimes.length

    return {
      totalReviews,
      averageRating,
      responseRate,
      averageResponseTime
    }
  }

  // 获取评价洞察
  async getReviewInsights(tutorId: string): Promise<{
    strengths: string[]
    improvements: string[]
    recommendations: string[]
  }> {
    const analytics = await this.getTutorAnalytics(tutorId)

    // 分析标签表现
    const strengths = analytics.tagAnalytics
      .filter(tag => tag.averageRating >= 4.5)
      .map(tag => tag.tag)

    const improvements = analytics.tagAnalytics
      .filter(tag => tag.averageRating <= 3.5)
      .map(tag => tag.tag)

    // 生成建议
    const recommendations = []

    if (analytics.summary.responseRate < 80) {
      recommendations.push('Improve response rate to student reviews')
    }

    if (analytics.summary.averageResponseTime > 24) {
      recommendations.push('Try to respond to reviews more quickly')
    }

    const recentTrend = analytics.trends.slice(-3)
    const averageRecentRating =
      recentTrend.reduce((sum, item) => sum + item.averageRating, 0) /
      recentTrend.length

    if (averageRecentRating < analytics.summary.averageRating) {
      recommendations.push('Recent ratings show a declining trend')
    }

    return {
      strengths,
      improvements,
      recommendations
    }
  }

  // 获取相似导师
  async getSimilarTutors(tutorId: string, limit: number = 5): Promise<TutorProfile[]> {
    const tutor = await this.tutorProfileRepo.findOne({
      where: { id: tutorId },
      relations: ['user']
    })

    if (!tutor) {
      return []
    }

    // 基于科目和评分查找相似导师
    const similarTutors = await this.tutorProfileRepo
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.user', 'user')
      .where('tutor.id != :tutorId', { tutorId })
      .andWhere('tutor.subjects && ARRAY[:...subjects]', {
        subjects: tutor.subjects
      })
      .andWhere('ABS(tutor.rating - :rating) <= 0.5', {
        rating: tutor.rating
      })
      .orderBy('tutor.rating', 'DESC')
      .addOrderBy('tutor.totalReviews', 'DESC')
      .take(limit)
      .getMany()

    return similarTutors
  }

  // 获取推荐导师
  async getRecommendedTutors(
    userId: string,
    limit: number = 5
  ): Promise<TutorProfile[]> {
    // 获取用户的历史评价
    const userReviews = await this.reviewRepo.find({
      where: { userId },
      relations: ['tutor']
    })

    // 如果用户没有评价历史，返回评分最高的导师
    if (userReviews.length === 0) {
      return this.tutorProfileRepo
        .createQueryBuilder('tutor')
        .leftJoinAndSelect('tutor.user', 'user')
        .where('tutor.isActive = :isActive', { isActive: true })
        .orderBy('tutor.rating', 'DESC')
        .addOrderBy('tutor.totalReviews', 'DESC')
        .take(limit)
        .getMany()
    }

    // 分析用户偏好
    const preferredSubjects = new Set<string>()
    const highRatedTutors = new Set<string>()

    userReviews.forEach(review => {
      if (review.rating >= 4) {
        review.tutor.subjects.forEach(subject => preferredSubjects.add(subject))
        highRatedTutors.add(review.tutorId)
      }
    })

    // 基于用户偏好推荐导师
    return this.tutorProfileRepo
      .createQueryBuilder('tutor')
      .leftJoinAndSelect('tutor.user', 'user')
      .where('tutor.id NOT IN (:...reviewedTutors)', {
        reviewedTutors: [...highRatedTutors]
      })
      .andWhere('tutor.isActive = :isActive', { isActive: true })
      .andWhere('tutor.subjects && ARRAY[:...subjects]', {
        subjects: [...preferredSubjects]
      })
      .orderBy('tutor.rating', 'DESC')
      .addOrderBy('tutor.totalReviews', 'DESC')
      .take(limit)
      .getMany()
  }
}
