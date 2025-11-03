#!/bin/bash

# Doppler 配置验证脚本
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

# 验证结果
PASSED=0
FAILED=0
WARNINGS=0

# 验证函数
validate() {
    local test_name="$1"
    local test_command="$2"
    
    log_info "验证: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "✓ $test_name"
        ((PASSED++))
        return 0
    else
        log_error "✗ $test_name"
        ((FAILED++))
        return 1
    fi
}

# 警告验证函数
validate_warning() {
    local test_name="$1"
    local test_command="$2"
    
    log_info "验证: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "✓ $test_name"
        ((PASSED++))
        return 0
    else
        log_warning "⚠ $test_name"
        ((WARNINGS++))
        return 1
    fi
}

echo "==============================================="
echo "WeMaster Doppler 配置验证"
echo "==============================================="
echo ""

# 1. 检查 Doppler CLI 安装
validate "Doppler CLI 安装" "command -v doppler"

# 2. 检查配置文件存在性
validate ".env.doppler 文件存在" "test -f .env.doppler"
validate "vercel.env.json 文件存在" "test -f vercel.env.json"
validate "fly.toml 文件存在" "test -f fly.toml"
validate "wrangler.toml 文件存在" "test -f wrangler.toml"
validate "service-tokens.env 文件存在" "test -f service-tokens.env"

# 3. 检查脚本权限
validate "switch-env.sh 可执行" "test -x switch-env.sh"
validate "rollback-config.sh 可执行" "test -x rollback-config.sh"
validate "restore-config.sh 可执行" "test -x restore-config.sh"
validate "deploy-all.sh 可执行" "test -x deploy-all.sh"

# 4. 验证环境变量格式
validate_warning "DATABASE_URL 格式正确" "grep -q '^DATABASE_URL=postgresql://' .env.doppler"
validate_warning "REDIS_URL 格式正确" "grep -q '^REDIS_URL=redis://' .env.doppler"
validate_warning "JWT_SECRET 存在" "grep -q '^JWT_SECRET=' .env.doppler"
validate_warning "STRIPE_SECRET_KEY 存在" "grep -q '^STRIPE_SECRET_KEY=sk_test_' .env.doppler"

# 5. 验证 JSON 格式
validate_warning "vercel.env.json JSON 格式正确" "python3 -m json.tool vercel.env.json > /dev/null"

# 6. 验证 TOML 格式
validate_warning "fly.toml TOML 格式正确" "grep -q 'app = ' fly.toml"
validate_warning "wrangler.toml TOML 格式正确" "grep -q 'name = ' wrangler.toml"

# 7. 检查必需的密钥长度
validate_warning "JWT_SECRET 长度足够" "grep '^JWT_SECRET=' .env.doppler | cut -d'=' -f2 | wc -c | grep -q '^.[3-9][0-9]'"

# 8. 验证服务令牌
validate_warning "CONFIG_SERVICE_TOKEN 存在" "grep -q '^CONFIG_SERVICE_TOKEN=' .env.doppler"
validate_warning "API_SERVICE_TOKEN 存在" "grep -q '^API_SERVICE_TOKEN=' service-tokens.env"

# 9. 检查环境切换脚本
validate_warning "环境切换脚本语法正确" "bash -n switch-env.sh"
validate_warning "配置回滚脚本语法正确" "bash -n rollback-config.sh"
validate_warning "配置恢复脚本语法正确" "bash -n restore-config.sh"

# 10. 检查目录结构
validate "scripts 目录存在" "test -d scripts"
validate "docs 目录存在" "test -d docs"

echo ""
echo "==============================================="
echo "验证结果汇总"
echo "==============================================="
echo ""

# 统计结果
TOTAL=$((PASSED + FAILED + WARNINGS))

echo "总检查项: $TOTAL"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo -e "警告: ${YELLOW}$WARNINGS${NC}"
echo ""

# 成功率计算
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "成功率: $SUCCESS_RATE%"
else
    echo "成功率: N/A"
fi

echo ""

# 生成报告
if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        log_success "🎉 所有配置验证通过！"
        echo ""
        echo "下一步操作:"
        echo "1. 登录 Doppler: doppler login"
        echo "2. 创建项目: doppler setup"
        echo "3. 上传配置: doppler secrets upload .env.doppler --config test"
        echo "4. 测试环境: ./switch-env.sh test"
    else
        log_warning "⚠️ 配置基本就绪，但有警告需要关注"
        echo ""
        echo "建议操作:"
        echo "1. 检查警告项目并修复"
        echo "2. 运行: doppler login"
        echo "3. 创建并配置 Doppler 项目"
    fi
else
    log_error "❌ 配置验证失败，请修复错误项目"
    echo ""
    echo "必需操作:"
    echo "1. 修复所有失败项"
    echo "2. 重新运行验证脚本"
    echo "3. 确保所有配置正确后继续"
fi

echo ""
echo "==============================================="
echo "详细配置文件列表"
echo "==============================================="

# 列出所有配置文件
echo ""
echo "配置文件:"
ls -la .env.doppler vercel.env.json fly.toml wrangler.toml service-tokens.env 2>/dev/null || echo "部分配置文件缺失"

echo ""
echo "管理脚本:"
ls -la switch-env.sh rollback-config.sh restore-config.sh deploy-all.sh 2>/dev/null || echo "部分脚本缺失"

echo ""
echo "文档:"
ls -la docs/DOPPLER_SETUP_GUIDE.md 2>/dev/null || echo "文档缺失"

# 退出码
if [ $FAILED -gt 0 ]; then
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    exit 2
else
    exit 0
fi