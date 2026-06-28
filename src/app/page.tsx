import Link from "next/link";
import { Sparkles, Shield, Trophy, Gift } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Trophy className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold text-primary">BenchmarkPass</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            登录
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium px-4 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            注册
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="animate-float mb-6">
          <Trophy className="w-16 h-16 text-secondary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          让好习惯像玩游戏一样
          <span className="text-primary">上瘾</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mb-8">
          BenchmarkPass 把孩子的日常目标变成战令挑战，
          完成任务赚 XP 升级，兑换心仪奖励。家长设定目标，系统智能建议合适的奖励。
        </p>
        <div className="flex gap-4">
          <Link
            href="/auth/register"
            className="px-8 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25"
          >
            免费开始
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 rounded-full border border-border text-foreground font-semibold hover:bg-muted transition-colors"
          >
            登录
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-card">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
            <Sparkles className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI 智能建议</h3>
            <p className="text-sm text-muted-foreground">
              告诉系统孩子的目标，AI 自动评估难度、建议合适的 XP 和奖励。再也不用想该奖励什么。
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
            <Shield className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">家长审核</h3>
            <p className="text-sm text-muted-foreground">
              孩子完成任务需要家长确认，确保真实完成。家长掌握一切控制权。
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
            <Gift className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-semibold text-lg mb-2">自定义奖励</h3>
            <p className="text-sm text-muted-foreground">
              每个孩子都不一样。男孩女孩不同年龄，奖励完全由你决定——乐高、屏幕时间、出游，什么都可以。
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>BenchmarkPass — 让孩子在挑战中成长</p>
      </footer>
    </div>
  );
}
