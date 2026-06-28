# BenchmarkPass Minimum Viable Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the core parent→child→goal→verify loop functional, polished, and pushable to GitHub.

**Architecture:** Next.js 16 App Router with Prisma 7 (MySQL), NextAuth v5 JWT, Tailwind v4. Server components fetch data, client components handle interactions. Each bug fix and feature gap is isolated to specific files with minimal cross-cutting changes.

**Tech Stack:** Next.js 16.2, Prisma 7.8, MariaDB/MySQL, Tailwind v4, NextAuth v5 beta, TypeScript 5

## Global Constraints

- Must work with existing database migration (no schema changes beyond adding indexes)
- All new API routes must use existing auth pattern (`auth()` + role check)
- All client error handling uses existing inline error state pattern (no new toast library)
- Chinese language for all user-facing text
- Existing Prisma enum values must not be modified

---

### Task 1: Add Database Indexes

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: existing Prisma schema
- Produces: indexed database for performance

- [ ] **Step 1: Add indexes to Goal model**

Edit `prisma/schema.prisma` to add indexes after the existing model fields but before the closing `}`:

```prisma
model Goal {
  // ... existing fields stay unchanged ...

  @@index([familyId])
  @@index([assignedToId])
  @@index([status])
}
```

- [ ] **Step 2: Add indexes to GoalCompletion model**

```prisma
model GoalCompletion {
  // ... existing fields stay unchanged ...

  @@index([goalId])
  @@index([childId])
  @@index([date])
}
```

- [ ] **Step 3: Add indexes to Transaction model**

```prisma
model Transaction {
  // ... existing fields stay unchanged ...

  @@index([childId])
  @@index([type])
}
```

- [ ] **Step 4: Generate Prisma client**

Run: `pnpm prisma generate`
Expected output: "Prisma Client successfully generated"

- [ ] **Step 5: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma src/generated/prisma
git commit -m "perf: add database indexes for common queries"
```

---

### Task 2: Fix Child Balance Query

**Files:**
- Modify: `src/app/parent/child/[id]/page.tsx`

**Interfaces:**
- Consumes: existing `auth()` and `prisma` from `@/lib`
- Produces: correct XP/coin display on child detail page

- [ ] **Step 1: Read the current file to understand the structure**

Read: `src/app/parent/child/[id]/page.tsx`

- [ ] **Step 2: Replace the transaction query block**

Find the existing Prisma query — it currently does:
```typescript
transactions: {
  orderBy: { createdAt: "desc" },
  take: 2,
},
```

Replace with separate queries after the main `user.findUnique`:
```typescript
// After getting child, fetch balances separately
const [xpTx, coinTx] = await Promise.all([
  prisma.transaction.findFirst({
    where: { childId: id, type: "XP" },
    orderBy: { createdAt: "desc" },
  }),
  prisma.transaction.findFirst({
    where: { childId: id, type: "COIN" },
    orderBy: { createdAt: "desc" },
  }),
]);

const xpBalance = xpTx?.balance ?? 0;
const coinBalance = coinTx?.balance ?? 0;
```

Remove the `child.transactions` reference and the old balance calculation lines (`const xpBalance = ...` / `const coinBalance = ...`).

- [ ] **Step 3: Remove `transactions` from the Prisma include**

The main `user.findUnique` no longer needs the `transactions` include at all. Remove it (or keep it minimal):

```typescript
const child = await prisma.user.findUnique({
  where: { id },
  include: {
    assignedGoals: {
      where: { status: "ACTIVE" },
      include: { completions: true },
    },
    family: true,
    // transactions removed — now queried separately
  },
});
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/app/parent/child/\[id\]/page.tsx
git commit -m "fix: correct child balance query on detail page"
```

---

### Task 3: Fix Weekly Goal Dedup

**Files:**
- Modify: `src/app/api/goals/complete/route.ts`

**Interfaces:**
- Consumes: POST body `{ goalId, note? }`, session from `auth()`
- Produces: correct duplicate detection per recurrence type

- [ ] **Step 1: Read the current file**

Read: `src/app/api/goals/complete/route.ts`

- [ ] **Step 2: Add the weekly start-of-week helper and fetch goal recurrence**

After getting `goalId` and `childId`, fetch the goal to know its recurrence:

```typescript
// Check if goal exists
const goal = await prisma.goal.findUnique({
  where: { id: goalId },
  select: { recurrence: true },
});

