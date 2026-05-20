// apps/api/src/routes/projects.ts
import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { asyncHandler } from '../middleware/auth'

const router = Router()

router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    where: { featured: true },
    orderBy: { order: 'asc' },
  })
  res.json({ success: true, data: projects })
}))

export default router
