# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Next.js dev server (default: http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Database

```bash
pnpm prisma generate   # Generate Prisma client (output: src/generated/prisma/)
pnpm prisma migrate dev  # Apply migrations to MySQL (DATABASE_URL in .env)
pnpm prisma studio      # Open Prisma Studio GUI
```

Prisma client is generated to `src/generated/prisma/` (`.gitignore`d). Run `pnpm prisma generate` after pulling schema changes.

## Project Overview

BenchmarkPass — a "Battle Pass" habit system for parents and children. Parents create goals/tasks, kids earn XP and BP coins by completing them, level up through season-based battle passes, and redeem rewards.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 (MySQL/MariaDB) · NextAuth v5 beta (Credentials JWT) · Stripe · DashScope AI

## Architecture

### Routing (App Router)

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/auth/login`, `/auth/register` | Public | Auth pages |
| `/parent/*` | PARENT | Dashboard, goals, child management, rewards, reviews, seasons, subscription |
| `/child/*` | CHILD | Dashboard (tasks), battle-pass, rewards shop |

### API Routes

- `/api/auth/register` — Register parent + create family (transactional)
- `/api/family/child` — Add child (generates login code, default password `123456`)
- `/api/family/children` — List children
- `/api/goals/` — CRUD goals (POST create, GET list)
- `/api/goals/complete` — Child submits completion (POST, dedup per day)
- `/api/goals/pending` — List pending verifications (PARENT)
- `/api/goals/verify` — Parent approves/rejects (POST, awards XP/coins on verify)
- `/api/goals/suggest` — AI suggestions via DashScope with keyword fallback
- `/api/seasons/` — CRUD seasons (creates 30 default levels)
- `/api/seasons/assign` — Assign child to a season
- `/api/seasons/claim` — Child claims level reward
- `/api/seasons/levels` — PATCH level rewards
- `/api/rewards/` — CRUD rewards
- `/api/rewards/redeem` — Child redeems reward with coins
- `/api/stripe/*` — Checkout, portal, webhook (subscription)

### Database Models (Prisma, MySQL)

Core entities: `User` (PARENT/CHILD) · `Family` · `Season` · `Level` (30 per season) · `Goal` · `GoalCompletion` · `Transaction` (XP/COIN balance) · `Reward` · `Redemption` · `LevelClaim`

Key patterns:
- **Balances** tracked via last Transaction record's `balance` field (not cumulative)
- **XP required** for each level = `levelNum * 100`
- **Goal dedup**: children cannot submit the same goal twice in one day
- **Once-only goals** auto-mark as COMPLETED when parent verifies

### Auth

- NextAuth v5 beta, JWT strategy, 30-day session
- Parents: email + password. Children: login code (e.g. `BP3X7K42`) + password (default `123456`)
- `src/lib/auth.config.ts` — shared config (no Prisma, safe for Edge middleware)
- `src/lib/auth.ts` — full config with Prisma-backed Credentials provider
- `src/lib/auth-middleware.ts` — minimal config for middleware JWT decode only
- `src/middleware.ts` — protects routes, redirects unauthenticated, enforces role-based access
- `src/lib/auth-types.d.ts` — TypeScript module augmentation for `next-auth`

### Key Libraries

- **class-variance-authority** + **clsx** + **tailwind-merge** (`cn()` utility in `src/lib/utils.ts`)
- **lucide-react** for icons
- **zod** for input validation (used in registration)
- **bcryptjs** for password hashing (12 rounds)
- **Stripe SDK** for subscriptions (checkout + webhook)
- **DashScope (通义千问)** for AI goal suggestions with keyword-based fallback

### Custom CSS

Tailwind v4 with `@theme inline` variables. CSS custom properties for light/dark mode (follows `prefers-color-scheme`). Game-like animations: `float`, `pulse-glow`, `slide-up`, XP bar shimmer.
