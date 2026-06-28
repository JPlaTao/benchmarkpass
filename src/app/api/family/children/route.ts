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

  const children = await prisma.user.findMany({
    where: { familyId, role: "CHILD" },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(children);
}
