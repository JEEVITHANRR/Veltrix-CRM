// apps/api/src/routes/auth.ts
import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { AppError } from '../middleware/error'
import { asyncHandler, authenticate } from '../middleware/auth'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  workspaceName: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  workspaceSlug: z.string(),
})

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6)
}

function signToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions)
}

// POST /api/auth/register
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body)

  const existing = await prisma.user.findUnique({ where: { email: body.email } })
  if (existing) throw new AppError(409, 'Email already registered')

  const passwordHash = await bcrypt.hash(body.password, 12)
  const slug = generateSlug(body.workspaceName)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      passwordHash,
      workspaces: {
        create: {
          role: 'OWNER',
          workspace: {
            create: {
              name: body.workspaceName,
              slug,
              plan: 'FREE',
              aiLimit: 10,
            },
          },
        },
      },
    },
    include: { workspaces: { include: { workspace: true } } },
  })

  const member = user.workspaces[0]
  const token = signToken({
    userId: user.id,
    workspaceId: member.workspace.id,
    role: member.role,
  })

  res.status(201).json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: member.workspace.id, name: member.workspace.name, slug: member.workspace.slug },
    },
  })
}))

// POST /api/auth/login
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body)

  const workspace = await prisma.workspace.findUnique({
    where: { slug: body.workspaceSlug },
    include: { members: { include: { user: true } } },
  })
  if (!workspace) throw new AppError(404, 'Workspace not found')

  const member = workspace.members.find((m: { user: { email: string } }) => m.user.email === body.email)
  if (!member) throw new AppError(401, 'Invalid credentials')

  const valid = await bcrypt.compare(body.password, member.user.passwordHash)
  if (!valid) throw new AppError(401, 'Invalid credentials')

  const token = signToken({ userId: member.user.id, workspaceId: workspace.id, role: member.role })

  res.json({
    success: true,
    data: {
      token,
      user: { id: member.user.id, email: member.user.email, name: member.user.name },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, plan: workspace.plan },
    },
  })
}))

// GET /api/auth/me
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
  })
  if (!user) throw new AppError(404, 'User not found')

  const workspace = await prisma.workspace.findUnique({
    where: { id: req.user!.workspaceId },
    select: { id: true, name: true, slug: true, plan: true, aiUsage: true, aiLimit: true },
  })

  res.json({ success: true, data: { user, workspace, role: req.user!.role } })
}))

export default router
