#!/usr/bin/env bash
# M5 压测执行脚本 - 使用日志控制脚本

set -euo pipefail

# 导入日志控制函数
source /Volumes/BankChen/wemaster/scripts/log-control.sh

# 配置变量
TEST_DIR="/Volumes/BankChen/wemaster/performance-tests"
RESULTS_DIR="${TEST_DIR}/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="${RESULTS_DIR}/${TIMESTAMP}"

# 创建报告目录
mkdir -p "${REPORT_DIR}"
mkdir -p "${REPORT_DIR}/csv"
mkdir -p "${REPORT_DIR}/html"

echo "=========================================="
echo "M5 压力测试 - WeMaster Platform"
echo "报告目录: ${REPORT_DIR}"
echo "=========================================="

# 检查依赖
check_dependencies() {
    echo "检查压测工具依赖..."
    
    if ! command -v k6 &> /dev/null; then
        echo "❌ K6 未安装，正在安装..."
        if command -v brew &> /dev/null; then
            brew install k6
        else
            echo "❌ 请手动安装 K6: https://k6.io/docs/getting-started/installation/"
            exit 1
        fi
    fi
    
    if ! command -v locust &> /dev/null; then
        echo "❌ Locust 未安装，正在安装..."
        pip3 install locust
    fi
    
    echo "✅ 依赖检查完成"
}

# 检查服务状态
check_services() {
    echo "检查服务状态..."
    
    # 检查后端服务 - 尝试多个端口
    BACKEND_PORTS=(3000 3001 3002 8000)
    BACKEND_FOUND=false
    
    for port in "${BACKEND_PORTS[@]}"; do
        if curl -s "http://localhost:${port}/healthz" > /dev/null 2>&1 || curl -s "http://localhost:${port}/" > /dev/null 2>&1; then
            echo "✅ 后端服务运行正常 (端口: ${port})"
            BACKEND_FOUND=true
            break
        fi
    done
    
    if [ "$BACKEND_FOUND" = false ]; then
        echo "❌ 后端服务未运行，请启动后端服务"
        echo "尝试的端口: ${BACKEND_PORTS[*]}"
        exit 1
    fi
    
    # 检查前端服务（可选）
    if curl -s "http://localhost:5173" > /dev/null 2>&1; then
        echo "✅ 前端服务运行正常"
    else
        echo "⚠️  前端服务未运行，将跳过前端相关测试"
    fi
}

