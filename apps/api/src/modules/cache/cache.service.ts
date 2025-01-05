import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { LoggerService } from '../logger/logger.service'

@Injectable()
export class CacheService implements OnModuleInit {
  private redis: Redis
  private localCache: Map<string, { value: any; expiry: number }> = new Map()

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService
  ) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      }
    })
  }

  async onModuleInit() {
    this.redis.on('error', (error) => {
      this.loggerService.error(
        'cache',
        `Redis connection error: ${error.message}`,
        error.stack
      )
    })

    this.redis.on('connect', () => {
      this.loggerService.log('cache', 'Connected to Redis')
    })

    // 定期清理过期的本地缓存
    setInterval(() => {
      const now = Date.now()
      for (const [key, { expiry }] of this.localCache.entries()) {
        if (expiry && expiry < now) {
          this.localCache.delete(key)
        }
      }
    }, 60000) // 每分钟清理一次
  }

  private getLocalCache<T>(key: string): T | null {
    const cached = this.localCache.get(key)
    if (cached) {
      if (!cached.expiry || cached.expiry > Date.now()) {
        return cached.value
      }
      this.localCache.delete(key)
    }
    return null
  }

  private setLocalCache(
    key: string,
    value: any,
    ttlSeconds?: number
  ): void {
    this.localCache.set(key, {
      value,
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      // 先检查本地缓存
      const localValue = this.getLocalCache<T>(key)
      if (localValue !== null) {
        return localValue
      }

      // 从Redis获取
      const value = await this.redis.get(key)
      if (!value) {
        return null
      }

      const parsed = JSON.parse(value)
      // 将Redis的值也存入本地缓存
      this.setLocalCache(key, parsed)
      return parsed
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error getting cache key ${key}: ${error.message}`,
        error.stack
      )
      return null
    }
  }

  async set(
    key: string,
    value: any,
    ttlSeconds?: number
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized)
      } else {
        await this.redis.set(key, serialized)
      }
      this.setLocalCache(key, value, ttlSeconds)
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error setting cache key ${key}: ${error.message}`,
        error.stack
      )
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
      this.localCache.delete(key)
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error deleting cache key ${key}: ${error.message}`,
        error.stack
      )
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      // 先从本地缓存获取
      const localResults = keys.map(key => this.getLocalCache<T>(key))
      const missingKeys = keys.filter(
        (key, index) => localResults[index] === null
      )

      if (missingKeys.length === 0) {
        return localResults
      }

      // 从Redis获取缺失的键
      const redisValues = await this.redis.mget(missingKeys)
      const parsedValues = redisValues.map(value =>
        value ? JSON.parse(value) : null
      )

      // 更新本地缓存
      missingKeys.forEach((key, index) => {
        if (parsedValues[index] !== null) {
          this.setLocalCache(key, parsedValues[index])
        }
      })

      // 合并结果
      return keys.map(key => this.getLocalCache<T>(key))
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error in mget: ${error.message}`,
        error.stack
      )
      return keys.map(() => null)
    }
  }

  async mset(
    items: { key: string; value: any; ttl?: number }[]
  ): Promise<void> {
    try {
      const pipeline = this.redis.pipeline()
      items.forEach(({ key, value, ttl }) => {
        const serialized = JSON.stringify(value)
        if (ttl) {
          pipeline.setex(key, ttl, serialized)
        } else {
          pipeline.set(key, serialized)
        }
        this.setLocalCache(key, value, ttl)
      })
      await pipeline.exec()
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error in mset: ${error.message}`,
        error.stack
      )
    }
  }

  async increment(key: string, value = 1): Promise<number> {
    try {
      const result = await this.redis.incrby(key, value)
      this.setLocalCache(key, result)
      return result
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error incrementing key ${key}: ${error.message}`,
        error.stack
      )
      return 0
    }
  }

  async decrement(key: string, value = 1): Promise<number> {
    try {
      const result = await this.redis.decrby(key, value)
      this.setLocalCache(key, result)
      return result
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error decrementing key ${key}: ${error.message}`,
        error.stack
      )
      return 0
    }
  }

  async flush(): Promise<void> {
    try {
      await this.redis.flushall()
      this.localCache.clear()
    } catch (error) {
      this.loggerService.error(
        'cache',
        `Error flushing cache: ${error.message}`,
        error.stack
      )
    }
  }
}
