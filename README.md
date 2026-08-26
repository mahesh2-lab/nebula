# Nebula

Nebula is a self-hosted, Vercel-style PaaS control plane built with Next.js. It lets you connect a GitHub repository, configure build settings and environment secrets, trigger deployments on AWS ECS Fargate, and watch build logs, domains, and traffic analytics in real time.

**Live demo:** https://nebula-psi-ochre.vercel.app

---

## Features

- **GitHub-based deploys** — import a repo, set install/build commands and an output directory, and ship
- **Fargate build workers** — each deployment is scheduled as an isolated AWS ECS Fargate task via `@aws-sdk/client-ecs`
- **Realtime updates** — Server-Sent Events (`/api/events`) push deployment status and log updates to the dashboard as they happen, backed by Redis pub/sub
- **Custom domains** — attach and verify custom domains per project
- **Secrets management** — per-project, per-environment variables
- **Traffic analytics** — request counts, bandwidth, latency, and region breakdowns rendered with Recharts
- **GitHub webhooks** — push-to-deploy on `POST /api/webhook`
- **Auth** — email/password, GitHub OAuth, and Google OAuth via NextAuth
- **API keys** — issue scoped `neb_live_*` tokens for programmatic access

## Architecture

```
graph TD
    User([User Client]) <--> |HTTP/SSE| NextApp[Next.js App Server :3000]
    NextApp <--> |Drizzle ORM| DB[(PostgreSQL Database)]
    NextApp <--> |ioredis| Redis[(Upstash Redis Cache & PubSub)]
    NextApp --> |AWS SDK| ECS[AWS ECS Fargate Task Scheduler]

    User -.-> |Logs & Status Sync| SocketServer[External Socket Server]
    User -.-> |Static Traffic| Proxy[External Reverse Proxy]
    SocketServer -.-> |Sync Status /api/deploy/status| NextApp
    Proxy -.-> |Write Telemetry| Redis
```

**High-level flow**

1. **Project configuration** — the dashboard lists a user's repos via the GitHub API; the user sets build config and secrets and kicks off a deployment.
2. **Build scheduling** — the API records a `queued` deployment in Postgres, publishes a `global:events` message to Redis for live UI updates, and launches an ECS Fargate build task.
3. **Status sync** — an external build agent/socket server streams logs to Redis and, on completion, posts final logs and status (`ready` / `failed`) back to `/api/deploy/status`.
4. **Analytics aggregation** — API routes read traffic telemetry (requests, bandwidth, latency, region) written by the routing layer into Redis and format it for the dashboard charts.

> Note: the build worker (Fargate container image), the socket/log server, and the reverse proxy that writes traffic telemetry are external services this repo integrates with — they are not included in this repository.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, Framer Motion |
| State | Zustand |
| Database | PostgreSQL via Drizzle ORM (+ Drizzle Kit for migrations) |
| Cache / Pub-Sub | Redis (ioredis), designed for Upstash |
| Realtime | Server-Sent Events |
| Auth | NextAuth (Credentials, GitHub OAuth, Google OAuth) |
| Compute | AWS ECS Fargate (`@aws-sdk/client-ecs`) |
| Charts | Recharts |
| Icons | Lucide React, Remixicon |
| UI Kit | shadcn/ui, Radix (via `@base-ui/react`) |
| Package manager | pnpm |

## Project Structure

```
/app
├── app/                  # Next.js App Router (pages & API routes)
│   ├── (auth)/           # Register, reset, onboarding
│   ├── (public)/         # Marketing pages: docs, pricing, features
│   ├── api/               # Backend API routes
│   ├── dashboard/        # Workspace overview
│   ├── project/          # Project tabs: overview, deployments, logs, secrets, analytics
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Marketing landing page
├── components/
│   ├── context/           # Context providers
│   ├── landing/            # Landing page sections
│   ├── layouts/            # Layout wrappers (SidebarLayout)
│   ├── magicui/            # Premium interactive UI components
│   ├── ui/                 # shadcn/ui primitives
│   └── providers.tsx        # Session / TokenGuard / SSE listener wrapper
├── features/
│   └── projects/            # Tab-specific feature components
├── hooks/
│   ├── use-shortcuts.ts
│   ├── useRealtimeEvents.ts
│   └── useTokenGuard.ts
├── lib/
│   ├── build/               # ECS task scheduling client
│   ├── db/                  # Schema, queries, Drizzle config
│   ├── redis.ts
│   └── utils.ts
├── store/
│   └── store.ts              # Zustand global app state
└── types/
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A PostgreSQL database
- A Redis instance (Upstash recommended)
- A GitHub OAuth App (and optionally a Google OAuth Client)
- An AWS account with an ECS Fargate cluster, task definition, subnets, and security groups configured for the build worker

### Installation

```bash
git clone https://github.com/mahesh2-lab/nebula.git
cd nebula
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=postgres://user:password@host:5432/nebula

