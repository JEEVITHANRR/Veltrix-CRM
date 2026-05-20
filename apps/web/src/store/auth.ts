// apps/web/src/store/auth.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
}

interface Workspace {
  id: string
  name: string
  slug: string
  plan: string
  aiUsage: number
  aiLimit: number
}

interface AuthState {
  token: string | null
  user: User | null
  workspace: Workspace | null
  role: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User, workspace: Workspace, role: string) => void
  updateWorkspace: (ws: Partial<Workspace>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      workspace: null,
      role: null,
      isAuthenticated: false,
      setAuth: (token, user, workspace, role) => {
        localStorage.setItem('veltrix_token', token)
        set({ token, user, workspace, role, isAuthenticated: true })
      },
      updateWorkspace: (ws) =>
        set((s) => ({ workspace: s.workspace ? { ...s.workspace, ...ws } : null })),
      logout: () => {
        localStorage.removeItem('veltrix_token')
        set({ token: null, user: null, workspace: null, role: null, isAuthenticated: false })
      },
    }),
    {
      name: 'veltrix-auth',
      partialize: (s) => ({ token: s.token, user: s.user, workspace: s.workspace, role: s.role, isAuthenticated: s.isAuthenticated }),
    }
  )
)
