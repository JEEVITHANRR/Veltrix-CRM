// apps/web/src/app/dashboard/settings/page.tsx
'use client'

import { motion } from 'framer-motion'
import { Zap, Shield, Bell, Palette } from 'lucide-react'
import { useAuthStore } from '../../../store/auth'

export default function SettingsPage() {
  const { user, workspace, role } = useAuthStore()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-ink-muted text-sm mt-0.5">Manage your account and workspace</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-surface-3 p-6 shadow-card mb-4">
        <h2 className="font-semibold text-ink mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-maroon" /> Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-maroon flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-ink">{user?.name}</div>
            <div className="text-sm text-ink-muted">{user?.email}</div>
            <span className="text-xs bg-maroon/10 text-maroon px-2 py-0.5 rounded-full font-semibold mt-1 inline-block">{role}</span>
          </div>
        </div>
      </motion.div>

      {/* Workspace */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-surface-3 p-6 shadow-card mb-4">
        <h2 className="font-semibold text-ink mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-maroon" /> Workspace</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-surface-2">
            <span className="text-sm text-ink-tertiary">Name</span>
            <span className="text-sm font-semibold text-ink">{workspace?.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-surface-2">
            <span className="text-sm text-ink-tertiary">Slug</span>
            <span className="text-sm font-mono text-ink">{workspace?.slug}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-ink-tertiary">Plan</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${workspace?.plan === 'PRO' ? 'bg-maroon/10 text-maroon' : 'bg-surface-2 text-ink-muted'}`}>
              {workspace?.plan}
            </span>
          </div>
        </div>
      </motion.div>

      {/* AI Usage */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-surface-3 p-6 shadow-card mb-4">
        <h2 className="font-semibold text-ink mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-maroon" /> AI Usage</h2>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-ink-tertiary">Daily credits used</span>
            <span className="text-sm font-semibold text-ink">{workspace?.aiUsage} / {workspace?.aiLimit}</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-maroon to-maroon-glow rounded-full transition-all"
              style={{ width: `${workspace ? Math.min((workspace.aiUsage / workspace.aiLimit) * 100, 100) : 0}%` }} />
          </div>
        </div>
        {workspace?.plan === 'FREE' && (
          <div className="mt-4 p-4 bg-maroon/5 rounded-xl border border-maroon/10">
            <p className="text-sm font-semibold text-ink mb-1">Upgrade to Pro</p>
            <p className="text-xs text-ink-muted mb-3">Get 100 AI credits/day, priority processing, and advanced analytics.</p>
            <button className="text-xs bg-maroon text-white px-4 py-2 rounded-full font-semibold hover:bg-maroon-light transition-colors">
              Upgrade — $29/mo
            </button>
          </div>
        )}
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-surface-3 p-6 shadow-card">
        <h2 className="font-semibold text-ink mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-maroon" /> Notifications</h2>
        {[
          { label: 'AI job completed', desc: 'Notify when scoring or email generation finishes' },
          { label: 'New lead assigned', desc: 'Get notified when a lead is assigned to you' },
          { label: 'Stage changes', desc: 'Alerts when deals move through your pipeline' },
        ].map(n => (
          <div key={n.label} className="flex items-center justify-between py-3 border-b border-surface-2 last:border-0">
            <div>
              <div className="text-sm font-medium text-ink">{n.label}</div>
              <div className="text-xs text-ink-muted">{n.desc}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-maroon" />
            </label>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
