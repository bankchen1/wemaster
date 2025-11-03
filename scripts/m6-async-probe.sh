#!/usr/bin/env bash
set -euo pipefail

# M6子代理3: 异步探针检查
# 对Staging端点进行24小时健康检查

source /Volumes/BankChen/wemaster/scripts/log-control.sh

# 配置变量
REPORT_DIR="docs"
LOG_DIR="logs"
DATA_DIR="logs/probe-data"
INTERVAL=60  # 60秒检查间隔
DURATION=86400  # 24小时 = 86400秒

# 创建必要目录
mkdir -p "$REPORT_DIR" "$LOG_DIR" "$DATA_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [M6-ASYNC-PROBE] $1" | tee -a "$LOG_DIR/m6-async-probe.log"
}

# 端点配置
declare -A ENDPOINTS=(
    ["admin_healthz"]="https://admin.staging.wemaster.dev/healthz"
    ["api_healthz"]="https://api.staging.wemaster.dev/healthz"
    ["api_readyz"]="https://api.staging.wemaster.dev/readyz"
    ["web_healthz"]="https://app.staging.wemaster.dev/healthz"
    ["api_users"]="https://api.staging.wemaster.dev/api/v1/users"
    ["api_courses"]="https://api.staging.wemaster.dev/api/v1/courses"
    ["api_orders"]="https://api.staging.wemaster.dev/api/v1/orders"
    ["api_sessions"]="https://api.staging.wemaster.dev/api/v1/sessions"
    ["api_payments"]="https://api.staging.wemaster.dev/api/v1/payments"
    ["api_subscriptions"]="https://api.staging.wemaster.dev/api/v1/subscriptions"
)

# HTTP状态码含义
declare -A STATUS_MEANINGS=(
    [200]="OK"
    [201]="Created"
    [204]="No Content"
    [400]="Bad Request"
    [401]="Unauthorized"
    [403]="Forbidden"
    [404]="Not Found"
    [429]="Too Many Requests"
    [500]="Internal Server Error"
    [502]="Bad Gateway"
    [503]="Service Unavailable"
    [504]="Gateway Timeout"
)

# 初始化统计数据
init_stats() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    for endpoint in "${!ENDPOINTS[@]}"; do
        echo "timestamp,endpoint,url,status_code,response_time,success,error_type" > "$DATA_DIR/${endpoint}.csv"
    done
    
    # 创建汇总统计文件
    echo "timestamp,total_checks,total_success,total_failures,success_rate,avg_response_time,p95_response_time" > "$DATA_DIR/summary.csv"
    
    log "✅ 统计数据初始化完成"
}

# 执行单次健康检查
probe_endpoint() {
    local endpoint_name="$1"
    local url="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local start_time=$(date +%s%3N)
    
    # 执行HTTP请求
    local response
    local status_code
    local response_time
    local success="false"
    local error_type=""
    
    # 使用curl执行请求，设置超时
    if response=$(curl -s -w "%{http_code}" --max-time 10 --connect-timeout 5 "$url" 2>/dev/null); then
        status_code="${response: -3}"
        response_body="${response%???}"
        
        # 计算响应时间
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        
        # 判断成功状态
        if [[ "$status_code" =~ ^[23] ]]; then
            success="true"
        else
            error_type="${STATUS_MEANINGS[$status_code]:-Unknown}"
        fi
        
        # 记录到CSV
        echo "$timestamp,$endpoint_name,$url,$status_code,$response_time,$success,$error_type" >> "$DATA_DIR/${endpoint_name}.csv"
        
    else
        # 请求失败
        local end_time=$(date +%s%3N)
        response_time=$((end_time - start_time))
        status_code="000"
        error_type="Connection Failed"
        
        echo "$timestamp,$endpoint_name,$url,$status_code,$response_time,$success,$error_type" >> "$DATA_DIR/${endpoint_name}.csv"
    fi
    
    # 返回结果
    echo "$success,$status_code,$response_time,$error_type"
}

