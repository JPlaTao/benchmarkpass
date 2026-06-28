"use client";

import { useState } from "react";
import { PlusCircle, Loader2, Users, Layers, Trophy, X } from "lucide-react";

interface SeasonData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count: { members: number; levels: number };
}

export default function SeasonManager({
  familyId,
  initialSeasons,
}: {
  familyId: string;
  initialSeasons: SeasonData[];
}) {
  const [seasons, setSeasons] = useState(initialSeasons);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState("4");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(weeks) * 7);

    try {
      const res = await fetch("/api/seasons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSeasons((prev) => [
          {
            id: data.id,
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.isActive,
            _count: { members: 0, levels: data.levels.length },
          },
          ...prev,
        ]);
        setShowForm(false);
        setName("");
        setWeeks("4");
      }
    } catch {
      // silent
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">赛季列表</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showForm ? "取消" : "新建赛季"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl p-4 border border-border space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">赛季名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：暑假挑战赛"
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">持续周数</label>
            <select
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="2">2 周</option>
              <option value="4">4 周（推荐）</option>
              <option value="6">6 周</option>
              <option value="8">8 周</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            创建赛季（自动生成 30 级战令）
          </button>
        </form>
      )}

      {/* Season List */}
      {seasons.length > 0 ? (
        <div className="space-y-3">
          {seasons.map((season) => (
            <div
              key={season.id}
              className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {season.isActive && (
                      <span className="w-2 h-2 rounded-full bg-success" />
                    )}
                    {season.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(season.startDate).toLocaleDateString("zh-CN")} -{" "}
                    {new Date(season.endDate).toLocaleDateString("zh-CN")}
                  </div>
                </div>
                {season.isActive && (
                  <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                    进行中
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {season._count.levels} 级
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {season._count.members} 个孩子
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">还没有创建赛季</p>
          <p className="text-xs text-muted-foreground mt-1">创建赛季后，孩子们就能开始战令挑战了</p>
        </div>
      )}
    </div>
  );
}
