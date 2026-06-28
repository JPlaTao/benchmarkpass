"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Clock, Star, Zap } from "lucide-react";

interface PendingItem {
  id: string;
  createdAt: string;
  goal: { title: string; xpReward: number; coinReward: number };
  child: { id: string; name: string; age: number | null };
}

export default function ReviewList() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/goals/pending")
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError("加载失败，请刷新重试");
        setLoading(false);
      });
  }, []);

  async function handleVerify(completionId: string, status: "VERIFIED" | "REJECTED") {
    setActionLoading(completionId);
    try {
      const res = await fetch("/api/goals/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionId, status }),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== completionId));
      }
    } catch {
      setError("操作失败，请重试");
    }
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">没有待审核的任务</p>
        <p className="text-xs text-muted-foreground mt-1">孩子完成的任务会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-danger bg-danger/5 px-3 py-2 rounded-lg">{error}</div>
      )}
      <p className="text-sm text-muted-foreground mb-2">
        共 {items.length} 项待审核
      </p>
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {item.child.name?.[0] || "?"}
                </div>
                <div>
                  <div className="font-medium text-sm">{item.child.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
              <p className="font-medium mt-2">{item.goal.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3 text-xs">
            <span className="flex items-center gap-1 bg-primary/5 text-primary px-2 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              +{item.goal.xpReward} XP
            </span>
            {item.goal.coinReward > 0 && (
              <span className="flex items-center gap-1 bg-secondary/5 text-secondary px-2 py-1 rounded-full">
                <Star className="w-3 h-3" />
                +{item.goal.coinReward}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleVerify(item.id, "VERIFIED")}
              disabled={actionLoading === item.id}
              className="flex-1 py-2 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {actionLoading === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              确认完成
            </button>
            <button
              onClick={() => handleVerify(item.id, "REJECTED")}
              disabled={actionLoading === item.id}
              className="flex-1 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              未完成
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
