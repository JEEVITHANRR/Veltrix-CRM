// apps/web/src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { authApi } from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [form, setForm] = useState({ email: 'demo@veltrix.io', password: 'demo1234', workspaceSlug: 'veltrix-demo' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login(form)
      setAuth(res.data.token, res.data.user, res.data.workspace as Parameters<typeof setAuth>[2], 'MEMBER')
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-1 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink p-12">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          VELTRIX<span className="text-maroon-glow">.</span>
        </Link>
        <div>
          <blockquote className="text-white/80 text-xl leading-relaxed mb-6">
            "Veltrix transformed our outreach pipeline. AI scoring alone saved us 8 hours per week."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-maroon flex items-center justify-center text-white font-bold text-sm">JK</div>
            <div>
              <div className="text-sm font-semibold text-white">Jordan Kim</div>
              <div className="text-xs text-white/40">VP Engineering, TechCorp</div>
            </div>
          </div>
        </div>
        <p className="text-white/20 text-xs">© 2025 Veltrix CRM</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink mb-2">Welcome back</h1>
            <p className="text-ink-tertiary text-sm">Sign in to your Veltrix workspace</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-2 uppercase tracking-wide">Workspace Slug</label>
              <input
                value={form.workspaceSlug}
                onChange={e => setForm(f => ({ ...f, workspaceSlug: e.target.value }))}
                placeholder="your-workspace"
                className="w-full px-4 py-3 rounded-xl border border-surface-3 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-xl border border-surface-3 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-secondary mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-surface-3 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-all pr-12"
                  required
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors p-1">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-maroon text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-maroon-light disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-surface-2 rounded-xl">
            <p className="text-xs text-ink-tertiary mb-1 font-semibold">Demo credentials</p>
            <p className="text-xs text-ink-muted font-mono">demo@veltrix.io / demo1234</p>
            <p className="text-xs text-ink-muted font-mono">workspace: veltrix-demo</p>
          </div>

          <p className="text-sm text-ink-muted text-center mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-maroon font-semibold hover:underline">Create workspace</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