if (!goal) {
  return NextResponse.json({ error: "目标不存在" }, { status: 404 });
}
```

- [ ] **Step 3: Compute the correct date window based on recurrence**

Replace the existing `today` computation with a recurrence-aware function:

```typescript
// Compute the start of the duplicate-check window based on recurrence
function getDedupStartDate(recurrence: string): Date {
  const now = new Date();
  if (recurrence === "WEEKLY") {
    // Monday 00:00 of the current week
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Sunday → go back 6, else go back (day-1)
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
  // DAILY and ONCE both use today's start
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
}
```

- [ ] **Step 4: Update the existing duplicate check**

Replace the current `today`/`existing` block:

```typescript
const dedupStart = getDedupStartDate(goal.recurrence);
const existing = await prisma.goalCompletion.findFirst({
  where: {
    goalId,
    childId,
    date: { gte: dedupStart },
    status: { in: ["PENDING_VERIFY", "VERIFIED"] },
  },
});

if (existing) {
  return NextResponse.json(
    { error: goal.recurrence === "WEEKLY" ? "本周已经提交过了" : "今天已经提交过了" },
    { status: 409 }
  );
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/app/api/goals/complete/route.ts
git commit -m "fix: weekly goal dedup checks current week, not just today"
```

---

### Task 4: Extract Shared Categories Constant

**Files:**
- Modify: `src/lib/templates/template-library.ts`
- Modify: `src/app/parent/goals/create/CreateGoalForm.tsx`

**Interfaces:**
- Produces: `CATEGORIES` exported constant (`src/lib/templates/template-library.ts` already exports it)
- Consumes: `CATEGORIES` imported in `CreateGoalForm.tsx`

- [ ] **Step 1: Verify that CATEGORIES is already exported**

Read `src/lib/templates/template-library.ts`. It already has `export const CATEGORIES = [...]`. Good — no change needed.

- [ ] **Step 2: Update CreateGoalForm to use the shared constant and add missing categories**

Read `src/app/parent/goals/create/CreateGoalForm.tsx`. Find the category `<select>` block and replace the hardcoded options with a loop over the imported `CATEGORIES`:

```typescript
// At top of file, add import:
import { CATEGORIES } from "@/lib/templates/template-library";
```

Replace the `<select>` for category:

```tsx
{/* Category */}
<div>
  <label className="text-sm font-medium block mb-1.5">分类</label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
  >
    <option value="">选择分类（可选）</option>
    {CATEGORIES.map((cat) => (
      <option key={cat.key} value={cat.key}>
        {cat.label}
      </option>
    ))}
  </select>
</div>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/parent/goals/create/CreateGoalForm.tsx
git commit -m "feat: use shared categories in goal creation form, add missing SKILL/OUTDOOR/READING"
```

---

### Task 5: Goal Edit & Delete API Routes

**Files:**
- Create: `src/app/api/goals/[id]/route.ts`

**Interfaces:**
- Consumes: PATCH body `{ title?, description?, xpReward?, coinReward?, recurrence?, category?, assignedToId?, status? }`; DELETE no body
- Produces: PATCH → updated Goal object; DELETE → `{ success: true }`
- Auth: PARENT role required, family-scope check

- [ ] **Step 1: Create the API route**

Create `src/app/api/goals/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/goals/[id] - update a goal
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const user = session.user as any;

    // Verify goal belongs to this family
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { family: { select: { id: true } } },
    });

    if (!goal || goal.family.id !== user.familyId) {
      return NextResponse.json({ error: "目标不存在" }, { status: 404 });
    }

    // Build update data — only include provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title", "description", "xpReward", "coinReward",
      "recurrence", "category", "assignedToId", "status",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "没有要更新的字段" }, { status: 400 });
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE /api/goals/[id] - delete a goal
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = session.user as any;

    // Verify goal belongs to this family
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { family: { select: { id: true } } },
    });

    if (!goal || goal.family.id !== user.familyId) {
      return NextResponse.json({ error: "目标不存在" }, { status: 404 });
    }

    await prisma.goal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/goals/\[id\]/route.ts
