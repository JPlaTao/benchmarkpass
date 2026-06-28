import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddChildForm from "./AddChildForm";

export default async function AddChildPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/parent/dashboard" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold">添加孩子</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground mb-8">
          添加孩子账号后，他/她就能登录查看任务和赚取奖励了
        </p>
        <AddChildForm familyId={(session.user as any).familyId!} />
      </div>
    </div>
  );
}
