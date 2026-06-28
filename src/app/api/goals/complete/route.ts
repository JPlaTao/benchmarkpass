import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "CHILD") {
    return NextResponse.json({ error: "仅孩子可提交完成" }, { status: 401 });
  }

  try {
    const { goalId, note } = await req.json();
    const childId = session.user.id;

    if (!goalId) {
      return NextResponse.json({ error: "缺少目标 ID" }, { status: 400 });
    }

    // Check if already completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.goalCompletion.findFirst({
      where: {
        goalId,
        childId,
        date: { gte: today },
        status: { in: ["PENDING_VERIFY", "VERIFIED"] },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "今天已经提交过了" }, { status: 409 });
    }

    const completion = await prisma.goalCompletion.create({
      data: {
        goalId,
        childId,
        note: note || null,
        status: "PENDING_VERIFY",
      },
    });

    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error("Complete goal error:", error);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
