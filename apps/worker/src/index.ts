// apps/worker/src/index.ts
import 'dotenv/config'
import { Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

console.log('🔧 Veltrix Worker starting...')

const PROMPT_TEMPLATES: Record<string, (data: Record<string, unknown>) => string> = {
  SCORE_LEAD: (d) => `
Score this sales lead on a scale of 0-100 based on ICP fit, engagement, and deal potential.
Lead data: ${JSON.stringify(d)}
Respond with JSON: { "score": number, "reasoning": string, "nextAction": string }
  `.trim(),

  SUMMARIZE_LEAD: (d) => `
Write a concise 2-3 sentence executive summary of this lead for a sales rep.
Lead data: ${JSON.stringify(d)}
Respond with JSON: { "summary": string, "highlights": string[] }
  `.trim(),

  FOLLOWUP_EMAIL: (d) => `
Write a personalized, warm follow-up email for this lead. Keep it under 150 words. 
Professional but conversational tone. Focus on value, not features.
Lead data: ${JSON.stringify(d)}
Respond with JSON: { "subject": string, "body": string }
  `.trim(),

  SUMMARIZE_CONVERSATION: (d) => `
Summarize this sales conversation and extract key action items.
Conversation: ${JSON.stringify(d)}
Respond with JSON: { "summary": string, "actionItems": string[], "sentiment": "positive"|"neutral"|"negative" }
  `.trim(),
}

async function processJob(job: Job) {
  const { jobId, type, leadId, workspaceId, input, promptVersion } = job.data
  console.log(`[Worker] Processing job ${jobId} (${type})`)

  // Mark as processing
  await prisma.aIJob.update({ where: { id: jobId }, data: { status: 'PROCESSING' } })

  try {
    let leadData: Record<string, unknown> = input || {}
    if (leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } })
      if (lead) leadData = { ...leadData, ...lead }
    }

    const prompt = PROMPT_TEMPLATES[type]?.(leadData)
    if (!prompt) throw new Error(`Unknown job type: ${type}`)

    // Call AI provider (OpenAI-compatible mock — replace with real key)
    let output: Record<string, unknown>

    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      })
      const data = await response.json() as { choices: Array<{ message: { content: string } }> }
      output = JSON.parse(data.choices[0].message.content)
    } else {
      // Mock output for development
      output = getMockOutput(type, leadData)
    }

    // Update AI job
    await prisma.aIJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', output: JSON.parse(JSON.stringify(output)), completedAt: new Date() },
    })

    // Apply output to lead
    if (leadId && type === 'SCORE_LEAD' && output.score) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { score: output.score as number },
      })
    }
    if (leadId && type === 'SUMMARIZE_LEAD' && output.summary) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { aiSummary: output.summary as string },
      })
    }

    // Log activity
    if (leadId) {
      await prisma.activity.create({
        data: {
          workspaceId,
          leadId,
          type: 'AI_INSIGHT',
          title: `AI ${type.replace(/_/g, ' ').toLowerCase()} completed`,
          body: JSON.stringify(output),
        },
      })
    }

    console.log(`[Worker] ✅ Job ${jobId} completed`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[Worker] ❌ Job ${jobId} failed:`, msg)
    await prisma.aIJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', error: msg },
    })
    throw err
  }
}

function getMockOutput(type: string, data: Record<string, unknown>): Record<string, unknown> {
  const name = `${data.firstName || 'Lead'} ${data.lastName || ''}`
  switch (type) {
    case 'SCORE_LEAD':
      return { score: Math.floor(Math.random() * 40 + 50), reasoning: `${name} matches ICP profile with strong engagement signals.`, nextAction: 'Schedule discovery call within 48h' }
    case 'SUMMARIZE_LEAD':
      return { summary: `${name} from ${data.company || 'Unknown'} is a high-potential lead at the ${data.stage} stage. Recommended for immediate outreach.`, highlights: ['Decision maker', 'Budget confirmed', 'Active evaluation'] }
    case 'FOLLOWUP_EMAIL':
      return { subject: `Following up — ${data.company || 'your team'}`, body: `Hi ${data.firstName || 'there'},\n\nJust wanted to circle back on our conversation. I believe we can genuinely help ${data.company || 'your team'} achieve your goals.\n\nWould you have 20 minutes this week?\n\nBest,\nVeltrix Team` }
    case 'SUMMARIZE_CONVERSATION':
      return { summary: 'Client expressed interest in enterprise features. Budget is confirmed. Timeline is Q2.', actionItems: ['Send pricing deck', 'Schedule technical demo', 'Loop in solutions engineer'], sentiment: 'positive' }
    default:
      return { result: 'processed' }
  }
}

const worker = new Worker('ai-jobs', processJob, {
  connection: redis,
  concurrency: Number(process.env.WORKER_CONCURRENCY || 3),
})

worker.on('completed', (job) => console.log(`[Worker] Job ${job.id} completed`))
worker.on('failed', (job, err) => console.error(`[Worker] Job ${job?.id} failed:`, err.message))

process.on('SIGTERM', async () => {
  await worker.close()
  await prisma.$disconnect()
  redis.disconnect()
  process.exit(0)
})
