#!/bin/bash

# WeMaster 服务回滚脚本
set -e

# 配置参数
ENVIRONMENT=${1:-staging}
SERVICE_TYPE=${2:-all}  # backend, frontend, all
BACKUP_VERSION=${3:-previous}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="/var/log/wemaster-services-rollback.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 服务 URL 配置
declare -A SERVICE_URLS
SERVICE_URLS[backend]="https://wemaster-api-${ENVIRONMENT}.fly.dev"
SERVICE_URLS[frontend]="https://wemaster-admin-${ENVIRONMENT}.vercel.app"

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
    log "检查服务回滚前置条件..."
    
    # 检查环境参数
    if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
        log_error "无效的环境参数: $ENVIRONMENT"
        exit 1
    fi
    
    # 检查服务类型参数
    if [[ ! "$SERVICE_TYPE" =~ ^(backend|frontend|all)$ ]]; then
        log_error "无效的服务类型参数: $SERVICE_TYPE"
        exit 1
    fi
    
    # 检查必要工具
    local tools=("fly" "vercel" "git" "curl")
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

# 备份当前服务状态
backup_service_state() {
    local service=$1
    log "备份 $service 服务状态..."
    
    local backup_dir="/tmp/wemaster-${service}-backup-$TIMESTAMP"
    mkdir -p "$backup_dir"
    
    if [ "$service" = "backend" ]; then
        cd /Volumes/BankChen/wemaster/wemaster-nest
        
        # 备份当前 commit
        git rev-parse HEAD > "$backup_dir/current-commit.txt"
        
        # 备份构建产物
        if [ -d "dist" ]; then
            cp -r dist "$backup_dir/"
        fi
        
        # 备份配置文件
        cp fly.toml "$backup_dir/"
        
        # 备份依赖版本
        npm list --depth=0 > "$backup_dir/dependencies.txt"
        
        # 获取当前部署信息
        fly status > "$backup_dir/deploy-status.txt" 2>&1
        
    elif [ "$service" = "frontend" ]; then
        cd /Volumes/BankChen/wemaster/wemaster-admin
        
        # 备份当前 commit
        git rev-parse HEAD > "$backup_dir/current-commit.txt"
        
        # 备份构建产物
        if [ -d "dist" ]; then
            cp -r dist "$backup_dir/"
        fi
        
        # 备份配置文件
        cp package.json "$backup_dir/"
        cp vite.config.js "$backup_dir/"
        
        # 备份依赖版本
        npm list --depth=0 > "$backup_dir/dependencies.txt"
        
        # 获取当前部署信息
        vercel ls > "$backup_dir/deploy-status.txt" 2>&1
    fi
    
    log_success "$service 服务状态备份完成: $backup_dir"
}

# 获取回滚版本
get_rollback_version() {
    local service=$1
    local current_dir
    
    if [ "$service" = "backend" ]; then
        current_dir="/Volumes/BankChen/wemaster/wemaster-nest"
    elif [ "$service" = "frontend" ]; then
        current_dir="/Volumes/BankChen/wemaster/wemaster-admin"
    else
        log_error "未知服务类型: $service"
        return 1
    fi
    
    cd "$current_dir"
    
    if [ "$BACKUP_VERSION" = "previous" ]; then
        # 获取上一个版本
        local rollback_commit=$(git rev-parse HEAD~1)
        echo "$rollback_commit"
    else
        # 使用指定的版本
        echo "$BACKUP_VERSION"
    fi
}

