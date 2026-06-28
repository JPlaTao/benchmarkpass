import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly",
    name: "月度订阅",
    description: "¥29/月",
    amount: 2900, // cents
    interval: "month" as const,
  },
  QUARTERLY: {
    priceId: process.env.STRIPE_QUARTERLY_PRICE_ID || "price_quarterly",
    name: "季度订阅",
    description: "¥69/季（省 21%）",
    amount: 6900,
    interval: "quarter" as const,
  },
  YEARLY: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || "price_yearly",
    name: "年度订阅",
    description: "¥199/年（省 43%）",
    amount: 19900,
    interval: "year" as const,
  },
} as const;

export type PlanKey = keyof typeof SUBSCRIPTION_PLANS;