# 更新汇总统计
update_summary() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local total_checks=0
    local total_success=0
    local total_failures=0
    local total_response_time=0
    local response_times=()
    
    # 遍历所有端点数据
    for endpoint in "${!ENDPOINTS[@]}"; do
        local csv_file="$DATA_DIR/${endpoint}.csv"
        
        if [[ -f "$csv_file" ]]; then
            # 跳过标题行
            while IFS=',' read -r ts ep url status rt succ err; do
                if [[ "$ts" != "timestamp" ]]; then
                    total_checks=$((total_checks + 1))
                    total_response_time=$((total_response_time + rt))
                    response_times+=("$rt")
                    
                    if [[ "$succ" == "true" ]]; then
                        total_success=$((total_success + 1))
                    else
                        total_failures=$((total_failures + 1))
                    fi
                fi
            done < "$csv_file"
        fi
    done
    
    # 计算统计指标
    local success_rate=0
    local avg_response_time=0
    local p95_response_time=0
    
    if [[ $total_checks -gt 0 ]]; then
        success_rate=$(echo "scale=2; $total_success * 100 / $total_checks" | bc -l)
        avg_response_time=$((total_response_time / total_checks))
        
        # 计算P95
        IFS=$'\n' sorted=($(sort -n <<<"${response_times[*]}"))
        local p95_index=$((total_checks * 95 / 100))
        p95_response_time=${sorted[$p95_index]}
    fi
    
    # 写入汇总统计
    echo "$timestamp,$total_checks,$total_success,$total_failures,$success_rate,$avg_response_time,$p95_response_time" >> "$DATA_DIR/summary.csv"
}

# 生成实时状态报告
generate_realtime_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="$LOG_DIR/probe-realtime-$timestamp.txt"
    
    cat > "$report_file" << EOF
=== WeMaster Staging 异步探针实时报告 ===
生成时间: $timestamp
检查间隔: ${INTERVAL}秒
运行时长: $(awk "BEGIN {printf \"%.2f\", $(date +%s) - $(stat -c %Y \"$LOG_DIR/m6-async-probe.log\" 2>/dev/null || echo $(date +%s))}") 秒

=== 端点状态概览 ===
EOF
    
    for endpoint in "${!ENDPOINTS[@]}"; do
        local url="${ENDPOINTS[$endpoint]}"
        local csv_file="$DATA_DIR/${endpoint}.csv"
        
        if [[ -f "$csv_file" ]]; then
            # 计算最近10次检查的状态
            local recent_checks=0
            local recent_success=0
            local latest_status="Unknown"
            local latest_time="Unknown"
            
            while IFS=',' read -r ts ep url status rt succ err; do
                if [[ "$ts" != "timestamp" ]]; then
                    recent_checks=$((recent_checks + 1))
                    if [[ "$succ" == "true" ]]; then
                        recent_success=$((recent_success + 1))
                    fi
                    latest_status="$status"
                    latest_time="$ts"
                fi
            done < <(tail -10 "$csv_file")
            
            local recent_rate=0
            if [[ $recent_checks -gt 0 ]]; then
                recent_rate=$(echo "scale=2; $recent_success * 100 / $recent_checks" | bc -l)
            fi
            
            local status_icon="❌"
            if [[ "$latest_status" =~ ^[23] ]]; then
                status_icon="✅"
            fi
            
            cat >> "$report_file" << EOF
$status_icon $endpoint: $latest_status (${recent_rate}% 最近成功率)
   URL: $url
   最新检查: $latest_time
EOF
        fi
    done
    
    cat >> "$report_file" << EOF

=== 汇总统计 ===
EOF
    
    # 读取最新汇总统计
    if [[ -f "$DATA_DIR/summary.csv" ]]; then
        tail -1 "$DATA_DIR/summary.csv" | while IFS=',' read -r ts total success failures rate avg p95; do
            cat >> "$report_file" << EOF
总检查次数: $total
成功次数: $success
失败次数: $failures
成功率: $rate%
平均响应时间: ${avg}ms
P95响应时间: ${p95}ms
EOF
        done
    fi
    
    log "实时报告生成完成: $report_file"
}

# 错误分类统计
analyze_errors() {
    log "分析错误分类..."
    
    local error_report="$LOG_DIR/error-analysis.txt"
    echo "=== 错误分类分析 ===" > "$error_report"
    echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')" >> "$error_report"
    echo "" >> "$error_report"
    
    # 统计各类错误
    declare -A error_counts
    
    for endpoint in "${!ENDPOINTS[@]}"; do
        local csv_file="$DATA_DIR/${endpoint}.csv"
        
        if [[ -f "$csv_file" ]]; then
            while IFS=',' read -r ts ep url status rt succ err; do
                if [[ "$ts" != "timestamp" && "$succ" == "false" ]]; then
                    error_counts["$err"]=$((${error_counts["$err"]:-0} + 1))
                fi
            done < "$csv_file"
        fi
    done
    
    # 输出错误统计
    for error_type in "${!error_counts[@]}"; do
        echo "$error_type: ${error_counts[$error_type]} 次" >> "$error_report"
    done
    
    log "错误分析完成: $error_report"
}

