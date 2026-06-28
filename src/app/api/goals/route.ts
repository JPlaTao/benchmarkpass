import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      familyId,
      createdById,
      assignedToId,
      title,
      description,
      xpReward,
      coinReward,
      recurrence,
      category,
    } = body;

    if (!familyId || !title || xpReward === undefined) {
      return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        familyId,
        createdById,
        assignedToId: assignedToId || null,
        title,
        description: description || null,
        xpReward,
        coinReward: coinReward || 0,
        recurrence: recurrence || "ONCE",
        category: category || null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
