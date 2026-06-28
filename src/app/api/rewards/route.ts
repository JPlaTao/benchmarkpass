import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/rewards - list rewards for parent's family
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const user = session.user as any;
  const familyId = user.familyId;
  if (!familyId) return NextResponse.json([]);

  const rewards = await prisma.reward.findMany({
    where: { familyId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rewards);
}

// POST /api/rewards - create a new reward (parent)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { familyId, title, description, coinCost } = await req.json();

    if (!familyId || !title || !coinCost) {
      return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
    }

    const reward = await prisma.reward.create({
      data: { familyId, title, description: description || null, coinCost },
    });

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error("Create reward error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
