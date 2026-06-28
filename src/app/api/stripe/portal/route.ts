import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/server";

// POST /api/stripe/portal - create Stripe Customer Portal session
export async function POST() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const user = session.user as any;
    const family = await prisma.family.findUnique({
      where: { id: user.familyId },
    });

    if (!family?.stripeCustomerId) {
      return NextResponse.json({ error: "无活跃订阅" }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: family.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/parent/subscription`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
