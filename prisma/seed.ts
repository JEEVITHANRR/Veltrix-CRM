// prisma/seed.ts
import { PrismaClient, Role, Plan, LeadStage, ActivityType, JobStatus, JobType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Veltrix CRM...')

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'veltrix-demo' },
    update: {},
    create: {
      name: 'Veltrix Demo',
      slug: 'veltrix-demo',
      plan: Plan.PRO,
      aiUsage: 3,
      aiLimit: 100,
    },
  })

  // Create owner user
  const passwordHash = await bcrypt.hash('demo1234', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'demo@veltrix.io' },
    update: {},
    create: {
      email: 'demo@veltrix.io',
      name: 'Alex Rivera',
      passwordHash,
    },
  })

  // Link owner to workspace
  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: owner.id, workspaceId: workspace.id } },
    update: {},
    create: {
      userId: owner.id,
      workspaceId: workspace.id,
      role: Role.OWNER,
    },
  })

  // Create member users
  const members = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah@veltrix.io' },
      update: {},
      create: { email: 'sarah@veltrix.io', name: 'Sarah Chen', passwordHash },
    }),
    prisma.user.upsert({
      where: { email: 'marcus@veltrix.io' },
      update: {},
      create: { email: 'marcus@veltrix.io', name: 'Marcus Johnson', passwordHash },
    }),
  ])

  for (const m of members) {
    await prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: m.id, workspaceId: workspace.id } },
      update: {},
      create: { userId: m.id, workspaceId: workspace.id, role: Role.MEMBER },
    })
  }

  // Create leads
  const leadsData = [
    { firstName: 'Jordan', lastName: 'Kim', email: 'jordan@techcorp.io', company: 'TechCorp', title: 'VP Engineering', stage: LeadStage.PROPOSAL, score: 87, value: 24000, source: 'LinkedIn' },
    { firstName: 'Priya', lastName: 'Nair', email: 'priya@scale.ai', company: 'Scale AI', title: 'Head of Growth', stage: LeadStage.QUALIFIED, score: 72, value: 18000, source: 'Referral' },
    { firstName: 'Tyler', lastName: 'Brooks', email: 'tyler@finworks.com', company: 'FinWorks', title: 'CEO', stage: LeadStage.CONTACTED, score: 55, value: 36000, source: 'Cold Email' },
    { firstName: 'Yuna', lastName: 'Park', email: 'yuna@moonshot.vc', company: 'Moonshot VC', title: 'Partner', stage: LeadStage.WON, score: 95, value: 120000, source: 'Event' },
    { firstName: 'Devon', lastName: 'Walsh', email: 'devon@cloudbase.io', company: 'CloudBase', title: 'CTO', stage: LeadStage.NEW, score: 40, value: 8000, source: 'Website' },
    { firstName: 'Amara', lastName: 'Diallo', email: 'amara@nexus.co', company: 'Nexus Co', title: 'Director of Sales', stage: LeadStage.CONTACTED, score: 63, value: 15000, source: 'LinkedIn' },
    { firstName: 'Felix', lastName: 'Mueller', email: 'felix@dataflow.de', company: 'DataFlow GmbH', title: 'Product Lead', stage: LeadStage.LOST, score: 30, value: 9000, source: 'Cold Email' },
    { firstName: 'Leila', lastName: 'Hassan', email: 'leila@orbit.io', company: 'Orbit Systems', title: 'COO', stage: LeadStage.QUALIFIED, score: 78, value: 42000, source: 'Referral' },
  ]

  const leads = await Promise.all(
    leadsData.map(d =>
      prisma.lead.upsert({
        where: { id: d.email },
        update: {},
        create: {
          ...d,
          workspaceId: workspace.id,
          id: d.email,
          aiSummary: `High-potential lead from ${d.company}. Recommended follow-up within 24h.`,
          tags: ['enterprise', d.source.toLowerCase()],
        },
      })
    )
  )

  // Create contacts
  await Promise.all([
    prisma.contact.upsert({
      where: { id: 'c-001' },
      update: {},
      create: {
        id: 'c-001',
        firstName: 'Morgan', lastName: 'Lee',
        email: 'morgan@partner.io', company: 'Partner Inc',
        title: 'Account Executive', workspaceId: workspace.id,
        tags: ['partner', 'warm'],
      },
    }),
    prisma.contact.upsert({
      where: { id: 'c-002' },
      update: {},
      create: {
        id: 'c-002',
        firstName: 'Ravi', lastName: 'Sharma',
        email: 'ravi@investor.com', company: 'Investor Corp',
        title: 'Investment Director', workspaceId: workspace.id,
        tags: ['investor'],
      },
    }),
  ])

  // Create activities
  await Promise.all(
    leads.slice(0, 4).map((lead, i) =>
      prisma.activity.create({
        data: {
          workspaceId: workspace.id,
          leadId: lead.id,
          type: i % 2 === 0 ? ActivityType.EMAIL_SENT : ActivityType.NOTE,
          title: i % 2 === 0 ? `Intro email sent to ${lead.firstName}` : `Note added for ${lead.firstName}`,
          body: i % 2 === 0
            ? `Sent initial outreach with pitch deck attached.`
            : `Great call — interested in enterprise tier. Follow up on Thursday.`,
        },
      })
    )
  )

  // Create AI jobs
  await prisma.aIJob.create({
    data: {
      type: JobType.SCORE_LEAD,
      status: JobStatus.COMPLETED,
      input: { leadId: leads[0].id },
      output: { score: 87, reasoning: 'Strong ICP match, decision maker, active on LinkedIn' },
      workspaceId: workspace.id,
      leadId: leads[0].id,
      userId: owner.id,
      promptVersion: 'v1',
      completedAt: new Date(),
    },
  })

  // Create projects
  const projects = [
    {
      title: 'Veltrix CRM Platform',
      description: 'Full-stack AI-powered CRM with cinematic 3D experience for modern sales teams.',
      summary: 'Monorepo architecture, Next.js 15, Express API, BullMQ workers, Prisma + PostgreSQL. Features multi-tenant auth, AI job queue, real-time analytics.',
      stack: ['Next.js', 'TypeScript', 'Three.js', 'Prisma', 'PostgreSQL', 'BullMQ', 'Redis'],
      featured: true, order: 1,
    },
    {
      title: 'Neural Commerce Engine',
      description: 'AI-driven e-commerce recommendation engine processing 10M+ events daily.',
      summary: 'Event-driven microservices, Kafka, Redis ML feature store, Python FastAPI inference layer with A/B testing infrastructure.',
      stack: ['Python', 'FastAPI', 'Kafka', 'Redis', 'PostgreSQL', 'Docker'],
      featured: true, order: 2,
    },
    {
      title: 'Enterprise Data Mesh',
      description: 'Distributed data platform with self-serve analytics for 200+ internal teams.',
      summary: 'Domain-oriented ownership model, dbt transformations, Airflow orchestration, Superset dashboards, data contracts via Protobuf.',
      stack: ['dbt', 'Airflow', 'Spark', 'Superset', 'Python', 'Kubernetes'],
      featured: true, order: 3,
    },
  ]

  for (const p of projects) {
    await prisma.project.create({ data: { ...p, workspaceId: workspace.id } })
  }

  // Create testimonials
  await Promise.all([
    prisma.testimonial.create({
      data: {
        author: 'Jordan Kim', role: 'VP Engineering', company: 'TechCorp',
        body: 'Veltrix transformed our sales pipeline. The AI insights alone paid for itself in the first month.',
        rating: 5, featured: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        author: 'Priya Nair', role: 'Head of Growth', company: 'Scale AI',
        body: 'The cinematic experience is unlike anything else. Our team actually enjoys using the CRM now.',
        rating: 5, featured: true,
      },
    }),
  ])

  console.log('✅ Seed complete!')
  console.log('   Demo login: demo@veltrix.io / demo1234')
  console.log(`   Workspace: veltrix-demo`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
