import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, EntityManager } from 'typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Review } from './review.entity'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { Booking } from '../booking/booking.entity'
import { CacheService } from '../cache/cache.service'
import { NotificationService } from '../notification/notification.service'
import { MonitoringService } from '../monitoring/monitoring.service'

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(TutorProfile)
    private tutorProfileRepo: Repository<TutorProfile>,
    @InjectRepository(Booking)
    private bookingRepo: Repository<Booking>,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private monitoringService: MonitoringService,
    private eventEmitter: EventEmitter2
  ) {}

  async createReview(
    userId: string,
    data: {
      bookingId: string
      rating: number
      content: string
      isAnonymous?: boolean
      tags?: string[]
    }
  ): Promise<Review> {
    // 验证预约
    const booking = await this.bookingRepo.findOne({
      where: {
        id: data.bookingId,
        userId,
        status: 'completed' // 只能评价已完成的课程
      },
      relations: ['tutor']
    })

    if (!booking) {
      throw new NotFoundException('Booking not found or not completed')
    }

    // 检查是否已评价
    const existingReview = await this.reviewRepo.findOne({
      where: { bookingId: data.bookingId }
    })

    if (existingReview) {
      throw new BadRequestException('Booking has already been reviewed')
    }

    return await this.entityManager.transaction(async manager => {
      // 创建评价
      const review = this.reviewRepo.create({
        userId,
        tutorId: booking.tutor.id,
        bookingId: booking.id,
        rating: data.rating,
        content: data.content,
        isAnonymous: data.isAnonymous || false,
        tags: data.tags
      })

      await manager.save(review)

      // 更新导师评分
      await this.updateTutorRating(booking.tutor.id, manager)

      // 发送通知
      await this.notificationService.sendNotification({
        userId: booking.tutor.userId,
        type: 'NEW_REVIEW',
        title: 'New Review',
        message: `You received a new ${data.rating}-star review`,
        data: {
          reviewId: review.id,
          bookingId: booking.id,
          rating: data.rating
        }
      })

      // 记录指标
      this.monitoringService.incrementCounter('reviews_created')
      this.monitoringService.recordHistogram('review_rating', data.rating)

      // 触发事件
      this.eventEmitter.emit('review.created', review)

      return review
    })
  }

  async updateReview(
    reviewId: string,
    userId: string,
    data: {
      rating?: number
      content?: string
      isAnonymous?: boolean
      tags?: string[]
    }
  ): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, userId }
    })

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    // 检查更新时间限制（例如24小时内）
    const hoursSinceCreation =
      (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCreation > 24) {
      throw new BadRequestException('Review can only be updated within 24 hours')
    }

    return await this.entityManager.transaction(async manager => {
      // 更新评价
      Object.assign(review, {
        ...data,
        isEdited: true
      })

      await manager.save(review)

      // 如果评分改变，更新导师评分
      if (data.rating && data.rating !== review.rating) {
        await this.updateTutorRating(review.tutorId, manager)
      }

      // 清除缓存
      await this.clearReviewCache(review.tutorId)

      // 触发事件
      this.eventEmitter.emit('review.updated', review)

      return review
    })
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, userId }
    })

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    // 检查删除时间限制
    const hoursSinceCreation =
      (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCreation > 24) {
      throw new BadRequestException('Review can only be deleted within 24 hours')
    }

    await this.entityManager.transaction(async manager => {
      await manager.remove(review)
      await this.updateTutorRating(review.tutorId, manager)
      await this.clearReviewCache(review.tutorId)
    })

    this.eventEmitter.emit('review.deleted', review)
  }

  async addTutorReply(
    reviewId: string,
    tutorId: string,
    reply: string
  ): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, tutorId }
    })

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    if (review.tutorReply) {
      throw new BadRequestException('Review already has a reply')
    }

    review.tutorReply = reply
    review.tutorReplyAt = new Date()

    await this.reviewRepo.save(review)
    await this.clearReviewCache(tutorId)

    // 发送通知给评价者
    await this.notificationService.sendNotification({
      userId: review.userId,
      type: 'REVIEW_REPLY',
      title: 'Tutor Replied to Your Review',
      message: 'Your review has received a response from the tutor',
      data: {
        reviewId: review.id,
        tutorId
      }
    })

    this.eventEmitter.emit('review.replied', review)

    return review
  }

  async markReviewHelpful(
    reviewId: string,
    userId: string
  ): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId }
    })

    if (!review) {
      throw new NotFoundException('Review not found')
    }

    if (review.helpfulUsers.includes(userId)) {
      throw new BadRequestException('Already marked as helpful')
    }

    review.helpfulUsers.push(userId)
    review.helpfulCount = review.helpfulUsers.length

    await this.reviewRepo.save(review)
    await this.clearReviewCache(review.tutorId)

    return review
  }

  async getTutorReviews(
    tutorId: string,
    options: {
      limit?: number
      offset?: number
      sortBy?: 'recent' | 'rating' | 'helpful'
      minRating?: number
      maxRating?: number
      withRepliesOnly?: boolean
    }
  ): Promise<{ reviews: Review[]; total: number }> {
    const cacheKey = `tutor:${tutorId}:reviews:${JSON.stringify(options)}`
    const cached = await this.cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .where('review.tutorId = :tutorId', { tutorId })
      .leftJoinAndSelect('review.user', 'user')

    if (options.minRating) {
      queryBuilder.andWhere('review.rating >= :minRating', {
        minRating: options.minRating
      })
    }

    if (options.maxRating) {
      queryBuilder.andWhere('review.rating <= :maxRating', {
        maxRating: options.maxRating
      })
    }

    if (options.withRepliesOnly) {
      queryBuilder.andWhere('review.tutorReply IS NOT NULL')
    }

    switch (options.sortBy) {
      case 'rating':
        queryBuilder.orderBy('review.rating', 'DESC')
        break
      case 'helpful':
        queryBuilder.orderBy('review.helpfulCount', 'DESC')
        break
      default:
        queryBuilder.orderBy('review.createdAt', 'DESC')
    }

    const [reviews, total] = await queryBuilder
      .skip(options.offset || 0)
      .take(options.limit || 10)
      .getManyAndCount()

    const result = { reviews, total }
    await this.cacheService.set(cacheKey, result, 3600)

    return result
  }

  private async updateTutorRating(
    tutorId: string,
    manager: EntityManager
  ): Promise<void> {
    const result = await manager
      .createQueryBuilder(Review, 'review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(*)', 'total')
      .where('review.tutorId = :tutorId', { tutorId })
      .getRawOne()

    await manager.update(
      TutorProfile,
      { id: tutorId },
      {
        rating: result.avgRating || 0,
        totalReviews: result.total
      }
    )

    await this.clearReviewCache(tutorId)
  }

  private async clearReviewCache(tutorId: string): Promise<void> {
    const pattern = `tutor:${tutorId}:reviews:*`
    await this.cacheService.delByPattern(pattern)
  }
}
