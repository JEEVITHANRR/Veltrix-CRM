// apps/api/src/routes/billing.ts
import { Router, Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { authenticate, requireRole, asyncHandler } from '../middleware/auth'
import { AppError } from '../middleware/error'

const router = Router()
router.use(authenticate)

router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: req.user!.workspaceId },
    select: { plan: true, aiUsage: true, aiLimit: true },
  })
  res.json({ success: true, data: workspace })
}))

router.post('/upgrade', requireRole('OWNER', 'ADMIN'), asyncHandler(async (_req: Request, res: Response) => {
  // Stripe-ready stub
  res.json({
    success: true,
    data: {
      checkoutUrl: 'https://checkout.stripe.com/stub-session',
      message: 'Stripe integration ready. Set STRIPE_SECRET_KEY to activate.',
    },
  })
}))

export default router
