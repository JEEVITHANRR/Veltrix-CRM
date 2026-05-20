// apps/web/src/app/dashboard/leads/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Zap, Loader2, ChevronDown, Trash2, Edit3, Eye, X } from 'lucide-react'
import { crmApi, aiApi, Lead } from '../../../lib/api'

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST']

const STAGE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  NEW:       { bg: 'bg-slate-100',   text: 'text-slate-700',   dot: 'bg-slate-400' },
  CONTACTED: { bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500' },
  QUALIFIED: { bg: 'bg-violet-50',   text: 'text-violet-700',  dot: 'bg-violet-500' },
  PROPOSAL:  { bg: 'bg-amber-50',    text: 'text-amber-700',   dot: 'bg-amber-500' },
  WON:       { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-500' },
  LOST:      { bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500' },
}

function StageBadge({ stage }: { stage: string }) {
  const s = STAGE_STYLES[stage] || STAGE_STYLES.NEW
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {stage.charAt(0) + stage.slice(1).toLowerCase()}
    </span>
  )
}

function ScoreBar({ score }: { score?: number | null }) {
  if (score == null) return <span className="text-xs text-ink-muted">—</span>
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-ink">{score}</span>
    </div>
  )
}

function LeadModal({ lead, onClose, onSave }: { lead: Partial<Lead> | null; onClose: () => void; onSave: (data: Partial<Lead>) => void }) {
  const [form, setForm] = useState<Partial<Lead>>(lead || { stage: 'NEW', tags: [] })
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try { await onSave(form) } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-ink">{lead?.id ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors">
            <X className="w-4 h-4 text-ink-muted" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'firstName', label: 'First name', required: true },
            { key: 'lastName', label: 'Last name', required: true },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Phone' },
            { key: 'company', label: 'Company' },
            { key: 'title', label: 'Job title' },
            { key: 'source', label: 'Source' },
            { key: 'value', label: 'Deal value ($)', type: 'number' },
          ].map(f => (
            <div key={f.key} className={f.key === 'email' ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-ink-secondary mb-1.5 uppercase tracking-wide">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={(form as Record<string, unknown>)[f.key] as string || ''}
                onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                required={f.required}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-all"
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-ink-secondary mb-1.5 uppercase tracking-wide">Stage</label>
            <select value={form.stage || 'NEW'} onChange={e => set('stage', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-maroon/20 bg-white">
              {STAGES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-ink-secondary mb-1.5 uppercase tracking-wide">Notes</label>
            <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-maroon/20 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-surface-3 text-sm font-semibold text-ink-tertiary hover:bg-surface-2 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.firstName || !form.lastName}
            className="flex-1 py-2.5 rounded-xl bg-maroon text-white text-sm font-semibold hover:bg-maroon-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Lead'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [modal, setModal] = useState<Partial<Lead> | null | false>(false)
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await crmApi.getLeads({ search: search || undefined, stage: stageFilter || undefined, limit: 50 })
      setLeads(res.data)
      setTotal(res.meta.total)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, stageFilter])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  const handleSave = async (data: Partial<Lead>) => {
    if (modal && (modal as Lead).id) {
      await crmApi.updateLead((modal as Lead).id, data)
    } else {
      await crmApi.createLead(data as Parameters<typeof crmApi.createLead>[0])
    }
    setModal(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    setDeleting(id)
    try { await crmApi.deleteLead(id); load() }
    finally { setDeleting(null) }
  }

  const runAI = async (lead: Lead, type: string) => {
    setAiLoading(p => ({ ...p, [`${lead.id}-${type}`]: true }))
    try {
      const job = await aiApi.enqueueJob({ type, leadId: lead.id })
      // Poll
      let result: { status: string; output: Record<string, unknown> | null; error: string | null } | null = null
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1500))
        const poll = await aiApi.pollJob(job.data.jobId)
        if (poll.data.status === 'COMPLETED' || poll.data.status === 'FAILED') { result = poll.data; break }
      }
      if (result?.status === 'COMPLETED') {
        alert(`AI Result:\n${JSON.stringify(result.output, null, 2)}`)
        load()
      } else {
        alert('AI job failed or timed out')
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'AI job failed')
    } finally {
      setAiLoading(p => ({ ...p, [`${lead.id}-${type}`]: false }))
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Leads</h1>
          <p className="text-ink-muted text-sm mt-0.5">{total} total leads in pipeline</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-maroon text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-maroon-light transition-colors shadow-glow-sm">
          <Plus className="w-4 h-4" /> New Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-white border border-surface-3 rounded-xl px-3 py-2 flex-1 min-w-[200px] max-w-xs">
          <Search className="w-4 h-4 text-ink-muted flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search leads…" className="bg-transparent text-sm text-ink flex-1 outline-none" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-surface-3 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-ink-muted" />
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
            className="bg-transparent text-sm text-ink outline-none cursor-pointer">
            <option value="">All stages</option>
            {STAGES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-3 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-2">
                {['Name', 'Company', 'Stage', 'Score', 'Value', 'Source', 'AI Actions', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-2">
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-maroon mx-auto" />
                </td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-ink-muted text-sm">
                  No leads found. <button onClick={() => setModal({})} className="text-maroon font-semibold hover:underline">Add your first lead →</button>
                </td></tr>
              ) : leads.map(lead => (
                <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-surface-1 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm text-ink">{lead.firstName} {lead.lastName}</div>
                    {lead.email && <div className="text-xs text-ink-muted">{lead.email}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-ink">{lead.company || '—'}</div>
                    {lead.title && <div className="text-xs text-ink-muted">{lead.title}</div>}
                  </td>
                  <td className="px-4 py-3"><StageBadge stage={lead.stage} /></td>
                  <td className="px-4 py-3"><ScoreBar score={lead.score} /></td>
                  <td className="px-4 py-3 text-sm text-ink font-medium">
                    {lead.value ? `$${lead.value.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{lead.source || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {[
                        { type: 'SCORE_LEAD', label: 'Score' },
                        { type: 'FOLLOWUP_EMAIL', label: 'Email' },
                      ].map(({ type, label }) => {
                        const key = `${lead.id}-${type}`
                        return (
                          <button key={type} onClick={() => runAI(lead, type)}
                            disabled={!!aiLoading[key]}
                            className="flex items-center gap-1 text-xs bg-maroon/8 hover:bg-maroon/15 text-maroon px-2.5 py-1.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                            {aiLoading[key] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal(lead)}
                        className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-muted hover:text-ink transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(lead.id)} disabled={deleting === lead.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-ink-muted hover:text-red-500 transition-colors">
                        {deleting === lead.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal !== false && (
          <LeadModal lead={modal || {}} onClose={() => setModal(false)} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  )
}
