import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { prisma } from "@/lib/prisma";

// POST /api/stripe/webhook - handle Stripe webhook events
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const checkout = event.data.object;
        const familyId = checkout.metadata?.familyId;
        const plan = checkout.metadata?.plan;

        if (familyId && plan && checkout.subscription) {
          await prisma.family.update({
            where: { id: familyId },
            data: {
              subscriptionStatus: "ACTIVE",
              subscriptionPlan: plan as any,
              stripeSubscriptionId: checkout.subscription as string,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const status =
          subscription.status === "active" || subscription.status === "trialing"
            ? "ACTIVE"
            : subscription.status === "canceled"
            ? "CANCELED"
            : "EXPIRED";

        await prisma.family.update({
          where: { stripeCustomerId: customerId },
          data: {
            subscriptionStatus: status,
            stripeSubscriptionId: subscription.id,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
