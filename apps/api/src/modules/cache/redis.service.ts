import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from '@vercel/kv';

@Injectable()
export class RedisService implements OnModuleInit {
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }

  async onModuleInit() {
    // Vercel KV doesn't require explicit initialization
  }

  async get(key: string) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Error getting key from KV:', error);
      throw error;
    }
  }

  async set(key: string, value: any, ttl?: number) {
    try {
      if (ttl) {
        await this.client.set(key, value, { ex: ttl });
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Error setting key in KV:', error);
      throw error;
    }
  }

  async del(key: string) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting key from KV:', error);
      throw error;
    }
  }

  async incr(key: string) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('Error incrementing key in KV:', error);
      throw error;
    }
  }

  async expire(key: string, seconds: number) {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      console.error('Error setting expiry in KV:', error);
      throw error;
    }
  }

  async keys(pattern: string) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error('Error getting keys from KV:', error);
      throw error;
    }
  }

  async mget(keys: string[]) {
    try {
      return await this.client.mget(...keys);
    } catch (error) {
      console.error('Error getting multiple keys from KV:', error);
      throw error;
    }
  }

  async mset(keyValuePairs: Record<string, any>) {
    try {
      const entries = Object.entries(keyValuePairs);
      await this.client.mset(...entries.flat());
    } catch (error) {
      console.error('Error setting multiple keys in KV:', error);
      throw error;
    }
  }
}
