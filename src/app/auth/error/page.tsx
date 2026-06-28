import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">认证失败</h1>
        <p className="text-muted-foreground mb-6">登录过程中出现问题，请重试。</p>
        <Link
          href="/auth/login"
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          返回登录
        </Link>
      </div>
    </div>
  );
}
