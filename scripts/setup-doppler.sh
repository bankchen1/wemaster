#!/bin/bash

# WeMaster Doppler 配置注入脚本
# 用于将环境变量从 Doppler 注入到各个服务

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

# 检查 Doppler CLI 是否安装
check_doppler() {
    log_info "检查 Doppler CLI 安装状态..."
    if ! command -v doppler &> /dev/null; then
        log_error "Doppler CLI 未安装"
        exit 1
    fi
    log_success "Doppler CLI 已安装: $(doppler --version)"
}

# 设置项目和环境
setup_project() {
    log_info "设置 WeMaster 项目..."
    
    # 项目配置
    export DOPPLER_PROJECT="wemaster"
    export DOPPLER_CONFIG="test"
    
    log_info "项目: $DOPPLER_PROJECT"
    log_info "环境: $DOPPLER_CONFIG"
}

# 生成环境变量
generate_env_vars() {
    log_info "生成环境变量配置..."
    
    cat > .env.doppler << EOF
# ==========================================
# WeMaster 环境变量配置 (Doppler)
# ==========================================

# 应用基础配置
NODE_ENV=test
PORT=3001
API_PREFIX=/api/v1

# 数据库配置 (PostgreSQL)
DATABASE_URL=postgresql://wemaster_test_user:wemaster_test_pass_2024@localhost:5432/wemaster_test
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=wemaster_test
DATABASE_USER=wemaster_test_user
DATABASE_PASSWORD=wemaster_test_pass_2024

# Redis 配置 (Upstash)
REDIS_URL=redis://default:abc123def456@upstash-redis-12345.upstash.io:6379
REDIS_HOST=upstash-redis-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=__REDIS_PASSWORD__
REDIS_TTL=3600

# JWT 配置
JWT_SECRET=__JWT_SECRET__
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Stripe 配置 (测试模式)
STRIPE_SECRET_KEY=__STRIPE_TEST_SECRET_KEY__
STRIPE_PUBLISHABLE_KEY=__STRIPE_TEST_PUBLISHABLE_KEY__
STRIPE_WEBHOOK_SECRET=__STRIPE_TEST_WEBHOOK_SECRET__
STRIPE_CONNECT_CLIENT_ID=__STRIPE_CONNECT_CLIENT_ID__
STRIPE_WEBHOOK_ENDPOINT=https://api.wemaster.test/api/v1/payments/webhooks/stripe

# AWS S3/R2 配置
AWS_ACCESS_KEY_ID=__AWS_ACCESS_KEY_ID__
AWS_SECRET_ACCESS_KEY=__AWS_SECRET_ACCESS_KEY__
AWS_REGION=us-east-1
AWS_S3_BUCKET=wemaster-test-storage
R2_ENDPOINT=https://abc123.r2.cloudflarestorage.com
R2_BUCKET=wemaster-test-r2

# 邮件服务配置 (SendGrid)
SENDGRID_API_KEY=__SENDGRID_API_KEY__
EMAIL_FROM=noreply@wemaster.test
EMAIL_FROM_NAME=WeMaster Test

# SMS 服务配置 (Twilio)
TWILIO_ACCOUNT_SID=__TWILIO_ACCOUNT_SID__
TWILIO_AUTH_TOKEN=__TWILIO_AUTH_TOKEN__
TWILIO_PHONE_NUMBER=+1234567890

# 多租户配置
DEFAULT_TENANT=wemaster
TENANT_ISOLATION_ENABLED=true

# CORS 配置
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=json

# 缓存配置
CACHE_TTL=300
CACHE_MAX_SIZE=1000

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# 监控配置
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true

# 第三方服务配置
LIVEKIT_API_KEY=devkey_1234567890abcdef
LIVEKIT_API_SECRET=1234567890abcdef1234567890abcdef
LIVEKIT_URL=wss://wemaster-test.livekit.cloud

# OpenAI 配置 (AI 功能)
OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef
OPENAI_MODEL=gpt-4

# 推送通知配置
FCM_SERVER_KEY=AAAAbc123def456_ghi789_jkl012_mno345
PUSH_NOTIFICATION_ENABLED=true

# 数据分析配置
GOOGLE_ANALYTICS_ID=GA-TEST-123456789-1
ANALYTICS_ENABLED=false

# 测试配置
TEST_DATABASE_URL=postgresql://test:test@localhost:5432/wemaster_test_e2e
TEST_REDIS_URL=redis://localhost:6379/1

# Doppler 服务令牌
CONFIG_SERVICE_TOKEN=doppler_v1_dpct_1234567890abcdef1234567890abcdef
EOF

    log_success "环境变量配置已生成: .env.doppler"
}

