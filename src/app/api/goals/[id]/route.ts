import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/goals/[id] - update a goal
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const user = session.user as any;

    // Verify goal belongs to this family
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { family: { select: { id: true } } },
    });

    if (!goal || goal.family.id !== user.familyId) {
      return NextResponse.json({ error: "目标不存在" }, { status: 404 });
    }

    // Build update data — only include provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "title", "description", "xpReward", "coinReward",
      "recurrence", "category", "assignedToId", "status",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "没有要更新的字段" }, { status: 400 });
    }

    const VALID_RECURRENCE = ["DAILY", "WEEKLY", "ONCE"];
    const VALID_STATUS = ["ACTIVE", "COMPLETED", "EXPIRED"];

    if (body.recurrence && !VALID_RECURRENCE.includes(body.recurrence)) {
      return NextResponse.json({ error: "无效的重复类型" }, { status: 400 });
    }
    if (body.status && !VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    if (body.assignedToId !== undefined && body.assignedToId !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: body.assignedToId },
        select: { familyId: true },
      });
      if (!assignee || assignee.familyId !== user.familyId) {
        return NextResponse.json({ error: "指定的孩子不存在" }, { status: 400 });
      }
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE /api/goals/[id] - delete a goal
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = session.user as any;

    // Verify goal belongs to this family
    const goal = await prisma.goal.findUnique({
      where: { id },
      include: { family: { select: { id: true } } },
    });

    if (!goal || goal.family.id !== user.familyId) {
      return NextResponse.json({ error: "目标不存在" }, { status: 404 });
    }

    await prisma.goal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete goal error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
