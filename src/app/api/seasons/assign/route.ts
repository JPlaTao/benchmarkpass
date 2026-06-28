import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/seasons/assign - assign a child to a season
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { childId, seasonId } = await req.json();

    if (!childId || !seasonId) {
      return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: childId },
      data: { seasonId },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Assign season error:", error);
    return NextResponse.json({ error: "分配失败" }, { status: 500 });
  }
}