# Redis
REDIS_URL=redis://user:password@host:6379

# GitHub OAuth
GITHUB_ID=
GITHUB_SECRET=

# Google OAuth (optional)
GOOGLE_ID=
GOOGLE_SECRET=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# AWS ECS (build scheduling)
AWS_REGION=
CLUSTER=
TASK=
SUBNETS=
SECURITY_GROUPS=

# Deployment domain
NEXT_PUBLIC_DEPLOY_DOMAIN=

# Optional: external log/socket server
SOCKET_SERVER_API_URL=http://localhost:9000
NEXT_PUBLIC_SOCKET_URL=http://localhost:9002

# Optional: fallback admin credentials login
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `GITHUB_ID` / `GITHUB_SECRET` | Yes | GitHub OAuth app credentials |
| `NEXTAUTH_SECRET` | Yes | JWT session signing secret |
| `NEXTAUTH_URL` | Yes | Canonical app URL |
| `AWS_REGION` | Yes | Region for ECS launches |
| `CLUSTER` | Yes | ECS cluster ARN |
| `TASK` | Yes | ECS task definition ARN |
| `SUBNETS` | Yes | VPC subnets for the Fargate task |
| `SECURITY_GROUPS` | Yes | Security groups for the Fargate task |
| `NEXT_PUBLIC_DEPLOY_DOMAIN` | Yes | Base domain for deployed sites |
| `SOCKET_SERVER_API_URL` | No | Log server REST endpoint (defaults to `http://localhost:9000`) |
| `NEXT_PUBLIC_SOCKET_URL` | No | Log server WebSocket endpoint (defaults to `http://localhost:9002`) |

### Database Setup

```bash
pnpm drizzle-kit generate   # generate migrations from the schema
pnpm drizzle-kit migrate    # apply migrations
```

### Run the Dev Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Run in Production

```bash
pnpm build
pnpm start
```

## Database Schema

Defined with Drizzle ORM in `app/lib/db/schema.ts`.

- **users** — account records for credentials/OAuth login
- **api_keys** — scoped `neb_live_*` tokens, cascades from `users`
- **projects** — repo/build configuration per project
- **deployments** — build history, status, commit metadata, logs; cascades from `projects`
- **domains** — custom domains attached to a project; cascades from `projects`
- **env_variables** — per-environment secrets; cascades from `projects`

## API Overview

All routes live under `app/app/api/`.

| Endpoint | Method | Description |
|---|---|---|
| `/api/projects` | GET | List all projects for the current user |
| `/api/projects/[projectId]` | GET / PATCH / DELETE | Fetch, update, or delete a project |
| `/api/deploy` | POST | Trigger a new deployment |
| `/api/deploy/status` | POST | Internal sync endpoint for build status/logs |
| `/api/events` | GET | SSE stream of realtime dashboard updates |
| `/api/webhook` | POST | GitHub push webhook — triggers CI builds |
| `/api/projects/[projectId]/deployments/[deploymentId]/logs` | GET | Fetch build logs |
| `/api/analytics` | GET | Aggregated traffic stats across all projects |
| `/api/projects/[projectId]/analytics` | GET | Traffic/bandwidth/latency for a single project |
| `/api/projects/[projectId]/env` | POST / PATCH / DELETE | Manage project secrets |
| `/api/api-keys` | POST | Generate a new API token |

## Authentication

Nebula uses NextAuth with three providers:

- **GitHub OAuth** — scopes `read:user user:email repo`, used to list and clone repositories
- **Google OAuth**
- **Credentials** — email/password, with a fallback to `ADMIN_EMAIL` / `ADMIN_PASSWORD`

Sessions use the JWT strategy. Routes under `/dashboard`, `/project`, and `/new` are protected by `middleware.ts`. Set the `x-boneyard-bypass: true` header to skip auth during local development/testing.

> **Security note:** credentials passwords are compared directly against the `users` table without hashing in the current implementation — treat this as a development convenience, not a production-ready auth flow, and harden it (e.g. bcrypt/argon2 hashing) before deploying publicly.

## Deployment

Nebula itself is a Next.js app and can be deployed anywhere Next.js runs (Vercel, a Node server, Docker, etc.). The parts that need to be provisioned separately are:

- A PostgreSQL database
- A Redis instance
- An AWS ECS Fargate cluster + task definition for the build worker
- An external socket/log server that streams build output and calls back to `/api/deploy/status`
- A reverse proxy that serves deployed sites and writes traffic telemetry into Redis

## Contributing

1. Fork the repo and create a feature branch.
2. Follow the existing TypeScript conventions (async dynamic route params, `revalidateTag` after writes, etc.).
3. Run `pnpm lint` before opening a PR.
4. Open a pull request describing your change.

## License

No license has been specified for this repository yet. Add a `LICENSE` file to clarify how others may use this code.
