import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import CreateGoalForm from "./CreateGoalForm";

export default async function CreateGoalPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/parent/goals" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold">创建目标</h1>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary bg-primary/5 px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          AI 辅助
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        <CreateGoalForm familyId={user.familyId} parentId={user.id} />
      </div>
    </div>
  );
}