# 重试统计
analyze_retries() {
    log "分析重试统计..."
    
    local retry_report="$LOG_DIR/retry-analysis.txt"
    echo "=== 重试统计 ===" > "$retry_report"
    echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')" >> "$retry_report"
    echo "" >> "$retry_report"
    
    # 分析连续失败和恢复情况
    for endpoint in "${!ENDPOINTS[@]}"; do
        local csv_file="$DATA_DIR/${endpoint}.csv"
        
        if [[ -f "$csv_file" ]]; then
            echo "端点: $endpoint" >> "$retry_report"
            
            local consecutive_failures=0
            local max_consecutive_failures=0
            local total_recoveries=0
            
            while IFS=',' read -r ts ep url status rt succ err; do
                if [[ "$ts" != "timestamp" ]]; then
                    if [[ "$succ" == "false" ]]; then
                        consecutive_failures=$((consecutive_failures + 1))
                        if [[ $consecutive_failures -gt $max_consecutive_failures ]]; then
                            max_consecutive_failures=$consecutive_failures
                        fi
                    else
                        if [[ $consecutive_failures -gt 0 ]]; then
                            total_recoveries=$((total_recoveries + 1))
                        fi
                        consecutive_failures=0
                    fi
                fi
            done < "$csv_file"
            
            echo "  最大连续失败次数: $max_consecutive_failures" >> "$retry_report"
            echo "  恢复次数: $total_recoveries" >> "$retry_report"
            echo "" >> "$retry_report"
        fi
    done
    
    log "重试分析完成: $retry_report"
}

# 主监控循环
run_monitoring() {
    log "开始24小时异步健康检查..."
    
    # 初始化统计
    init_stats
    
    local start_time=$(date +%s)
    local end_time=$((start_time + DURATION))
    local current_time=$(date +%s)
    local check_count=0
    
    while [[ $current_time -lt $end_time ]]; do
        check_count=$((check_count + 1))
        log "执行第 $check_count 次健康检查..."
        
        # 检查所有端点
        for endpoint in "${!ENDPOINTS[@]}"; do
            local url="${ENDPOINTS[$endpoint]}"
            local result
            result=$(probe_endpoint "$endpoint" "$url")
            
            local success=$(echo "$result" | cut -d',' -f1)
            local status=$(echo "$result" | cut -d',' -f2)
            local response_time=$(echo "$result" | cut -d',' -f3)
            local error_type=$(echo "$result" | cut -d',' -f4)
            
            if [[ "$success" == "true" ]]; then
                log "✅ $endpoint: $status (${response_time}ms)"
            else
                log "❌ $endpoint: $status - $error_type (${response_time}ms)"
            fi
        done
        
        # 更新汇总统计
        update_summary
        
        # 每10次检查生成一次实时报告
        if [[ $((check_count % 10)) -eq 0 ]]; then
            generate_realtime_report
        fi
        
        # 等待下一次检查
        sleep "$INTERVAL"
        current_time=$(date +%s)
    done
    
    log "24小时健康检查完成，共执行 $check_count 次检查"
}

