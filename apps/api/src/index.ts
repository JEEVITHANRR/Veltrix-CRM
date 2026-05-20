// apps/api/src/index.ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { errorMiddleware } from './middleware/error'
import { logger } from './utils/logger'
import authRoutes from './routes/auth'
import workspaceRoutes from './routes/workspaces'
import crmRoutes from './routes/crm'
import aiRoutes from './routes/ai'
import analyticsRoutes from './routes/analytics'
import billingRoutes from './routes/billing'
import projectRoutes from './routes/projects'
import messageRoutes from './routes/messages'
import integrationRoutes from './routes/integrations'

const app = express()
const PORT = process.env.PORT || 4000

// ─── Security ──────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))

// ─── Rate limiting ─────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// ─── Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }))

// ─── Health ────────────────────────────────────────────
app.get('/health', (_, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// ─── Routes ────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/crm', crmRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/integrations', integrationRoutes)

// ─── 404 ───────────────────────────────────────────────
app.use('*', (_, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

// ─── Error handler ─────────────────────────────────────
app.use(errorMiddleware)

// ─── Start ─────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 Veltrix API running on port ${PORT}`)
})

export default app
