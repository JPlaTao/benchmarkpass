import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Star, Gift, Zap, CheckCircle, Sparkles } from "lucide-react";
import TaskList from "./task-list";

export default async function ChildDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "CHILD") redirect("/parent/dashboard");

  const user = session.user as any;

  // Get today's goals for this child
  const todayGoals = await prisma.goal.findMany({
    where: {
      assignedToId: user.id,
      status: "ACTIVE",
      OR: [
        { recurrence: "DAILY" },
        { recurrence: "ONCE" },
        { recurrence: "WEEKLY" },
      ],
    },
    include: {
      completions: {
        where: {
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Get XP and balance
  const xpTransactions = await prisma.transaction.findMany({
    where: { childId: user.id, type: "XP" },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  const coinTransactions = await prisma.transaction.findMany({
    where: { childId: user.id, type: "COIN" },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  const currentXp = xpTransactions[0]?.balance ?? 0;
  const currentCoins = coinTransactions[0]?.balance ?? 0;

  // Get active season with levels
  const activeSeason = user.seasonId
    ? await prisma.season.findUnique({
        where: { id: user.seasonId },
        include: { levels: { orderBy: { levelNum: "asc" } } },
      })
    : null;

  let currentLevel = 1;
  let nextLevelXp = 100;
  if (activeSeason?.levels) {
    for (const level of activeSeason.levels) {
      if (currentXp >= level.xpRequired) currentLevel = level.levelNum;
    }
    const nextLevel = activeSeason.levels.find((l) => l.levelNum === currentLevel + 1);
    if (nextLevel) nextLevelXp = nextLevel.xpRequired;
  }

  const tasks = todayGoals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    xpReward: goal.xpReward,
    coinReward: goal.coinReward,
    completedToday: goal.completions.some(
      (c) => c.status === "VERIFIED" || c.status === "PENDING_VERIFY"
    ),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {user.name?.[0] || "?"}
            </div>
            <div>
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-xs text-muted-foreground">等级 {currentLevel}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-primary">{currentXp}</span>
            </div>
            <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-secondary" />
              <span className="font-bold text-sm text-secondary">{currentCoins}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Battle Pass Progress */}
        <Link
          href="/child/battle-pass"
          className="block bg-gradient-to-r from-primary to-accent rounded-2xl p-5 mb-6 text-white shadow-lg shadow-primary/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">战令 Lv.{currentLevel}</span>
            </div>
            <Sparkles className="w-5 h-5 animate-float" />
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
            <div
              className="bg-white rounded-full h-2.5 transition-all duration-500"
              style={{ width: `${Math.min((currentXp / nextLevelXp) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/80">
            <span>{currentXp} XP</span>
            <span>下一级 {nextLevelXp} XP</span>
          </div>
        </Link>

        {/* Today's Missions */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            今日任务
          </h2>
          <TaskList tasks={tasks} />
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <Link href="/child/dashboard" className="flex flex-col items-center gap-0.5 text-primary">
            <CheckCircle className="w-5 h-5" />
            <span className="text-xs font-medium">任务</span>
          </Link>
          <Link href="/child/battle-pass" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
            <Trophy className="w-5 h-5" />
            <span className="text-xs">战令</span>
          </Link>
          <Link href="/child/rewards" className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
            <Gift className="w-5 h-5" />
            <span className="text-xs">奖励</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
