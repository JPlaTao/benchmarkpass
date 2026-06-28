import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, SUBSCRIPTION_PLANS } from "@/lib/stripe/server";
import type { PlanKey } from "@/lib/stripe/server";

// POST /api/stripe/checkout - create Stripe Checkout session
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PARENT") {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { plan } = await req.json();
    const user = session.user as any;

    if (!plan || !SUBSCRIPTION_PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: "无效的订阅计划" }, { status: 400 });
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as PlanKey];

    // Get or create Stripe customer
    const family = await prisma.family.findUnique({
      where: { id: user.familyId },
    });

    let customerId = family?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: { familyId: user.familyId },
      });
      customerId = customer.id;

      await prisma.family.update({
        where: { id: user.familyId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/parent/subscription?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/parent/subscription?canceled=true`,
      metadata: { familyId: user.familyId, plan },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
