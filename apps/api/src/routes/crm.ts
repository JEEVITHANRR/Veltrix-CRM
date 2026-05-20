// apps/api/src/routes/crm.ts
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { authenticate, asyncHandler } from '../middleware/auth'
import { AppError } from '../middleware/error'

type LeadStage = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST'

const router = Router()
router.use(authenticate)

// ─── Lead schemas ──────────────────────────────────────
const leadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  stage: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']).default('NEW'),
  value: z.number().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

// ─── Leads CRUD ────────────────────────────────────────
router.get('/leads', asyncHandler(async (req: Request, res: Response) => {
  const { search, stage, page = '1', limit = '20' } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const stageStr = stage && stage !== 'undefined' && stage !== 'null' ? String(stage) : undefined
  const searchStr = search && search !== 'undefined' && search !== 'null' ? String(search) : undefined

  const where: Record<string, unknown> = { workspaceId: req.user!.workspaceId }
  if (stageStr) where.stage = stageStr
  if (searchStr) {
    where.OR = [
      { firstName: { contains: searchStr, mode: 'insensitive' } },
      { lastName: { contains: searchStr, mode: 'insensitive' } },
      { email: { contains: searchStr, mode: 'insensitive' } },
      { company: { contains: searchStr, mode: 'insensitive' } },
    ]
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lead.count({ where }),
  ])

  res.json({ success: true, data: leads, meta: { total, page: Number(page), limit: Number(limit) } })
}))

router.get('/leads/:id', asyncHandler(async (req: Request, res: Response) => {
  const lead = await prisma.lead.findFirst({
    where: { id: req.params.id, workspaceId: req.user!.workspaceId },
    include: { activities: { orderBy: { createdAt: 'desc' }, take: 20 } },
  })
  if (!lead) throw new AppError(404, 'Lead not found')
  res.json({ success: true, data: lead })
}))

router.post('/leads', asyncHandler(async (req: Request, res: Response) => {
  const body = leadSchema.parse(req.body)
  const lead = await prisma.lead.create({
    data: { ...body, workspaceId: req.user!.workspaceId },
  })
  res.status(201).json({ success: true, data: lead })
}))

router.put('/leads/:id', asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.lead.findFirst({
    where: { id: req.params.id, workspaceId: req.user!.workspaceId },
  })
  if (!existing) throw new AppError(404, 'Lead not found')

  const body = leadSchema.partial().parse(req.body)

  // Log stage change
  if (body.stage && body.stage !== existing.stage) {
    await prisma.activity.create({
      data: {
        workspaceId: req.user!.workspaceId,
        leadId: existing.id,
        type: 'STAGE_CHANGE',
        title: `Stage changed from ${existing.stage} → ${body.stage}`,
        metadata: { from: existing.stage, to: body.stage },
      },
    })
  }

  const lead = await prisma.lead.update({ where: { id: req.params.id }, data: body })
  res.json({ success: true, data: lead })
}))

router.delete('/leads/:id', asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.lead.findFirst({
    where: { id: req.params.id, workspaceId: req.user!.workspaceId },
  })
  if (!existing) throw new AppError(404, 'Lead not found')
  await prisma.lead.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: { deleted: true } })
}))

// ─── Contacts CRUD ─────────────────────────────────────
const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

router.get('/contacts', asyncHandler(async (req: Request, res: Response) => {
  const { search, page = '1', limit = '20' } = req.query
  const skip = (Number(page) - 1) * Number(limit)
  const where: Record<string, unknown> = { workspaceId: req.user!.workspaceId }
  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ]
  }
  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.contact.count({ where }),
  ])
  res.json({ success: true, data: contacts, meta: { total, page: Number(page), limit: Number(limit) } })
}))

router.post('/contacts', asyncHandler(async (req: Request, res: Response) => {
  const body = contactSchema.parse(req.body)
  const contact = await prisma.contact.create({ data: { ...body, workspaceId: req.user!.workspaceId } })
  res.status(201).json({ success: true, data: contact })
}))

router.put('/contacts/:id', asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.contact.findFirst({ where: { id: req.params.id, workspaceId: req.user!.workspaceId } })
  if (!existing) throw new AppError(404, 'Contact not found')
  const body = contactSchema.partial().parse(req.body)
  const contact = await prisma.contact.update({ where: { id: req.params.id }, data: body })
  res.json({ success: true, data: contact })
}))

router.delete('/contacts/:id', asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.contact.findFirst({ where: { id: req.params.id, workspaceId: req.user!.workspaceId } })
  if (!existing) throw new AppError(404, 'Contact not found')
  await prisma.contact.delete({ where: { id: req.params.id } })
  res.json({ success: true, data: { deleted: true } })
}))

// ─── Activity feed ─────────────────────────────────────
router.get('/activities', asyncHandler(async (req: Request, res: Response) => {
  const { leadId, contactId, limit = '30' } = req.query
  const where: Record<string, unknown> = { workspaceId: req.user!.workspaceId }
  if (leadId) where.leadId = leadId
  if (contactId) where.contactId = contactId

  const activities = await prisma.activity.findMany({
    where,
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, data: activities })
}))

router.post('/activities', asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    type: z.enum(['NOTE', 'EMAIL_SENT', 'EMAIL_RECEIVED', 'CALL', 'MEETING', 'AI_INSIGHT', 'WHATSAPP']),
    title: z.string(),
    body: z.string().optional(),
    leadId: z.string().optional(),
    contactId: z.string().optional(),
  })
  const body = schema.parse(req.body)
  const activity = await prisma.activity.create({
    data: { ...body, workspaceId: req.user!.workspaceId },
  })
  res.status(201).json({ success: true, data: activity })
}))

export default router
