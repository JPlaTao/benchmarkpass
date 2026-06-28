"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteGoalButton({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("确定删除这个目标吗？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs px-3 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
    >
      {loading ? "删除中..." : "删除"}
    </button>
  );
}
