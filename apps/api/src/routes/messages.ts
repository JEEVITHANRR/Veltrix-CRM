// apps/api/src/routes/messages.ts
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { asyncHandler, authenticate } from '../middleware/auth'
import { AppError } from '../middleware/error'

const router = Router()

// Public contact form submission
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    subject: z.string().optional(),
    body: z.string().min(10),
    workspaceSlug: z.string(),
  })
  const body = schema.parse(req.body)
  const ws = await prisma.workspace.findUnique({ where: { slug: body.workspaceSlug } })
  if (!ws) throw new AppError(404, 'Workspace not found')

  const message = await prisma.message.create({
    data: { name: body.name, email: body.email, subject: body.subject, body: body.body, workspaceId: ws.id },
  })
  res.status(201).json({ success: true, data: { id: message.id } })
}))

// Authenticated — list messages
router.get('/', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const messages = await prisma.message.findMany({
    where: { workspaceId: req.user!.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json({ success: true, data: messages })
}))

export default router
