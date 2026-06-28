"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, CheckCircle, Loader2, Target, PlusCircle, Sparkles,
  ChevronDown, ChevronUp, Clock, Zap, Star, Filter
} from "lucide-react";
import { CATEGORIES } from "@/lib/templates/template-library";
import type { GoalTemplate } from "@/lib/templates/template-library";

interface ChildInfo {
  id: string;
  name: string;
  age: number | null;
}

export default function TemplateBrowser({
  familyId,
  parentId,
  children,
}: {
  familyId: string;
  parentId: string;
  children: ChildInfo[];
}) {
  const router = useRouter();
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<{
    template: GoalTemplate;
    childId: string;
  } | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [activeCategory, difficultyFilter]);

  async function fetchTemplates() {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (difficultyFilter) params.set("difficulty", difficultyFilter);

    try {
      const res = await fetch(`/api/goals/templates?${params}`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      // silent
    }
    setLoading(false);
  }

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [templates, searchQuery]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, GoalTemplate[]>();
    const cats = activeCategory ? [activeCategory] : CATEGORIES.map((c) => c.key);
    for (const c of cats) {
      const items = filtered.filter((t) => t.category === c);
      if (items.length > 0) map.set(c, items);
    }
    return map;
  }, [filtered, activeCategory]);

  async function handleAssign(template: GoalTemplate, childId: string) {
    setAssigning(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          createdById: parentId,
          assignedToId: childId,
          title: template.title,
          description: template.description,
          xpReward: template.xpReward,
          coinReward: template.coinReward,
          recurrence: template.recurrence,
          category: template.category,
        }),
      });

      if (res.ok) {
        const childName = children.find((c) => c.id === childId)?.name || "孩子";
        setAssignSuccess(`已为「${childName}」添加目标：${template.title} 🎉`);
        setShowAssignModal(false);
        setAssignTarget(null);
      }
    } catch {
      // silent
    }
    setAssigning(false);
  }

  function openAssign(template: GoalTemplate) {
    if (children.length === 1) {
      handleAssign(template, children[0].id);
    } else {
      setAssignTarget({ template, childId: "" });
      setShowAssignModal(true);
    }
  }

  const getCategoryInfo = (key: string) =>
    CATEGORIES.find((c) => c.key === key);

  return (
    <div className="space-y-6">
      {/* Success toast */}
      {assignSuccess && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 text-success text-sm flex items-center gap-2 animate-slide-up">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {assignSuccess}
          <button
            onClick={() => setAssignSuccess(null)}
            className="ml-auto text-success/60 hover:text-success"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索目标..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="w-full sm:w-32 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">全部难度</option>
          <option value="EASY">简单</option>
          <option value="MEDIUM">中等</option>
          <option value="HARD">困难</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory(null)}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !activeCategory
              ? "bg-primary text-white shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:border-primary/30"
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() =>
              setActiveCategory(activeCategory === cat.key ? null : cat.key)
            }
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat.key
                ? "bg-primary text-white shadow-sm"
                : "bg-card text-muted-foreground border border-border hover:border-primary/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Count */}
      <p className="text-sm text-muted-foreground">
        {loading ? "加载中..." : `找到 ${filtered.length} 个目标模板`}
      </p>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : grouped.size === 0 ? (
        <div className="text-center py-20">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">没有找到匹配的模板</p>
          <p className="text-sm text-muted-foreground">试试换个关键词或分类搜索</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([categoryKey, items]) => {
            const cat = getCategoryInfo(categoryKey);
            return (
              <section key={categoryKey}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span>{cat?.label || categoryKey}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({items.length})
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {items.map((template) => {
                    const expanded = expandedId === template.id;
                    const diffLabel =
                      template.difficulty === "EASY"
                        ? "简单"
                        : template.difficulty === "MEDIUM"
                        ? "中等"
                        : "困难";
                    const reccLabel =
                      template.recurrence === "DAILY"
                        ? "每日"
                        : template.recurrence === "WEEKLY"
                        ? "每周"
                        : "一次性";

                    return (
                      <div
                        key={template.id}
                        className="bg-card rounded-xl border border-border hover:border-primary/30 transition-all"
                      >
                        <div className="p-4">
                          {/* Top: Title + Quick add */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{template.title}</h3>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  template.difficulty === "EASY"
                                    ? "bg-green-50 text-green-600"
                                    : template.difficulty === "MEDIUM"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-red-50 text-red-600"
                                }`}>
                                  {diffLabel}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {template.description}
                              </p>
                            </div>
                            <button
                              onClick={() => openAssign(template)}
                              disabled={children.length === 0}
                              className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              title={
                                children.length === 0
                                  ? "请先添加孩子"
                                  : "一键添加此目标"
                              }
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              添加
                            </button>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {template.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Bottom: Meta + Expand */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {reccLabel}
                            </span>
                            <span className="flex items-center gap-1 text-primary">
                              <Zap className="w-3 h-3" />
                              +{template.xpReward} XP
                            </span>
                            {template.coinReward > 0 && (
                              <span className="flex items-center gap-1 text-secondary">
                                <Star className="w-3 h-3" />
                                +{template.coinReward}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              {template.ageRange}岁
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Assign Modal (for multi-child families) */}
      {showAssignModal && assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl border border-border animate-slide-up">
            <h3 className="font-bold text-lg mb-2">分配给哪个孩子？</h3>
            <p className="text-sm text-muted-foreground mb-4">
              目标：{assignTarget.template.title}
            </p>
            <div className="space-y-2 mb-4">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleAssign(assignTarget.template, child.id)}
                  disabled={assigning}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted transition-all disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {child.name?.[0] || "?"}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{child.name}</div>
                    {child.age && (
                      <div className="text-xs text-muted-foreground">{child.age}岁</div>
                    )}
                  </div>
                  {assigning ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <PlusCircle className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAssignModal(false)}
              className="w-full py-2 rounded-xl text-sm font-medium text-muted-foreground border border-border hover:bg-muted transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