# 注入到 Vercel 前端
inject_to_vercel() {
    log_info "注入配置到 Vercel 前端项目..."
    
    cat > vercel.env.json << EOF
{
  "build": {
    "env": {
      "VITE_API_BASE_URL": "https://api.wemaster.test",
      "VITE_STRIPE_PUBLISHABLE_KEY": "pk_test_51234567890abcdef51234567890abcdef",
      "VITE_APP_NAME": "WeMaster Admin",
      "VITE_APP_VERSION": "1.0.0",
      "VITE_ENVIRONMENT": "test",
      "VITE_SENTRY_DSN": "https://1234567890abcdef@sentry.io/123456",
      "VITE_ENABLE_MOCK": "true"
    }
  },
  "preview": {
    "env": {
      "VITE_API_BASE_URL": "https://api.wemaster.test",
      "VITE_STRIPE_PUBLISHABLE_KEY": "pk_test_51234567890abcdef51234567890abcdef",
      "VITE_APP_NAME": "WeMaster Admin",
      "VITE_APP_VERSION": "1.0.0",
      "VITE_ENVIRONMENT": "test",
      "VITE_SENTRY_DSN": "https://1234567890abcdef@sentry.io/123456",
      "VITE_ENABLE_MOCK": "true"
    }
  },
  "production": {
    "env": {
      "VITE_API_BASE_URL": "https://api.wemaster.com",
      "VITE_STRIPE_PUBLISHABLE_KEY": "\${STRIPE_PUBLISHABLE_KEY}",
      "VITE_APP_NAME": "WeMaster Admin",
      "VITE_APP_VERSION": "1.0.0",
      "VITE_ENVIRONMENT": "production",
      "VITE_SENTRY_DSN": "\${SENTRY_DSN}",
      "VITE_ENABLE_MOCK": "false"
    }
  }
}
EOF

    log_success "Vercel 环境配置已生成: vercel.env.json"
}

# 注入到 Fly.io 后端
inject_to_fly() {
    log_info "注入配置到 Fly.io 后端服务..."
    
    cat > fly.toml << EOF
app = "wemaster-api-test"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "test"
  PORT = "8080"
  DATABASE_URL = "\${DATABASE_URL}"
  REDIS_URL = "\${REDIS_URL}"
  JWT_SECRET = "\${JWT_SECRET}"
  STRIPE_SECRET_KEY = "\${STRIPE_SECRET_KEY}"
  STRIPE_WEBHOOK_SECRET = "\${STRIPE_WEBHOOK_SECRET}"
  AWS_ACCESS_KEY_ID = "\${AWS_ACCESS_KEY_ID}"
  AWS_SECRET_ACCESS_KEY = "\${AWS_SECRET_ACCESS_KEY}"
  CONFIG_SERVICE_TOKEN = "\${CONFIG_SERVICE_TOKEN}"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[http_service.checks]]
  interval = "15s"
  timeout = "2s"
  grace_period = "5s"
  method = "GET"
  path = "/healthz"

[deploy]
  strategy = "rolling"

[experimental]
  cmd = ["npm", "run", "start:prod"]
EOF

    log_success "Fly.io 配置已生成: fly.toml"
}

# 注入到 Cloudflare Workers
inject_to_cloudflare() {
    log_info "注入配置到 Cloudflare Workers..."
    
    cat > wrangler.toml << EOF
name = "wemaster-worker-test"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.test]
name = "wemaster-worker-test"
vars = { ENVIRONMENT = "test" }

[env.production]
name = "wemaster-worker"
vars = { ENVIRONMENT = "production" }

# 环境变量
[vars]
ENVIRONMENT = "test"
DATABASE_URL = "\${DATABASE_URL}"
REDIS_URL = "\${REDIS_URL}"
JWT_SECRET = "\${JWT_SECRET}"
CONFIG_SERVICE_TOKEN = "\${CONFIG_SERVICE_TOKEN}"

