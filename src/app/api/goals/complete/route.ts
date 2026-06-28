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

    // Check if goal exists and get its recurrence
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      select: { recurrence: true },
    });

    if (!goal) {
      return NextResponse.json({ error: "目标不存在" }, { status: 404 });
    }

    // Compute the start of the duplicate-check window based on recurrence
    function getDedupStartDate(recurrence: string): Date {
      const now = new Date();
      if (recurrence === "WEEKLY") {
        // Monday 00:00 of the current week
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1; // Sunday → go back 6, else go back (day-1)
        const monday = new Date(now);
        monday.setDate(now.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
      }
      // DAILY and ONCE both use today's start
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return today;
    }

    const dedupStart = getDedupStartDate(goal.recurrence);
    const existing = await prisma.goalCompletion.findFirst({
      where: {
        goalId,
        childId,
        date: { gte: dedupStart },
        status: { in: ["PENDING_VERIFY", "VERIFIED"] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: goal.recurrence === "WEEKLY" ? "本周已经提交过了" : "今天已经提交过了" },
        { status: 409 }
      );
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
