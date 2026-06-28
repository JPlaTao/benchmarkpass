import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "仅家长可审核" }, { status: 401 });
  }

  try {
    const { completionId, status, note } = await req.json();
    const parentId = session.user.id;

    if (!completionId || !status) {
      return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
    }

    if (status !== "VERIFIED" && status !== "REJECTED") {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    // Verify this completion belongs to the parent's family
    const completion = await prisma.goalCompletion.findUnique({
      where: { id: completionId },
      include: {
        goal: {
          include: { family: { select: { id: true } } },
        },
      },
    });

    if (!completion) {
      return NextResponse.json({ error: "完成记录不存在" }, { status: 404 });
    }

    const user = session.user as any;
    if (completion.goal.family.id !== user.familyId) {
      return NextResponse.json({ error: "无权审核" }, { status: 403 });
    }

    // Update completion status
    const updated = await prisma.goalCompletion.update({
      where: { id: completionId },
      data: {
        status,
        verifiedAt: new Date(),
        verifiedBy: parentId,
      },
    });

    // If verified, award XP and coins
    if (status === "VERIFIED") {
      const goal = completion.goal;

      // Award XP
      const lastXpTx = await prisma.transaction.findFirst({
        where: { childId: completion.childId, type: "XP" },
        orderBy: { createdAt: "desc" },
      });
      const currentXp = lastXpTx?.balance ?? 0;

      await prisma.transaction.create({
        data: {
          childId: completion.childId,
          type: "XP",
          amount: goal.xpReward,
          balance: currentXp + goal.xpReward,
          reason: `完成目标: ${goal.title}`,
          referenceId: completion.id,
        },
      });

      // Award coins if applicable
      if (goal.coinReward > 0) {
        const lastCoinTx = await prisma.transaction.findFirst({
          where: { childId: completion.childId, type: "COIN" },
          orderBy: { createdAt: "desc" },
        });
        const currentCoins = lastCoinTx?.balance ?? 0;

        await prisma.transaction.create({
          data: {
            childId: completion.childId,
            type: "COIN",
            amount: goal.coinReward,
            balance: currentCoins + goal.coinReward,
            reason: `完成目标: ${goal.title}`,
            referenceId: completion.id,
          },
        });
      }

      // If it's a one-time goal, mark as completed
      if (goal.recurrence === "ONCE") {
        await prisma.goal.update({
          where: { id: goal.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Verify goal error:", error);
    return NextResponse.json({ error: "审核失败" }, { status: 500 });
  }
}
