# BenchmarkPass 🏆

让孩子在游戏化的挑战中养成好习惯。

家长设定目标 → 孩子完成任务赚 XP 升级 → 家长审核通过 → 孩子兑换奖励。

## 技术栈

- **框架:** Next.js 16 (App Router)
- **语言:** TypeScript
- **样式:** Tailwind CSS v4
- **数据库:** MySQL / MariaDB (Prisma 7)
- **认证:** NextAuth v5 (Credentials JWT)
- **支付:** Stripe（可选）
- **AI:** 通义千问 DashScope（可选）

## 前置依赖

- Node.js 20+
- pnpm
- MySQL 8.0+

## 快速开始

```bash
# 1. 克隆仓库
git clone <repo-url> && cd benchmarkpass

# 2. 安装依赖（自动生成 Prisma Client）
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 MySQL 连接信息

# 4. 创建数据库并执行迁移
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS benchmarkpass"
pnpm prisma migrate dev

# 5. 启动开发服务器
pnpm dev
```

打开 http://localhost:3000 即可使用。

## 使用流程

1. **家长注册** — 用邮箱注册账号，自动创建家庭
2. **添加孩子** — 获得孩子的登录码（例如 BP3X7K42）
3. **创建目标** — 从模板库选或自定义，设定 XP/币奖励
4. **孩子登录** — 用登录码 + 默认密码 123456 进入任务看板
5. **完成任务** — 孩子点击勾选提交，等待家长审核
6. **家长审核** — 确认完成后 XP 和币自动到账

## 环境变量

参见 `.env.example`。Stripe 和 DashScope 为可选配置，不配不影响核心功能。

## 项目结构

```
src/
├── app/
│   ├── api/          # API 路由（认证、目标、奖励、赛季、Stripe）
│   ├── auth/         # 登录/注册页面
│   ├── parent/       # 家长管理端
│   ├── child/        # 孩子操作端
│   └── page.tsx      # 首页着陆页
├── components/       # 共享组件
├── lib/              # 工具函数、认证配置、模板库
└── generated/prisma/ # Prisma Client（自动生成）
```

## License

MIT
