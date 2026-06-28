"use client";

import { useState } from "react";
import { PlusCircle, Loader2, Gift, Star, CheckCircle, X, Clock, Zap } from "lucide-react";

interface RewardData {
  id: string;
  title: string;
  description: string | null;
  coinCost: number;
  imageUrl: string | null;
  isActive: boolean;
}

interface PendingRedemption {
  id: string;
  childName: string | null;
  rewardTitle: string;
  coinCost: number;
  createdAt: string;
}

export default function RewardManager({
  familyId,
  initialRewards,
  initialPendingRedemptions,
}: {
  familyId: string;
  initialRewards: RewardData[];
  initialPendingRedemptions: PendingRedemption[];
}) {
  const [rewards, setRewards] = useState(initialRewards);
  const [redemptions, setRedemptions] = useState(initialPendingRedemptions);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coinCost, setCoinCost] = useState(10);
  const [loading, setLoading] = useState(false);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId, title, description, coinCost }),
      });

      if (res.ok) {
        const data = await res.json();
        setRewards((prev) => [data, ...prev]);
        setShowForm(false);
        setTitle("");
        setDescription("");
        setCoinCost(10);
      }
    } catch {
      setError("创建失败，请重试");
    }
    setLoading(false);
  }

  async function handleFulfill(redemptionId: string) {
    setFulfillingId(redemptionId);
    try {
      const res = await fetch("/api/rewards/fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId }),
      });

      if (res.ok) {
        setRedemptions((prev) => prev.filter((r) => r.id !== redemptionId));
      }
    } catch {
      setError("操作失败，请重试");
    }
    setFulfillingId(null);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="text-sm text-danger bg-danger/5 px-4 py-2 rounded-lg">{error}</div>
      )}
      {/* Pending Redemptions */}
      {redemptions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            待兑现奖励
          </h2>
          <div className="space-y-3">
            {redemptions.map((r) => (
              <div
                key={r.id}
                className="bg-warning/5 border border-warning/20 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium">{r.childName || "孩子"} 想要兑换</div>
                    <div className="text-sm text-muted-foreground">{r.rewardTitle}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(r.createdAt).toLocaleString("zh-CN")}
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-secondary">
                    <Star className="w-3 h-3" />
                    {r.coinCost}
                  </span>
                </div>
                <button
                  onClick={() => handleFulfill(r.id)}
                  disabled={fulfillingId === r.id}
                  className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {fulfillingId === r.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  确认已兑现
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rewards List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">奖励列表</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {showForm ? "取消" : "添加奖励"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-card rounded-xl p-4 border border-border space-y-3 mb-4">
            <div>
              <label className="text-sm font-medium block mb-1">奖励名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：去游乐园"
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">描述（可选）</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="奖励的具体说明"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">需要 BP 币</label>
              <input
                type="number"
                value={coinCost}
                onChange={(e) => setCoinCost(parseInt(e.target.value) || 0)}
                min={1}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
              添加奖励
            </button>
          </form>
        )}

        {rewards.length > 0 ? (
          <div className="space-y-2">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-card rounded-xl p-4 border border-border flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{reward.title}</div>
                  {reward.description && (
                    <div className="text-sm text-muted-foreground">{reward.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full">
                  <Star className="w-3 h-3 text-secondary" />
                  <span className="text-sm font-bold text-secondary">{reward.coinCost}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">还没有添加奖励</p>
            <p className="text-xs text-muted-foreground mt-1">添加奖励后，孩子可以用 BP 币兑换</p>
          </div>
        )}
      </section>
    </div>
  );
}