git commit -m "feat: add PATCH and DELETE goals API"
```

---

### Task 6: Goal Edit UI

**Files:**
- Create: `src/app/parent/goals/edit/[id]/page.tsx`
- Modify: `src/app/parent/goals/page.tsx`

**Interfaces:**
- Consumes: `CreateGoalForm` component (modified to accept optional `goal` prop)
- Produces: edit page at `/parent/goals/edit/[id]` with navigation from goal list

- [ ] **Step 1: Make CreateGoalForm accept an optional goal prop for edit mode**

Modify `src/app/parent/goals/create/CreateGoalForm.tsx` to accept an optional `initialGoal` prop:

```typescript
// Add to the Props interface
interface CreateGoalFormProps {
  familyId: string;
  parentId: string;
  initialGoal?: {
    id: string;
    title: string;
    description: string | null;
    xpReward: number;
    coinReward: number;
    recurrence: string;
    category: string | null;
    assignedToId: string | null;
  };
}
```

Update the `useState` initializers to use `initialGoal` when provided:

```typescript
const [title, setTitle] = useState(initialGoal?.title || "");
const [description, setDescription] = useState(initialGoal?.description || "");
const [xpReward, setXpReward] = useState(initialGoal?.xpReward ?? 10);
const [coinReward, setCoinReward] = useState(initialGoal?.coinReward ?? 0);
const [recurrence, setRecurrence] = useState<"DAILY" | "WEEKLY" | "ONCE">(
  (initialGoal?.recurrence as "DAILY" | "WEEKLY" | "ONCE") || "ONCE"
);
const [category, setCategory] = useState(initialGoal?.category || "");
const [childId, setChildId] = useState(initialGoal?.assignedToId || "");
```

Update `handleSubmit` to call PATCH if editing, POST if creating:

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const url = initialGoal
      ? `/api/goals/${initialGoal.id}`
      : "/api/goals";
    const method = initialGoal ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familyId,
        createdById: parentId,
        assignedToId: childId || null,
        title,
        description,
        xpReward,
        coinReward,
        recurrence,
        category: category || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || (initialGoal ? "更新失败" : "创建失败"));
      setLoading(false);
      return;
    }

    router.push("/parent/goals");
  } catch {
    setError(initialGoal ? "更新失败" : "创建失败");
    setLoading(false);
  }
}
```

Update the submit button text:

```tsx
<button
  type="submit"
  disabled={loading}
  className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
>
  {loading ? (
    <><Loader2 className="w-4 h-4 animate-spin" /> {initialGoal ? "保存中..." : "创建中..."}</>
  ) : (
    <><Target className="w-4 h-4" /> {initialGoal ? "保存修改" : "创建目标"}</>
  )}
</button>
```

- [ ] **Step 2: Create the edit page**

Create `src/app/parent/goals/edit/[id]/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import CreateGoalForm from "../create/CreateGoalForm";

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const user = session.user as any;
  const { id } = await params;

  const goal = await prisma.goal.findUnique({
    where: { id },
  });

  if (!goal || goal.familyId !== user.familyId) {
    redirect("/parent/goals");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/parent/goals" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-primary" />
          <h1 className="font-bold">编辑目标</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <CreateGoalForm
          familyId={user.familyId}
          parentId={user.id}
          initialGoal={{
            id: goal.id,
            title: goal.title,
            description: goal.description,
            xpReward: goal.xpReward,
            coinReward: goal.coinReward,
            recurrence: goal.recurrence,
            category: goal.category,
            assignedToId: goal.assignedToId,
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add edit and delete buttons to the goal list**

Edit `src/app/parent/goals/page.tsx`. In the goal card, add action buttons:

```tsx
// After the goal title/description block, before closing </div>:
<div className="flex items-center gap-2 mt-3">
  <Link
    href={`/parent/goals/edit/${goal.id}`}
    className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
  >
    编辑
  </Link>
  <button
    onClick={async () => {
      if (!confirm("确定删除这个目标吗？")) return;
      await fetch(`/api/goals/${goal.id}`, { method: "DELETE" });
      window.location.reload();
    }}
    className="text-xs px-3 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
  >
    删除
  </button>
</div>
```

Since this is a server component, the delete button will need a client-side handler. Better approach — wrap the delete in a simple client component or use a form. Let's use a minimal inline client component approach instead.

Add a `"use client"` delete button component at the bottom of the page file (or a separate file). Let's keep it simple — add it as a client component in the same file. Actually, for server components, we can't use `onClick`. Let me make a pragmatic choice: add a `<DeleteGoalButton>` client component in the same file, or extract it.

Simplest approach — add the delete button as a native `<form>` that POSTs to a new action endpoint. Even simpler — just use a `confirm` dialog with a server action. Actually the simplest is to make the delete button a separate tiny client component.

I'll create it inline in the page file:

```tsx
// At the bottom of goals/page.tsx, add:
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function DeleteGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定删除这个目标吗？")) return;
    setLoading(true);
    try {
      await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-3 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}
