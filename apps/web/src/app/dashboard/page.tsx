// apps/web/src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, CheckCircle, DollarSign, Zap, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { analyticsApi, crmApi, AnalyticsOverview, Activity } from '../../lib/api'
import { useAuthStore } from '../../store/auth'

const STAGE_COLORS: Record<string, string> = {
  NEW: 'bg-slate-400', CONTACTED: 'bg-blue-500', QUALIFIED: 'bg-violet-500',
  PROPOSAL: 'bg-amber-500', WON: 'bg-emerald-500', LOST: 'bg-red-500',
}

const ACTIVITY_ICONS: Record<string, string> = {
  EMAIL_SENT: '📧', EMAIL_RECEIVED: '📨', NOTE: '📝',
  CALL: '📞', MEETING: '🤝', STAGE_CHANGE: '🔀', AI_INSIGHT: '🤖', WHATSAPP: '💬',
}

function StatCard({ label, value, sub, icon: Icon, delta, color = 'maroon' }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; delta?: string; color?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-surface-3 shadow-card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'maroon' ? 'bg-maroon/8' : 'bg-emerald-50'}`}>
          <Icon className={`w-5 h-5 ${color === 'maroon' ? 'text-maroon' : 'text-emerald-600'}`} />
        </div>
        {delta && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {delta}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-ink mb-0.5">{value}</div>
      <div className="text-sm font-medium text-ink-tertiary">{label}</div>
      {sub && <div className="text-xs text-ink-muted mt-1">{sub}</div>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user, workspace } = useAuthStore()
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [ov, act] = await Promise.all([
        analyticsApi.overview(),
        crmApi.getActivities({ }),
      ])
      setOverview(ov.data)
      setActivities(act.data.slice(0, 8))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-ink-muted text-sm mt-1">Here's what's happening in your pipeline</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-ink-tertiary hover:text-ink transition-colors px-3 py-2 rounded-xl hover:bg-surface-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Leads" value={overview?.totalLeads ?? '—'} icon={Users} delta="+12%" />
        <StatCard label="Won Deals" value={overview?.won ?? '—'} icon={CheckCircle} color="green" delta="+8%" />
        <StatCard label="Pipeline Value" value={overview ? fmt(overview.totalValue) : '—'} icon={DollarSign} delta="+23%" />
        <StatCard label="Response Rate" value={overview ? `${overview.responseRate}%` : '—'} icon={TrendingUp} delta="+5%" />
      </div>

      {/* Pipeline + Activity */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Pipeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-3 p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-ink">Pipeline Overview</h2>
            <Link href="/dashboard/leads" className="text-xs text-maroon font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {overview?.pipelineByStage?.length ? overview.pipelineByStage.map(({ stage, count, value }) => (
              <div key={stage}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STAGE_COLORS[stage] || 'bg-ink-muted'}`} />
                    <span className="text-sm font-medium text-ink capitalize">{stage.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-ink-muted">
                    <span>{count} leads</span>
                    <span className="font-medium text-ink">{fmt(value)}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${overview.totalLeads ? (count / overview.totalLeads) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full ${STAGE_COLORS[stage] || 'bg-ink-muted'}`} />
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-ink-muted text-sm">No pipeline data yet</div>
            )}
          </div>
        </div>

        {/* AI Widget */}
        <div className="bg-gradient-to-br from-ink to-maroon-dark rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-maroon/20 -translate-y-8 translate-x-8 blur-2xl" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold mb-1">AI Insights</h3>
            <p className="text-white/60 text-sm mb-4">
              {workspace ? `${workspace.aiUsage}/${workspace.aiLimit} credits used today` : 'Loading...'}
            </p>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-red-400 to-maroon rounded-full"
                style={{ width: `${workspace ? (workspace.aiUsage / workspace.aiLimit) * 100 : 0}%` }} />
            </div>
            <Link href="/dashboard/leads"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors">
              Score your leads <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-surface-3 p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-ink">Recent Activity</h2>
          <span className="text-xs text-ink-muted">{activities.length} events</span>
        </div>
        {activities.length ? (
          <div className="space-y-0 divide-y divide-surface-2">
            {activities.map(act => (
              <motion.div key={act.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-start gap-3 py-3">
                <span className="text-base flex-shrink-0 mt-0.5">{ACTIVITY_ICONS[act.type] || '📌'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{act.title}</p>
                  {act.body && <p className="text-xs text-ink-muted mt-0.5 truncate">{act.body}</p>}
                </div>
                <span className="text-xs text-ink-muted flex-shrink-0">
                  {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-ink-muted text-sm">No activity yet — add leads to get started</div>
        )}
      </div>
    </div>
  )
}
