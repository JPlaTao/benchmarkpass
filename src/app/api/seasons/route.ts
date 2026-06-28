import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/seasons - list seasons for a family
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const familyId = (session.user as any).familyId;
  if (!familyId) return NextResponse.json([]);

  const seasons = await prisma.season.findMany({
    where: { familyId },
    include: {
      levels: { orderBy: { levelNum: "asc" } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(seasons);
}

// POST /api/seasons - create a new season with default levels
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { familyId, name, startDate, endDate } = await req.json();

    if (!familyId || !name || !startDate || !endDate) {
      return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
    }

    // Create season with 30 default levels
    const season = await prisma.$transaction(async (tx) => {
      const s = await tx.season.create({
        data: {
          familyId,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: true,
        },
      });

      // Create 30 default levels
      const levels = [];
      for (let i = 1; i <= 30; i++) {
        levels.push({
          seasonId: s.id,
          levelNum: i,
          xpRequired: i * 100, // Level 1 = 100 XP, Level 30 = 3000 XP
          rewardTitle: null, // Parent customizes later
          rewardDesc: null,
          isPremium: i > 20, // Levels 21-30 are premium
        });
      }
      await tx.level.createMany({ data: levels });

      return tx.season.findUnique({
        where: { id: s.id },
        include: { levels: { orderBy: { levelNum: "asc" } } },
      });
    });

    return NextResponse.json(season, { status: 201 });
  } catch (error) {
    console.error("Create season error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
