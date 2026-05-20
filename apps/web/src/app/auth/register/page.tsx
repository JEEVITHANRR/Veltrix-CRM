// apps/web/src/app/auth/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Check } from 'lucide-react'
import { authApi } from '../../../lib/api'
import { useAuthStore } from '../../../store/auth'

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '', name: '', workspaceName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.register(form)
      setAuth(res.data.token, res.data.user, { ...res.data.workspace, plan: 'FREE', aiUsage: 0, aiLimit: 10 }, 'OWNER')
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const perks = ['10 AI credits/day free', 'Unlimited leads & contacts', 'Pipeline analytics', 'No credit card required']

  return (
    <div className="min-h-screen bg-surface-1 flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-maroon to-maroon-dark p-12">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">VELTRIX<span className="text-white/50">.</span></Link>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Start building your pipeline today</h2>
          <p className="text-white/60 mb-8">Join hundreds of agencies and sales teams running on Veltrix.</p>
          <ul className="space-y-3">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-white/80 text-sm">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/20 text-xs">© 2025 Veltrix CRM</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink mb-2">Create your workspace</h1>
            <p className="text-ink-tertiary text-sm">Free forever. Upgrade when ready.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full name', placeholder: 'Alex Rivera', type: 'text' },
              { key: 'email', label: 'Work email', placeholder: 'alex@company.com', type: 'email' },
              { key: 'workspaceName', label: 'Workspace name', placeholder: 'Acme Sales Team', type: 'text' },
              { key: 'password', label: 'Password', placeholder: '8+ characters', type: 'password' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-ink-secondary mb-2 uppercase tracking-wide">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-surface-3 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon/40 transition-all"
                  required
                  minLength={field.key === 'password' ? 8 : 1}
                />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-maroon text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-maroon-light disabled:opacity-60 transition-all mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create workspace <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-sm text-ink-muted text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-maroon font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
