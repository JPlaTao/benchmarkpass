import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/seasons/levels - update a level's reward info
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { levelId, rewardTitle, rewardDesc, rewardType } = await req.json();

    if (!levelId) {
      return NextResponse.json({ error: "缺少等级 ID" }, { status: 400 });
    }

    const level = await prisma.level.update({
      where: { id: levelId },
      data: {
        ...(rewardTitle !== undefined && { rewardTitle }),
        ...(rewardDesc !== undefined && { rewardDesc }),
        ...(rewardType !== undefined && { rewardType }),
      },
    });

    return NextResponse.json(level);
  } catch (error) {
    console.error("Update level error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
