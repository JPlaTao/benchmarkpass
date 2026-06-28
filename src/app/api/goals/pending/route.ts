import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const familyId = (session.user as any).familyId;
  if (!familyId) return NextResponse.json([]);

  const pending = await prisma.goalCompletion.findMany({
    where: {
      goal: { familyId },
      status: "PENDING_VERIFY",
    },
    include: {
      goal: {
        select: { title: true, xpReward: true, coinReward: true },
      },
      child: {
        select: { id: true, name: true, age: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(pending);
}