```

Wait, you can't have both `"use client"` and a server component in the same file. Let me think about this differently.

Actually in Next.js App Router, you can have a client component at the bottom of a file that's primarily a server component — but the export would conflict. Better approach: create a separate file `src/app/parent/goals/delete-button.tsx`:

Create `src/app/parent/goals/delete-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定删除这个目标吗？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-3 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}
```

And in `goals/page.tsx`, import and use it:

```tsx
import DeleteGoalButton from "./delete-button";

// In the goal card:
<div className="flex items-center gap-2 mt-3">
  <Link
    href={`/parent/goals/edit/${goal.id}`}
    className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
  >
    编辑
  </Link>
  <DeleteGoalButton goalId={goal.id} />
</div>
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/app/parent/goals/edit/\[id\]/page.tsx src/app/parent/goals/page.tsx src/app/parent/goals/create/CreateGoalForm.tsx src/app/parent/goals/delete-button.tsx
git commit -m "feat: add goal edit and delete with reusable form"
```

---

### Task 7: Goal List Filtering

**Files:**
- Modify: `src/app/parent/goals/page.tsx`

**Interfaces:**
- Consumes: URL search params `?status=ACTIVE&childId=xxx`
- Produces: filtered goal list

- [ ] **Step 1: Read current goals page**

Read: `src/app/parent/goals/page.tsx`

- [ ] **Step 2: Add filter params to the Prisma query**

Replace the current `prisma.goal.findMany` with a query that reads searchParams:

```typescript
import { redirect } from "next/navigation";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; childId?: string }>;
}) {
  // ... existing auth checks ...

  const params = await searchParams;
  const user = session.user as any;

  // Build where clause
  const where: Record<string, unknown> = { familyId: user.familyId };
  if (params.status) {
    where.status = params.status;
  }
  if (params.childId) {
    where.assignedToId = params.childId;
  }

  const goals = await prisma.goal.findMany({
    where,
    include: { assignedTo: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Get children for filter dropdown
  const children = await prisma.user.findMany({
    where: { familyId: user.familyId, role: "CHILD" },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
```

- [ ] **Step 3: Add filter UI above the goal list**

Replace the header/goals section:

```tsx
<header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Link href="/parent/dashboard" className="text-muted-foreground hover:text-foreground">
      ←
    </Link>
    <h1 className="font-bold">目标管理</h1>
  </div>
  <Link
    href="/parent/goals/create"
    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm"
  >
    <PlusCircle className="w-4 h-4" />
    新建
  </Link>
</header>

<div className="max-w-3xl mx-auto px-4 py-6">
  {/* Filters */}
  <div className="flex gap-3 mb-4">
    <select
      defaultValue={params.status || ""}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value) url.searchParams.set("status", e.target.value);
        else url.searchParams.delete("status");
        window.location.href = url.toString();
      }}
      className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
    >
      <option value="">全部状态</option>
      <option value="ACTIVE">进行中</option>
      <option value="COMPLETED">已完成</option>
      <option value="EXPIRED">已过期</option>
    </select>
    <select
      defaultValue={params.childId || ""}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value) url.searchParams.set("childId", e.target.value);
        else url.searchParams.delete("childId");
        window.location.href = url.toString();
      }}
      className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
    >
      <option value="">全部孩子</option>
      {children.map((c: { id: string; name: string | null }) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  </div>
```

Also add a status badge in each goal card:

```tsx
<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
  goal.status === "ACTIVE" ? "bg-success/10 text-success" :
  goal.status === "COMPLETED" ? "bg-primary/10 text-primary" :
  "bg-muted text-muted-foreground"
}`}>
  {goal.status === "ACTIVE" ? "进行中" :
   goal.status === "COMPLETED" ? "已完成" : "已过期"}
</span>
```

Note: since the filter dropdowns use `window.location`, they need `"use client"`. But this page is a server component. The simplest approach: create a separate client component for the filter bar.

Create `src/app/parent/goals/goal-filters.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";

interface ChildItem {
  id: string;
  name: string | null;
}

export default function GoalFilters({
  status,
  childId,
  children,
}: {
  status: string;
  childId: string;
  children: ChildItem[];
}) {
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    router.push(url.toString());
  }

  return (
    <div className="flex gap-3 mb-4">
      <select
        defaultValue={status}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
      >
        <option value="">全部状态</option>
        <option value="ACTIVE">进行中</option>
        <option value="COMPLETED">已完成</option>
        <option value="EXPIRED">已过期</option>
      </select>
      <select
        defaultValue={childId}
        onChange={(e) => updateFilter("childId", e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
      >
        <option value="">全部孩子</option>
        {children.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Update goals/page.tsx to use the filter component**

After the header, add the filter bar and update the goal card to show status:

```tsx
import GoalFilters from "./goal-filters";
import DeleteGoalButton from "./delete-button";

// Inside the return, after <header>:
<div className="max-w-3xl mx-auto px-4 py-6">
  <GoalFilters
    status={params.status || ""}
    childId={params.childId || ""}
    children={children}
  />

  {goals.length > 0 ? (
    // ... existing goal list with added status badge and edit/delete buttons
  ) : (
    // ... existing empty state
  )}
</div>
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/app/parent/goals/goal-filters.tsx src/app/parent/goals/page.tsx
git commit -m "feat: add goal list filtering by status and child"
```

---

### Task 8: Fix Silent Catch Blocks

**Files:**
- Modify: `src/components/task-card.tsx`
- Modify: `src/app/parent/reviews/review-list.tsx`
- Modify: `src/app/parent/rewards/reward-manager.tsx`
- Modify: `src/app/parent/child/add/AddChildForm.tsx`
- Modify: `src/app/parent/subscription/subscription-plans.tsx`
- Modify: `src/app/child/battle-pass/battle-pass-client.tsx`

**Interfaces:**
- Consumes: existing component patterns with local `error` state
- Produces: user-visible error feedback on fetch failures

- [ ] **Step 1: Fix task-card.tsx**

Add an `error` state variable:

```typescript
const [error, setError] = useState("");
```

In the catch block:

```typescript
} catch {
  setError("提交失败，请重试");
}
setLoading(false);
```

Add error display in the JSX (before the progress indicator):

```tsx
{error && (
  <div className="text-xs text-danger bg-danger/5 px-3 py-2 rounded-lg mb-2">{error}</div>
)}
```

- [ ] **Step 2: Fix review-list.tsx**

Add `error` state, set it in catch, display it near the top of the list.

- [ ] **Step 3: Fix reward-manager.tsx**

Add `error` state for both create and fulfill operations, display errors.

- [ ] **Step 4: Fix AddChildForm.tsx**

Already has error display (`{error && ...}`) — the catch block at line 42-44 just needs to call `setError`:

```typescript
} catch {
  setError("添加失败，请重试");
  setLoading(false);
}
```

- [ ] **Step 5: Fix subscription-plans.tsx**

Add `error` state, set in both `handleSubscribe` and `handleManageSubscription` catch blocks, display above the plan grid.

- [ ] **Step 6: Fix battle-pass-client.tsx**

Add `error` state, set on claim failure, display above the level list.

- [ ] **Step 7: Commit**

```bash
git add src/components/task-card.tsx src/app/parent/reviews/review-list.tsx src/app/parent/rewards/reward-manager.tsx src/app/parent/child/add/AddChildForm.tsx src/app/parent/subscription/subscription-plans.tsx src/app/child/battle-pass/battle-pass-client.tsx
git commit -m "fix: add user-visible error feedback to all client catch blocks"
```

---

### Task 9: Error Boundary & Loading States

**Files:**
- Create: `src/app/error.tsx`
- Create: `src/app/loading.tsx`

**Interfaces:**
- Produces: catch-all error page and loading spinner

- [ ] **Step 1: Create error.tsx**

Create `src/app/error.tsx`:

```tsx
"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">😅</div>
        <h1 className="text-xl font-bold mb-2">出错了</h1>
        <p className="text-sm text-muted-foreground mb-6">
          页面加载出现了点问题，请重试
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create loading.tsx**

