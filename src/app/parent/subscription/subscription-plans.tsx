"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Trophy, Star, Sparkles, ArrowRight, ExternalLink } from "lucide-react";

const PLANS = [
  {
    key: "MONTHLY",
    name: "月度",
    price: "¥29",
    period: "/月",
    description: "适合先体验一下",
    features: [
      "所有基础功能",
      "AI 奖励建议",
      "最多 2 个孩子",
    ],
    popular: false,
  },
  {
    key: "QUARTERLY",
    name: "季度",
    price: "¥69",
    period: "/季",
    description: "省 21%，最受欢迎",
    features: [
      "所有基础功能",
      "AI 奖励建议",
      "最多 4 个孩子",
      "详细进度报告",
    ],
    popular: true,
  },
  {
    key: "YEARLY",
    name: "年度",
    price: "¥199",
    period: "/年",
    description: "省 43%，最超值",
    features: [
      "所有高级功能",
      "AI 奖励建议",
      "不限孩子数量",
      "详细进度报告",
      "优先客服",
    ],
    popular: false,
  },
];

export default function SubscriptionPlans({
  currentStatus,
  currentPlan,
  stripeCustomerId,
}: {
  currentStatus: string;
  currentPlan: string | null;
  stripeCustomerId: string | null;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  const isSubscribed = currentStatus === "ACTIVE" || currentStatus === "TRIAL";

  async function handleSubscribe(planKey: string) {
    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("订阅失败，请重试");
    }
    setLoading(null);
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("操作失败，请重试");
    }
    setPortalLoading(false);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="text-sm text-danger bg-danger/5 px-4 py-2 rounded-lg">{error}</div>
      )}
      {/* Current Status */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">当前状态</h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSubscribed
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {currentStatus === "ACTIVE"
              ? "已订阅"
              : currentStatus === "TRIAL"
              ? "试用中"
              : currentStatus === "CANCELED"
              ? "已取消"
              : "未订阅"}
          </span>
        </div>

        {isSubscribed ? (
          <div>
            <p className="text-muted-foreground text-sm mb-4">
              {currentPlan
                ? `当前方案：${PLANS.find((p) => p.key === currentPlan)?.name || currentPlan}`
                : "享受全部高级功能"}
            </p>
            {stripeCustomerId && (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                管理订阅
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-primary" />
            <span>当前使用免费版本。订阅后解锁高级战令奖励和高级功能。</span>
          </div>
        )}
      </div>

      {/* What you get */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">订阅权益</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {[
            "创建和管理目标",
            "AI 智能奖励建议",
            "战令赛季系统",
            "孩子进度看板",
            "高级战令奖励轨",
            "多孩子支持",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Star className="w-4 h-4 text-secondary shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={`relative bg-card rounded-2xl p-6 border transition-all ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/30"
              } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  最受欢迎
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-primary">{plan.price}</div>
                <div className="text-sm text-muted-foreground">{plan.period}</div>
                <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <div className="w-full py-2.5 rounded-xl bg-primary/5 text-primary text-sm font-medium text-center border border-primary/20">
                  当前方案
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={loading === plan.key}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {loading === plan.key ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  订阅
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Mock mode notice */}
      <div className="text-center text-xs text-muted-foreground bg-muted/50 rounded-xl p-4">
        需要配置 Stripe API 密钥才能启用真实支付。配置方式：在 .env 中填入
        STRIPE_SECRET_KEY、NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 和 STRIPE_WEBHOOK_SECRET。
      </div>
    </div>
  );
}
