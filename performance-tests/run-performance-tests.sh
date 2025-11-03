#!/bin/bash

# WeMaster Platform - Performance Testing Script
# M5-4 压力测试：生产级负载验证

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
TEST_DIR="/Volumes/BankChen/wemaster/performance-tests"
RESULTS_DIR="${TEST_DIR}/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="${RESULTS_DIR}/${TIMESTAMP}"

# 服务地址
BACKEND_URL="http://localhost:3002"
FRONTEND_URL="http://localhost:5173"

# 创建报告目录
mkdir -p "${REPORT_DIR}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WeMaster Platform - Performance Testing${NC}"
echo -e "${BLUE}M5-4: 压力测试验证${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查工具是否安装
check_dependencies() {
    echo -e "${YELLOW}检查依赖工具...${NC}"
    
    if ! command -v k6 &> /dev/null; then
        echo -e "${RED}❌ K6 未安装，请先安装 K6: brew install k6${NC}"
        exit 1
    fi
    
    if ! command -v artillery &> /dev/null; then
        echo -e "${YELLOW}⚠️  Artillery 未安装，将跳过 Artillery 测试${NC}"
        ARTILLERY_AVAILABLE=false
    else
        ARTILLERY_AVAILABLE=true
    fi
    
    echo -e "${GREEN}✅ 依赖检查完成${NC}"
}

# 检查服务状态
check_services() {
    echo -e "${YELLOW}检查服务状态...${NC}"
    
    # 检查后端服务
    if curl -s "${BACKEND_URL}/healthz" > /dev/null; then
        echo -e "${GREEN}✅ 后端服务运行正常${NC}"
    else
        echo -e "${RED}❌ 后端服务未运行，请启动后端服务${NC}"
        exit 1
    fi
    
    # 检查前端服务（可选）
    if curl -s "${FRONTEND_URL}" > /dev/null; then
        echo -e "${GREEN}✅ 前端服务运行正常${NC}"
        FRONTEND_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠️  前端服务未运行，将跳过前端测试${NC}"
        FRONTEND_AVAILABLE=false
    fi
}

# 准备测试数据
prepare_test_data() {
    echo -e "${YELLOW}准备测试数据...${NC}"
    
    # 进入后端目录
    cd /Volumes/BankChen/wemaster/wemaster-nest
    
    # 检查数据库连接
    if npm run prisma:generate > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        exit 1
    fi
    
    # 创建测试用户（如果需要）
    echo -e "${YELLOW}创建测试数据...${NC}"
    # 这里可以添加创建测试用户的逻辑
    
    cd ..
}

# 执行 K6 API 负载测试
run_k6_api_test() {
    echo -e "${BLUE}执行 K6 API 负载测试...${NC}"
    
    cd "${TEST_DIR}"
    
    k6 run \
        --out json="${REPORT_DIR}/k6-api-results.json" \
        --summary-export="${REPORT_DIR}/k6-api-summary.json" \
        load-test-api.js
    
    echo -e "${GREEN}✅ API 负载测试完成${NC}"
}

# 执行 K6 数据库压力测试
run_k6_db_test() {
    echo -e "${BLUE}执行 K6 数据库压力测试...${NC}"
    
    cd "${TEST_DIR}"
    
    k6 run \
        --out json="${REPORT_DIR}/k6-db-results.json" \
        --summary-export="${REPORT_DIR}/k6-db-summary.json" \
        db-stress-test.js
    
    echo -e "${GREEN}✅ 数据库压力测试完成${NC}"
}

# 执行 K6 前端性能测试
run_k6_frontend_test() {
    if [ "$FRONTEND_AVAILABLE" = true ]; then
        echo -e "${BLUE}执行 K6 前端性能测试...${NC}"
        
        cd "${TEST_DIR}"
        
        k6 run \
            --out json="${REPORT_DIR}/k6-frontend-results.json" \
            --summary-export="${REPORT_DIR}/k6-frontend-summary.json" \
            frontend-load-test.js
        
        echo -e "${GREEN}✅ 前端性能测试完成${NC}"
    else
        echo -e "${YELLOW}⚠️  跳过前端性能测试${NC}"
    fi
}

# 执行系统极限测试
run_k6_system_test() {
    echo -e "${BLUE}执行系统极限测试...${NC}"
    
    cd "${TEST_DIR}"
    
    k6 run \
        --out json="${REPORT_DIR}/k6-system-results.json" \
        --summary-export="${REPORT_DIR}/k6-system-summary.json" \
        system-limit-test.js
    
    echo -e "${GREEN}✅ 系统极限测试完成${NC}"
}

