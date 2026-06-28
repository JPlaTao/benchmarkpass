"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Zap, Star, Sparkles } from "lucide-react";

interface TaskCardProps {
  goalId: string;
  title: string;
  description: string | null;
  xpReward: number;
  coinReward: number;
  completedToday: boolean;
  onComplete: () => void;
}

export default function TaskCard({
  goalId,
  title,
  description,
  xpReward,
  coinReward,
  completedToday,
  onComplete,
}: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(completedToday);
  const [error, setError] = useState("");

  async function handleComplete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/goals/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });

      if (res.ok) {
        setSubmitted(true);
        onComplete();
      } else {
        const data = await res.json();
        if (data.error === "今天已经提交过了") {
          setSubmitted(true);
        }
      }
    } catch {
      setError("提交失败，请重试");
    }
    setLoading(false);
  }

  return (
    <div
      className={`bg-card rounded-xl p-4 border transition-all ${
        submitted
          ? "border-success/30 bg-success/5"
          : "border-border hover:border-primary/30 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleComplete}
              disabled={loading || submitted}
              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                submitted
                  ? "bg-success border-success"
                  : "border-muted-foreground hover:border-primary hover:bg-primary/10"
              } ${loading ? "animate-pulse" : ""}`}
            >
              {loading ? (
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
              ) : submitted ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : null}
            </button>
            <span
              className={`font-medium truncate ${
                submitted ? "line-through text-muted-foreground" : ""
              }`}
            >
              {title}
            </span>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 ml-8">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
            <Zap className="w-3 h-3" />
            +{xpReward}
          </span>
          {coinReward > 0 && (
            <span className="inline-flex items-center gap-0.5 bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-medium">
              <Star className="w-3 h-3" />
              +{coinReward}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs text-danger bg-danger/5 px-3 py-2 rounded-lg mb-2">{error}</div>
      )}
      {submitted && (
        <div className="mt-2 ml-8 flex items-center gap-1.5 text-xs text-success">
          <Sparkles className="w-3 h-3" />
          已提交，等待家长审核
        </div>
      )}
    </div>
  );
}
