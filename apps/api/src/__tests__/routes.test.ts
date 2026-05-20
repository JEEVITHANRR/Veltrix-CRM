// apps/api/src/__tests__/routes.test.ts
import { z } from 'zod'

// ─── Zod schema validation tests ─────────────────────────
// These test the same schemas used in routes without DB

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

const jobSchema = z.object({
  type: z.enum(['SUMMARIZE_LEAD', 'SCORE_LEAD', 'FOLLOWUP_EMAIL', 'SUMMARIZE_CONVERSATION']),
  leadId: z.string().optional(),
  input: z.record(z.unknown()).optional(),
  promptVersion: z.string().default('v1'),
})

// ─── Register schema ──────────────────────────────────────
describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'secure123',
      name: 'Alex Rivera',
      workspaceName: 'Acme Sales',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'secure123',
      name: 'Alex',
      workspaceName: 'Acme',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      name: 'Alex Rivera',
      workspaceName: 'Acme',
    })
    expect(result.success).toBe(false)
  })

  it('rejects single-character name', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'secure123',
      name: 'A',
      workspaceName: 'Acme',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Login schema ─────────────────────────────────────────
describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword',
      workspaceSlug: 'my-workspace',
    })
    expect(result.success).toBe(true)
  })

  it('requires workspaceSlug', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword',
    })
    expect(result.success).toBe(false)
  })
})

// ─── Lead schema ──────────────────────────────────────────
describe('leadSchema', () => {
  it('accepts minimal valid lead', () => {
    const result = leadSchema.safeParse({ firstName: 'Jordan', lastName: 'Kim' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stage).toBe('NEW')
      expect(result.data.tags).toEqual([])
    }
  })

  it('accepts full lead data', () => {
    const result = leadSchema.safeParse({
      firstName: 'Jordan',
      lastName: 'Kim',
      email: 'jordan@tech.io',
      stage: 'QUALIFIED',
      value: 25000,
      tags: ['enterprise', 'hot'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid stage', () => {
    const result = leadSchema.safeParse({
      firstName: 'Jordan',
      lastName: 'Kim',
      stage: 'INVALID_STAGE',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email format', () => {
    const result = leadSchema.safeParse({
      firstName: 'Jordan',
      lastName: 'Kim',
      email: 'not-email',
    })
    expect(result.success).toBe(false)
  })

  it('defaults stage to NEW', () => {
    const result = leadSchema.safeParse({ firstName: 'J', lastName: 'K' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.stage).toBe('NEW')
  })

  it('requires firstName', () => {
    const result = leadSchema.safeParse({ lastName: 'Kim' })
    expect(result.success).toBe(false)
  })
})

// ─── AI Job schema ────────────────────────────────────────
describe('jobSchema', () => {
  it('accepts valid SCORE_LEAD job', () => {
    const result = jobSchema.safeParse({
      type: 'SCORE_LEAD',
      leadId: 'lead-123',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.promptVersion).toBe('v1')
    }
  })

  it('accepts all valid job types', () => {
    const types = ['SUMMARIZE_LEAD', 'SCORE_LEAD', 'FOLLOWUP_EMAIL', 'SUMMARIZE_CONVERSATION']
    for (const type of types) {
      const result = jobSchema.safeParse({ type })
      expect(result.success).toBe(true)
    }
  })

  it('rejects unknown job type', () => {
    const result = jobSchema.safeParse({ type: 'UNKNOWN_TYPE' })
    expect(result.success).toBe(false)
  })

  it('defaults promptVersion to v1', () => {
    const result = jobSchema.safeParse({ type: 'SCORE_LEAD' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promptVersion).toBe('v1')
  })

  it('accepts custom promptVersion', () => {
    const result = jobSchema.safeParse({ type: 'SCORE_LEAD', promptVersion: 'v2' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.promptVersion).toBe('v2')
  })
})
