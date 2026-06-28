"use client";

import { useRouter } from "next/navigation";

interface ChildItem {
  id: string;
  name: string | null;
}

export default function GoalFilters({
  status,
  childId,
  children,
}: {
  status: string;
  childId: string;
  children: ChildItem[];
}) {
  const router = useRouter();

  function updateFilter(key: string, value: string) {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    router.push(url.toString());
  }

  return (
    <div className="flex gap-3 mb-4">
      <select
        defaultValue={status}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
      >
        <option value="">全部状态</option>
        <option value="ACTIVE">进行中</option>
        <option value="COMPLETED">已完成</option>
        <option value="EXPIRED">已过期</option>
      </select>
      <select
        defaultValue={childId}
        onChange={(e) => updateFilter("childId", e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
      >
        <option value="">全部孩子</option>
        {children.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
