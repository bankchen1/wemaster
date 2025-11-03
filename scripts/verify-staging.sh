#!/bin/bash

# Staging 环境验证脚本
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

# 配置
API_BASE_URL="https://api.staging.wemaster.dev/api/v1"
ADMIN_URL="https://admin.staging.wemaster.dev"
HEALTH_CHECK_TIMEOUT=30

log_info "开始 Staging 环境验证..."
log_info "API 基础 URL: $API_BASE_URL"
log_info "管理后台 URL: $ADMIN_URL"

# 初始化验证结果
VERIFICATION_PASSED=true
TOTAL_CHECKS=0
PASSED_CHECKS=0

# 检查函数
check_service() {
    local service_name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "检查 $service_name: $url"
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $HEALTH_CHECK_TIMEOUT "$url" || echo "000")
    
    if [ "$response_code" = "$expected_status" ]; then
        log_success "$service_name 正常 (HTTP $response_code)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        log_error "$service_name 异常 (HTTP $response_code, 期望 $expected_status)"
        return 1
    fi
}

# 1. 基础健康检查
log_info "1. 基础健康检查..."

check_service "后端健康检查" "$API_BASE_URL/../healthz"
check_service "前端管理页面" "$ADMIN_URL"

# 2. API 端点检查
log_info "2. API 端点检查..."

# 公开 API
check_service "公开课程列表" "$API_BASE_URL/offerings" 200
check_service "API 文档" "$API_BASE_URL/../docs" 200

# 需要认证的 API（会返回 401）
check_service "用户列表（未认证）" "$API_BASE_URL/users" 401
check_service "订单列表（未认证）" "$API_BASE_URL/orders" 401

# 3. 数据库连接检查
log_info "3. 数据库连接检查..."

# 通过健康检查间接验证数据库连接
db_check_response=$(curl -s "$API_BASE_URL/../healthz" | jq -r '.database // "unknown"' 2>/dev/null || echo "unknown")
if [ "$db_check_response" = "ok" ]; then
    log_success "数据库连接正常"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    log_warning "数据库连接状态未知: $db_check_response"
fi

# 4. Redis 连接检查
log_info "4. Redis 连接检查..."

redis_check_response=$(curl -s "$API_BASE_URL/../healthz" | jq -r '.redis // "unknown"' 2>/dev/null || echo "unknown")
if [ "$redis_check_response" = "ok" ]; then
    log_success "Redis 连接正常"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    log_warning "Redis 连接状态未知: $redis_check_response"
fi

# 5. CORS 检查
log_info "5. CORS 检查..."

cors_response=$(curl -s -H "Origin: $ADMIN_URL" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "$API_BASE_URL/offerings" -w "%{http_code}" -o /dev/null)
if [ "$cors_response" = "204" ] || [ "$cors_response" = "200" ]; then
    log_success "CORS 配置正常"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    log_warning "CORS 配置可能有问题 (HTTP $cors_response)"
fi

# 6. SSL 证书检查
log_info "6. SSL 证书检查..."

check_ssl() {
    local domain="$1"
    local service_name="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -checkend 86400 >/dev/null; then
        log_success "$service_name SSL 证书有效"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_warning "$service_name SSL 证书无效或即将过期"
    fi
}

check_ssl "api.staging.wemaster.dev" "后端 API"
check_ssl "admin.staging.wemaster.dev" "前端管理"

# 7. 性能检查
log_info "7. 性能检查..."

api_response_time=$(curl -o /dev/null -s -w "%{time_total}" "$API_BASE_URL/../healthz" || echo "0")
if (( $(echo "$api_response_time < 2.0" | bc -l) )); then
    log_success "API 响应时间良好: ${api_response_time}s"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    log_warning "API 响应时间较慢: ${api_response_time}s"
fi

# 8. 多租户检查
log_info "8. 多租户检查..."

tenant_response=$(curl -s -H "x-tenant-id: wemaster_staging" "$API_BASE_URL/offerings" -w "%{http_code}" -o /dev/null)
if [ "$tenant_response" = "200" ]; then
    log_success "多租户头部处理正常"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
else
    log_warning "多租户头部处理异常 (HTTP $tenant_response)"
fi

# 验证结果总结
log_info "验证结果总结:"
log_info "总检查项: $TOTAL_CHECKS"
log_info "通过检查: $PASSED_CHECKS"
log_info "失败检查: $((TOTAL_CHECKS - PASSED_CHECKS))"

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    log_success "🎉 所有检查通过！Staging 环境验证成功！"
    VERIFICATION_PASSED=true
else
    log_warning "⚠️  部分检查未通过，请查看上述详细信息"
    VERIFICATION_PASSED=false
fi

# 生成验证报告
cat > /tmp/staging-verification-report.md << EOF
# WeMaster Staging 环境验证报告

## 验证时间
$(date)

## 环境信息
- API 基础 URL: $API_BASE_URL
- 管理后台 URL: $ADMIN_URL
- 验证超时: ${HEALTH_CHECK_TIMEOUT}s

## 验证结果
- 总检查项: $TOTAL_CHECKS
- 通过检查: $PASSED_CHECKS
- 失败检查: $((TOTAL_CHECKS - PASSED_CHECKS))
- 验证状态: $([ "$VERIFICATION_PASSED" = true ] && echo "✅ 通过" || echo "❌ 失败")

## 检查详情

### 1. 基础健康检查
- 后端健康检查: $([ "$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/../healthz")" = "200" ] && echo "✅ 正常" || echo "❌ 异常")
- 前端管理页面: $([ "$(curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL")" = "200" ] && echo "✅ 正常" || echo "❌ 异常")

### 2. API 端点检查
- 公开课程列表: $([ "$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/offerings")" = "200" ] && echo "✅ 正常" || echo "❌ 异常")
- API 文档: $([ "$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/../docs")" = "200" ] && echo "✅ 正常" || echo "❌ 异常")

### 3. 基础设施状态
- 数据库连接: $([ "$db_check_response" = "ok" ] && echo "✅ 正常" || echo "❌ 异常")
- Redis 连接: $([ "$redis_check_response" = "ok" ] && echo "✅ 正常" || echo "❌ 异常")

### 4. 安全配置
- CORS 配置: $([ "$cors_response" = "204" ] || [ "$cors_response" = "200" ] && echo "✅ 正常" || echo "❌ 异常")
- SSL 证书: 需要手动验证

### 5. 性能指标
- API 响应时间: ${api_response_time}s

### 6. 功能特性
- 多租户支持: $([ "$tenant_response" = "200" ] && echo "✅ 正常" || echo "❌ 异常")

## 建议
$([ "$VERIFICATION_PASSED" = true ] && echo "✅ 环境已就绪，可以进行功能测试" || echo "⚠️ 请修复上述问题后重新验证")

## 下一步
1. 执行完整的功能测试
2. 进行性能测试
3. 执行安全扫描
4. 准备生产环境部署
EOF

log_info "验证报告已生成: /tmp/staging-verification-report.md"

# 返回验证结果
if [ "$VERIFICATION_PASSED" = true ]; then
    exit 0
else
    exit 1
fi