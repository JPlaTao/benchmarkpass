import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, Zap, Star, CheckCircle } from "lucide-react";

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const { id } = await params;

  const child = await prisma.user.findUnique({
    where: { id },
    include: {
      assignedGoals: {
        where: { status: "ACTIVE" },
        include: { completions: true },
      },
      family: true,
    },
  });

  // Fetch balances separately
  const [xpTx, coinTx] = await Promise.all([
    prisma.transaction.findFirst({
      where: { childId: id, type: "XP" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findFirst({
      where: { childId: id, type: "COIN" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const xpBalance = xpTx?.balance ?? 0;
  const coinBalance = coinTx?.balance ?? 0;

  if (!child || child.familyId !== (session.user as any).familyId) {
    redirect("/parent/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/parent/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold">{child.name}</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-primary">{xpBalance}</div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Star className="w-5 h-5 text-secondary mx-auto mb-1" />
            <div className="text-xl font-bold text-secondary">{coinBalance}</div>
            <div className="text-xs text-muted-foreground">BP 币</div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center">
            <Target className="w-5 h-5 text-accent mx-auto mb-1" />
            <div className="text-xl font-bold text-accent">{child.assignedGoals.length}</div>
            <div className="text-xs text-muted-foreground">进行中</div>
          </div>
        </div>

        {/* TODO: Placeholder for full child detail */}
        <p className="text-center text-muted-foreground py-8">详细数据看板即将上线</p>
      </div>
    </div>
  );
}
