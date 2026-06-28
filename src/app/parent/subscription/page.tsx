import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Trophy, Sparkles, Star } from "lucide-react";
import SubscriptionPlans from "./subscription-plans";

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const user = session.user as any;

  const family = await prisma.family.findUnique({
    where: { id: user.familyId },
  });

  const rawTrialEnd = null; // Could add trialEndDate to schema later

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/parent/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h1 className="font-bold">订阅管理</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {family && (
          <SubscriptionPlans
            currentStatus={family.subscriptionStatus}
            currentPlan={family.subscriptionPlan}
            stripeCustomerId={family.stripeCustomerId}
          />
        )}
      </div>
    </div>
  );
}
