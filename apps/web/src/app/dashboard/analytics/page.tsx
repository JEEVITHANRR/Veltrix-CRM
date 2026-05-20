// apps/web/src/app/dashboard/analytics/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Users, Target, BarChart3, Loader2 } from 'lucide-react'
import { analyticsApi, AnalyticsOverview, PipelineStage } from '../../../lib/api'

const STAGE_COLORS: Record<string, string> = {
  NEW: '#94a3b8', CONTACTED: '#3b82f6', QUALIFIED: '#8b5cf6',
  PROPOSAL: '#f59e0b', WON: '#10b981', LOST: '#ef4444',
}

function MetricCard({ label, value, sub, icon: Icon, accent = false }: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent?: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 border ${accent ? 'bg-ink border-ink text-white' : 'bg-white border-surface-3 text-ink'} shadow-card`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent ? 'bg-white/10' : 'bg-maroon/8'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-maroon'}`} />
      </div>
      <div className={`text-3xl font-bold mb-1 ${accent ? 'text-white' : 'text-ink'}`}>{value}</div>
      <div className={`text-sm font-medium ${accent ? 'text-white/60' : 'text-ink-tertiary'}`}>{label}</div>
      {sub && <div className={`text-xs mt-1 ${accent ? 'text-white/40' : 'text-ink-muted'}`}>{sub}</div>}
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [pipeline, setPipeline] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsApi.overview(), analyticsApi.pipeline()])
      .then(([ov, pl]) => { setOverview(ov.data); setPipeline(pl.data) })
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`
  const maxCount = Math.max(...pipeline.map(p => p.count), 1)

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-maroon" />
    </div>
  )

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Analytics</h1>
        <p className="text-ink-muted text-sm mt-0.5">Pipeline performance and team metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Leads" value={String(overview?.totalLeads ?? 0)} icon={Users} sub="In all stages" />
        <MetricCard label="Pipeline Value" value={overview ? fmt(overview.totalValue) : '$0'} icon={DollarSign} sub="Across all leads" />
        <MetricCard label="Won Revenue" value={overview ? fmt(overview.wonValue) : '$0'} icon={Target} accent sub={`${overview?.won ?? 0} deals closed`} />
        <MetricCard label="Response Rate" value={`${overview?.responseRate ?? 0}%`} icon={TrendingUp} sub="Contacted → Qualified" />
      </div>

      {/* Pipeline funnel */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-surface-3 p-6 shadow-card">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4 h-4 text-maroon" />
            <h2 className="font-semibold text-ink">Pipeline Funnel</h2>
          </div>
          <div className="space-y-5">
            {pipeline.map((stage, i) => (
              <motion.div key={stage.stage}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: STAGE_COLORS[stage.stage] }} />
                    <span className="text-sm font-medium text-ink capitalize">{stage.stage.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-ink-muted">{stage.count} leads</span>
                    <span className="font-semibold text-ink w-16 text-right">{fmt(stage.value)}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: STAGE_COLORS[stage.stage] }} />
                </div>
                {stage.avgScore != null && (
                  <div className="text-xs text-ink-muted mt-1">Avg AI score: <span className="font-semibold text-ink">{stage.avgScore}</span></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 content-start">
          {[
            { label: 'Contacted', value: overview?.contacted ?? 0, color: '#3b82f6' },
            { label: 'Qualified', value: overview?.qualified ?? 0, color: '#8b5cf6' },
            { label: 'Follow-ups sent', value: overview?.followUps ?? 0, color: '#f59e0b' },
            { label: 'Deals won', value: overview?.won ?? 0, color: '#10b981' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-surface-3 p-5 shadow-card text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-ink-muted font-medium">{s.label}</div>
            </motion.div>
          ))}

          {/* Win rate donut placeholder */}
          <div className="col-span-2 bg-gradient-to-br from-maroon to-maroon-dark rounded-2xl p-6 text-white text-center">
            <div className="text-5xl font-bold mb-1">{overview?.responseRate ?? 0}%</div>
            <div className="text-white/60 text-sm">Conversion Rate</div>
            <div className="text-white/40 text-xs mt-1">Contacted → Qualified</div>
          </div>
        </div>
      </div>
    </div>
  )
}
