import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/seasons/claim - claim a level reward (child)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "CHILD") {
    return NextResponse.json({ error: "仅孩子可领取奖励" }, { status: 401 });
  }

  try {
    const { levelId } = await req.json();
    const childId = session.user.id;

    if (!levelId) {
      return NextResponse.json({ error: "缺少等级 ID" }, { status: 400 });
    }

    // Check level exists
    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: { season: { select: { id: true } } },
    });

    if (!level) {
      return NextResponse.json({ error: "等级不存在" }, { status: 404 });
    }

    // Check child is assigned to this season
    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { seasonId: true },
    });

    if (!child || child.seasonId !== level.seasonId) {
      return NextResponse.json({ error: "未分配到此赛季" }, { status: 403 });
    }

    // Check child has enough XP
    const lastXpTx = await prisma.transaction.findFirst({
      where: { childId, type: "XP" },
      orderBy: { createdAt: "desc" },
    });
    const currentXp = lastXpTx?.balance ?? 0;

    if (currentXp < level.xpRequired) {
      return NextResponse.json({ error: "经验值不足" }, { status: 403 });
    }

    // Check reward not already claimed
    const existingClaim = await prisma.levelClaim.findUnique({
      where: { childId_levelId: { childId, levelId } },
    });

    if (existingClaim) {
      return NextResponse.json({ error: "已经领取过了" }, { status: 409 });
    }

    // Create claim record
    await prisma.levelClaim.create({
      data: { childId, levelId },
    });

    return NextResponse.json({ success: true, levelNum: level.levelNum });
  } catch (error) {
    console.error("Claim reward error:", error);
    return NextResponse.json({ error: "领取失败" }, { status: 500 });
  }
}
