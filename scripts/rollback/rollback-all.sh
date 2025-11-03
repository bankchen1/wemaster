#!/bin/bash

# WeMaster 全平台回滚脚本
set -e

# 配置参数
ENVIRONMENT=${1:-staging}
BACKUP_VERSION=${2:-previous}
BACKUP_DIR="/tmp/wemaster-backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/var/log/wemaster-rollback.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# 检查前置条件
check_prerequisites() {
    log "检查回滚前置条件..."
    
    # 检查环境参数
    if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
        log_error "无效的环境参数: $ENVIRONMENT"
        exit 1
    fi
    
    # 检查必要工具
    local tools=("fly" "vercel" "psql" "redis-cli" "doppler")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "缺少必要工具: $tool"
            exit 1
        fi
    done
    
    # 检查网络连接
    if ! ping -c 1 google.com &> /dev/null; then
        log_error "网络连接异常"
        exit 1
    fi
    
    log_success "前置条件检查通过"
}

# 备份当前状态
backup_current_state() {
    log "备份当前状态到 $BACKUP_DIR..."
    
    mkdir -p "$BACKUP_DIR"
    
    # 备份环境变量
    log "备份环境变量..."
    doppler secrets download --env="$ENVIRONMENT" --format=env > "$BACKUP_DIR/secrets.env"
    
    # 备份数据库
    log "备份数据库..."
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database.sql"
    
    # 备份当前版本信息
    log "备份版本信息..."
    cd /Volumes/BankChen/wemaster/wemaster-nest
    git rev-parse HEAD > "$BACKUP_DIR/backend-commit.txt"
    
    cd /Volumes/BankChen/wemaster/wemaster-admin
    git rev-parse HEAD > "$BACKUP_DIR/frontend-commit.txt"
    
    # 备份配置文件
    log "备份配置文件..."
    cp /Volumes/BankChen/wemaster/fly.toml "$BACKUP_DIR/fly.toml"
    cp /Volumes/BankChen/wemaster/vercel.env.json "$BACKUP_DIR/vercel.env.json"
    
    log_success "当前状态备份完成"
}

# 数据库回滚
rollback_database() {
    log "开始数据库回滚..."
    
    cd /Volumes/BankChen/wemaster/wemaster-nest
    
    # 检查数据库连接
    if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        log_error "数据库连接失败"
        exit 1
    fi
    
    # 回滚迁移
    log "回滚数据库迁移..."
    if npx prisma migrate reset --force --skip-seed; then
        log_success "数据库迁移回滚成功"
    else
        log_error "数据库迁移回滚失败"
        exit 1
    fi
    
    # 恢复数据 (如果有备份)
    if [ -f "$BACKUP_DIR/database.sql" ]; then
        log "恢复数据库数据..."
        if psql "$DATABASE_URL" < "$BACKUP_DIR/database.sql"; then
            log_success "数据库数据恢复成功"
        else
            log_warning "数据库数据恢复失败，将使用种子数据"
            npm run prisma:seed
        fi
    else
        log "使用种子数据初始化数据库..."
        npm run prisma:seed
    fi
    
    # 验证数据库
    log "验证数据库状态..."
    if npm run consistency-check; then
        log_success "数据库验证通过"
    else
        log_warning "数据库验证发现问题，尝试修复..."
        npm run consistency-check:fix
    fi
}

# 后端服务回滚
rollback_backend() {
    log "开始后端服务回滚..."
    
    cd /Volumes/BankChen/wemaster/wemaster-nest
    
    # 获取回滚版本
    if [ "$BACKUP_VERSION" = "previous" ]; then
        ROLLBACK_COMMIT=$(git rev-parse HEAD~1)
    else
        ROLLBACK_COMMIT="$BACKUP_VERSION"
    fi
    
    log "回滚到版本: $ROLLBACK_COMMIT"
    
    # 切换到回滚版本
    if git checkout "$ROLLBACK_COMMIT"; then
        log_success "代码切换成功"
    else
        log_error "代码切换失败"
        exit 1
    fi
    
    # 重新构建
    log "重新构建后端应用..."
    if npm run build; then
        log_success "后端构建成功"
    else
        log_error "后端构建失败"
        exit 1
    fi
    
    # 部署到 Fly.io
    log "部署到 Fly.io..."
    if fly deploy --strategy=immediate; then
        log_success "后端部署成功"
    else
        log_error "后端部署失败"
        exit 1
    fi
    
    # 等待服务启动
    log "等待服务启动..."
    sleep 30
    
    # 验证服务状态
    local api_url="https://wemaster-api-${ENVIRONMENT}.fly.dev"
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$api_url/healthz" &> /dev/null; then
            log_success "后端服务健康检查通过"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "后端服务健康检查失败"
            exit 1
        fi
        
        log "等待服务启动... (尝试 $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
}

# 前端服务回滚
rollback_frontend() {
    log "开始前端服务回滚..."
    
    cd /Volumes/BankChen/wemaster/wemaster-admin
    
    # 获取回滚版本
    if [ "$BACKUP_VERSION" = "previous" ]; then
        ROLLBACK_COMMIT=$(git rev-parse HEAD~1)
    else
        ROLLBACK_COMMIT="$BACKUP_VERSION"
    fi
    
    log "回滚到版本: $ROLLBACK_COMMIT"
    
    # 切换到回滚版本
    if git checkout "$ROLLBACK_COMMIT"; then
        log_success "前端代码切换成功"
    else
        log_error "前端代码切换失败"
        exit 1
    fi
    
    # 重新生成 API 客户端
    log "重新生成 API 客户端..."
    if npm run generate:api; then
        log_success "API 客户端生成成功"
    else
        log_warning "API 客户端生成失败，继续回滚"
    fi
    
    # 重新构建
    log "重新构建前端应用..."
    if npm run build; then
        log_success "前端构建成功"
    else
        log_error "前端构建失败"
        exit 1
    fi
    
    # 部署到 Vercel
    log "部署到 Vercel..."
    if vercel --prod --force; then
        log_success "前端部署成功"
    else
        log_error "前端部署失败"
        exit 1
    fi
    
    # 验证前端访问
    local frontend_url="https://wemaster-admin-${ENVIRONMENT}.vercel.app"
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$frontend_url" &> /dev/null; then
            log_success "前端服务访问验证通过"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "前端服务访问验证失败"
            exit 1
        fi
        
        log "等待前端部署生效... (尝试 $attempt/$max_attempts)"
        sleep 30
        ((attempt++))
    done
}

