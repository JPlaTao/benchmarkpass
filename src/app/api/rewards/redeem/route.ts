import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/rewards/redeem - child redeems a reward
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "CHILD") {
    return NextResponse.json({ error: "仅孩子可兑换" }, { status: 401 });
  }

  try {
    const { rewardId } = await req.json();
    const childId = session.user.id;

    if (!rewardId) {
      return NextResponse.json({ error: "缺少奖励 ID" }, { status: 400 });
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      return NextResponse.json({ error: "奖励不存在或已下架" }, { status: 404 });
    }

    // Check balance
    const lastCoinTx = await prisma.transaction.findFirst({
      where: { childId, type: "COIN" },
      orderBy: { createdAt: "desc" },
    });
    const currentCoins = lastCoinTx?.balance ?? 0;

    if (currentCoins < reward.coinCost) {
      return NextResponse.json(
        { error: `BP 币不足，需要 ${reward.coinCost}，当前有 ${currentCoins}` },
        { status: 403 }
      );
    }

    // Deduct coins and create redemption in transaction
    const result = await prisma.$transaction(async (tx) => {
      const redemption = await tx.redemption.create({
        data: {
          childId,
          rewardId,
          status: "PENDING_VERIFY",
        },
      });

      await tx.transaction.create({
        data: {
          childId,
          type: "COIN",
          amount: -reward.coinCost,
          balance: currentCoins - reward.coinCost,
          reason: `兑换奖励: ${reward.title}`,
          referenceId: redemption.id,
        },
      });

      return redemption;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Redeem reward error:", error);
    return NextResponse.json({ error: "兑换失败" }, { status: 500 });
  }
}
