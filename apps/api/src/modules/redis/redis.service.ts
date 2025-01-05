import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      db: 0,
      retryStrategy: (times) => {
        // 重试策略
        const delay = Math.min(times * 50, 2000)
        return delay
      }
    })

    // 错误处理
    this.redis.on('error', (error) => {
      console.error('Redis Error:', error)
    })
  }

  async onModuleDestroy() {
    await this.redis.quit()
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  async set(
    key: string,
    value: string,
    ttl?: number
  ): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl)
    } else {
      await this.redis.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key)
    return result === 1
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key)
  }

  async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<void> {
    await this.redis.zadd(key, score, member)
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    withScores = false
  ): Promise<string[]> {
    if (withScores) {
      return this.redis.zrange(key, start, stop, 'WITHSCORES')
    }
    return this.redis.zrange(key, start, stop)
  }

  // 用于缓存对象
  async getObject<T>(key: string): Promise<T | null> {
    const data = await this.get(key)
    return data ? JSON.parse(data) : null
  }

  async setObject<T>(
    key: string,
    value: T,
    ttl?: number
  ): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl)
  }

  // 用于分布式锁
  async lock(
    key: string,
    ttl: number
  ): Promise<boolean> {
    const result = await this.redis.set(
      `lock:${key}`,
      '1',
      'EX',
      ttl,
      'NX'
    )
    return result === 'OK'
  }

  async unlock(key: string): Promise<void> {
    await this.del(`lock:${key}`)
  }

  // 用于限流
  async rateLimit(
    key: string,
    limit: number,
    window: number
  ): Promise<boolean> {
    const current = await this.incr(key)
    if (current === 1) {
      await this.redis.expire(key, window)
    }
    return current <= limit
  }

  // 发布订阅
  async publish(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message)
  }

  async subscribe(
    channel: string,
    callback: (channel: string, message: string) => void
  ): Promise<void> {
    const subscriber = this.redis.duplicate()
    await subscriber.subscribe(channel)
    subscriber.on('message', callback)
  }

  // 缓存预热
  async warmup<T>(
    key: string,
    getData: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.getObject<T>(key)
    if (cached) return cached

    const data = await getData()
    await this.setObject(key, data, ttl)
    return data
  }
}
