"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!confirm("确定删除这个目标吗？")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      setError("删除失败，请重试");
      setLoading(false);
    }
  }

  return (
    <>
      {error && <div className="text-xs text-danger mb-2">{error}</div>}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-3 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
      >
        {loading ? "删除中..." : "删除"}
      </button>
    </>
  );
}
