// apps/api/src/routes/ai.ts
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { getRedis, defaultJobOptions } from '../config/redis'
import { authenticate, asyncHandler } from '../middleware/auth'
import { AppError } from '../middleware/error'

const router = Router()
router.use(authenticate)

// BullMQ queue — created lazily only when Redis is available
let aiQueue: any = null

async function getAiQueue() {
  if (aiQueue) return aiQueue
  
  const redis = await getRedis()
  if (!redis) return null

  try {
    const { Queue } = await import('bullmq')
    aiQueue = new Queue('ai-jobs', { connection: redis, defaultJobOptions })
    return aiQueue
  } catch {
    return null
  }
}

const jobSchema = z.object({
  type: z.enum(['SUMMARIZE_LEAD', 'SCORE_LEAD', 'FOLLOWUP_EMAIL', 'SUMMARIZE_CONVERSATION']),
  leadId: z.string().optional(),
  input: z.record(z.unknown()).optional(),
  promptVersion: z.string().default('v1'),
})

// POST /api/ai/jobs — enqueue job
router.post('/jobs', asyncHandler(async (req: Request, res: Response) => {
  const workspace = await prisma.workspace.findUnique({ where: { id: req.user!.workspaceId } })
  if (!workspace) throw new AppError(404, 'Workspace not found')

  // Check daily AI usage limit
  if (workspace.aiUsage >= workspace.aiLimit) {
    throw new AppError(429, `Daily AI limit reached (${workspace.aiUsage}/${workspace.aiLimit}). Upgrade to Pro for more.`)
  }

  const body = jobSchema.parse(req.body)

  // Create DB record
  const aiJob = await prisma.aIJob.create({
    data: {
      type: body.type,
      status: 'QUEUED',
      input: { ...body.input, leadId: body.leadId },
      promptVersion: body.promptVersion,
      workspaceId: req.user!.workspaceId,
      leadId: body.leadId,
      userId: req.user!.userId,
    },
  })

  // Try to enqueue BullMQ job (only if Redis is available)
  const queue = await getAiQueue()
  if (queue) {
    await queue.add(body.type, {
      jobId: aiJob.id,
      type: body.type,
      leadId: body.leadId,
      workspaceId: req.user!.workspaceId,
      userId: req.user!.userId,
      input: body.input,
      promptVersion: body.promptVersion,
    })
  } else {
    // Mark job as failed gracefully when Redis is not available
    await prisma.aIJob.update({
      where: { id: aiJob.id },
      data: { status: 'FAILED', error: 'AI queue not available (Redis not configured)' },
    })
  }

  // Increment usage
  await prisma.workspace.update({
    where: { id: req.user!.workspaceId },
    data: { aiUsage: { increment: 1 } },
  })

  res.status(202).json({
    success: true,
    data: { jobId: aiJob.id, status: queue ? 'queued' : 'failed', type: body.type },
  })
}))

// GET /api/ai/jobs/:id — poll job status
router.get('/jobs/:id', asyncHandler(async (req: Request, res: Response) => {
  const job = await prisma.aIJob.findFirst({
    where: { id: req.params.id, workspaceId: req.user!.workspaceId },
  })
  if (!job) throw new AppError(404, 'Job not found')

  res.json({
    success: true,
    data: {
      id: job.id,
      type: job.type,
      status: job.status,
      output: job.output,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    },
  })
}))

// GET /api/ai/jobs — list jobs for workspace
router.get('/jobs', asyncHandler(async (req: Request, res: Response) => {
  const { leadId, status, limit = '20' } = req.query
  const where: Record<string, unknown> = { workspaceId: req.user!.workspaceId }
  if (leadId) where.leadId = leadId
  if (status) where.status = status

  const jobs = await prisma.aIJob.findMany({
    where,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: jobs })
}))

// GET /api/ai/usage — usage stats
router.get('/usage', asyncHandler(async (req: Request, res: Response) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: req.user!.workspaceId },
    select: { aiUsage: true, aiLimit: true, plan: true },
  })
  res.json({ success: true, data: workspace })
}))

export default router
