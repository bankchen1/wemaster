import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { TutorFollow } from './tutor-follow.entity'
import { TutorProfile } from './tutor-profile.entity'
import { User } from '../user/user.entity'
import { CacheService } from '../cache/cache.service'
import { NotificationService } from '../notification/notification.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class TutorSocialService {
  private readonly frontendUrl: string

  constructor(
    @InjectRepository(TutorFollow)
    private tutorFollowRepo: Repository<TutorFollow>,
    @InjectRepository(TutorProfile)
    private tutorProfileRepo: Repository<TutorProfile>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private eventEmitter: EventEmitter2,
    configService: ConfigService
  ) {
    this.frontendUrl = configService.get('FRONTEND_URL')
  }

  // 关注导师
  async followTutor(userId: string, tutorId: string): Promise<TutorFollow> {
    // 检查导师是否存在
    const tutor = await this.tutorProfileRepo.findOne({
      where: { id: tutorId, isActive: true }
    })

    if (!tutor) {
      throw new NotFoundException('Tutor not found')
    }

    // 检查是否已关注
    const existingFollow = await this.tutorFollowRepo.findOne({
      where: { userId, tutorId }
    })

    if (existingFollow) {
      throw new ConflictException('Already following this tutor')
    }

    // 创建关注记录
    const follow = this.tutorFollowRepo.create({
      userId,
      tutorId
    })

    await this.tutorFollowRepo.save(follow)

    // 清除缓存
    await this.clearFollowCache(userId, tutorId)

    // 发送通知给导师
    const user = await this.userRepo.findOne({
      where: { id: userId }
    })

    await this.notificationService.sendNotification({
      userId: tutor.userId,
      type: 'NEW_FOLLOWER',
      title: 'New Follower',
      message: `${user.fullName} started following you`,
      data: {
        followerId: userId,
        followerName: user.fullName
      }
    })

    // 触发事件
    this.eventEmitter.emit('tutor.followed', {
      tutorId,
      userId,
      follow
    })

    return follow
  }

  // 取消关注
  async unfollowTutor(userId: string, tutorId: string): Promise<void> {
    const follow = await this.tutorFollowRepo.findOne({
      where: { userId, tutorId }
    })

    if (!follow) {
      throw new NotFoundException('Follow relationship not found')
    }

    await this.tutorFollowRepo.remove(follow)

    // 清除缓存
    await this.clearFollowCache(userId, tutorId)

    // 触发事件
    this.eventEmitter.emit('tutor.unfollowed', {
      tutorId,
      userId
    })
  }

  // 获取用户关注的导师列表
  async getFollowedTutors(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<{ tutors: TutorProfile[]; total: number }> {
    const cacheKey = `user:${userId}:followed_tutors`
    const cached = await this.cacheService.get(cacheKey)

    if (cached && !options?.offset) {
      return cached
    }

    const [follows, total] = await this.tutorFollowRepo.findAndCount({
      where: { userId },
      relations: ['tutor', 'tutor.user'],
      order: { createdAt: 'DESC' },
      skip: options?.offset,
      take: options?.limit
    })

    const tutors = follows.map(follow => follow.tutor)

    if (!options?.offset) {
      await this.cacheService.set(cacheKey, { tutors, total }, 3600)
    }

    return { tutors, total }
  }

  // 获取导师的粉丝列表
  async getTutorFollowers(
    tutorId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<{ followers: User[]; total: number }> {
    const cacheKey = `tutor:${tutorId}:followers`
    const cached = await this.cacheService.get(cacheKey)

    if (cached && !options?.offset) {
      return cached
    }

    const [follows, total] = await this.tutorFollowRepo.findAndCount({
      where: { tutorId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: options?.offset,
      take: options?.limit
    })

    const followers = follows.map(follow => follow.user)

    if (!options?.offset) {
      await this.cacheService.set(cacheKey, { followers, total }, 3600)
    }

    return { followers, total }
  }

  // 检查是否已关注
  async isFollowing(userId: string, tutorId: string): Promise<boolean> {
    const cacheKey = `user:${userId}:following:${tutorId}`
    const cached = await this.cacheService.get(cacheKey)

    if (cached !== undefined) {
      return cached
    }

    const follow = await this.tutorFollowRepo.findOne({
      where: { userId, tutorId }
    })

    const isFollowing = !!follow
    await this.cacheService.set(cacheKey, isFollowing, 3600)

    return isFollowing
  }

  // 生成分享链接
  async generateShareLink(tutorId: string): Promise<{
    url: string
    title: string
    description: string
    image?: string
  }> {
    const tutor = await this.tutorProfileRepo.findOne({
      where: { id: tutorId },
      relations: ['user']
    })

    if (!tutor) {
      throw new NotFoundException('Tutor not found')
    }

    return {
      url: `${this.frontendUrl}/tutors/${tutorId}`,
      title: `${tutor.user.fullName} - Professional Tutor`,
      description: tutor.bio,
      image: tutor.user['avatarUrl'] // 假设User实体有avatarUrl字段
    }
  }

  // 获取热门导师
  async getPopularTutors(limit: number = 10): Promise<TutorProfile[]> {
    const cacheKey = `popular_tutors:${limit}`
    const cached = await this.cacheService.get(cacheKey)

    if (cached) {
      return cached
    }

    // 基于关注数量获取热门导师
    const tutors = await this.tutorProfileRepo
      .createQueryBuilder('tutor')
      .leftJoin('tutor_follows', 'follow', 'follow.tutorId = tutor.id')
      .addSelect('COUNT(follow.id)', 'followCount')
      .where('tutor.isActive = :isActive', { isActive: true })
      .groupBy('tutor.id')
      .orderBy('followCount', 'DESC')
      .limit(limit)
      .getMany()

    await this.cacheService.set(cacheKey, tutors, 3600)

    return tutors
  }

  private async clearFollowCache(userId: string, tutorId: string): Promise<void> {
    const keys = [
      `user:${userId}:followed_tutors`,
      `tutor:${tutorId}:followers`,
      `user:${userId}:following:${tutorId}`
    ]

    await Promise.all(
      keys.map(key => this.cacheService.del(key))
    )
  }
}
