// apps/api/src/config/prisma.ts
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL || ''
  
  if (!dbUrl || dbUrl.includes('placeholder')) {
    logger.error('❌ DATABASE_URL is not set or contains a placeholder!')
  } else {
    // Log a safe version of the URL (hide password)
    const safeUrl = dbUrl.replace(/:([^@]+)@/, ':***@')
    logger.info(`📡 Connecting to database: ${safeUrl.substring(0, 80)}...`)
  }

  return new PrismaClient({
    datasourceUrl: dbUrl,
    log: [
      { emit: 'event', level: 'error' },
    ],
  })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

prisma.$on('error', (e: { message: string }) => {
  logger.error('Prisma error:', e.message)
})