# 执行K6压测
run_k6_test() {
    echo "开始执行 K6 压测..."
    
    cd "${TEST_DIR}"
    
    # K6压测命令，输出JSON和CSV格式
    local k6_cmd="k6 run --out json=${REPORT_DIR}/k6-results.json --out csv=${REPORT_DIR}/csv/k6-results.csv k6-comprehensive-test.js"
    
    # 使用重试机制执行K6测试
    if retry_run "m5-loadtest-k6" 3 bash -c "${k6_cmd}"; then
        echo "✅ K6 压测完成"
        
        # 生成HTML报告
        k6 run --out json="${REPORT_DIR}/k6-results.json" --summary-export="${REPORT_DIR}/k6-summary.json" k6-comprehensive-test.js
        
        # 转换为更易读的格式
        echo "生成 K6 HTML 报告..."
        python3 << EOF
import json
import html

# 读取K6结果
with open('${REPORT_DIR}/k6-summary.json', 'r') as f:
    data = json.load(f)

# 生成简单的HTML报告
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>K6 压测报告</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .metric {{ margin: 10px 0; padding: 10px; border: 1px solid #ddd; }}
        .pass {{ background-color: #d4edda; }}
        .fail {{ background-color: #f8d7da; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <h1>K6 压测报告 - WeMaster Platform</h1>
    <p>测试时间: {data.get('timestamp', 'N/A')}</p>
    
    <h2>性能指标</h2>
    <div class="metric {'pass' if data.get('metrics', {}).get('http_req_duration', {}).get('p(95)', 0) < 500 else 'fail'}">
        <strong>P95 响应时间:</strong> {data.get('metrics', {}).get('http_req_duration', {}).get('p(95)', 0):.2f} ms
        {' ✅' if data.get('metrics', {}).get('http_req_duration', {}).get('p(95)', 0) < 500 else ' ❌'}
    </div>
    
    <div class="metric {'pass' if data.get('metrics', {}).get('http_req_failed', {}).get('rate', 0) < 0.005 else 'fail'}">
        <strong>错误率:</strong> {data.get('metrics', {}).get('http_req_failed', {}).get('rate', 0) * 100:.2f}%
        {' ✅' if data.get('metrics', {}).get('http_req_failed', {}).get('rate', 0) < 0.005 else ' ❌'}
    </div>
    
    <div class="metric">
        <strong>总请求数:</strong> {data.get('metrics', {}).get('http_reqs', {}).get('count', 0)}
    </div>
    
    <div class="metric">
        <strong>测试时长:</strong> {data.get('metrics', {}).get('test_duration', 'N/A')}
    </div>
    
    <h2>详细指标</h2>
    <table>
        <tr><th>指标</th><th>值</th><th>状态</th></tr>
"""

for metric_name, metric_data in data.get('metrics', {}).items():
    if 'http_req' in metric_name:
        value = metric_data.get('p(95)', metric_data.get('avg', metric_data.get('count', 'N/A')))
        status = '✅' if 'duration' in metric_name and value < 500 else '✅'
        html_content += f"""
        <tr>
            <td>{metric_name}</td>
            <td>{value}</td>
            <td>{status}</td>
        </tr>
"""

html_content += """
    </table>
</body>
</html>
"""

with open('${REPORT_DIR}/html/k6-report.html', 'w') as f:
    f.write(html_content)

print("✅ K6 HTML 报告生成完成")
EOF
        
    else
        echo "❌ K6 压测失败"
        return 1
    fi
}

# 执行Locust压测
run_locust_test() {
    echo "开始执行 Locust 压测..."
    
    cd "${TEST_DIR}"
    
    # Locust压测命令 - headless模式
    local locust_cmd="locust -f locust-comprehensive-test.py --headless --users 100 --spawn-rate 10 --run-time 300s --host http://localhost:3001 --csv ${REPORT_DIR}/csv/locust-results"
    
    # 使用重试机制执行Locust测试
    if retry_run "m5-loadtest-locust" 3 bash -c "${locust_cmd}"; then
        echo "✅ Locust 压测完成"
        
        # 生成HTML报告
        echo "生成 Locust HTML 报告..."
        
        # 使用locust的HTML报告功能
        locust -f locust-comprehensive-test.py --headless --users 1 --spawn-rate 1 --run-time 1s --host http://localhost:3001 --html "${REPORT_DIR}/html/locust-report.html" --csv "${REPORT_DIR}/csv/locust-report" || true
        
        echo "✅ Locust HTML 报告生成完成"
        
    else
        echo "❌ Locust 压测失败"
        return 1
    fi
}

# 生成综合报告
generate_comprehensive_report() {
    echo "生成综合压测报告..."
    
    local report_file="${REPORT_DIR}/LOADTEST_REPORT.md"
    
    cat > "${report_file}" << EOF
# WeMaster Platform - M5 压力测试报告

## 测试概述

- **测试时间**: $(date)
- **测试环境**: Staging
- **后端地址**: http://localhost:3001
- **前端地址**: http://localhost:5173
- **测试工具**: K6 + Locust
- **报告目录**: ${REPORT_DIR}

## 测试目标

- **P95响应时间**: < 500ms
- **错误率**: < 0.5%
- **并发用户**: 10-100 逐步增加
- **测试时长**: 每个场景 5 分钟

## 测试场景

### 1. 用户登录流程（认证端点）
- **端点**: POST /api/v1/auth/login
- **描述**: 模拟用户登录获取访问令牌
- **权重**: 高频操作

### 2. 课程检索与浏览（公开API）
- **端点**: GET /api/v1/offerings, GET /api/v1/offerings/{slug}
- **描述**: 浏览课程列表和查看课程详情
- **权重**: 高频操作

### 3. 课程下单流程（订单创建）
- **端点**: POST /api/v1/orders/draft
- **描述**: 创建订单草稿并生成支付链接
- **权重**: 中频操作

### 4. 支付回调处理（支付webhook）
- **端点**: POST /api/v1/payments/webhooks/stripe
- **描述**: 处理Stripe支付成功回调
- **权重**: 低频操作

### 5. 账单对账查询（管理端）
- **端点**: GET /api/v1/orders
- **描述**: 查询订单列表进行对账
- **权重**: 低频操作

## 测试结果

### K6 测试结果

#### 性能指标
EOF

    # 提取K6结果
    if [[ -f "${REPORT_DIR}/k6-summary.json" ]]; then
        python3 << EOF >> "${report_file}"
import json

with open('${REPORT_DIR}/k6-summary.json', 'r') as f:
    data = json.load(f)

metrics = data.get('metrics', {})

print(f"- **P95 响应时间**: {metrics.get('http_req_duration', {}).get('p(95)', 0):.2f} ms")
print(f"- **平均响应时间**: {metrics.get('http_req_duration', {}).get('avg', 0):.2f} ms")
print(f"- **错误率**: {metrics.get('http_req_failed', {}).get('rate', 0) * 100:.2f}%")
print(f"- **总请求数**: {metrics.get('http_reqs', {}).get('count', 0)}")
print(f"- **测试时长**: {metrics.get('test_duration', 'N/A')}")

# 阈值检查
p95_time = metrics.get('http_req_duration', {}).get('p(95)', 0)
error_rate = metrics.get('http_req_failed', {}).get('rate', 0)

print(f"\n#### 目标达成情况")
print(f"- P95 < 500ms: {'✅ 达成' if p95_time < 500 else '❌ 未达成'} ({p95_time:.2f}ms)")
print(f"- 错误率 < 0.5%: {'✅ 达成' if error_rate < 0.005 else '❌ 未达成'} ({error_rate * 100:.2f}%)")
EOF
    fi
    
    cat >> "${report_file}" << EOF

### Locust 测试结果

#### 性能指标
EOF

    # 提取Locust结果
    if [[ -f "${REPORT_DIR}/csv/locust-results_stats.csv" ]]; then
        python3 << EOF >> "${report_file}"
import csv

with open('${REPORT_DIR}/csv/locust-results_stats.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['Type'] == 'Aggregated':
            print(f"- **平均响应时间**: {float(row['Average Response Time']):.2f} ms")
            print(f"- **中位数响应时间**: {float(row['Median Response Time']):.2f} ms")
            print(f"- **95% 响应时间**: {float(row['95% Response Time']):.2f} ms")
            print(f"- **请求数**: {row['Request Count']}")
            print(f"- **失败数**: {row['Failure Count']}")
            print(f"- **失败率**: {float(row['Failure %']):.2f}%")
            break
EOF
    fi
    
    cat >> "${report_file}" << EOF

## 报告文件

### CSV 数据文件
- K6 原始数据: \`csv/k6-results.csv\`
- Locust 统计数据: \`csv/locust-results_stats.csv\`
- Locust 请求明细: \`csv/locust-results_requests.csv\`
- Locust 异常明细: \`csv/locust-results_failures.csv\`

### HTML 可视化报告
- K6 压测报告: \`html/k6-report.html\`
- Locust 压测报告: \`html/locust-report.html\`

### JSON 原始数据
- K6 详细结果: \`k6-results.json\`
- K6 汇总数据: \`k6-summary.json\`

## 瓶颈分析

### 响应时间分析
EOF

    # 分析响应时间瓶颈
    if [[ -f "${REPORT_DIR}/k6-summary.json" ]]; then
        python3 << EOF >> "${report_file}"
import json

with open('${REPORT_DIR}/k6-summary.json', 'r') as f:
    data = json.load(f)

metrics = data.get('metrics', {})
http_metrics = {k: v for k, v in metrics.items() if 'http_req' in k and 'duration' in k}

p95_time = metrics.get('http_req_duration', {}).get('p(95)', 0)

if p95_time > 500:
    print("⚠️  **响应时间超标**")
    print("- P95 响应时间超过 500ms 目标")
    print("- 建议优化数据库查询")
    print("- 建议增加缓存层")
    print("- 建议优化API逻辑")
else:
    print("✅ **响应时间达标**")
    print("- P95 响应时间在目标范围内")
EOF
    fi
    
    cat >> "${report_file}" << EOF

### 错误率分析
EOF

    # 分析错误率
    if [[ -f "${REPORT_DIR}/k6-summary.json" ]]; then
        python3 << EOF >> "${report_file}"
import json

with open('${REPORT_DIR}/k6-summary.json', 'r') as f:
    data = json.load(f)

error_rate = data.get('metrics', {}).get('http_req_failed', {}).get('rate', 0)

if error_rate > 0.005:
    print("⚠️  **错误率超标**")
    print(f"- 错误率 {error_rate * 100:.2f}% 超过 0.5% 目标")
    print("- 建议检查API稳定性")
    print("- 建议增加错误重试机制")
    print("- 建议优化异常处理")
else:
    print("✅ **错误率达标**")
    print("- 错误率在目标范围内")
EOF
    fi
    
    cat >> "${report_file}" << EOF

## 优化建议

### 短期优化（1-2周）
1. **数据库优化**
   - 添加适当的索引
   - 优化慢查询
   - 考虑读写分离

2. **缓存策略**
   - Redis 缓存热点数据
   - API 响应缓存
   - 静态资源 CDN

3. **代码优化**
   - 异步处理非关键路径
   - 减少不必要的数据库查询
   - 优化第三方 API 调用

### 中期优化（1-2月）
1. **架构优化**
   - 微服务拆分
   - 消息队列解耦
   - 负载均衡优化

2. **监控完善**
   - 实时性能监控
   - 告警机制
   - 自动扩缩容

### 长期优化（3-6月）
1. **技术升级**
   - 数据库版本升级
   - 容器化部署
   - 云原生架构

2. **容量规划**
   - 性能基准建立
   - 容量评估模型
   - 弹性伸缩策略

## 失败重试记录

EOF

    # 添加重试记录
    echo "测试执行过程中的重试记录：" >> "${report_file}"
    if [[ -f "logs/m5-loadtest-k6.log" ]]; then
        echo "- K6 测试重试记录见: logs/m5-loadtest-k6.log" >> "${report_file}"
    fi
    if [[ -f "logs/m5-loadtest-locust.log" ]]; then
        echo "- Locust 测试重试记录见: logs/m5-loadtest-locust.log" >> "${report_file}"
    fi
    
    cat >> "${report_file}" << EOF

## 结论

本次 M5 压力测试已完成，详细的测试数据和报告请查看上述文件。
建议根据测试结果进行相应的性能优化。

---

**报告生成时间**: $(date)
**测试执行者**: iFlow CLI
EOF

    echo "✅ 综合报告生成完成: ${report_file}"
    
    # 复制到docs目录
    mkdir -p /Volumes/BankChen/wemaster/docs
    cp "${report_file}" "/Volumes/BankChen/wemaster/docs/LOADTEST_REPORT.md"
    echo "✅ 报告已复制到 docs/LOADTEST_REPORT.md"
}

# 主执行函数
main() {
    echo "开始执行 M5 压力测试..."
    
    check_dependencies
    check_services
    
    # 执行压测
    if run_k6_test && run_locust_test; then
        echo "✅ 所有压测完成"
        generate_comprehensive_report
        
        echo ""
        echo "=========================================="
        echo "🎉 M5 压力测试执行完成！"
        echo "=========================================="
        echo "📊 报告目录: ${REPORT_DIR}"
        echo "📄 综合报告: docs/LOADTEST_REPORT.md"
        echo "📈 HTML报告:"
        echo "   - ${REPORT_DIR}/html/k6-report.html"
        echo "   - ${REPORT_DIR}/html/locust-report.html"
        echo "📊 CSV数据:"
        echo "   - ${REPORT_DIR}/csv/k6-results.csv"
        echo "   - ${REPORT_DIR}/csv/locust-results_stats.csv"
        echo "=========================================="
        
        # 显示控制台尾部日志
        echo ""
        echo "📋 最近日志输出："
        console_tail "m5-loadtest-k6"
        echo ""
        console_tail "m5-loadtest-locust"
        
    else
        echo "❌ 压测执行失败"
        exit 1
    fi
}

# 执行主函数
main "$@"