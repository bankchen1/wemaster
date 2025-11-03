#!/bin/bash

# WeMaster Staging 环境部署脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 部署配置
STAGING_DOMAIN="staging.wemaster.dev"
API_DOMAIN="api.staging.wemaster.dev"
ADMIN_DOMAIN="admin.staging.wemaster.dev"

log_info "开始部署 WeMaster Staging 环境"
log_info "目标域名: $STAGING_DOMAIN"

# 1. 环境准备
log_info "1. 环境准备..."

# 加载 staging 环境变量
if [ -f .env.staging ]; then
    set -a
    source .env.staging
    set +a
    log_success "Staging 环境变量已加载"
else
    log_error "未找到 .env.staging 文件"
    exit 1
fi

# 2. 前端部署 (Vercel)
log_info "2. 部署前端到 Vercel..."
cd wemaster-admin

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 使用 staging 环境配置
if [ -f .env.staging ]; then
    cp .env.staging .env.production
fi

# 构建前端
log_info "构建前端应用..."
npm run build

# 部署到 Vercel
log_info "部署到 Vercel Staging..."
vercel --name wemaster-admin-staging --prod

# 记录部署 URL
ADMIN_URL=$(vercel ls wemaster-admin-staging --json | jq -r '.[0].url')
log_success "前端部署完成: $ADMIN_URL"

cd ..

# 3. 后端部署 (Fly.io)
log_info "3. 部署后端到 Fly.io..."

cd wemaster-nest

# 检查是否安装了 Fly CLI
if ! command -v fly &> /dev/null; then
    log_warning "Fly CLI 未安装，正在安装..."
    curl -L https://fly.io/install.sh | sh
fi

# 使用 staging 配置
if [ -f ../fly.staging.toml ]; then
    cp ../fly.staging.toml fly.toml
fi

# 设置环境变量
log_info "设置 Fly.io 环境变量..."
fly secrets set NODE_ENV=staging
fly secrets set DATABASE_URL="$DATABASE_URL"
fly secrets set REDIS_URL="$REDIS_URL"
fly secrets set JWT_SECRET="$JWT_SECRET"
fly secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
fly secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
fly secrets set AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
fly secrets set AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
fly secrets set DEFAULT_TENANT="$DEFAULT_TENANT"

# 部署到 Fly.io
log_info "部署到 Fly.io Staging..."
fly deploy

# 获取部署 URL
API_URL=$(fly status --json | jq -r '.Hostname')
log_success "后端部署完成: https://$API_URL"

cd ..

# 4. Cloudflare Workers 部署
log_info "4. 部署 Cloudflare Workers..."

# 检查是否安装了 Wrangler
if ! command -v wrangler &> /dev/null; then
    log_warning "Wrangler CLI 未安装，正在安装..."
    npm install -g wrangler
fi

# 设置环境变量
wrangler secret put DATABASE_URL --env staging << EOF
$DATABASE_URL
EOF

wrangler secret put REDIS_URL --env staging << EOF
$REDIS_URL
EOF

wrangler secret put JWT_SECRET --env staging << EOF
$JWT_SECRET
EOF

# 部署 Workers
log_info "部署 Workers 到 Staging..."
wrangler deploy --env staging

WORKER_URL="wemaster-worker-staging.$(wrangler whoami | jq -r '.Account.subdomain').workers.dev"
log_success "Workers 部署完成: https://$WORKER_URL"

# 5. 数据库迁移
log_info "5. 执行数据库迁移..."

cd wemaster-nest

# 运行数据库迁移
log_info "运行 Prisma 迁移..."
npx prisma migrate deploy

# 生成 Prisma 客户端
npx prisma generate

# 填充种子数据（如果需要）
if [ "$1" = "--seed" ]; then
    log_info "填充种子数据..."
    npx prisma db seed
fi

cd ..

# 6. 域名配置
log_info "6. 配置域名解析..."

# 这里需要手动配置 Cloudflare DNS
log_warning "请手动配置以下 DNS 记录:"
log_info "A $ADMIN_DOMAIN -> Vercel 分配的 IP"
log_info "A $API_DOMAIN -> Fly.io 分配的 IP"
log_info "CNAME api.$STAGING_DOMAIN -> $API_URL"
log_info "CNAME www.$STAGING_DOMAIN -> $ADMIN_URL"

# 7. 健康检查
log_info "7. 执行健康检查..."

# 检查后端健康状态
sleep 10  # 等待服务启动
if curl -f -s "https://$API_URL/healthz" > /dev/null; then
    log_success "后端健康检查通过"
else
    log_warning "后端健康检查失败，可能还在启动中"
fi

# 检查前端
if curl -f -s "https://$ADMIN_URL" > /dev/null; then
    log_success "前端访问正常"
else
    log_warning "前端访问检查失败"
fi

# 8. 部署总结
log_success "Staging 环境部署完成!"
log_info "访问地址:"
log_info "  前端管理: https://$ADMIN_URL"
log_info "  后端 API: https://$API_URL"
log_info "  API 网关: https://$WORKER_URL"

log_info "环境信息:"
log_info "  环境: staging"
log_info "  域名: $STAGING_DOMAIN"
log_info "  数据库: $DATABASE_HOST"
log_info "  Redis: $REDIS_HOST"

log_warning "后续步骤:"
log_info "1. 配置 Cloudflare DNS 记录"
log_info "2. 更新 Stripe Webhook 端点"
log_info "3. 配置 SSL 证书（如果需要）"
log_info "4. 执行完整的功能测试"

# 创建部署报告
cat > /tmp/staging-deployment-report.md << EOF
# WeMaster Staging 环境部署报告

## 部署时间
$(date)

## 部署地址
- 前端管理: https://$ADMIN_URL
- 后端 API: https://$API_URL
- API 网关: https://$WORKER_URL

## 环境配置
- 环境: staging
- 域名: $STAGING_DOMAIN
- 数据库: $DATABASE_HOST
- Redis: $REDIS_HOST

## 部署状态
- [x] 前端部署 (Vercel)
- [x] 后端部署 (Fly.io)
- [x] Workers 部署 (Cloudflare)
- [x] 数据库迁移

## 待完成任务
- [ ] DNS 配置
- [ ] SSL 证书配置
- [ ] Stripe Webhook 更新
- [ ] 功能测试

## 健康检查结果
- 后端 API: $(curl -s -o /dev/null -w "%{http_code}" "https://$API_URL/healthz" || echo "Failed")
- 前端: $(curl -s -o /dev/null -w "%{http_code}" "https://$ADMIN_URL" || echo "Failed")
EOF

log_success "部署报告已生成: /tmp/staging-deployment-report.md"
log_success "Staging 环境部署任务完成!"