# 生成最终报告
generate_final_report() {
    log "生成最终验证报告..."
    
    local report_file="$REPORT_DIR/STAGING_ASYNC_VALIDATION.md"
    
    cat > "$report_file" << EOF
# WeMaster Staging 异步验证报告

## 监控概览

- **监控时间**: 24小时
- **检查间隔**: ${INTERVAL}秒
- **监控端点**: ${#ENDPOINTS[@]}个
- **开始时间**: $(head -1 "$DATA_DIR/summary.csv" | cut -d',' -f1)
- **结束时间**: $(tail -1 "$DATA_DIR/summary.csv" | cut -d',' -f1)

## 端点配置

| 端点名称 | URL | 类型 |
|---------|-----|------|
EOF
    
    for endpoint in "${!ENDPOINTS[@]}"; do
        echo "| $endpoint | ${ENDPOINTS[$endpoint]} | 健康检查 |" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF

## 可用性统计

### 总体统计
\`\`\`
$(tail -1 "$DATA_DIR/summary.csv" | while IFS=',' read -r ts total success failures rate avg p95; do
    echo "总检查次数: $total"
    echo "成功次数: $success"
    echo "失败次数: $failures"
    echo "成功率: $rate%"
    echo "平均响应时间: ${avg}ms"
    echo "P95响应时间: ${p95}ms"
done)
\`\`\`

### 端点详细统计
EOF
    
    for endpoint in "${!ENDPOINTS[@]}"; do
        local csv_file="$DATA_DIR/${endpoint}.csv"
        
        if [[ -f "$csv_file" ]]; then
            local total=0
            local success=0
            local failures=0
            local total_time=0
            local times=()
            
            while IFS=',' read -r ts ep url status rt succ err; do
                if [[ "$ts" != "timestamp" ]]; then
                    total=$((total + 1))
                    total_time=$((total_time + rt))
                    times+=("$rt")
                    
                    if [[ "$succ" == "true" ]]; then
                        success=$((success + 1))
                    else
                        failures=$((failures + 1))
                    fi
                fi
            done < "$csv_file"
            
            local success_rate=0
            local avg_time=0
            local p95_time=0
            
            if [[ $total -gt 0 ]]; then
                success_rate=$(echo "scale=2; $success * 100 / $total" | bc -l)
                avg_time=$((total_time / total))
                
                IFS=$'\n' sorted=($(sort -n <<<"${times[*]}"))
                local p95_index=$((total * 95 / 100))
                p95_time=${sorted[$p95_index]}
            fi
            
            cat >> "$report_file" << EOF

#### $endpoint
- **总检查次数**: $total
- **成功次数**: $success
- **失败次数**: $failures
- **成功率**: $success_rate%
- **平均响应时间**: ${avg_time}ms
- **P95响应时间**: ${p95_time}ms
- **URL**: ${ENDPOINTS[$endpoint]}
EOF
        fi
    done
    
    cat >> "$report_file" << EOF

## 错误分类

$(cat "$LOG_DIR/error-analysis.txt" 2>/dev/null || echo "错误分析文件不存在")

## 重试统计

$(cat "$LOG_DIR/retry-analysis.txt" 2>/dev/null || echo "重试分析文件不存在")

## 性能指标

### 响应时间分布
- **< 100ms**: 快速响应
- **100-500ms**: 正常响应
- **500ms-1s**: 较慢响应
- **> 1s**: 慢响应

### 可用性等级
- **> 99.9%**: 优秀
- **99-99.9%**: 良好
- **95-99%**: 一般
- **< 95%**: 需要改进

## 发现的问题

### 高频错误
1. 分析显示的错误类型和频率
2. 识别需要优先解决的问题

### 性能问题
1. 响应时间异常的端点
2. P95响应时间过高的端点

### 可用性问题
1. 成功率低于95%的端点
2. 连续失败时间较长的端点

## 改进建议

### 立即处理
1. 修复导致频繁失败的问题
2. 优化响应时间过慢的端点
3. 加强错误监控和告警

### 长期改进
1. 实施自动故障恢复机制
2. 优化系统架构和性能
3. 完善监控和告警体系

## 结论

经过24小时连续监控，WeMaster Staging环境的整体可用性表现如下：

- **整体可用性**: 根据实际数据计算
- **性能表现**: 根据响应时间数据评估
- **稳定性**: 根据错误频率和恢复情况评估

建议在正式发布前解决发现的关键问题。

---

**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**监控时长**: 24小时  
**报告版本**: 1.0.0
EOF

    log "✅ 最终验证报告生成完成: $report_file"
}

# 主执行流程
main() {
    log "开始执行M6异步探针检查..."
    
    # 检查是否已经运行
    if pgrep -f "m6-async-probe.sh" > /dev/null; then
        log "⚠️ 异步探针已在运行中"
        exit 0
    fi
    
    # 运行24小时监控
    run_monitoring
    
    # 分析错误和重试
    analyze_errors
    analyze_retries
    
    # 生成最终报告
    generate_final_report
    
    log "✅ M6异步探针检查完成"
    
    # 显示日志尾部
    console_tail "m6-async-probe"
}

# 执行主函数
main "$@"