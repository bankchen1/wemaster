# WeMaster Staging 环境部署执行指南

## 概述

本指南提供了 WeMaster Staging 环境完整部署的详细步骤和操作说明。Staging 环境是生产环境的镜像，用于最终的功能验证和性能测试。

## 前置条件

### 工具要求
- ✅ Node.js >= 18.x
- ✅ Docker & Docker Compose
- ✅ Fly CLI (`flyctl`)
- ✅ Vercel CLI (`vercel`)
- ✅ Cloudflare Wrangler (`wrangler`)
- ✅ Terraform >= 1.5.0

### 账户要求
- ✅ Fly.io 账户和 API Token
- ✅ Vercel 账户和 API Token
- ✅ Cloudflare 账户和 API Token
- ✅ Neon Database 账户
- ✅ Upstash Redis 账户
- ✅ AWS 账户 (R2 存储)

## 快速部署

### 1. 环境准备
```bash
# 克隆项目
git clone <repository-url>
cd wemaster

# 安装依赖
npm install

# 加载 staging 环境变量
set -a && source .env.staging && set +a
```

### 2. 一键部署
```bash
# 执行完整部署
./deploy-staging.sh

# 部署完成后验证
./scripts/verify-staging.sh
```

## 详细部署步骤

### 步骤 1: 基础设施部署

#### 1.1 Terraform 配置
```bash
cd infra/terraform

# 复制并编辑配置文件
cp terraform.tfvars.example terraform.tfvars
# 编辑 terraform.tfvars，填入真实的 API 密钥

# 初始化 Terraform
terraform init

# 查看部署计划
terraform plan -var-file=terraform.tfvars

# 部署基础设施
terraform apply -var-file=terraform.tfvars -auto-approve
```

#### 1.2 验证基础设施
```bash
# 检查部署状态
./verify.sh

# 查看输出信息
terraform output
```

### 步骤 2: 数据库设置

#### 2.1 创建 Staging 数据库
```bash
# 在 Neon 控制台创建 staging 分支
# 或使用 API 创建数据库分支

# 运行迁移
./scripts/migrate-staging.sh

# 可选：填充种子数据
./scripts/migrate-staging.sh --seed
```

#### 2.2 验证数据库
```bash
cd wemaster-nest

# 检查数据库连接
npx prisma db pull

# 验证表结构
npx prisma studio &
# 访问 http://localhost:5555 查看数据库
```

### 步骤 3: 后端部署

#### 3.1 Fly.io 部署
```bash
cd wemaster-nest

# 使用 staging 配置
cp ../fly.staging.toml fly.toml

# 登录 Fly.io
fly auth login

# 创建应用
fly launch --name wemaster-api-staging --no-deploy

# 设置环境变量
fly secrets set NODE_ENV=staging
fly secrets set DATABASE_URL="$DATABASE_URL"
fly secrets set REDIS_URL="$REDIS_URL"
fly secrets set JWT_SECRET="$JWT_SECRET"
fly secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
fly secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
fly secrets set AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
fly secrets set AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
fly secrets set DEFAULT_TENANT="$DEFAULT_TENANT"

# 部署应用
fly deploy

# 检查部署状态
fly status
```

#### 3.2 配置健康检查
```bash
# 查看日志
fly logs

# 扩展实例
fly scale count 1

# 设置自动启动
fly autoscale set --min=1 --max=3
```

### 步骤 4: 前端部署

#### 4.1 Vercel 配置
```bash
cd wemaster-admin

# 登录 Vercel
vercel login

# 使用 staging 环境配置
cp .env.staging .env.production

# 构建项目
npm run build

# 部署到 Vercel
vercel --name wemaster-admin-staging --prod

# 配置自定义域名
vercel domains add admin.staging.wemaster.dev
```

#### 4.2 验证前端部署
```bash
# 检查部署状态
vercel ls

# 访问部署的 URL
vercel visit wemaster-admin-staging
```

### 步骤 5: Cloudflare Workers 部署

#### 5.1 Workers 配置
```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler auth login

# 设置环境变量
wrangler secret put DATABASE_URL --env staging
wrangler secret put REDIS_URL --env staging
wrangler secret put JWT_SECRET --env staging
wrangler secret put STRIPE_SECRET_KEY --env staging

# 部署 Workers
wrangler deploy --env staging
```

#### 5.2 配置路由
```bash
# 在 Cloudflare 控制台配置 Workers 路由
# 或使用 API 配置
```

### 步骤 6: DNS 配置

#### 6.1 Cloudflare DNS 设置
在 Cloudflare 控制台添加以下 DNS 记录：

