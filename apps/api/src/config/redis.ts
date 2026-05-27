// apps/api/src/config/redis.ts
import { logger } from '../utils/logger'

// Redis is OPTIONAL — only used for BullMQ AI job queues.
// If REDIS_URL is not set, the API runs without Redis (AI queue features disabled).

let redis: any = null

async function getRedis() {
  if (redis) return redis
  
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    logger.warn('⚠️ REDIS_URL not set — AI job queue features are disabled')
    return null
  }

  try {
    const IORedis = (await import('ioredis')).default
    redis = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.error('❌ Redis connection failed after 3 retries. AI features disabled.')
          return null // Stop retrying
        }
        return Math.min(times * 500, 3000)
      },
    })

    redis.on('connect', () => logger.info('✅ Redis connected'))
    redis.on('error', (err: Error) => logger.error('Redis error:', err.message))

    await redis.connect()
    return redis
  } catch (err) {
    logger.warn('⚠️ Redis connection failed. AI job queue disabled.', (err as Error).message)
    redis = null
    return null
  }
}

export { getRedis }

export const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: 50,
}
