import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, Star } from "lucide-react";
import RewardManager from "./reward-manager";

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const user = session.user as any;
  const familyId = user.familyId;

  const rewards = await prisma.reward.findMany({
    where: { familyId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const pendingRedemptions = await prisma.redemption.findMany({
    where: {
      reward: { familyId },
      status: "PENDING_VERIFY",
    },
    include: {
      child: { select: { name: true } },
      reward: { select: { title: true, coinCost: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = pendingRedemptions.map((r) => ({
    id: r.id,
    childName: r.child.name,
    rewardTitle: r.reward.title,
    coinCost: r.reward.coinCost,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/parent/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-secondary" />
            <h1 className="font-bold">奖励管理</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <RewardManager
          familyId={familyId!}
          initialRewards={rewards}
          initialPendingRedemptions={serialized}
        />
      </div>
    </div>
  );
}
