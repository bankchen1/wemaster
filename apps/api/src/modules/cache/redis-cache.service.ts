import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        // 重试策略
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serializedValue);
    } else {
      await this.redis.set(key, serializedValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  // 用于在线状态管理
  async setUserStatus(userId: string, status: 'online' | 'offline'): Promise<void> {
    const key = `user:status:${userId}`;
    if (status === 'online') {
      await this.set(key, status, 300); // 5分钟过期
    } else {
      await this.del(key);
    }
  }

  // 获取用户在线状态
  async getUserStatus(userId: string): Promise<'online' | 'offline'> {
    const key = `user:status:${userId}`;
    const status = await this.get(key);
    return status || 'offline';
  }

  // 用于会议临时数据存储
  async setMeetingData(
    meetingId: string,
    data: any,
    ttl: number = 3600
  ): Promise<void> {
    const key = `meeting:data:${meetingId}`;
    await this.set(key, data, ttl);
  }

  async getMeetingData(meetingId: string): Promise<any> {
    const key = `meeting:data:${meetingId}`;
    return await this.get(key);
  }

  // 用于消息队列
  async pushMessage(queueName: string, message: any): Promise<void> {
    await this.redis.rpush(queueName, JSON.stringify(message));
  }

  async popMessage(queueName: string): Promise<any> {
    const message = await this.redis.lpop(queueName);
    return message ? JSON.parse(message) : null;
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
