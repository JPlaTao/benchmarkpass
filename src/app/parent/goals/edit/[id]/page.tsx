import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import CreateGoalForm from "../../create/CreateGoalForm";

export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const user = session.user as any;
  const { id } = await params;

  const goal = await prisma.goal.findUnique({
    where: { id },
  });

  if (!goal || goal.familyId !== user.familyId) {
    redirect("/parent/goals");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/parent/goals" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Pencil className="w-5 h-5 text-primary" />
          <h1 className="font-bold">编辑目标</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <CreateGoalForm
          familyId={user.familyId}
          parentId={user.id}
          initialGoal={{
            id: goal.id,
            title: goal.title,
            description: goal.description,
            xpReward: goal.xpReward,
            coinReward: goal.coinReward,
            recurrence: goal.recurrence,
            category: goal.category,
            assignedToId: goal.assignedToId,
          }}
        />
      </div>
    </div>
  );
}
