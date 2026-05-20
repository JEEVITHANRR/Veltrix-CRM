// apps/api/src/routes/integrations.ts
import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { authenticate, asyncHandler } from '../middleware/auth'
import { logger } from '../utils/logger'

const router = Router()

// POST /api/integrations/email/send
router.post('/email/send', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
    leadId: z.string().optional(),
    contactId: z.string().optional(),
  })
  const body = schema.parse(req.body)

  logger.info(`[EMAIL] Sending to ${body.to}: ${body.subject}`)

  // Log activity
  await prisma.activity.create({
    data: {
      workspaceId: req.user!.workspaceId,
      leadId: body.leadId,
      contactId: body.contactId,
      type: 'EMAIL_SENT',
      title: `Email sent: ${body.subject}`,
      body: body.body,
      metadata: { to: body.to },
    },
  })

  // Provider-agnostic mock — replace with Resend/SendGrid/Nodemailer
  res.json({
    success: true,
    data: { messageId: `mock-${Date.now()}`, status: 'sent', to: body.to },
  })
}))

// POST /api/integrations/whatsapp/webhook — Twilio ingest
router.post('/whatsapp/webhook', asyncHandler(async (req: Request, res: Response) => {
  const { From, Body, WaId } = req.body
  logger.info(`[WHATSAPP] Incoming from ${From}: ${Body}`)

  // Find lead by phone (WaId is the phone number without +)
  const lead = await prisma.lead.findFirst({
    where: { phone: { contains: WaId } },
  })

  if (lead) {
    await prisma.activity.create({
      data: {
        workspaceId: lead.workspaceId,
        leadId: lead.id,
        type: 'WHATSAPP',
        title: `WhatsApp message received from ${From}`,
        body: Body,
        metadata: { from: From, waId: WaId },
      },
    })
  }

  // Twilio expects TwiML response
  res.set('Content-Type', 'text/xml')
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`)
}))

export default router