Create `src/app/loading.tsx`:

```tsx
export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/error.tsx src/app/loading.tsx
git commit -m "feat: add global error boundary and loading state"
```

---

### Task 10: Stripe Placeholder Safety

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts`
- Modify: `src/lib/stripe/server.ts`

**Interfaces:**
- Produces: clear error when Stripe is not configured instead of silently falling back

- [ ] **Step 1: Remove unsafe placeholder fallback in webhook**

In `src/app/api/stripe/webhook/route.ts`, replace:

```typescript
process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder"
```

with:

```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
}
```

And use the variable:

```typescript
event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

- [ ] **Step 2: Remove placeholder price IDs in stripe/server.ts**

In `src/lib/stripe/server.ts`, the `SUBSCRIPTION_PLANS` have fallback `|| "price_monthly"` etc. Remove those — they'll fail at Stripe API call anyway, but better to fail early:

```typescript
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!, // non-null assertion — validated at use
    // ...
  },
  // ...
};
```

Actually, this is a minor change — the subscription page already shows a "not configured" notice. Let's skip changing `stripe/server.ts` to keep scope small. Just fix the webhook.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts
git commit -m "fix: fail early when Stripe webhook secret is not configured"
```

---

### Task 11: .env.example & README

**Files:**
- Create: `.env.example`
- Rewrite: `README.md`

- [ ] **Step 1: Create .env.example**

Create `.env.example`:

```
# Database — MySQL 连接
DATABASE_URL="mysql://root:password@localhost:3306/benchmarkpass"

