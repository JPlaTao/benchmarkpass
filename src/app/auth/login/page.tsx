"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Mail, Lock, Eye, EyeOff, AlertCircle, User, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"parent" | "child">("parent");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const identifier = mode === "parent" ? email : code.toUpperCase();

    try {
      const result = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(mode === "parent" ? "邮箱或密码错误" : "登录码或密码错误");
        setLoading(false);
        return;
      }

      // Fetch user role to redirect correctly
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      if (role === "PARENT") {
        router.push("/parent/dashboard");
      } else if (role === "CHILD") {
        router.push("/child/dashboard");
      } else {
        router.push("/");
      }
    } catch {
      setError("登录失败，请重试");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Trophy className="w-12 h-12 text-primary mb-2" />
          <h1 className="text-2xl font-bold text-primary">BenchmarkPass</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "parent" ? "家长登录" : "孩子登录"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("parent"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "parent"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Mail className="w-4 h-4" />
              家长登录
            </div>
          </button>
          <button
            onClick={() => { setMode("child"); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === "child"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              孩子登录
            </div>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-lg border border-border space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-danger bg-danger/5 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {mode === "parent" ? (
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">登录码</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="例如：BP3X7K42"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors uppercase"
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                让家长在「添加孩子」时获取登录码
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "child" ? "默认密码 123456" : "请输入密码"}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登录中..." : mode === "parent" ? "登录" : "进入我的任务"}
          </button>

          {mode === "parent" && (
            <p className="text-center text-sm text-muted-foreground">
              还没有账号？{" "}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                注册
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
