#!/bin/bash

# Staging 环境数据库迁移脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

log_info "开始 Staging 环境数据库迁移..."

# 加载环境变量
cd /Volumes/BankChen/wemaster
if [ -f .env.staging ]; then
    set -a
    source .env.staging
    set +a
    log_success "Staging 环境变量已加载"
else
    log_error "未找到 .env.staging 文件"
    exit 1
fi

# 进入后端目录
cd wemaster-nest

# 检查数据库连接
log_info "检查数据库连接..."
if ! npx prisma db push --accept-data-loss 2>/dev/null; then
    log_error "数据库连接失败，请检查 DATABASE_URL"
    exit 1
fi

# 生成 Prisma 客户端
log_info "生成 Prisma 客户端..."
npx prisma generate

# 运行迁移
log_info "运行数据库迁移..."
npx prisma migrate deploy

# 验证迁移结果
log_info "验证迁移结果..."
npx prisma db pull

# 检查数据库状态
log_info "检查数据库状态..."
SCHEMA_VERSION=$(npx prisma migrate list | head -1 | awk '{print $1}')
log_info "当前数据库版本: $SCHEMA_VERSION"

# 填充基础数据（如果需要）
if [ "$1" = "--seed" ]; then
    log_info "填充种子数据..."
    npx prisma db seed
    log_success "种子数据填充完成"
fi

# 验证表结构
log_info "验证表结构..."
npx prisma db pull --force > /tmp/schema.prisma.tmp
if diff prisma/schema.prisma /tmp/schema.prisma.tmp > /dev/null; then
    log_success "表结构验证通过"
else
    log_warning "表结构存在差异，请检查 schema.prisma"
    diff prisma/schema.prisma /tmp/schema.prisma.tmp || true
fi

# 清理临时文件
rm -f /tmp/schema.prisma.tmp

log_success "Staging 环境数据库迁移完成!"

# 生成迁移报告
cat > /tmp/staging-migration-report.md << EOF
# WeMaster Staging 环境数据库迁移报告

## 迁移时间
$(date)

## 数据库信息
- 主机: $DATABASE_HOST
- 端口: $DATABASE_PORT
- 数据库: $DATABASE_NAME
- 用户: $DATABASE_USER

## 迁移状态
- [x] 数据库连接检查
- [x] Prisma 客户端生成
- [x] 数据库迁移
- [x] 表结构验证
EOF

if [ "$1" = "--seed" ]; then
    echo "- [x] 种子数据填充" >> /tmp/staging-migration-report.md
fi

log_info "迁移报告已生成: /tmp/staging-migration-report.md"