# NextAuth — JWT 加密密钥（可用 openssl rand -base64 32 生成）
NEXTAUTH_SECRET="your-random-secret-here"

# NextAuth — 开发时填实际启动端口
NEXTAUTH_URL="http://localhost:3000"

# Stripe 支付（可选，不配订阅功能不可用）
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# DashScope（通义千问）AI 奖励建议（可选，不配则使用关键词兜底方案）
DASHSCOPE_API_KEY=
DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com/api/v1"
```

- [ ] **Step 2: Rewrite README.md**

Write to `README.md`:

```markdown
# BenchmarkPass 🏆

让孩子在游戏化的挑战中养成好习惯。

家长设定目标 → 孩子完成任务赚 XP 升级 → 家长审核通过 → 孩子兑换奖励。

## 技术栈

- **框架:** Next.js 16 (App Router)
- **语言:** TypeScript
- **样式:** Tailwind CSS v4
- **数据库:** MySQL / MariaDB (Prisma 7)
- **认证:** NextAuth v5 (Credentials JWT)
- **支付:** Stripe（可选）
- **AI:** 通义千问 DashScope（可选）

## 前置依赖

- Node.js 20+
- pnpm
- MySQL 8.0+

## 快速开始

```bash
# 1. 克隆仓库
git clone <repo-url> && cd benchmarkpass

# 2. 安装依赖（自动生成 Prisma Client）
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 MySQL 连接信息

# 4. 创建数据库并执行迁移
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS benchmarkpass"
pnpm prisma migrate dev

# 5. 启动开发服务器
pnpm dev
```

打开 http://localhost:3000 即可使用。

## 使用流程

1. **家长注册** — 用邮箱注册账号，自动创建家庭
2. **添加孩子** — 获得孩子的登录码（例如 BP3X7K42）
3. **创建目标** — 从模板库选或自定义，设定 XP/币奖励
4. **孩子登录** — 用登录码 + 默认密码 123456 进入任务看板
5. **完成任务** — 孩子点击勾选提交，等待家长审核
6. **家长审核** — 确认完成后 XP 和币自动到账

## 环境变量

参见 `.env.example`。Stripe 和 DashScope 为可选配置，不配不影响核心功能。

## 项目结构

```
src/
├── app/
│   ├── api/          # API 路由（认证、目标、奖励、赛季、Stripe）
│   ├── auth/         # 登录/注册页面
│   ├── parent/       # 家长管理端
│   ├── child/        # 孩子操作端
│   └── page.tsx      # 首页着陆页
├── components/       # 共享组件
├── lib/              # 工具函数、认证配置、模板库
└── generated/prisma/ # Prisma Client（自动生成）
```

## License

MIT
```

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: add .env.example and rewrite README"
```

---

### Task 12: Postinstall Hook & .gitignore

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Add postinstall script to package.json**

In `package.json`, add the postinstall script:

```json
"scripts": {
  "postinstall": "prisma generate",
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

- [ ] **Step 2: Ensure .gitignore is correct**

Read `.gitignore` to verify `src/generated/prisma` is ignored (it already is — line 43).

- [ ] **Step 3: Create initial git repo and commit everything**

```bash
cd E:/1.Projects/BenchmarkPass
git init
git add .
git commit -m "feat: initial BenchmarkPass — family habit battle-pass system"
```

- [ ] **Step 4: Verify git status is clean**

Run: `git status`
Expected: "nothing to commit, working tree clean"

---

### Task 13: Final Verification

- [ ] **Step 1: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: No errors or warnings (existing warnings are acceptable)

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: final cleanup before push"
```
