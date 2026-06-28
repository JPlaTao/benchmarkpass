import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import SeasonManager from "./season-manager";

export default async function SeasonPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "PARENT") redirect("/child/dashboard");

  const familyId = (session.user as any).familyId;

  const seasons = await prisma.season.findMany({
    where: { familyId },
    include: {
      _count: { select: { members: true, levels: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const serializedSeasons = seasons.map((s) => ({
    id: s.id,
    name: s.name,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate.toISOString(),
    isActive: s.isActive,
    _count: { members: s._count.members, levels: s._count.levels },
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/parent/dashboard" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h1 className="font-bold">战令设置</h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <SeasonManager familyId={familyId!} initialSeasons={serializedSeasons} />
      </div>
    </div>
  );
}
