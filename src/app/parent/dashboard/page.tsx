import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Users, Target, Gift, Settings, Trophy, ClipboardCheck, LayoutTemplate } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";

export default async function ParentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const user = session.user as any;
  const familyId = user.familyId;

  if (!familyId) {
    return <div>请先创建家庭</div>;
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        where: { role: "CHILD" },
        select: { id: true, name: true, age: true, image: true },
      },
    },
  });

  const activeGoals = await prisma.goal.count({
    where: { familyId, status: "ACTIVE" },
  });

  const todayCompletions = await prisma.goalCompletion.count({
    where: {
      goal: { familyId },
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
      status: "VERIFIED",
    },
  });

  const pendingReviews = await prisma.goalCompletion.count({
    where: {
      goal: { familyId },
      status: "PENDING_VERIFY",
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="font-bold text-primary">BenchmarkPass</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.name}</span>
          <SignOutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">你好, {user.name} 👋</h1>
          <p className="text-muted-foreground">{family?.name || "您的家庭"}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-2xl font-bold text-primary">{activeGoals}</div>
            <div className="text-xs text-muted-foreground mt-1">进行中目标</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-2xl font-bold text-success">{todayCompletions}</div>
            <div className="text-xs text-muted-foreground mt-1">今日完成</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <div className="text-2xl font-bold text-warning">{pendingReviews}</div>
            <div className="text-xs text-muted-foreground mt-1">待审核</div>
          </div>
        </div>

        {/* Pending Reviews */}
        {pendingReviews > 0 && (
          <Link
            href="/parent/reviews"
            className="block bg-warning/10 border border-warning/20 rounded-xl p-4 mb-8 text-center hover:bg-warning/15 transition-colors"
          >
            <div className="flex items-center justify-center gap-2 text-warning font-semibold">
              <ClipboardCheck className="w-5 h-5" />
              有 {pendingReviews} 项任务待审核
            </div>
          </Link>
        )}

        {/* Children */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            我的孩子
          </h2>
          <div className="grid gap-3">
            {family?.members && family.members.length > 0 ? (
              family.members.map((child) => (
                <Link
                  key={child.id}
                  href={`/parent/child/${child.id}`}
                  className="flex items-center justify-between bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {child.name?.[0] || "?"}
                    </div>
                    <div>
                      <div className="font-medium">{child.name}</div>
                      {child.age && <div className="text-xs text-muted-foreground">{child.age} 岁</div>}
                    </div>
                  </div>
                  <div className="text-sm text-primary">查看详情 →</div>
                </Link>
              ))
            ) : (
              <div className="bg-card rounded-xl p-6 border border-dashed border-border text-center">
                <p className="text-muted-foreground mb-3">还没有添加孩子</p>
                <Link
                  href="/parent/child/add"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  添加孩子
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/parent/goals/templates"
              className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <LayoutTemplate className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">目标模板</span>
            </Link>
            <Link
              href="/parent/goals/create"
              className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <Target className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">创建目标</span>
            </Link>
            <Link
              href="/parent/goals"
              className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <Target className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium">管理目标</span>
            </Link>
            <Link
              href="/parent/rewards"
              className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <Gift className="w-6 h-6 text-secondary" />
              <span className="text-sm font-medium">奖励管理</span>
            </Link>
            <Link
              href="/parent/reviews"
              className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <ClipboardCheck className="w-6 h-6 text-success" />
              <span className="text-sm font-medium">审核任务</span>
            </Link>
            <Link
              href="/parent/season"
              className="flex flex-col items-center gap-2 bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <Settings className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium">战令设置</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
