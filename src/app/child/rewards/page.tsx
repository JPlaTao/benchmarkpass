import { Gift, Star, Trophy, CheckCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ShopClient from "./shop-client";

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "CHILD") redirect("/parent/dashboard");

  const user = session.user as any;

  const coinTransactions = await prisma.transaction.findMany({
    where: { childId: user.id, type: "COIN" },
    orderBy: { createdAt: "desc" },
    take: 1,
  });
  const currentCoins = coinTransactions[0]?.balance ?? 0;

  const rewards = await prisma.reward.findMany({
    where: { familyId: user.familyId, isActive: true },
  });

  const pendingRedemptions = await prisma.redemption.findMany({
    where: {
      childId: user.id,
      status: "PENDING_VERIFY",
    },
    select: { rewardId: true },
  });
  const pendingSet = new Set(pendingRedemptions.map((r) => r.rewardId));

  const serializedRewards = rewards.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    coinCost: r.coinCost,
    imageUrl: r.imageUrl,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/10 via-background to-background pb-20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-secondary" />
            <span className="font-bold text-lg">奖励商城</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-secondary" />
            <span className="font-bold text-sm text-secondary">{currentCoins}</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <ShopClient
          rewards={serializedRewards}
          currentCoins={currentCoins}
          pendingSet={Array.from(pendingSet)}
        />
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          <Link href="/child/dashboard" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <CheckCircle className="w-5 h-5" />
            <span className="text-xs">任务</span>
          </Link>
          <Link href="/child/battle-pass" className="flex flex-col items-center gap-0.5 text-muted-foreground">
            <Trophy className="w-5 h-5" />
            <span className="text-xs">战令</span>
          </Link>
          <Link href="/child/rewards" className="flex flex-col items-center gap-0.5 text-primary">
            <Gift className="w-5 h-5" />
            <span className="text-xs font-medium">奖励</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
