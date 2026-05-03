import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

let redisClient: RedisClientType;

export async function initializeRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: false, // Disable auto-reconnect
      },
    });

    redisClient.on('error', (err) => {
      // Silently ignore errors if Redis is not available
      if (err.code !== 'ECONNREFUSED') {
        logger.error('Redis client error:', err);
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redisClient.connect();
    logger.info('Redis initialized successfully');
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      logger.warn('Redis not available - continuing without cache');
    } else {
      logger.warn('Redis connection failed - continuing without cache:', error.message);
    }
    redisClient = null as any; // Clear the client
  }
}

export function getRedisClient(): RedisClientType | null {
  if (!redisClient || !redisClient.isOpen) {
    logger.warn('Redis client not available');
    return null;
  }
  return redisClient;
}

// Cache helper functions
export async function cacheSet(
  key: string,
  value: any,
  expirySeconds?: number
): Promise<void> {
  if (!redisClient || !redisClient.isOpen) {
    logger.debug('Cache set skipped - Redis not available');
    return;
  }
  
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (expirySeconds) {
      await redisClient.setEx(key, expirySeconds, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
  } catch (error) {
    logger.warn('Cache set failed:', error);
  }
}

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  if (!redisClient || !redisClient.isOpen) {
    logger.debug('Cache get skipped - Redis not available');
    return null;
  }
  
  try {
    const value = await redisClient.get(key);
    
    if (!value) {
      return null;
    }
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  } catch (error) {
    logger.warn('Cache get failed:', error);
    return null;
  }
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redisClient || !redisClient.isOpen) {
    logger.debug('Cache delete skipped - Redis not available');
    return;
  }
  
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.warn('Cache delete failed:', error);
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (!redisClient || !redisClient.isOpen) {
    logger.debug('Cache delete pattern skipped - Redis not available');
    return;
  }
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.warn('Cache delete pattern failed:', error);
  }
}

export async function cacheExists(key: string): Promise<boolean> {
  if (!redisClient || !redisClient.isOpen) {
    logger.debug('Cache exists skipped - Redis not available');
    return false;
  }
  
  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.warn('Cache exists failed:', error);
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}
