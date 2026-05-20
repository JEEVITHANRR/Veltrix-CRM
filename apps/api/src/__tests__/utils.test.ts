// apps/api/src/__tests__/utils.test.ts

// ─── Slug generation logic ───────────────────────────────
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

describe('generateSlug', () => {
  it('converts workspace name to slug', () => {
    expect(generateSlug('Acme Corp')).toBe('acme-corp')
  })

  it('handles special characters', () => {
    expect(generateSlug('My Awesome CRM!!!')).toBe('my-awesome-crm')
  })

  it('handles multiple spaces', () => {
    expect(generateSlug('hello   world')).toBe('hello-world')
  })

  it('lowercases everything', () => {
    expect(generateSlug('VELTRIX CRM')).toBe('veltrix-crm')
  })

  it('strips leading/trailing hyphens', () => {
    expect(generateSlug('--hello--')).toBe('hello')
  })
})

// ─── Pipeline stage ordering ─────────────────────────────
const STAGE_ORDER = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']

describe('STAGE_ORDER', () => {
  it('contains all 6 expected stages', () => {
    expect(STAGE_ORDER).toHaveLength(6)
  })

  it('starts with NEW', () => {
    expect(STAGE_ORDER[0]).toBe('NEW')
  })

  it('ends with LOST', () => {
    expect(STAGE_ORDER[STAGE_ORDER.length - 1]).toBe('LOST')
  })

  it('includes WON before LOST', () => {
    expect(STAGE_ORDER.indexOf('WON')).toBeLessThan(STAGE_ORDER.indexOf('LOST'))
  })
})

// ─── Analytics calculation ───────────────────────────────
interface LeadRow { stage: string; value: number | null }

function calcAnalytics(leads: LeadRow[]) {
  const totalValue = leads.reduce((s, l) => s + (l.value ?? 0), 0)
  const wonValue = leads.filter(l => l.stage === 'WON').reduce((s, l) => s + (l.value ?? 0), 0)
  const contacted = leads.filter(l => l.stage === 'CONTACTED').length
  const qualified = leads.filter(l => l.stage === 'QUALIFIED').length
  const responseRate = contacted > 0 ? Math.round((qualified / contacted) * 100) : 0
  return { totalValue, wonValue, responseRate }
}

describe('calcAnalytics', () => {
  const leads: LeadRow[] = [
    { stage: 'WON',       value: 5000 },
    { stage: 'WON',       value: 12000 },
    { stage: 'CONTACTED', value: 3000 },
    { stage: 'CONTACTED', value: null },
    { stage: 'QUALIFIED', value: 8000 },
    { stage: 'NEW',       value: 0 },
  ]

  it('calculates total pipeline value', () => {
    expect(calcAnalytics(leads).totalValue).toBe(28000)
  })

  it('calculates won revenue', () => {
    expect(calcAnalytics(leads).wonValue).toBe(17000)
  })

  it('calculates response rate as qualified/contacted', () => {
    // 1 qualified / 2 contacted = 50%
    expect(calcAnalytics(leads).responseRate).toBe(50)
  })

  it('returns 0 responseRate when no contacted leads', () => {
    const r = calcAnalytics([{ stage: 'NEW', value: 1000 }])
    expect(r.responseRate).toBe(0)
  })

  it('handles null values gracefully', () => {
    const r = calcAnalytics([{ stage: 'WON', value: null }])
    expect(r.wonValue).toBe(0)
    expect(r.totalValue).toBe(0)
  })
})

// ─── AI daily limit check ────────────────────────────────
const AI_LIMITS: Record<string, number> = { FREE: 10, PRO: 100, ENTERPRISE: 1000 }

function canUseAI(plan: string, usedToday: number): boolean {
  const limit = AI_LIMITS[plan] ?? 10
  return usedToday < limit
}

describe('canUseAI', () => {
  it('allows usage under limit', () => {
    expect(canUseAI('FREE', 9)).toBe(true)
    expect(canUseAI('PRO', 99)).toBe(true)
  })

  it('blocks usage at limit', () => {
    expect(canUseAI('FREE', 10)).toBe(false)
    expect(canUseAI('PRO', 100)).toBe(false)
  })

  it('blocks usage over limit', () => {
    expect(canUseAI('FREE', 15)).toBe(false)
  })

  it('handles unknown plan with FREE limit', () => {
    expect(canUseAI('UNKNOWN', 5)).toBe(true)
    expect(canUseAI('UNKNOWN', 10)).toBe(false)
  })

  it('allows enterprise high usage', () => {
    expect(canUseAI('ENTERPRISE', 999)).toBe(true)
    expect(canUseAI('ENTERPRISE', 1000)).toBe(false)
  })
})