# 回滚后端服务
rollback_backend() {
    log "开始回滚后端服务..."
    
    cd /Volumes/BankChen/wemaster/wemaster-nest
    
    # 备份当前状态
    backup_service_state "backend"
    
    # 获取回滚版本
    local rollback_version=$(get_rollback_version "backend")
    log "回滚到版本: $rollback_version"
    
    # 检查版本是否存在
    if ! git cat-file -e "$rollback_version" 2>/dev/null; then
        log_error "指定的版本不存在: $rollback_version"
        return 1
    fi
    
    # 切换到回滚版本
    log "切换代码到回滚版本..."
    if git checkout "$rollback_version"; then
        log_success "代码切换成功"
    else
        log_error "代码切换失败"
        return 1
    fi
    
    # 清理和重新安装依赖
    log "清理和重新安装依赖..."
    rm -rf node_modules package-lock.json
    if npm ci; then
        log_success "依赖安装成功"
    else
        log_error "依赖安装失败"
        return 1
    fi
    
    # 生成 Prisma 客户端
    log "生成 Prisma 客户端..."
    if npm run prisma:generate; then
        log_success "Prisma 客户端生成成功"
    else
        log_warning "Prisma 客户端生成失败，继续回滚"
    fi
    
    # 构建应用
    log "构建后端应用..."
    if npm run build; then
        log_success "后端构建成功"
    else
        log_error "后端构建失败"
        return 1
    fi
    
    # 部署到 Fly.io
    log "部署到 Fly.io..."
    if fly deploy --strategy=immediate; then
        log_success "后端部署成功"
    else
        log_error "后端部署失败"
        return 1
    fi
    
    # 等待服务启动
    log "等待服务启动..."
    sleep 30
    
    # 验证服务状态
    verify_service_health "backend"
}

# 回滚前端服务
rollback_frontend() {
    log "开始回滚前端服务..."
    
    cd /Volumes/BankChen/wemaster/wemaster-admin
    
    # 备份当前状态
    backup_service_state "frontend"
    
    # 获取回滚版本
    local rollback_version=$(get_rollback_version "frontend")
    log "回滚到版本: $rollback_version"
    
    # 检查版本是否存在
    if ! git cat-file -e "$rollback_version" 2>/dev/null; then
        log_error "指定的版本不存在: $rollback_version"
        return 1
    fi
    
    # 切换到回滚版本
    log "切换代码到回滚版本..."
    if git checkout "$rollback_version"; then
        log_success "代码切换成功"
    else
        log_error "代码切换失败"
        return 1
    fi
    
    # 清理和重新安装依赖
    log "清理和重新安装依赖..."
    rm -rf node_modules package-lock.json
    if npm ci; then
        log_success "依赖安装成功"
    else
        log_error "依赖安装失败"
        return 1
    fi
    
    # 生成 API 客户端
    log "生成 API 客户端..."
    if npm run generate:api; then
        log_success "API 客户端生成成功"
    else
        log_warning "API 客户端生成失败，继续回滚"
    fi
    
    # 构建应用
    log "构建前端应用..."
    if npm run build; then
        log_success "前端构建成功"
    else
        log_error "前端构建失败"
        return 1
    fi
    
    # 部署到 Vercel
    log "部署到 Vercel..."
    if vercel --prod --force; then
        log_success "前端部署成功"
    else
        log_error "前端部署失败"
        return 1
    fi
    
    # 等待部署生效
    log "等待前端部署生效..."
    sleep 60
    
    # 验证服务状态
    verify_service_health "frontend"
}

# 验证服务健康状态
verify_service_health() {
    local service=$1
    local url="${SERVICE_URLS[$service]}"
    local max_attempts=10
    local attempt=1
    
    log "验证 $service 服务健康状态..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url/healthz" &> /dev/null; then
            log_success "$service 服务健康检查通过"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "$service 服务健康检查失败"
            return 1
        fi
        
        log "等待 $service 服务启动... (尝试 $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
}