# KV 命名空间
[[kv_namespaces]]
binding = "CACHE"
id = "abc123def456ghi789"
preview_id = "def456ghi789jkl012"

# D1 数据库
[[d1_databases]]
binding = "DB"
database_name = "wemaster-test-db"
database_id = "abc123-def456-ghi789-jkl012"

# R2 存储桶
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "wemaster-test-worker"

# Secrets (通过 wrangler secret put 设置)
# wrangler secret put STRIPE_SECRET_KEY
# wrangler secret put JWT_SECRET
EOF

    log_success "Cloudflare Workers 配置已生成: wrangler.toml"
}

# 创建服务间通信令牌
generate_service_tokens() {
    log_info "生成服务间通信令牌..."
    
    # 生成 CONFIG_SERVICE_TOKEN
    CONFIG_SERVICE_TOKEN="doppler_v1_dpct_$(openssl rand -hex 16)"
    
    # 生成其他服务令牌
    API_SERVICE_TOKEN="svc_api_$(openssl rand -hex 12)"
    WORKER_SERVICE_TOKEN="svc_worker_$(openssl rand -hex 12)"
    
    cat > service-tokens.env << EOF
# 服务间通信令牌
CONFIG_SERVICE_TOKEN=${CONFIG_SERVICE_TOKEN}
API_SERVICE_TOKEN=${API_SERVICE_TOKEN}
WORKER_SERVICE_TOKEN=${WORKER_SERVICE_TOKEN}

# 服务发现配置
API_SERVICE_URL=https://api.wemaster.test
WORKER_SERVICE_URL=https://worker.wemaster.test
AUTH_SERVICE_URL=https://auth.wemaster.test

# 服务间认证
INTERNAL_API_KEY=internal_$(openssl rand -hex 20)
SERVICE_MESH_ENABLED=true
EOF

    log_success "服务令牌已生成: service-tokens.env"
}

# 创建配置切换脚本
create_switch_scripts() {
    log_info "创建配置切换脚本..."
    
    cat > switch-env.sh << 'EOF'
#!/bin/bash

# 环境切换脚本
set -e

ENVIRONMENT=${1:-test}

echo "切换到环境: $ENVIRONMENT"

case $ENVIRONMENT in
    "test")
        export DOPPLER_PROJECT="wemaster"
        export DOPPLER_CONFIG="test"
        ;;
    "staging")
        export DOPPLER_PROJECT="wemaster"
        export DOPPLER_CONFIG="staging"
        ;;
    "production")
        export DOPPLER_PROJECT="wemaster"
        export DOPPLER_CONFIG="production"
        ;;
    *)
        echo "错误: 未知环境 '$ENVIRONMENT'"
        echo "可用环境: test, staging, production"
        exit 1
        ;;
esac

echo "已切换到 $ENVIRONMENT 环境"
echo "项目: $DOPPLER_PROJECT"
echo "配置: $DOPPLER_CONFIG"

# 导出环境变量到当前 shell
if command -v doppler &> /dev/null; then
    eval $(doppler secrets download --format=env)
    echo "Doppler 环境变量已加载"
else
    echo "警告: Doppler CLI 未安装，使用本地 .env.doppler 文件"
    if [ -f .env.doppler ]; then
        export $(cat .env.doppler | grep -v '^#' | xargs)
        echo "本地环境变量已加载"
    fi
fi
EOF

    chmod +x switch-env.sh
    
    cat > rollback-config.sh << 'EOF'
#!/bin/bash

# 配置回滚脚本
set -e

BACKUP_DIR="./config-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "创建配置备份..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份当前配置
cp .env.doppler $BACKUP_DIR/.env.doppler.$TIMESTAMP 2>/dev/null || true
cp vercel.env.json $BACKUP_DIR/vercel.env.json.$TIMESTAMP 2>/dev/null || true
cp fly.toml $BACKUP_DIR/fly.toml.$TIMESTAMP 2>/dev/null || true
cp wrangler.toml $BACKUP_DIR/wrangler.toml.$TIMESTAMP 2>/dev/null || true

echo "配置已备份到: $BACKUP_DIR"

# 列出可用的备份
echo "可用的备份:"
ls -la $BACKUP_DIR/

echo "使用方法: ./restore-config.sh <timestamp>"
EOF

    chmod +x rollback-config.sh
    
    cat > restore-config.sh << 'EOF'
