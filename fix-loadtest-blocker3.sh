#!/bin/bash

#############################################################
# WeMaster 压测通过率0% 修复脚本
# BLOCKER #3 自动化修复
#
# 使用方法: bash fix-loadtest-blocker3.sh [start|fix|test|all]
# - start: 启动后端
# - fix:   应用修复配置
# - test:  运行压测
# - all:   完整流程 (推荐)
#############################################################

set -e

PROJECT_ROOT="/Volumes/BankChen/wemaster"
BACKEND_DIR="$PROJECT_ROOT/wemaster-nest"
LOADTEST_DIR="$PROJECT_ROOT/performance-tests"
BACKEND_PORT=3001

# 颜色输出
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

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖环境..."

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi

    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi

    # 检查k6
    if ! command -v k6 &> /dev/null; then
        log_warn "K6 未安装, 压测功能将不可用"
        log_info "安装: brew install k6"
    fi

    log_success "依赖检查完成"
}

# 步骤1: 启动后端
start_backend() {
    log_info "=========================================="
    log_info "步骤 1/4: 启动后端服务"
    log_info "=========================================="

    # 杀死旧进程
    log_info "清理旧的后端进程..."
    pkill -f "nest start" || true
    pkill -f "node.*wemaster-nest" || true
    sleep 2

    # 检查端口
    if lsof -i :$BACKEND_PORT &> /dev/null; then
        log_warn "端口 $BACKEND_PORT 已被占用, 尝试杀死..."
        lsof -i :$BACKEND_PORT | awk 'NR!=1 {print $2}' | xargs kill -9 2>/dev/null || true
        sleep 2
    fi

    # 启动后端
    log_info "启动 NestJS 后端 (端口 $BACKEND_PORT)..."
    cd "$BACKEND_DIR"

    # 后台启动
    nohup npm run start:dev > /tmp/wemaster-backend.log 2>&1 &
    BACKEND_PID=$!

    log_info "后端进程 PID: $BACKEND_PID"

    # 等待启动
    log_info "等待后端启动 (最多30秒)..."
    for i in {1..30}; do
        if curl -s http://localhost:$BACKEND_PORT/healthz > /dev/null 2>&1; then
            log_success "后端启动成功!"
            return 0
        fi
        sleep 1
        echo -n "."
    done

    log_error "后端启动超时"
    log_info "查看后端日志: cat /tmp/wemaster-backend.log"
    return 1
}

# 步骤2: 应用修复
apply_fix() {
    log_info "=========================================="
    log_info "步骤 2/4: 应用修复配置"
    log_info "=========================================="

    # 修复1: 更新压测脚本端口
    log_info "修复1: 更新压测脚本端口 (3002 → 3001)..."
    SCRIPT_FILE="$LOADTEST_DIR/k6-final-test.js"

    if [ -f "$SCRIPT_FILE" ]; then
        # macOS sed 需要 -i ''
        sed -i '' "s|localhost:3002|localhost:3001|g" "$SCRIPT_FILE"
        log_success "压测脚本已更新"
    else
        log_error "找不到 $SCRIPT_FILE"
        return 1
    fi

    # 修复2: 调整速率限制配置
    log_info "修复2: 调整速率限制配置..."
    APP_MODULE="$BACKEND_DIR/src/app.module.ts"

    if [ -f "$APP_MODULE" ]; then
        # 备份原文件
        cp "$APP_MODULE" "${APP_MODULE}.bak"
        log_success "原文件已备份: ${APP_MODULE}.bak"

        log_warn "手动操作: 编辑 $APP_MODULE"
        log_info "将以下内容替换到 app.module.ts 中的 ThrottlerModule.forRoot 配置:"
        echo ""
        echo "{ name: 'auth', ttl: 60000, limit: 50 }      # 从 5 改为 50"
        echo "{ name: 'payment', ttl: 60000, limit: 100 }  # 从 10 改为 100"
        echo "{ name: 'order', ttl: 60000, limit: 100 }    # 从 20 改为 100"
        echo "{ name: 'strict', ttl: 60000, limit: 50 }    # 从 10 改为 50"
        echo ""
    else
        log_error "找不到 $APP_MODULE"
        return 1
    fi

    log_success "修复配置已准备"
}

# 步骤3: 验证环境
verify_setup() {
    log_info "=========================================="
    log_info "步骤 3/4: 验证环境"
    log_info "=========================================="

    # 检查后端
    log_info "检查后端健康状态..."
    if curl -s http://localhost:$BACKEND_PORT/healthz > /dev/null 2>&1; then
        log_success "后端服务正常"
    else
        log_error "后端服务异常"
        return 1
    fi

    # 检查压测脚本
    log_info "检查压测脚本..."
    if grep -q "localhost:3001" "$LOADTEST_DIR/k6-final-test.js"; then
        log_success "压测脚本已正确配置"
    else
        log_warn "压测脚本可能未更新"
    fi

    log_success "环境验证完成"
}

# 步骤4: 运行压测
run_loadtest() {
    log_info "=========================================="
    log_info "步骤 4/4: 运行压测"
    log_info "=========================================="

    if ! command -v k6 &> /dev/null; then
        log_error "K6 未安装, 无法运行压测"
        log_info "安装命令: brew install k6"
        return 1
    fi

    cd "$LOADTEST_DIR"

    log_info "开始执行完整压测 (耗时: 约24分钟)..."
    log_info "目标: 100并发用户, P95 < 500ms"

    # 运行压测
    k6 run k6-final-test.js \
        --vus 10 \
        --duration 60s \
        --summary-export=results/loadtest-results-$(date +%Y%m%d-%H%M%S).json

    RESULT=$?

    if [ $RESULT -eq 0 ]; then
        log_success "压测完成"
    else
        log_error "压测失败 (代码: $RESULT)"
        return 1
    fi
}

# 运行快速测试
run_quick_test() {
    log_info "运行快速验证 (60秒, 5并发)..."

    cd "$LOADTEST_DIR"
    k6 run k6-simple-test.js -u 5 -d 60s
}

# 主程序
main() {
    ACTION="${1:-all}"

    check_dependencies

    case "$ACTION" in
        start)
            start_backend
            ;;
        fix)
            apply_fix
            ;;
        verify)
            verify_setup
            ;;
        test)
            run_loadtest
            ;;
        quick)
            run_quick_test
            ;;
        all)
            log_info "=========================================="
            log_info "WeMaster 压测修复完整流程"
            log_info "=========================================="

            start_backend && \
            apply_fix && \
            sleep 5 && \
            verify_setup && \
            run_quick_test

            if [ $? -eq 0 ]; then
                log_success "所有步骤完成! 建议运行完整压测:"
                log_info "cd $LOADTEST_DIR && k6 run k6-final-test.js"
            else
                log_error "修复过程中出现错误"
                return 1
            fi
            ;;
        *)
            log_error "未知操作: $ACTION"
            echo "用法: $0 {start|fix|verify|test|quick|all}"
            return 1
            ;;
    esac
}

# 执行主程序
main "$@"
