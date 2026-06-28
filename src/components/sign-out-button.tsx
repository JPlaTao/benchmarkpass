"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className={`text-muted-foreground hover:text-foreground transition-colors ${className || ""}`}
      title="退出登录"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
