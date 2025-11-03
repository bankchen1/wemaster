#!/bin/bash

# WeMaster 基础设施验证脚本
# 验证所有服务是否正常运行

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 命令未找到，请先安装"
        return 1
    fi
    return 0
}

# 检查 HTTP 端点
check_http_endpoint() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    log_info "检查 $name: $url"
    
    if curl -f -s -m $timeout "$url" > /dev/null 2>&1; then
        log_success "$name 响应正常"
        return 0
    else
        log_error "$name 无响应或返回错误"
        return 1
    fi
}

# 检查 DNS 解析
check_dns_resolution() {
    local domain=$1
    local name=$2
    
    log_info "检查 $name DNS 解析: $domain"
    
    if nslookup "$domain" > /dev/null 2>&1; then
        local ip=$(nslookup "$domain" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
        log_success "$name DNS 解析成功: $ip"
        return 0
    else
        log_error "$name DNS 解析失败"
        return 1
    fi
}

# 检查数据库连接
check_database_connection() {
    local db_url=$1
    
    log_info "检查数据库连接..."
    
    # 使用 psql 检查连接（如果可用）
    if command -v psql &> /dev/null; then
        if psql "$db_url" -c "SELECT 1;" > /dev/null 2>&1; then
            log_success "数据库连接正常"
            return 0
        else
            log_error "数据库连接失败"
            return 1
        fi
    else
        log_warning "psql 未安装，跳过数据库连接检查"
        return 0
    fi
}

# 检查 Redis 连接
check_redis_connection() {
    local redis_url=$1
    local redis_token=$2
    
    log_info "检查 Redis 连接..."
    
    # 提取 Redis 主机名
    local redis_host=$(echo "$redis_url" | sed 's|https://||' | cut -d'/' -f1)
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli -u "$redis_url" -a "$redis_token" ping > /dev/null 2>&1; then
            log_success "Redis 连接正常"
            return 0
        else
            log_error "Redis 连接失败"
            return 1
        fi
    else
        log_warning "redis-cli 未安装，跳过 Redis 连接检查"
        return 0
    fi
}

# 主验证函数
main() {
    cd "$(dirname "$0")"
    
    log_info "开始验证 WeMaster 基础设施..."
    
    # 检查必要的命令
    check_command curl || exit 1
    check_command jq || exit 1
    check_command nslookup || exit 1
    
    # 检查 Terraform 状态
    if [ ! -f "terraform.tfstate" ]; then
        log_error "未找到 terraform.tfstate 文件，请先运行部署"
        exit 1
    fi
    
    # 获取 Terraform 输出
    log_info "获取基础设施配置信息..."
    
    local admin_url=$(terraform output -raw vercel_admin_url 2>/dev/null || echo "")
    local api_url=$(terraform output -json application_urls 2>/dev/null | jq -r '.api_gateway' || echo "")
    local backend_url=$(terraform output -json application_urls 2>/dev/null | jq -r '.backend_direct' || echo "")
    local db_url=$(terraform output -raw neon_database_url 2>/dev/null || echo "")
    local redis_url=$(terraform output -json redis_config 2>/dev/null | jq -r '.url' || echo "")
    local redis_token=$(terraform output -json redis_config 2>/dev/null | jq -r '.token' || echo "")
    
    # 验证结果统计
    local total_checks=0
    local passed_checks=0
    
    # 检查 DNS 解析
    echo ""
    log_info "=== DNS 解析检查 ==="
    
    if [ ! -z "$admin_url" ]; then
        ((total_checks++))
        local admin_domain=$(echo "$admin_url" | sed 's|https://||')
        if check_dns_resolution "$admin_domain" "管理后台"; then
            ((passed_checks++))
        fi
    fi
    
    if [ ! -z "$api_url" ]; then
        ((total_checks++))
        local api_domain=$(echo "$api_url" | sed 's|https://||')
        if check_dns_resolution "$api_domain" "API 网关"; then
            ((passed_checks++))
        fi
    fi
    
    # 检查 HTTP 端点
    echo ""
    log_info "=== HTTP 端点检查 ==="
    
    if [ ! -z "$api_url" ]; then
        ((total_checks++))
        if check_http_endpoint "$api_url/healthz" "API 健康检查"; then
            ((passed_checks++))
        fi
    fi
    
    if [ ! -z "$backend_url" ]; then
        ((total_checks++))
        if check_http_endpoint "$backend_url/healthz" "后端服务"; then
            ((passed_checks++))
        fi
    fi
    
    if [ ! -z "$admin_url" ]; then
        ((total_checks++))
        if check_http_endpoint "$admin_url" "管理后台"; then
            ((passed_checks++))
        fi
    fi
    
    # 检查数据库连接
    echo ""
    log_info "=== 数据库连接检查 ==="
    
    if [ ! -z "$db_url" ]; then
        ((total_checks++))
        if check_database_connection "$db_url"; then
            ((passed_checks++))
        fi
    fi
    
    # 检查 Redis 连接
    echo ""
    log_info "=== Redis 连接检查 ==="
    
    if [ ! -z "$redis_url" ] && [ ! -z "$redis_token" ]; then
        ((total_checks++))
        if check_redis_connection "$redis_url" "$redis_token"; then
            ((passed_checks++))
        fi
    fi
    
    # 显示验证结果
    echo ""
    log_info "=== 验证结果汇总 ==="
    echo "总检查项: $total_checks"
    echo "通过检查: $passed_checks"
    echo "失败检查: $((total_checks - passed_checks))"
    
    if [ $passed_checks -eq $total_checks ]; then
        log_success "所有检查通过！基础设施运行正常"
        exit 0
    else
        log_warning "部分检查失败，请检查相关服务"
        exit 1
    fi
}

# 运行主函数
main "$@"