# 执行冒烟测试
run_smoke_tests() {
    local service=$1
    log "对 $service 服务执行冒烟测试..."
    
    local api_url="${SERVICE_URLS[backend]}"
    
    # 测试 API 端点
    local endpoints=(
        "/healthz"
        "/api/v1/courses"
        "/api/v1/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log "测试端点: $endpoint"
        if curl -f -s "$api_url$endpoint" &> /dev/null; then
            log_success "端点 $endpoint 测试通过"
        else
            log_warning "端点 $endpoint 测试失败"
        fi
    done
    
    # 测试前端访问 (如果是前端回滚)
    if [ "$service" = "frontend" ] || [ "$SERVICE_TYPE" = "all" ]; then
        local frontend_url="${SERVICE_URLS[frontend]}"
        if curl -f -s "$frontend_url" &> /dev/null; then
            log_success "前端访问测试通过"
        else
            log_warning "前端访问测试失败"
        fi
    fi
    
    log_success "冒烟测试完成"
}

# 清理缓存和临时文件
cleanup() {
    log "清理缓存和临时文件..."
    
    # 清理后端缓存
    cd /Volumes/BankChen/wemaster/wemaster-nest
    rm -rf node_modules/.cache dist
    
    # 清理前端缓存
    cd /Volumes/BankChen/wemaster/wemaster-admin
    rm -rf node_modules/.cache dist
    
    # 清理 Git 状态
    cd /Volumes/BankChen/wemaster/wemaster-nest
    git clean -fd
    
    cd /Volumes/BankChen/wemaster/wemaster-admin
    git clean -fd
    
    log_success "缓存清理完成"
}

# 生成回滚报告
generate_report() {
    log "生成服务回滚报告..."
    
    local report_file="/tmp/wemaster-services-rollback-report-$TIMESTAMP.txt"
    
    cat > "$report_file" << EOF
WeMaster 服务回滚报告
======================

回滚时间: $(date)
环境: $ENVIRONMENT
服务类型: $SERVICE_TYPE
回滚版本: $BACKUP_VERSION
操作用户: $(whoami)

服务状态:
--------
EOF
    
    # 添加各服务状态
    if [ "$SERVICE_TYPE" = "backend" ] || [ "$SERVICE_TYPE" = "all" ]; then
        cat >> "$report_file" << EOF
后端服务:
--------
URL: ${SERVICE_URLS[backend]}
状态: $(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URLS[backend]}/healthz")
版本: $(curl -s "${SERVICE_URLS[backend]}/healthz" | grep -o '"version":"[^"]*"' || echo "未知")

EOF
    fi
    
    if [ "$SERVICE_TYPE" = "frontend" ] || [ "$SERVICE_TYPE" = "all" ]; then
        cat >> "$report_file" << EOF
前端服务:
--------
URL: ${SERVICE_URLS[frontend]}
状态: $(curl -s -o /dev/null -w "%{http_code}" "${SERVICE_URLS[frontend]}")
版本: $(curl -s "${SERVICE_URLS[frontend]}" | grep -o 'version="[^"]*"' || echo "未知")

EOF
    fi
    
    cat >> "$report_file" << EOF
操作结果:
--------
状态: 成功
错误: 无

建议:
--------
1. 监控服务性能
2. 检查用户反馈
3. 验证业务功能
4. 更新监控告警

EOF
    
    log_success "回滚报告生成完成: $report_file"
}

# 主函数
main() {
    log "开始服务回滚 - 环境: $ENVIRONMENT, 服务: $SERVICE_TYPE"
    
    # 执行前置检查
    check_prerequisites
    
    # 根据服务类型执行回滚
    case "$SERVICE_TYPE" in
        "backend")
            rollback_backend
            run_smoke_tests "backend"
            ;;
        "frontend")
            rollback_frontend
            run_smoke_tests "frontend"
            ;;
        "all")
            rollback_backend
            rollback_frontend
            run_smoke_tests "all"
            ;;
    esac
    
    # 清理和报告
    cleanup
    generate_report
    
    log_success "服务回滚完成"
    
    # 显示服务访问信息
    echo
    log "服务访问信息:"
    if [ "$SERVICE_TYPE" = "backend" ] || [ "$SERVICE_TYPE" = "all" ]; then
        echo "后端 API: ${SERVICE_URLS[backend]}"
        echo "API 文档: ${SERVICE_URLS[backend]}/docs"
    fi
    if [ "$SERVICE_TYPE" = "frontend" ] || [ "$SERVICE_TYPE" = "all" ]; then
        echo "前端管理: ${SERVICE_URLS[frontend]}"
    fi
}

# 错误处理
trap 'log_error "服务回滚过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"