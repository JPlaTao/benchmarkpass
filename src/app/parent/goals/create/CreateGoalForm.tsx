"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Star, Target } from "lucide-react";
import { CATEGORIES } from "@/lib/templates/template-library";

export default function CreateGoalForm({
  familyId,
  parentId,
}: {
  familyId: string;
  parentId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [coinReward, setCoinReward] = useState(0);
  const [recurrence, setRecurrence] = useState<"DAILY" | "WEEKLY" | "ONCE">("ONCE");
  const [category, setCategory] = useState("");
  const [childId, setChildId] = useState("");
  const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/family/children")
      .then((r) => r.json())
      .then((data) => setChildren(data))
      .catch(() => {});
  }, []);

  async function handleAiSuggest() {
    if (!title.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await fetch("/api/goals/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiSuggestion(data.suggestion);
        if (data.xpReward) setXpReward(data.xpReward);
        if (data.coinReward) setCoinReward(data.coinReward);
      }
    } catch {
      // AI suggestion failed silently
    }
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          createdById: parentId,
          assignedToId: childId || null,
          title,
          description,
          xpReward,
          coinReward,
          recurrence,
          category: category || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "创建失败");
        setLoading(false);
        return;
      }

      router.push("/parent/goals");
    } catch {
      setError("创建失败，请重试");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-danger bg-danger/5 p-3 rounded-lg">{error}</div>
      )}

      {/* Title + AI Suggestion */}
      <div>
        <label className="text-sm font-medium block mb-1.5">目标标题</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：每天阅读 20 分钟"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={aiLoading || !title.trim()}
            className="px-3 py-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors disabled:opacity-50"
            title="AI 建议奖励"
          >
            <Sparkles className={`w-5 h-5 ${aiLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-accent text-sm font-medium mb-1">
            <Sparkles className="w-4 h-4" />
            AI 建议
          </div>
          <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="text-sm font-medium block mb-1.5">描述（可选）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="目标的具体说明..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium block mb-1.5">分类</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">选择分类（可选）</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Assign to child */}
      <div>
        <label className="text-sm font-medium block mb-1.5">分配给</label>
        <select
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">选择孩子（可选）</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Rewards */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1.5">XP 奖励</label>
          <input
            type="number"
            value={xpReward}
            onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
            min={0}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">BP 币奖励</label>
          <input
            type="number"
            value={coinReward}
            onChange={(e) => setCoinReward(parseInt(e.target.value) || 0)}
            min={0}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <label className="text-sm font-medium block mb-1.5">重复</label>
        <div className="flex gap-2">
          {(["ONCE", "DAILY", "WEEKLY"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRecurrence(r)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                recurrence === r
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {r === "ONCE" ? "一次性" : r === "DAILY" ? "每日" : "每周"}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 创建中...</> : <><Target className="w-4 h-4" /> 创建目标</>}
      </button>
    </form>
  );
}