# 配置回滚
rollback_config() {
    log "开始配置回滚..."
    
    # 恢复环境变量
    if [ -f "$BACKUP_DIR/secrets.env" ]; then
        log "恢复环境变量..."
        doppler secrets set --env="$ENVIRONMENT" --file="$BACKUP_DIR/secrets.env"
        log_success "环境变量恢复成功"
    else
        log_warning "未找到环境变量备份，跳过恢复"
    fi
    
    # 恢复配置文件
    if [ -f "$BACKUP_DIR/fly.toml" ]; then
        log "恢复 Fly.io 配置..."
        cp "$BACKUP_DIR/fly.toml" /Volumes/BankChen/wemaster/fly.toml
        log_success "Fly.io 配置恢复成功"
    fi
    
    if [ -f "$BACKUP_DIR/vercel.env.json" ]; then
        log "恢复 Vercel 配置..."
        cp "$BACKUP_DIR/vercel.env.json" /Volumes/BankChen/wemaster/vercel.env.json
        log_success "Vercel 配置恢复成功"
    fi
}

# 缓存清理
clear_cache() {
    log "清理缓存..."
    
    # 清理 Redis 缓存
    if redis-cli -u "$REDIS_URL" ping &> /dev/null; then
        redis-cli -u "$REDIS_URL" flushall
        log_success "Redis 缓存清理完成"
    else
        log_warning "Redis 连接失败，跳过缓存清理"
    fi
    
    # 清理本地缓存
    cd /Volumes/BankChen/wemaster/wemaster-nest
    rm -rf node_modules/.cache dist
    
    cd /Volumes/BankChen/wemaster/wemaster-admin
    rm -rf node_modules/.cache dist
    
    log_success "本地缓存清理完成"
}

# 回滚验证
verify_rollback() {
    log "开始回滚验证..."
    
    # 健康检查
    local api_url="https://wemaster-api-${ENVIRONMENT}.fly.dev"
    local frontend_url="https://wemaster-admin-${ENVIRONMENT}.vercel.app"
    
    # API 健康检查
    log "验证 API 健康状态..."
    if curl -f -s "$api_url/healthz" &> /dev/null; then
        log_success "API 健康检查通过"
    else
        log_error "API 健康检查失败"
        return 1
    fi
    
    # 数据库连接检查
    log "验证数据库连接..."
    if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        log_success "数据库连接正常"
    else
        log_error "数据库连接异常"
        return 1
    fi
    
    # Redis 连接检查
    log "验证 Redis 连接..."
    if redis-cli -u "$REDIS_URL" ping &> /dev/null; then
        log_success "Redis 连接正常"
    else
        log_error "Redis 连接异常"
        return 1
    fi
    
    # 前端访问检查
    log "验证前端访问..."
    if curl -f -s "$frontend_url" &> /dev/null; then
        log_success "前端访问正常"
    else
        log_error "前端访问异常"
        return 1
    fi
    
    # 基础功能测试
    log "执行基础功能测试..."
    if /Volumes/BankChen/wemaster/scripts/smoke-test.sh "$ENVIRONMENT"; then
        log_success "基础功能测试通过"
    else
        log_warning "基础功能测试失败，需要人工检查"
    fi
    
    log_success "回滚验证完成"
}

# 发送通知
send_notification() {
    local status=$1
    local message="WeMaster $ENVIRONMENT 环境回滚$status"
    
    # 发送 Slack 通知 (如果配置了)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" &> /dev/null
    fi
    
    # 发送邮件通知 (如果配置了)
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "WeMaster 回滚通知" "$NOTIFICATION_EMAIL" &> /dev/null
    fi
    
    log "通知已发送: $message"
}

# 主函数
main() {
    log "开始 WeMaster $ENVIRONMENT 环境回滚..."
    log "回滚版本: $BACKUP_VERSION"
    log "备份目录: $BACKUP_DIR"
    
    # 记录回滚开始
    send_notification "开始"
    
    # 执行回滚步骤
    check_prerequisites
    backup_current_state
    rollback_database
    rollback_backend
    rollback_frontend
    rollback_config
    clear_cache
    
    # 验证回滚结果
    if verify_rollback; then
        log_success "回滚成功完成"
        send_notification "成功"
        
        # 生成回滚报告
        echo "回滚完成时间: $(date)" > "$BACKUP_DIR/rollback-report.txt"
        echo "回滚版本: $BACKUP_VERSION" >> "$BACKUP_DIR/rollback-report.txt"
        echo "环境: $ENVIRONMENT" >> "$BACKUP_DIR/rollback-report.txt"
        echo "状态: 成功" >> "$BACKUP_DIR/rollback-report.txt"
        
        exit 0
    else
        log_error "回滚验证失败"
        send_notification "失败"
        exit 1
    fi
}

# 错误处理
trap 'log_error "回滚过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"
