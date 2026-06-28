import { Trophy, Zap, Gift, Star, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BattlePassClient from "./battle-pass-client";

export default async function BattlePassPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "CHILD") redirect("/parent/dashboard");

  const user = session.user as any;

  const xpTransactions = await prisma.transaction.findMany({
    where: { childId: user.id, type: "XP" },
    orderBy: { createdAt: "desc" },
    take: 1,
  });
  const currentXp = xpTransactions[0]?.balance ?? 0;

  const activeSeason = user.seasonId
    ? await prisma.season.findUnique({
        where: { id: user.seasonId },
        include: {
          levels: { orderBy: { levelNum: "asc" } },
        },
      })
    : null;

  const claimedLevels = user.seasonId
    ? await prisma.levelClaim.findMany({
        where: {
          childId: user.id,
          level: { seasonId: user.seasonId },
        },
        select: { levelId: true },
      })
    : [];

  const claimedSet = new Set(claimedLevels.map((c) => c.levelId));

  const levelsWithStatus = (activeSeason?.levels ?? []).map((level) => {
    const unlocked = currentXp >= level.xpRequired;
    const claimed = claimedSet.has(level.id);
    return {
      id: level.id,
      levelNum: level.levelNum,
      xpRequired: level.xpRequired,
      rewardTitle: level.rewardTitle || `等级 ${level.levelNum} 奖励`,
      rewardDesc: level.rewardDesc,
      rewardType: level.rewardType,
      isPremium: level.isPremium,
      unlocked,
      claimed,
    };
  });

  const currentLevel = levelsWithStatus.filter((l) => l.unlocked).length || 1;
  const nextLevel = levelsWithStatus.find((l) => !l.claimed && l.levelNum === currentLevel + 1);
  const nextLevelXp = nextLevel?.xpRequired ?? levelsWithStatus[levelsWithStatus.length - 1]?.xpRequired ?? 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background pb-20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">战令</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-primary">{currentXp}</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Season Header */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-6">
          <div className="text-center mb-4">
            <div className="text-5xl font-extrabold text-primary mb-2">Lv.{currentLevel}</div>
            <p className="text-muted-foreground text-sm">{activeSeason?.name || "当前赛季"}</p>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-accent rounded-full h-3 transition-all duration-500"
              style={{ width: `${Math.min((currentXp / nextLevelXp) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{currentXp} XP</span>
            <span>下一级 {nextLevelXp} XP</span>
          </div>
        </div>

        {/* Level List - Interactive */}
        <BattlePassClient levels={levelsWithStatus} />

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>已解锁</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success" />
            <span>已领取</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>未解锁</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-accent" />
            <span>高级</span>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <Link href="/child/dashboard" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <CheckCircle className="w-5 h-5" />
            <span className="text-xs">任务</span>
          </Link>
          <Link href="/child/battle-pass" className="flex flex-col items-center gap-0.5 text-primary">
            <Trophy className="w-5 h-5" />
            <span className="text-xs font-medium">战令</span>
          </Link>
          <Link href="/child/rewards" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Gift className="w-5 h-5" />
            <span className="text-xs">奖励</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
