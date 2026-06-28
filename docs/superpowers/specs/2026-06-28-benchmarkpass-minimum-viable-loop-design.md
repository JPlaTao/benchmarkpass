# BenchmarkPass — Minimum Viable Loop Design

**Date:** 2026-06-28
**Status:** Draft → Approved
**Target:** Run a complete parent→child→goal→verify loop, push to GitHub

## 1. Scope

This iteration targets only the core loop:

> **Parent registers → Adds child → Creates a goal → Child completes it → Parent verifies → XP/coins awarded**

Anything outside this chain (season/battle-pass system, reward shop/subscriptions, child detail dashboard, Streaks, notifications) is explicitly deferred.

## 2. Product Form

- Single web app (Next.js), all devices via browser.
- Parents log in with email/password; children log in with a login code + password.
- No separate child device required — a parent can hand their phone to the child after logging the child in.
- The split UI (parent routes → management panel, child routes → simple task view) is kept as-is.
- **Future consideration** (out of scope): a "switch to child" button on the parent dashboard that skips the login code for low-age scenarios.

## 3. Bug Fixes

### 3.1 Child Balance Query (parent/child/[id])

**Problem:** The detail page fetches `transactions: { take: 2 }` then `.find()` by type. If the two most recent transactions are both COIN, XP reads 0.

**Fix:** Replace the single query with two targeted `findFirst` calls — one per type. The child dashboard and battle-pass pages already do this correctly and need no change.

**Files:** `src/app/parent/child/[id]/page.tsx`

### 3.2 Weekly Goal Dedup

**Problem:** `goals/complete` checks only `date: { gte: today }`, but WEEKLY goals should reject duplicates within the same calendar week.

**Fix:** Compute the start-of-week (Monday 00:00) and use that as the lower bound for WEEKLY goals. DAILY stays on today, ONCE checks globally (no date window needed since they auto-COMPLETE after verification).

**Files:** `src/app/api/goals/complete/route.ts`

### 3.3 Database Indexes

Add indexes on common query paths:

- `Goal`: familyId, assignedToId, status
- `GoalCompletion`: goalId, childId, date
- `Transaction`: childId, type

**Files:** `prisma/schema.prisma`

## 4. Feature Gaps

### 4.1 Goal Edit & Delete

**Problem:** Goals cannot be modified or removed after creation.

**Solution:**
- New API route `PATCH /api/goals/[id]` — updates title, description, xpReward, coinReward, recurrence, category, assignedToId, status
- New API route `DELETE /api/goals/[id]` — hard deletes the goal (with family-scope check; cascades to completions)
- Frontend: edit button per goal navigates to a reuse of `CreateGoalForm` (or inline form); delete button shows a confirmation dialog then removes the row
- Reuse `CreateGoalForm` by adding an optional `goal` prop. When present, the form pre-fills and calls PATCH instead of POST.

### 4.2 Goal List Filtering

**Problem:** `/parent/goals` shows all goals with no filtering.

**Solution:**
- Add a filter bar above the list: status dropdown (All / Active / Completed / Expired) + child assignment dropdown
- Filters are driven by URL query params (`?status=ACTIVE&childId=xxx`)
- Backend adds Prisma `where` conditions accordingly

### 4.3 Category Consistency

**Problem:** Goal creation dropdown is missing SKILL / OUTDOOR / READING categories that exist in the template library.

**Solution:**
- Extract `CATEGORIES` from `template-library.ts` as a shared constant
- Both `CreateGoalForm` and the template browser import the same source

## 5. UX Polish

### 5.1 Silent catch Blocks

**Problem:** All `catch { }` blocks in client components are empty — users get no feedback on failure.

**Fix:** Every client component with a fetch operation must set its local `error` state on catch (most already have an `error` state variable). Where a success message would be helpful, add a local `success` state (pattern already exists in `shop-client`).

Affected components:
- `task-card.tsx` — set error state on complete failure
- `review-list.tsx` — set error on verify failure
- `reward-manager.tsx` — set error on create/fulfill failure
- `add-child-form.tsx` — already has error display, fill the catch block
- `create-goal-form.tsx` — already has error display, fill the catch block
- `subscription-plans.tsx` — set error on subscribe/portal failure
- `battle-pass-client.tsx` — set error on claim failure

### 5.2 Error Boundary & Loading States

- Add `error.tsx` at `src/app/error.tsx` (catches all routes via Next.js error boundary nesting)
- Add `loading.tsx` to routes that depend on async data fetching where useful
- Use a simple spinner matching the existing design system

### 5.3 Category Dropdown Completeness

Add SKILL / OUTDOOR / READING options to the goal creation form.

## 6. GitHub Release Prep

### 6.1 .env.example

Create a `.env.example` file documenting every environment variable with a short Chinese comment:

```
DATABASE_URL="mysql://root:password@localhost:3306/benchmarkpass"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
DASHSCOPE_API_KEY=
DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com/api/v1"
```

### 6.2 README Rewrite

Replace the default create-next-app README with a project-specific one covering:
- What is BenchmarkPass
- Tech stack
- Prerequisites (MySQL, Node.js 20+, pnpm)
- Quick start steps
- Usage flow overview
- Environment variables reference

### 6.3 Postinstall Hook

Add `"postinstall": "prisma generate"` to `package.json` so new clones don't need a manual generate step.

### 6.4 .gitignore & Migration

- Keep `src/generated/prisma` gitignored (regenerated via postinstall)
- The existing migration files in `prisma/migrations/` are committed and sufficient
- Remove any placeholder fallback values in code that could mask configuration errors

## 7. Non-Goals (Explicitly Out of Scope)

- Streak / consecutive-day system
- Photo upload for goal verification
- Notifications (any channel)
- Season editing UI for parents
- Multi-child comparison dashboard
- Unit/E2E tests
- Docker deployment
- Stripe subscription live integration

## 8. Open Questions Resolved

| Question | Decision |
|---|---|
| How should the child use the app? | Same browser, login code, parent can hand over device |
| Edit vs delete? | Both — edit via reusable form, delete with confirmation |
| Toast library or inline? | Inline error/success state (no new dependency) |
| Hard or soft delete? | Hard delete with cascade |
| Add seed script? | Not now — README steps suffice |
