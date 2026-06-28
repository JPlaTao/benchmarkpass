import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/rewards/pending - get pending redemptions for parent
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const familyId = (session.user as any).familyId;
  if (!familyId) return NextResponse.json([]);

  const pending = await prisma.redemption.findMany({
    where: {
      reward: { familyId },
      status: "PENDING_VERIFY",
    },
    include: {
      child: { select: { name: true } },
      reward: { select: { title: true, coinCost: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pending);
}
