// apps/web/src/app/dashboard/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck, BarChart3, Settings,
  LogOut, Zap, ChevronLeft, ChevronRight, Bell, Search, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/leads', label: 'Leads', icon: Users },
  { href: '/dashboard/contacts', label: 'Contacts', icon: UserCheck },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, workspace, role, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-surface-3 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-ink">
            VELTRIX<span className="text-gradient">.</span>
          </span>
        )}
        {collapsed && <span className="font-black text-maroon text-lg">V</span>}
      </div>

      {/* Workspace badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 px-3 py-2.5 bg-surface-2 rounded-xl">
          <p className="text-xs text-ink-muted">Workspace</p>
          <p className="text-sm font-semibold text-ink truncate">{workspace?.name}</p>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 inline-block ${workspace?.plan === 'PRO' ? 'bg-maroon/10 text-maroon' : 'bg-surface-3 text-ink-muted'}`}>
            {workspace?.plan}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 mt-2 space-y-0.5 sidebar-scroll overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-maroon text-white shadow-glow-sm'
                  : 'text-ink-tertiary hover:bg-surface-2 hover:text-ink'
              } ${collapsed ? 'justify-center' : ''}`}>
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-ink-muted group-hover:text-ink'}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* AI Usage */}
      {!collapsed && workspace && (
        <div className="mx-3 mb-3 p-3 border border-surface-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-3.5 h-3.5 text-maroon" />
            <span className="text-xs font-semibold text-ink">AI Credits</span>
          </div>
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-maroon to-maroon-glow rounded-full transition-all"
              style={{ width: `${Math.min((workspace.aiUsage / workspace.aiLimit) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-ink-muted mt-1">{workspace.aiUsage}/{workspace.aiLimit} used today</p>
        </div>
      )}

      {/* User */}
      <div className={`border-t border-surface-3 p-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-maroon flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.name?.slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
            <p className="text-[10px] text-ink-muted truncate">{role}</p>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => { logout(); router.push('/') }}
            className="p-1.5 text-ink-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-surface-1 overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col bg-white border-r border-surface-3 relative overflow-hidden flex-shrink-0">
        <NavContent />
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-surface-3 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10">
          {collapsed ? <ChevronRight className="w-3 h-3 text-ink-muted" /> : <ChevronLeft className="w-3 h-3 text-ink-muted" />}
        </button>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-ink/40 z-40 backdrop-blur-sm" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 flex flex-col shadow-2xl">
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-surface-3 flex items-center gap-4 px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 text-ink-muted hover:text-ink">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-3 bg-surface-1 rounded-xl px-3 py-2 max-w-md">
            <Search className="w-4 h-4 text-ink-muted flex-shrink-0" />
            <input placeholder="Search leads, contacts..." className="bg-transparent text-sm text-ink placeholder-ink-muted flex-1 outline-none" />
          </div>
          <button className="p-2 text-ink-muted hover:text-ink transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-maroon" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
