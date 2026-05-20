// apps/web/src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('veltrix_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// ─── Auth ────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string; workspaceSlug: string }) =>
    request<{ success: boolean; data: { token: string; user: { id: string; email: string; name: string }; workspace: { id: string; name: string; slug: string; plan: string } } }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  register: (data: { email: string; password: string; name: string; workspaceName: string }) =>
    request<{ success: boolean; data: { token: string; user: { id: string; email: string; name: string }; workspace: { id: string; name: string; slug: string } } }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  me: () =>
    request<{ success: boolean; data: { user: { id: string; email: string; name: string; avatarUrl: string | null }; workspace: { id: string; name: string; slug: string; plan: string; aiUsage: number; aiLimit: number }; role: string } }>('/api/auth/me'),
}

// ─── CRM ─────────────────────────────────────────────────
function cleanParams(params?: Record<string, any>): Record<string, string> {
  const clean: Record<string, string> = {}
  if (!params) return clean
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      clean[k] = String(v)
    }
  }
  return clean
}

export const crmApi = {
  getLeads: (params?: { search?: string; stage?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams(cleanParams(params)).toString()
    return request<{ success: boolean; data: Lead[]; meta: { total: number; page: number; limit: number } }>(`/api/crm/leads${q ? `?${q}` : ''}`)
  },
  getLead: (id: string) => request<{ success: boolean; data: Lead & { activities: Activity[] } }>(`/api/crm/leads/${id}`),
  createLead: (data: Partial<Lead>) => request<{ success: boolean; data: Lead }>('/api/crm/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: Partial<Lead>) => request<{ success: boolean; data: Lead }>(`/api/crm/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id: string) => request<{ success: boolean }>(`/api/crm/leads/${id}`, { method: 'DELETE' }),

  getContacts: (params?: { search?: string; page?: number }) => {
    const q = new URLSearchParams(cleanParams(params)).toString()
    return request<{ success: boolean; data: Contact[]; meta: { total: number } }>(`/api/crm/contacts${q ? `?${q}` : ''}`)
  },
  createContact: (data: Partial<Contact>) => request<{ success: boolean; data: Contact }>('/api/crm/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id: string, data: Partial<Contact>) => request<{ success: boolean; data: Contact }>(`/api/crm/contacts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id: string) => request<{ success: boolean }>(`/api/crm/contacts/${id}`, { method: 'DELETE' }),

  getActivities: (params?: { leadId?: string; contactId?: string }) => {
    const q = new URLSearchParams(cleanParams(params)).toString()
    return request<{ success: boolean; data: Activity[] }>(`/api/crm/activities${q ? `?${q}` : ''}`)
  },
  createActivity: (data: { type: string; title: string; body?: string; leadId?: string; contactId?: string }) =>
    request<{ success: boolean; data: Activity }>('/api/crm/activities', { method: 'POST', body: JSON.stringify(data) }),
}

// ─── AI ──────────────────────────────────────────────────
export const aiApi = {
  enqueueJob: (data: { type: string; leadId?: string; input?: Record<string, unknown> }) =>
    request<{ success: boolean; data: { jobId: string; status: string } }>('/api/ai/jobs', { method: 'POST', body: JSON.stringify(data) }),
  pollJob: (id: string) =>
    request<{ success: boolean; data: { id: string; status: string; output: Record<string, unknown> | null; error: string | null } }>(`/api/ai/jobs/${id}`),
  getUsage: () => request<{ success: boolean; data: { aiUsage: number; aiLimit: number; plan: string } }>('/api/ai/usage'),
}

// ─── Analytics ───────────────────────────────────────────
export const analyticsApi = {
  overview: () => request<{ success: boolean; data: AnalyticsOverview }>('/api/analytics/overview'),
  pipeline: () => request<{ success: boolean; data: PipelineStage[] }>('/api/analytics/pipeline'),
}

// ─── Types (minimal frontend types) ─────────────────────
export interface Lead {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  company?: string | null
  title?: string | null
  stage: string
  score?: number | null
  value?: number | null
  source?: string | null
  notes?: string | null
  aiSummary?: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

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
  createdAt: string
  updatedAt: string
}

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
  pipelineByStage: { stage: string; count: number; value: number }[]
}

export interface PipelineStage {
  stage: string
  count: number
  value: number
  avgScore: number | null
}
