# WeMaster 平台

WeMaster 是一个现代化的在线教育平台，连接学生与专业导师，提供直播课堂、个性化课程、支付结算与移动端学习体验。本仓库用来统一管理多栈项目，并将各栈代码迁移到独立的子仓库，便于单独部署与协同开发。

## 核心功能概览

- 实时课堂：WebRTC 直播、实时聊天、互动白板与录制
- 支付系统：课程支付、退款处理、导师提现与收入统计
- 导师中心：身份验证、课程管理、收益/提现管理
- 运营配套：VIP 订阅、社区互动、通知与监控告警

## 技术栈

- **前端 (wemaster-core)**：Next.js、React、TypeScript、TailwindCSS、Zustand、Stripe
- **后端 (wemaster-nest)**：NestJS、TypeScript、PostgreSQL、Prisma、Redis、Stripe
- **移动端 (wemaster-app-flutter)**：Flutter、Riverpod、GoRouter、Socket.IO、Agora、Stripe

更多细节可查阅 `AGENTS.md`。

## 仓库结构

```
wemaster/                # 主仓库（当前项目）
├── wemaster-core/       # Next.js 子仓库 (Git submodule)
├── wemaster-nest/       # NestJS 子仓库 (Git submodule)
└── wemaster-app-flutter/# Flutter 子仓库 (Git submodule)
```

- 主仓库管理统一运维脚本、文档、基础设施配置等资源。
- 各子目录是独立 Git 仓库，通过 Git Submodule 方式关联。

## 克隆与初始化

```bash
git clone https://github.com/bankchen1/wemaster.git
cd wemaster
git submodule update --init --recursive
```

如需同步最新子仓库提交：

```bash
git pull --recurse-submodules
git submodule update --recursive --remote
```

## 子仓库快捷指引

- `wemaster-core`：Next.js 前端。开发命令见该目录下 `README.md` 或 `AGENTS.md`。
- `wemaster-nest`：NestJS 后端。含 Prisma、Redis、Stripe 等配套，支持多租户与监控。
- `wemaster-app-flutter`：Flutter 移动端。现已初始化为独立仓库并推送到远程。

对某个子仓库的改动，需要在该子目录内单独提交并推送：

```bash
cd wemaster-nest
git status
git commit -am "feat: ..."
git push origin <branch>
```

随后回到主仓库更新子模块引用：

```bash
cd ..
git add wemaster-nest
git commit -m "chore: bump wemaster-nest submodule"
git push origin main
```

## 常见任务

- 主仓库脚本：`scripts/`、`infra/`、`deploy-*.sh` 等。
- 文档与交付材料：根目录下的各类 `*.md` 文件。
- 环境变量样例：请参考各子仓库内的 `.env.example`。

更多运维与开发流程，请参考 `AGENTS.md`、`DEPLOY_PLAYBOOK.md` 等文档。

## 许可证

默认遵循原项目的 MIT License（如有更新，请以实际 LICENSE 文件为准）。