# 执行 Artillery 测试
run_artillery_test() {
    if [ "$ARTILLERY_AVAILABLE" = true ]; then
        echo -e "${BLUE}执行 Artillery 负载测试...${NC}"
        
        cd "${TEST_DIR}"
        
        artillery run artillery-config.yml --output "${REPORT_DIR}/artillery-results.json"
        
        # 生成 HTML 报告
        artillery report "${REPORT_DIR}/artillery-results.json" --output "${REPORT_DIR}/artillery-report.html"
        
        echo -e "${GREEN}✅ Artillery 测试完成${NC}"
    else
        echo -e "${YELLOW}⚠️  跳过 Artillery 测试${NC}"
    fi
}

# 收集系统指标
collect_system_metrics() {
    echo -e "${YELLOW}收集系统指标...${NC}"
    
    # CPU 和内存使用情况
    top -l 1 -n 10 | head -n 10 > "${REPORT_DIR}/system-metrics.txt"
    
    # 磁盘使用情况
    df -h >> "${REPORT_DIR}/system-metrics.txt"
    
    # 网络连接情况
    netstat -an | grep :3001 | wc -l > "${REPORT_DIR}/connection-count.txt"
    
    # 数据库连接数
    cd /Volumes/BankChen/wemaster/wemaster-nest
    if command -v psql &> /dev/null; then
        psql -c "SELECT count(*) as active_connections FROM pg_stat_activity;" >> "${REPORT_DIR}/db-connections.txt" 2>/dev/null || echo "无法获取数据库连接信息" > "${REPORT_DIR}/db-connections.txt"
    fi
    
    echo -e "${GREEN}✅ 系统指标收集完成${NC}"
}

# 生成综合报告
generate_report() {
    echo -e "${BLUE}生成综合性能测试报告...${NC}"
    
    cat > "${REPORT_DIR}/performance-test-report.md" << EOF
# WeMaster Platform - 性能测试报告

## 测试概述

- **测试时间**: $(date)
- **测试环境**: Staging
- **后端地址**: ${BACKEND_URL}
- **前端地址**: ${FRONTEND_URL}

## 测试项目

### 1. API 负载测试
- **测试工具**: K6
- **测试场景**: 正常负载到高并发
- **目标**: 验证 API 在 1000+ 并发用户下的性能

### 2. 数据库压力测试
- **测试工具**: K6
- **测试场景**: 高频读写操作
- **目标**: 验证数据库连接池和查询性能

### 3. 前端性能测试
- **测试工具**: K6
- **测试场景**: 页面加载和资源加载
- **目标**: 验证前端在高并发下的响应速度

### 4. 系统极限测试
- **测试工具**: K6
- **测试场景**: 极限负载测试 (5000+ 并发)
- **目标**: 验证系统极限和恢复能力

## 测试结果

详细的测试结果请查看以下文件：
- K6 API 测试报告: k6-api-report.html
- K6 数据库测试报告: k6-db-report.html
- K6 前端测试报告: k6-frontend-report.html
- K6 系统测试报告: k6-system-report.html
- Artillery 测试报告: artillery-report.html

## 性能指标

### 响应时间基准
- API 平均响应时间: < 500ms
- 数据库查询时间: < 800ms
- 页面加载时间: < 2000ms

### 并发能力
- 目标并发用户: 1000+
- 系统极限测试: 5000+

### 错误率
- 正常负载错误率: < 10%
- 极限负载错误率: < 30%

## 系统资源

测试期间的系统资源使用情况请查看：
- system-metrics.txt
- connection-count.txt
- db-connections.txt

## 建议和优化

基于测试结果的性能优化建议将在测试完成后补充。

EOF

    echo -e "${GREEN}✅ 综合报告生成完成${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}开始执行 WeMaster 平台性能测试...${NC}"
    
    check_dependencies
    check_services
    prepare_test_data
    
    run_k6_api_test
    run_k6_db_test
    run_k6_frontend_test
    run_k6_system_test
    run_artillery_test
    
    collect_system_metrics
    generate_report
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✅ 性能测试完成！${NC}"
    echo -e "${GREEN}报告目录: ${REPORT_DIR}${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# 执行主函数
main "$@"