import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TutorFavorite } from './favorite.entity'
import { TutorService } from './tutor.service'
import { RedisService } from '../redis/redis.service'

@Injectable()
export class TutorFavoriteService {
  constructor(
    @InjectRepository(TutorFavorite)
    private favoriteRepository: Repository<TutorFavorite>,
    private tutorService: TutorService,
    private redisService: RedisService
  ) {}

  async addFavorite(userId: string, tutorId: string) {
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { userId, tutorId }
    })

    if (existingFavorite) {
      throw new ConflictException('导师已经在收藏列表中')
    }

    const tutor = await this.tutorService.findOne(tutorId)
    const favorite = this.favoriteRepository.create({
      userId,
      tutorId
    })

    await this.favoriteRepository.save(favorite)
    await this.updateFavoriteCache(userId)

    return favorite
  }

  async removeFavorite(userId: string, tutorId: string) {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, tutorId }
    })

    if (!favorite) {
      throw new NotFoundException('收藏记录不存在')
    }

    await this.favoriteRepository.remove(favorite)
    await this.updateFavoriteCache(userId)

    return { success: true }
  }

  async getFavorites(userId: string, page = 1, limit = 10) {
    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: { userId },
      relations: ['tutor'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    })

    return {
      favorites,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  async isFavorite(userId: string, tutorId: string): Promise<boolean> {
    const cacheKey = `user:${userId}:favorites`
    const cachedFavorites = await this.redisService.get(cacheKey)

    if (cachedFavorites) {
      const favoriteIds = JSON.parse(cachedFavorites)
      return favoriteIds.includes(tutorId)
    }

    const favorite = await this.favoriteRepository.findOne({
      where: { userId, tutorId }
    })

    return !!favorite
  }

  private async updateFavoriteCache(userId: string) {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      select: ['tutorId']
    })

    const favoriteIds = favorites.map(f => f.tutorId)
    await this.redisService.set(
      `user:${userId}:favorites`,
      JSON.stringify(favoriteIds),
      60 * 60 * 24 // 24小时缓存
    )
  }
}
