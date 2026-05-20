// packages/shared/src/index.ts

// ─── Enums ─────────────────────────────────────────────
export const LEAD_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'] as const
export type LeadStage = typeof LEAD_STAGES[number]

export const ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const
export type Role = typeof ROLES[number]

export const PLANS = ['FREE', 'PRO', 'ENTERPRISE'] as const
export type Plan = typeof PLANS[number]

export const JOB_TYPES = ['SUMMARIZE_LEAD', 'SCORE_LEAD', 'FOLLOWUP_EMAIL', 'SUMMARIZE_CONVERSATION'] as const
export type JobType = typeof JOB_TYPES[number]

export const JOB_STATUSES = ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'] as const
export type JobStatus = typeof JOB_STATUSES[number]

// ─── API Types ──────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  meta?: { page?: number; limit?: number; total?: number }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─── Auth ───────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
}

export interface AuthTokenPayload {
  userId: string
  workspaceId: string
  role: Role
}

export interface LoginInput {
  email: string
  password: string
  workspaceSlug: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  workspaceName: string
}

// ─── Lead ───────────────────────────────────────────────
export interface Lead {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  company?: string | null
  title?: string | null
  stage: LeadStage
  score?: number | null
  value?: number | null
  source?: string | null
  notes?: string | null
  aiSummary?: string | null
  tags: string[]
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadInput {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  title?: string
  stage?: LeadStage
  value?: number
  source?: string
  notes?: string
  tags?: string[]
}

// ─── Contact ────────────────────────────────────────────
export interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  company?: string | null
  title?: string | null
  notes?: string | null
  tags: string[]
  workspaceId: string
  createdAt: string
  updatedAt: string
}

// ─── Activity ───────────────────────────────────────────
export interface Activity {
  id: string
  type: string
  title: string
  body?: string | null
  metadata?: Record<string, unknown> | null
  leadId?: string | null
  contactId?: string | null
  createdAt: string
}

// ─── AI Job ─────────────────────────────────────────────
export interface AIJob {
  id: string
  type: JobType
  status: JobStatus
  input: Record<string, unknown>
  output?: Record<string, unknown> | null
  error?: string | null
  promptVersion: string
  workspaceId: string
  leadId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  completedAt?: string | null
}

// ─── Analytics ──────────────────────────────────────────
export interface AnalyticsOverview {
  totalLeads: number
  contacted: number
  qualified: number
  won: number
  lost: number
  followUps: number
  responseRate: number
  totalValue: number
  wonValue: number
  pipelineByStage: { stage: LeadStage; count: number; value: number }[]
}

// ─── Constants ──────────────────────────────────────────
export const AI_DAILY_LIMITS: Record<Plan, number> = {
  FREE: 10,
  PRO: 100,
  ENTERPRISE: 1000,
}

export const STAGE_COLORS: Record<LeadStage, string> = {
  NEW: '#64748b',
  CONTACTED: '#3b82f6',
  QUALIFIED: '#8b5cf6',
  PROPOSAL: '#f59e0b',
  WON: '#10b981',
  LOST: '#ef4444',
}

export const STAGE_LABELS: Record<LeadStage, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  WON: 'Won',
  LOST: 'Lost',
}
