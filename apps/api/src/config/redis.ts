// apps/api/src/config/redis.ts
import IORedis from 'ioredis'
import { logger } from '../utils/logger'

export const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

redis.on('connect', () => logger.info('Redis connected'))
redis.on('error', (err) => logger.error('Redis error:', err.message))

export const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 50,
}
