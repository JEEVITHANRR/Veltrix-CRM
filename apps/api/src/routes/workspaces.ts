// apps/api/src/routes/workspaces.ts
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { authenticate, requireRole, asyncHandler } from '../middleware/auth'
import { AppError } from '../middleware/error'

const router = Router()
router.use(authenticate)

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const ws = await prisma.workspace.findFirst({
    where: { id: req.params.id },
    include: {
      members: { include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } } },
    },
  })
  if (!ws || ws.id !== req.user!.workspaceId) throw new AppError(403, 'Access denied')
  res.json({ success: true, data: ws })
}))

router.put('/:id', requireRole('OWNER', 'ADMIN'), asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({ name: z.string().optional() })
  const body = schema.parse(req.body)
  if (req.params.id !== req.user!.workspaceId) throw new AppError(403, 'Access denied')
  const ws = await prisma.workspace.update({ where: { id: req.params.id }, data: body })
  res.json({ success: true, data: ws })
}))

export default router
