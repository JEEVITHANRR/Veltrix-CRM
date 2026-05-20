// apps/web/src/app/page.tsx
'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ChevronDown, Zap, Shield, BarChart3, Users, Brain, Globe } from 'lucide-react'

const HeroScene = dynamic(() => import('../components/3d/HeroScene'), { ssr: false, loading: () => <div className="w-full h-full bg-transparent" /> })
const ParticleField = dynamic(() => import('../components/3d/ParticleField'), { ssr: false, loading: () => null })

// ─── Animation variants ───────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] } }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ─── Components ───────────────────────────────────────────
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-xl font-bold tracking-tight text-ink">
            VELTRIX<span className="text-gradient">.</span>
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="hidden md:flex items-center gap-8">
          {['Platform', 'Features', 'Pricing', 'Docs'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-sm text-ink-tertiary hover:text-ink transition-colors duration-200 font-medium">
              {item}
            </a>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="flex items-center gap-3">
          <Link href="/auth/login"
            className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/auth/register"
            className="text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-full hover:bg-maroon transition-all duration-300">
            Get started
          </Link>
        </motion.div>
      </div>
    </nav>
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -100])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-surface-0">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-red-50/60 via-transparent to-transparent" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-maroon/5 blur-3xl" />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <HeroScene />
      </div>

      {/* Content */}
      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-20">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass border border-maroon/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-maroon animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-maroon">AI-Powered CRM Platform</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={stagger} initial="hidden" animate="visible" className="display-xl mb-6">
          <motion.span variants={fadeUp} className="block text-ink">Engineering Digital</motion.span>
          <motion.span variants={fadeUp} className="block text-gradient">Experiences Beyond</motion.span>
          <motion.span variants={fadeUp} className="block text-ink">Interfaces</motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="text-lg md:text-xl text-ink-tertiary max-w-2xl mx-auto mb-10 leading-relaxed">
          Full-stack systems, cinematic interactions, and enterprise-grade architecture —
          designed for agencies, recruiters, and modern sales teams.
        </motion.p>

        {/* CTAs */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/register"
            className="group flex items-center gap-2 bg-maroon text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-maroon-light transition-all duration-300 shadow-glow hover:shadow-glow-lg">
            Explore Platform
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#architecture"
            className="flex items-center gap-2 glass border border-ink/10 text-ink px-8 py-4 rounded-full font-semibold text-sm hover:border-maroon/30 transition-all duration-300">
            View Architecture
            <ArrowRight className="w-4 h-4 opacity-50" />
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
          className="flex flex-wrap items-center justify-center gap-8 mt-16">
          {[
            { value: '10K+', label: 'Leads tracked' },
            { value: '98%', label: 'Response rate' },
            { value: '3x', label: 'Pipeline velocity' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-ink">{stat.value}</div>
              <div className="text-xs text-ink-muted mt-0.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-ink-muted tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown className="w-4 h-4 text-ink-muted" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: Brain, title: 'AI Lead Intelligence', description: 'Auto-score leads, generate follow-up emails, and surface insights — all powered by GPT-4o.' },
    { icon: BarChart3, title: 'Pipeline Analytics', description: 'Real-time pipeline visibility with stage conversion metrics, response rates, and revenue forecasting.' },
    { icon: Users, title: 'Multi-Tenant Workspaces', description: 'Isolated workspace architecture with RBAC — owner, admin, and member roles with full tenant scoping.' },
    { icon: Zap, title: 'Async AI Jobs', description: 'BullMQ-powered job queue processes AI tasks in background. Poll status or receive webhook notifications.' },
    { icon: Shield, title: 'Enterprise Security', description: 'JWT auth, rate limiting, helmet headers, Zod validation, and structured error handling throughout.' },
    { icon: Globe, title: 'Integration Ready', description: 'Email (Resend/SendGrid), WhatsApp via Twilio, Stripe billing, and Cloudinary media — all pluggable.' },
  ]

  return (
    <section id="features" className="py-32 px-6 bg-surface-1">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-20">
          <span className="text-xs font-bold tracking-widest uppercase text-maroon mb-4 block">Platform Features</span>
          <h2 className="display-lg text-ink mb-4">Everything your team needs</h2>
          <p className="text-ink-tertiary max-w-xl mx-auto">Built for agencies, recruiters, and sales teams who demand more than a spreadsheet.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="glass-card rounded-2xl p-8 group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-maroon/8 flex items-center justify-center mb-5 group-hover:bg-maroon/15 transition-colors">
                <f.icon className="w-5 h-5 text-maroon" />
              </div>
              <h3 className="font-semibold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-ink-tertiary leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArchitectureSection() {
  const layers = [
    { layer: 'Frontend', items: ['Next.js 15', 'React Three Fiber', 'Framer Motion', 'GSAP + ScrollTrigger', 'Tailwind CSS', 'Zustand'] },
    { layer: 'API Layer', items: ['Express + TypeScript', 'Zod Validation', 'JWT + RBAC', 'Helmet + Rate Limit', 'Structured Logging'] },
    { layer: 'Data Layer', items: ['PostgreSQL + Prisma', 'Redis + BullMQ', 'Multi-tenant Models', 'Optimized Indexes'] },
    { layer: 'Infra', items: ['Docker + Compose', 'Vercel (Frontend)', 'Railway (API)', 'Neon (DB)', 'Cloudinary'] },
  ]

  return (
    <section id="architecture" className="py-32 px-6 bg-ink">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-20">
          <span className="text-xs font-bold tracking-widest uppercase text-maroon-glow mb-4 block">Architecture</span>
          <h2 className="display-lg text-white mb-4">Production-grade stack</h2>
          <p className="text-white/40 max-w-xl mx-auto">Every layer designed for scale, performance, and developer experience.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {layers.map((l, i) => (
            <motion.div key={l.layer}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-dark rounded-2xl p-6 border border-white/5">
              <div className="text-xs font-bold tracking-widest uppercase text-maroon-glow mb-4">{l.layer}</div>
              <ul className="space-y-2">
                {l.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="w-1 h-1 rounded-full bg-maroon-glow flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PipelineSection() {
  const stages = [
    { name: 'New', count: 24, pct: 100, color: '#64748b' },
    { name: 'Contacted', count: 18, pct: 75, color: '#3b82f6' },
    { name: 'Qualified', count: 12, pct: 50, color: '#8b5cf6' },
    { name: 'Proposal', count: 8, pct: 33, color: '#f59e0b' },
    { name: 'Won', count: 5, pct: 21, color: '#10b981' },
  ]

  return (
    <section id="platform" className="py-32 px-6 bg-surface-0">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="text-xs font-bold tracking-widest uppercase text-maroon mb-4 block">Pipeline Visualization</span>
          <h2 className="display-md text-ink mb-6">See your deals move, visually</h2>
          <p className="text-ink-tertiary leading-relaxed mb-8">
            Cinematic pipeline views with real-time stage conversion metrics. Know exactly where every deal stands and what action to take next.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 bg-maroon text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-maroon-light transition-colors">
            Start free trial <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="glass-card rounded-3xl p-8">
          <div className="text-sm font-semibold text-ink mb-6">Pipeline Overview</div>
          <div className="space-y-4">
            {stages.map((s, i) => (
              <motion.div key={s.name}
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-ink">{s.name}</span>
                  <span className="text-xs text-ink-muted">{s.count} leads</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.pct}%` }}
                    viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full" style={{ background: s.color }} />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-surface-3 flex gap-6">
            <div>
              <div className="text-2xl font-bold text-ink">$284K</div>
              <div className="text-xs text-ink-muted">Pipeline value</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-maroon">28%</div>
              <div className="text-xs text-ink-muted">Win rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">14d</div>
              <div className="text-xs text-ink-muted">Avg cycle</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TechStackSection() {
  const stack = ['Next.js', 'TypeScript', 'Three.js', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ', 'Framer Motion', 'GSAP', 'Tailwind CSS', 'Express', 'Docker', 'Vercel', 'OpenAI']

  return (
    <section className="py-20 overflow-hidden border-y border-surface-3 bg-surface-1">
      <div className="flex gap-8 animate-marquee whitespace-nowrap w-max">
        {[...stack, ...stack].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-tertiary px-4">
            <span className="w-1.5 h-1.5 rounded-full bg-maroon/40" />
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-32 px-6 bg-surface-0">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative glass-card rounded-3xl p-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-maroon/5 to-transparent" />
          <div className="relative">
            <h2 className="display-lg text-ink mb-4">
              Ready to ship a world-class CRM?
            </h2>
            <p className="text-ink-tertiary mb-10 max-w-xl mx-auto">
              Set up your workspace in minutes. No credit card required. Upgrade when you need more AI power.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 bg-maroon text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-maroon-light transition-colors shadow-glow">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center gap-2 glass border border-ink/10 text-ink px-8 py-4 rounded-full font-semibold text-sm hover:border-maroon/20 transition-colors">
                Demo login
              </Link>
            </div>
            <p className="text-xs text-ink-muted mt-6">
              Demo: demo@veltrix.io / demo1234 / workspace: veltrix-demo
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-surface-3 bg-surface-1">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-lg font-bold tracking-tight">VELTRIX<span className="text-gradient">.</span></span>
        <p className="text-sm text-ink-muted">© 2025 Veltrix CRM. Built with Next.js, Three.js, and Prisma.</p>
        <div className="flex gap-6 text-sm text-ink-muted">
          <a href="#" className="hover:text-ink transition-colors">Privacy</a>
          <a href="#" className="hover:text-ink transition-colors">Terms</a>
          <a href="#" className="hover:text-ink transition-colors">Docs</a>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Nav />
      <HeroSection />
      <TechStackSection />
      <FeaturesSection />
      <PipelineSection />
      <ArchitectureSection />
      <CTASection />
      <Footer />
    </main>
  )
}
