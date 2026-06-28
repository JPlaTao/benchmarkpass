import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/rewards/fulfill - parent marks a redemption as fulfilled
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { redemptionId } = await req.json();

    if (!redemptionId) {
      return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
    }

    const redemption = await prisma.redemption.update({
      where: { id: redemptionId },
      data: { status: "VERIFIED", fulfilledAt: new Date() },
    });

    return NextResponse.json(redemption);
  } catch (error) {
    console.error("Fulfill redemption error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