#!/bin/bash

# 配置恢复脚本
set -e

BACKUP_DIR="./config-backups"
TIMESTAMP=${1:-}

if [ -z "$TIMESTAMP" ]; then
    echo "错误: 请提供备份时间戳"
    echo "可用备份:"
    ls -la $BACKUP_DIR/
    exit 1
fi

echo "恢复配置到时间戳: $TIMESTAMP"

# 恢复配置文件
cp $BACKUP_DIR/.env.doppler.$TIMESTAMP .env.doppler 2>/dev/null || echo "警告: .env.doppler 备份不存在"
cp $BACKUP_DIR/vercel.env.json.$TIMESTAMP vercel.env.json 2>/dev/null || echo "警告: vercel.env.json 备份不存在"
cp $BACKUP_DIR/fly.toml.$TIMESTAMP fly.toml 2>/dev/null || echo "警告: fly.toml 备份不存在"
cp $BACKUP_DIR/wrangler.toml.$TIMESTAMP wrangler.toml 2>/dev/null || echo "警告: wrangler.toml 备份不存在"

echo "配置已恢复"
echo "请重新部署服务以应用配置"
EOF

    chmod +x restore-config.sh
    
    log_success "配置切换脚本已创建"
}

# 验证配置
verify_config() {
    log_info "验证配置..."
    
    # 检查必需的环境变量
    required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "STRIPE_SECRET_KEY"
        "CONFIG_SERVICE_TOKEN"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env.doppler; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_success "所有必需的环境变量都已配置"
    else
        log_error "缺少必需的环境变量:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    # 验证配置文件
    config_files=(
        ".env.doppler"
        "vercel.env.json"
        "fly.toml"
        "wrangler.toml"
        "service-tokens.env"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "$file 已创建"
        else
            log_warning "$file 不存在"
        fi
    done
}

# 创建部署脚本
create_deploy_scripts() {
    log_info "创建部署脚本..."
    
    cat > deploy-all.sh << 'EOF'
#!/bin/bash

# 全平台部署脚本
set -e

echo "开始部署 WeMaster 全平台..."

# 加载环境变量
source ./switch-env.sh ${1:-test}

# 部署前端到 Vercel
echo "部署前端到 Vercel..."
cd wemaster-admin
npm run build
vercel --prod
cd ..

# 部署后端到 Fly.io
echo "部署后端到 Fly.io..."
cd wemaster-nest
fly deploy
cd ..

# 部署 Workers 到 Cloudflare
echo "部署 Workers 到 Cloudflare..."
cd wemaster-workers
wrangler deploy
cd ..

echo "全平台部署完成!"
EOF

    chmod +x deploy-all.sh
    
    log_success "部署脚本已创建"
}

# 主函数
main() {
    echo "==============================================="
    echo "WeMaster Doppler 配置注入脚本"
    echo "==============================================="
    echo ""
    
    check_doppler
    setup_project
    generate_env_vars
    inject_to_vercel
    inject_to_fly
    inject_to_cloudflare
    generate_service_tokens
    create_switch_scripts
    create_deploy_scripts
    verify_config
    
    echo ""
    echo "==============================================="
    log_success "Doppler 配置注入完成!"
    echo "==============================================="
    echo ""
    echo "生成的文件:"
    echo "  - .env.doppler              # 环境变量配置"
    echo "  - vercel.env.json           # Vercel 前端配置"
    echo "  - fly.toml                  # Fly.io 后端配置"
    echo "  - wrangler.toml             # Cloudflare Workers 配置"
    echo "  - service-tokens.env        # 服务间令牌"
    echo ""
    echo "管理脚本:"
    echo "  - ./switch-env.sh [env]     # 环境切换"
    echo "  - ./rollback-config.sh      # 配置备份"
    echo "  - ./restore-config.sh [ts]  # 配置恢复"
    echo "  - ./deploy-all.sh [env]     # 全平台部署"
    echo ""
    echo "下一步:"
    echo "1. 登录 Doppler: doppler login"
    echo "2. 创建项目: doppler setup"
    echo "3. 上传配置: doppler secrets upload .env.doppler"
    echo "4. 测试配置: ./switch-env.sh test"
    echo "==============================================="
}

# 执行主函数
main "$@"
