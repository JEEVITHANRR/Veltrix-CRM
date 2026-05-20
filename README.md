# Veltrix CRM

> A world-class AI-powered CRM platform with cinematic 3D experience — built for agencies, recruiters, and modern sales teams.

![Veltrix CRM](https://via.placeholder.com/1200x600/800020/ffffff?text=Veltrix+CRM)

---

## ✨ Features

- **Cinematic 3D UI** — Three.js + React Three Fiber hero with dynamic camera, particles, and floating geometry
- **AI Lead Intelligence** — Score leads, generate follow-up emails, and summarize conversations via BullMQ job queue
- **Pipeline Management** — Drag-and-drop stages: New → Contacted → Qualified → Proposal → Won/Lost
- **Multi-tenant Workspaces** — Full tenant isolation with RBAC (Owner / Admin / Member)
- **Real-time Analytics** — Pipeline value, response rates, stage conversion metrics
- **Integration Ready** — Email (Resend/SendGrid), WhatsApp via Twilio, Stripe billing stub
- **Production Architecture** — Docker, Prisma, PostgreSQL, Redis, Next.js 15 App Router

---

## 🏗️ Architecture

```
veltrix-crm/                   # npm workspace monorepo
├── apps/
│   ├── web/                   # Next.js 15 cinematic frontend
│   ├── api/                   # Express + TypeScript REST API
│   └── worker/                # BullMQ AI job processor
├── packages/
│   └── shared/                # Shared types, constants, schemas
├── prisma/                    # Schema + migrations + seed
├── docker-compose.yml
├── render.yaml
└── vercel.json
```

### Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | Next.js 15, React 18, Three.js, Framer Motion, GSAP, Tailwind CSS |
| Backend   | Express, TypeScript, Zod, JWT, Helmet, Morgan  |
| Database  | PostgreSQL + Prisma ORM                         |
| Queue     | Redis + BullMQ                                  |
| AI        | OpenAI GPT-4o-mini (mock fallback included)     |
| Infra     | Docker, Vercel (web), Render/Railway (api)      |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- npm 9+

### 1. Clone and install

```bash
git clone https://github.com/your-org/veltrix-crm
cd veltrix-crm
npm install
```

### 2. Environment setup

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env`:
```env
DATABASE_URL="postgresql://veltrix:veltrix@localhost:5432/veltrix_crm"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-here"
```

### 3. Start infrastructure

```bash
docker-compose up postgres redis -d
```

### 4. Database setup

```bash
# Generate Prisma client
npx prisma generate --schema=prisma/schema.prisma

# Run migrations
DATABASE_URL="postgresql://veltrix:veltrix@localhost:5432/veltrix_crm" \
  npx prisma migrate dev --schema=prisma/schema.prisma --name init

# Seed demo data
DATABASE_URL="postgresql://veltrix:veltrix@localhost:5432/veltrix_crm" \
  npx prisma db seed --schema=prisma/schema.prisma
```

### 5. Start development servers

```bash
# All services in parallel
npm run dev

# Or individually:
npm run dev --workspace=apps/api      # :4000
npm run dev --workspace=apps/web      # :3000
npm run dev --workspace=apps/worker   # Background processor
```

### 6. Demo login

Open http://localhost:3000

```
Workspace: veltrix-demo
Email:     demo@veltrix.io
Password:  demo1234
```

---

## 🐳 Docker (Full Stack)

```bash
# Build and start everything
docker-compose up --build

# Run migrations inside container
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma db seed
```

---

## 🌐 Environment Variables

### API (`apps/api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | — | Default: `7d` |
| `PORT` | — | Default: `4000` |
| `CORS_ORIGIN` | — | Comma-separated allowed origins |
| `OPENAI_API_KEY` | — | OpenAI key (mock fallback if empty) |
| `AI_MODEL` | — | Default: `gpt-4o-mini` |
| `SMTP_*` | — | Email transport config |
| `TWILIO_*` | — | WhatsApp webhook |
| `STRIPE_SECRET_KEY` | — | Billing (stub if empty) |

### Web (`apps/web/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | API base URL |
| `NEXT_PUBLIC_APP_URL` | — | Frontend URL for metadata |

---

## 📡 API Reference

### Auth

```
POST /api/auth/register     Register + create workspace
POST /api/auth/login        Login to workspace
GET  /api/auth/me           Get current user
```

### CRM

```
GET    /api/crm/leads              List leads (search, stage, pagination)
POST   /api/crm/leads              Create lead
GET    /api/crm/leads/:id          Get lead + activity timeline
PUT    /api/crm/leads/:id          Update lead (auto-logs stage changes)
DELETE /api/crm/leads/:id          Delete lead

GET    /api/crm/contacts           List contacts
POST   /api/crm/contacts           Create contact
PUT    /api/crm/contacts/:id       Update contact
DELETE /api/crm/contacts/:id       Delete contact

GET    /api/crm/activities         Activity feed (filterable by lead/contact)
POST   /api/crm/activities         Log activity
```

### AI

```
POST /api/ai/jobs           Enqueue AI job
GET  /api/ai/jobs/:id       Poll job status
GET  /api/ai/jobs           List jobs
GET  /api/ai/usage          Daily usage stats
```

**Job types:**
- `SCORE_LEAD` — Score 0-100 with reasoning
- `SUMMARIZE_LEAD` — Executive summary
- `FOLLOWUP_EMAIL` — Draft personalized email
- `SUMMARIZE_CONVERSATION` — Extract action items

### Analytics

```
GET /api/analytics/overview     KPIs: leads, value, win rate
GET /api/analytics/pipeline     Stage breakdown with avg score
```

### Integrations

```
POST /api/integrations/email/send          Send email (logs activity)
POST /api/integrations/whatsapp/webhook    Twilio webhook ingest
```

---

## 🚢 Deployment

### Vercel (Frontend)

```bash
npm i -g vercel
vercel --prod
```

Set env vars in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` → your Render API URL

### Render (API + Worker)

```bash
# Deploy using render.yaml
render blueprint apply
```

Or manually:
1. New Web Service → repo → `apps/api`
2. Build: `npm install && npm run build --workspace=apps/api`
3. Start: `node apps/api/dist/index.js`
4. Add PostgreSQL + Redis from Render dashboard

### Neon (PostgreSQL)

1. Create project at neon.tech
2. Copy connection string to `DATABASE_URL`
3. Run `npx prisma migrate deploy`

---

## ⚡ Performance Notes

- **Three.js**: Lazy-loaded with `dynamic()`, `dpr={[1, 1.5]}` cap, `alpha: true` canvas
- **Code splitting**: All 3D components are dynamic imports with SSR disabled
- **Framer Motion**: `useTransform` for scroll parallax without layout recalculation
- **Prisma**: Connection pooling via `globalThis` singleton
- **Redis**: BullMQ with `removeOnComplete: 100` to prevent memory bloat
- **Images**: Next.js `<Image>` with Cloudinary domain configured

---

## 🧪 Development

```bash
# Lint all workspaces
npm run lint

# Test
npm test

# Prisma Studio
npm run db:studio

# Generate Prisma types after schema change
npx prisma generate --schema=prisma/schema.prisma
```

---

## 📁 File Structure

```
apps/web/src/
├── app/
│   ├── page.tsx                  # Cinematic landing page
│   ├── layout.tsx                # Root layout + fonts
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── dashboard/
│       ├── layout.tsx            # Sidebar + nav
│       ├── page.tsx              # Overview + analytics
│       ├── leads/page.tsx        # Lead CRUD + AI actions
│       ├── contacts/page.tsx     # Contact management
│       ├── analytics/page.tsx    # Pipeline analytics
│       └── settings/page.tsx     # Workspace settings
├── components/
│   └── 3d/
│       ├── HeroScene.tsx         # Three.js hero scene
│       └── ParticleField.tsx     # Particle system
├── lib/api.ts                    # API client
├── store/auth.ts                 # Zustand auth store
└── styles/globals.css            # Design tokens + utilities
```

---

## 🤝 Contributing

PRs welcome. Please follow existing conventions:
- TypeScript strict mode
- Zod for all request validation
- Prisma for all DB queries
- `asyncHandler` wrapper for all Express routes

---

## 📄 License

MIT © Veltrix Team
