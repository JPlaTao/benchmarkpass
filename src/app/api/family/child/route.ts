import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { familyId, name, age } = await req.json();

    if (!familyId || !name) {
      return NextResponse.json({ error: "缺少必要信息" }, { status: 400 });
    }

    // Generate a friendly login code
    const code = `BP${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;
    const defaultPassword = "123456";
    const hashedPassword = await hash(defaultPassword, 12);

    const child = await prisma.user.create({
      data: {
        name,
        age: age || null,
        loginCode: code,
        password: hashedPassword,
        role: "CHILD",
        familyId,
      },
    });

    return NextResponse.json(
      { id: child.id, name: child.name, code },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add child error:", error);
    return NextResponse.json({ error: "添加失败" }, { status: 500 });
  }
}
