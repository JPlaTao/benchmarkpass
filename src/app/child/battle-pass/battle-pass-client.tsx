"use client";

import { useState } from "react";
import { Zap, CheckCircle, Lock, Star, Gift, Sparkles, Loader2 } from "lucide-react";

interface LevelData {
  id: string;
  levelNum: number;
  xpRequired: number;
  rewardTitle: string;
  rewardDesc: string | null;
  rewardType: string;
  isPremium: boolean;
  unlocked: boolean;
  claimed: boolean;
}

export default function BattlePassClient({ levels }: { levels: LevelData[] }) {
  const [claimedIds, setClaimedIds] = useState<Set<string>>(
    new Set(levels.filter((l) => l.claimed).map((l) => l.id))
  );
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleClaim(levelId: string) {
    setClaimingId(levelId);
    setError("");
    try {
      const res = await fetch("/api/seasons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelId }),
      });

      if (res.ok) {
        setClaimedIds((prev) => new Set(prev).add(levelId));
      }
    } catch {
      setError("领取失败，请重试");
    }
    setClaimingId(null);
  }

  // Free track and premium track
  const freeLevels = levels.filter((l) => !l.isPremium);
  const premiumLevels = levels.filter((l) => l.isPremium);

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-sm text-danger bg-danger/5 px-4 py-2 rounded-lg">{error}</div>
      )}
      {/* Free Track */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4" />
          免费奖励
        </h3>
        <div className="space-y-2">
          {freeLevels.map((level) => (
            <LevelRow
              key={level.id}
              level={level}
              claimed={claimedIds.has(level.id)}
              claiming={claimingId === level.id}
              onClaim={handleClaim}
            />
          ))}
        </div>
      </div>

      {/* Premium Track */}
      <div>
        <h3 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
          <Star className="w-4 h-4" />
          高级奖励（订阅解锁）
        </h3>
        <div className="space-y-2">
          {premiumLevels.map((level) => (
            <LevelRow
              key={level.id}
              level={level}
              claimed={claimedIds.has(level.id)}
              claiming={claimingId === level.id}
              onClaim={handleClaim}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelRow({
  level,
  claimed,
  claiming,
  onClaim,
}: {
  level: LevelData;
  claimed: boolean;
  claiming: boolean;
  onClaim: (id: string) => void;
}) {
  const isNext = level.unlocked && !claimed;

  return (
    <div
      className={`flex items-center gap-3 bg-card rounded-xl p-3 border transition-all ${
        claimed
          ? "border-success/30 bg-success/5"
          : level.unlocked
          ? "border-primary/30 bg-primary/5 hover:shadow-sm"
          : "border-border opacity-60"
      }`}
    >
      {/* Level Number */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
          claimed
            ? "bg-success text-white"
            : level.unlocked
            ? "bg-primary text-white"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {claimed ? <CheckCircle className="w-5 h-5" /> : level.levelNum}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {level.rewardTitle}
          {level.isPremium && (
            <Star className="w-3 h-3 text-accent inline ml-1" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {level.rewardDesc && <span className="truncate">{level.rewardDesc}</span>}
          <span className="flex items-center gap-0.5 text-primary">
            <Zap className="w-3 h-3" />
            {level.xpRequired}
          </span>
        </div>
      </div>

      {/* Action */}
      {claimed ? (
        <span className="text-xs text-success font-medium shrink-0 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          已领取
        </span>
      ) : level.unlocked ? (
        <button
          onClick={() => onClaim(level.id)}
          disabled={claiming}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1"
        >
          {claiming ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Gift className="w-3 h-3" />
          )}
          领取
        </button>
      ) : (
        <div className="text-muted-foreground shrink-0">
          <Lock className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
