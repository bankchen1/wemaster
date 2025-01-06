import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from '@vercel/kv';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }

  async onModuleDestroy() {
    // Vercel KV doesn't require explicit connection closing
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: any, ttl?: number) {
    if (ttl) {
      await this.client.set(key, value, { ex: ttl });
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async incr(key: string) {
    return await this.client.incr(key);
  }

  async expire(key: string, seconds: number) {
    await this.client.expire(key, seconds);
  }

  async keys(pattern: string) {
    return await this.client.keys(pattern);
  }
}
