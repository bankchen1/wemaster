# WeMaster - 在线教育平台

WeMaster 是一个现代化的在线教育平台，提供实时直播课堂、支付系统和导师管理功能。

## 主要功能

- 实时直播课堂
  - WebRTC 视频会议
  - 实时聊天
  - 互动白板
  - 课堂录制

- 支付系统
  - 课程支付
  - 退款处理
  - 导师提现
  - 收入统计

- 导师管理
  - 账户验证
  - 课程管理
  - 收入管理
  - 提现管理

## 技术栈

### 前端
- Next.js
- React
- TypeScript
- Zustand
- TailwindCSS
- LiveKit Client

### 后端
- NestJS
- TypeScript
- PostgreSQL
- Prisma
- LiveKit Server
- Stripe

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/bankchen1/wemaster.git
cd wemaster
```

2. 安装依赖
```bash
# 安装前端依赖
cd apps/web
npm install

# 安装后端依赖
cd ../api
npm install
```

3. 环境变量配置
```bash
# 前端环境变量
cp apps/web/.env.example apps/web/.env.local

# 后端环境变量
cp apps/api/.env.example apps/api/.env
```

4. 启动开发服务器
```bash
# 启动前端
cd apps/web
npm run dev

# 启动后端
cd ../api
npm run start:dev
```

## 部署

### 前端部署 (Vercel)
1. Fork 此仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 后端部署 (Digital Ocean)
1. 创建 App Platform 应用
2. 连接 GitHub 仓库
3. 配置环境变量
4. 部署

## 测试

```bash
# 运行前端测试
cd apps/web
npm test

# 运行后端测试
cd ../api
npm test
```

## API 文档

API 文档使用 Swagger 生成，可在开发环境中访问：
- http://localhost:3000/api/docs

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT License](LICENSE)