```
# A 记录
admin.staging.wemaster.dev → Vercel IP
api.staging.wemaster.dev → Fly.io IP

# CNAME 记录
www.staging.wemaster.dev → admin.staging.wemaster.dev
app.staging.wemaster.dev → admin.staging.wemaster.dev

# MX 记录（如果需要邮件）
staging.wemaster.dev → mail server
```

#### 6.2 SSL 证书
```bash
# Cloudflare 会自动配置 SSL 证书
# 验证证书状态
curl -I https://admin.staging.wemaster.dev
curl -I https://api.staging.wemaster.dev
```

### 步骤 7: 验证和测试

#### 7.1 健康检查
```bash
# 运行自动验证脚本
./scripts/verify-staging.sh

# 手动检查关键服务
curl https://api.staging.wemaster.dev/healthz
curl https://admin.staging.wemaster.dev
```

#### 7.2 功能测试
```bash
# API 测试
curl https://api.staging.wemaster.dev/api/v1/offerings

# 认证测试
curl -X POST https://api.staging.wemaster.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 多租户测试
curl -H "x-tenant-id: wemaster_staging" \
  https://api.staging.wemaster.dev/api/v1/offerings
```

## 环境变量配置

### Staging 环境变量文件
位置：`.env.staging`

```bash
# 核心配置
NODE_ENV=staging
PORT=3001
API_PREFIX=/api/v1

# 数据库
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# 认证
JWT_SECRET=staging_secret_key
STRIPE_SECRET_KEY=sk_test_...

# 域名配置
CORS_ORIGINS=https://staging.wemaster.dev,https://admin.staging.wemaster.dev

# 监控
LOG_LEVEL=info
HEALTH_CHECK_ENABLED=true
```

### Fly.io Secrets
```bash
fly secrets set NODE_ENV=staging
fly secrets set DATABASE_URL="$DATABASE_URL"
fly secrets set REDIS_URL="$REDIS_URL"
# ... 其他敏感配置
```

### Vercel Environment Variables
```bash
# 在 Vercel 控制台或 CLI 设置
vercel env add VITE_API_BASE_URL staging
vercel env add VITE_APP_TITLE staging
```

## 监控和日志

### 应用监控
```bash
# Fly.io 监控
fly monitor

# 查看实时日志
fly logs --follow

# 性能指标
fly metrics
```

### 错误追踪
```bash
# 检查应用错误
curl https://api.staging.wemaster.dev/healthz | jq .

# 查看错误日志
fly logs --level error
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库 URL
echo $DATABASE_URL

# 测试连接
npx prisma db pull

# 检查网络连接
ping $DATABASE_HOST
```

#### 2. Redis 连接失败
```bash
# 检查 Redis URL
echo $REDIS_URL

# 测试连接
redis-cli -u $REDIS_URL ping
```

#### 3. 前端构建失败
```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install

# 检查环境变量
cat .env.production
```

#### 4. API 部署失败
```bash
# 检查 Fly.io 状态
fly status

# 查看部署日志
fly deploy --verbose
```

### 回滚程序

#### 快速回滚
```bash
# Fly.io 回滚
fly deploy --version <previous-version>

# Vercel 回滚
vercel rollback wemaster-admin-staging

# Workers 回滚
wrangler rollback --env staging
```

#### 完全回滚
```bash
# 停止服务
fly scale count 0

# 清理资源
terraform destroy -var-file=terraform.tfvars

# 重新部署
./deploy-staging.sh
```

## 性能优化

### 数据库优化
```bash
# 分析查询性能
npx prisma db seed

# 添加索引
# 在 schema.prisma 中添加 @@index
```

### 缓存优化
```bash
# Redis 缓存配置
# 检查缓存命中率
redis-cli -u $REDIS_URL info stats
```

### CDN 优化
```bash
# Cloudflare 缓存规则
# 在控制台配置页面规则
```

## 安全检查清单

- [ ] HTTPS 强制启用
- [ ] 安全头部配置
- [ ] CORS 策略正确
- [ ] API 速率限制
- [ ] 敏感信息环境变量化
- [ ] 数据库连接加密
- [ ] 日志不包含敏感信息
- [ ] 定期密钥轮换

## 部署后任务

1. **功能测试**: 执行完整的测试套件
2. **性能测试**: 运行负载和压力测试
3. **安全测试**: 执行安全扫描
4. **用户验收**: 邀请团队测试
5. **文档更新**: 更新操作手册
6. **监控配置**: 设置告警规则

## 支持

如遇到问题，请查看：
1. 日志文件：`/tmp/staging-deployment-report.md`
2. 验证报告：`/tmp/staging-verification-report.md`
3. 迁移报告：`/tmp/staging-migration-report.md`

联系技术支持团队获取帮助。