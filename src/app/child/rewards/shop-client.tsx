"use client";

import { useState } from "react";
import { Gift, Star, Loader2, CheckCircle, ShoppingBag, Sparkles, AlertCircle } from "lucide-react";

interface RewardItem {
  id: string;
  title: string;
  description: string | null;
  coinCost: number;
  imageUrl: string | null;
}

export default function ShopClient({
  rewards,
  currentCoins,
  pendingSet,
}: {
  rewards: RewardItem[];
  currentCoins: number;
  pendingSet: string[];
}) {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set(pendingSet));
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRedeem(rewardId: string) {
    setError("");
    setSuccess("");
    setRedeemingId(rewardId);

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });

      const data = await res.json();
      if (res.ok) {
        setPendingIds((prev) => new Set(prev).add(rewardId));
        setSuccess("兑换成功！等着家长兑现吧 🎉");
      } else {
        setError(data.error || "兑换失败");
      }
    } catch {
      setError("兑换失败，请重试");
    }
    setRedeemingId(null);
  }

  return (
    <div>
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-secondary to-secondary-light rounded-2xl p-5 mb-6 text-white text-center">
        <div className="text-3xl font-bold">{currentCoins}</div>
        <div className="text-sm opacity-80 mt-1">BP 币</div>
        <div className="text-xs opacity-60 mt-2">完成任务可获得 BP 币</div>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-3 mb-4 text-sm text-success flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 mb-4 text-sm text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Rewards */}
      {rewards.length > 0 ? (
        <div className="space-y-3">
          {rewards.map((reward) => {
            const pending = pendingIds.has(reward.id);
            const canAfford = currentCoins >= reward.coinCost;

            return (
              <div
                key={reward.id}
                className={`bg-card rounded-xl p-4 border transition-all ${
                  pending
                    ? "border-success/30 bg-success/5"
                    : "border-border hover:border-secondary/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{reward.title}</div>
                    {reward.description && (
                      <div className="text-sm text-muted-foreground">{reward.description}</div>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <ShoppingBag className="w-3 h-3" />
                      需要
                      <span className="font-medium text-secondary">{reward.coinCost} BP 币</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                    <div className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full">
                      <Star className="w-3 h-3 text-secondary" />
                      <span className="text-sm font-bold text-secondary">{reward.coinCost}</span>
                    </div>

                    {pending ? (
                      <span className="text-xs text-success font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        已申请
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={!canAfford || redeemingId === reward.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1 ${
                          canAfford
                            ? "bg-secondary text-white hover:bg-secondary/90"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                      >
                        {redeemingId === reward.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Gift className="w-3 h-3" />
                        )}
                        {canAfford ? "兑换" : "不足"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">还没有奖励可以兑换</p>
          <p className="text-xs text-muted-foreground mt-1">让爸爸妈妈先添加一些奖励吧！</p>
        </div>
      )}
    </div>
  );
}
