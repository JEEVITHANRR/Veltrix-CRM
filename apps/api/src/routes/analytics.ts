// apps/api/src/routes/analytics.ts
import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { authenticate, asyncHandler } from '../middleware/auth'

const router = Router()
router.use(authenticate)

interface LeadRow {
  stage: string
  value: number | null
  score?: number | null
}

router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const wid = req.user!.workspaceId

  const [totalLeads, contacted, qualified, won, lost, allLeads] = await Promise.all([
    prisma.lead.count({ where: { workspaceId: wid } }),
    prisma.lead.count({ where: { workspaceId: wid, stage: 'CONTACTED' } }),
    prisma.lead.count({ where: { workspaceId: wid, stage: 'QUALIFIED' } }),
    prisma.lead.count({ where: { workspaceId: wid, stage: 'WON' } }),
    prisma.lead.count({ where: { workspaceId: wid, stage: 'LOST' } }),
    prisma.lead.findMany({ where: { workspaceId: wid }, select: { stage: true, value: true } }),
  ])

  const totalValue = allLeads.reduce((s: number, l: LeadRow) => s + (l.value ?? 0), 0)
  const wonValue = allLeads
    .filter((l: LeadRow) => l.stage === 'WON')
    .reduce((s: number, l: LeadRow) => s + (l.value ?? 0), 0)

  const stageMap: Record<string, { count: number; value: number }> = {}
  for (const l of allLeads) {
    if (!stageMap[l.stage]) stageMap[l.stage] = { count: 0, value: 0 }
    stageMap[l.stage].count++
    stageMap[l.stage].value += l.value ?? 0
  }

  const pipelineByStage = Object.entries(stageMap).map(([stage, data]) => ({ stage, ...data }))
  const followUps = await prisma.activity.count({ where: { workspaceId: wid, type: 'EMAIL_SENT' } })
  const responseRate = contacted > 0 ? Math.round((qualified / contacted) * 100) : 0

  res.json({
    success: true,
    data: { totalLeads, contacted, qualified, won, lost, followUps, responseRate, totalValue, wonValue, pipelineByStage },
  })
}))

router.get('/pipeline', asyncHandler(async (req: Request, res: Response) => {
  const wid = req.user!.workspaceId
  const leads = await prisma.lead.findMany({
    where: { workspaceId: wid },
    select: { stage: true, value: true, score: true },
  })

  const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']
  const pipeline = stages.map(stage => {
    const sl = leads.filter((l: LeadRow) => l.stage === stage)
    const scored = sl.filter((l: LeadRow) => l.score != null)
    return {
      stage,
      count: sl.length,
      value: sl.reduce((s: number, l: LeadRow) => s + (l.value ?? 0), 0),
      avgScore: scored.length
        ? Math.round(scored.reduce((s: number, l: LeadRow) => s + (l.score ?? 0), 0) / scored.length)
        : null,
    }
  })

  res.json({ success: true, data: pipeline })
}))

export default router
