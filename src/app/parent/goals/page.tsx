import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Target } from "lucide-react";
import GoalFilters from "./goal-filters";
import DeleteGoalButton from "./delete-button";

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; childId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

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

  return (
    <div className="min-h-screen bg-background">
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
        <GoalFilters
          status={params.status || ""}
          childId={params.childId || ""}
          children={children}
        />

        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{goal.title}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        goal.status === "ACTIVE" ? "bg-success/10 text-success" :
                        goal.status === "COMPLETED" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {goal.status === "ACTIVE" ? "进行中" :
                         goal.status === "COMPLETED" ? "已完成" : "已过期"}
                      </span>
                    </div>
                    {goal.description && (
                      <div className="text-sm text-muted-foreground">{goal.description}</div>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{goal.assignedTo?.name || "未分配"}</span>
                      <span>+{goal.xpReward} XP</span>
                      <span className="capitalize">{goal.recurrence.toLowerCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/parent/goals/edit/${goal.id}`}
                      className="text-xs px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      编辑
                    </Link>
                    <DeleteGoalButton goalId={goal.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">还没有创建任何目标</p>
            <Link
              href="/parent/goals/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white"
            >
              <PlusCircle className="w-4 h-4" />
              创建第一个目标
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
