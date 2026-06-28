"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, CheckCircle } from "lucide-react";

export default function AddChildForm({ familyId }: { familyId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [childCode, setChildCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/family/child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          name,
          age: age ? parseInt(age) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "添加失败");
        setLoading(false);
        return;
      }

      setChildCode(data.code || "");
      setSuccess(true);
      setLoading(false);
    } catch {
      setError("添加失败，请重试");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center bg-card rounded-2xl p-8 border border-border">
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">添加成功！🎉</h2>
        <p className="text-muted-foreground mb-2">孩子的登录信息如下：</p>
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="mb-3">
            <div className="text-xs text-muted-foreground mb-1">登录码</div>
            <div className="text-2xl font-mono font-bold tracking-wider text-primary">{childCode}</div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">默认密码：</span>
            <span className="font-mono font-semibold">123456</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-2">让孩子用登录码在「孩子登录」页进入</p>
        <p className="text-xs text-muted-foreground mb-4">建议首次登录后修改密码</p>
        <button
          onClick={() => router.push("/parent/dashboard")}
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          返回看板
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border space-y-4">
      {error && (
        <div className="text-sm text-danger bg-danger/5 p-3 rounded-lg">{error}</div>
      )}

      <div>
        <label className="text-sm font-medium block mb-1.5">孩子称呼</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="小明的昵称"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">年龄</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="可选"
          min={3}
          max={18}
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> 添加中...</> : <><UserPlus className="w-4 h-4" /> 添加孩子</>}
      </button>
    </form>
  );
}
