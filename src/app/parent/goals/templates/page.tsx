import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import TemplateBrowser from "./template-browser";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const user = session.user as any;

  const children = (await prisma.user.findMany({
    where: { familyId: user.familyId, role: "CHILD" },
    select: { id: true, name: true, age: true },
  })).map(c => ({ id: c.id, name: c.name || "孩子", age: c.age }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/parent/goals" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            <h1 className="font-bold">目标模板库</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <TemplateBrowser
          familyId={user.familyId}
          parentId={user.id}
          children={children}
        />
      </div>
    </div>
  );
}
