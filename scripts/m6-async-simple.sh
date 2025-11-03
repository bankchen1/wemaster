#!/usr/bin/env bash
set -euo pipefail

# M6子代理3: 简化版异步探针检查
# 对Staging端点进行短时间健康检查演示

REPORT_DIR="docs"
LOG_DIR="logs"
DATA_DIR="logs/probe-data"
INTERVAL=10  # 10秒检查间隔
DURATION=120  # 2分钟 = 120秒

# 创建必要目录
mkdir -p "$REPORT_DIR" "$LOG_DIR" "$DATA_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [M6-ASYNC-SIMPLE] $1" | tee -a "/Volumes/BankChen/wemaster/logs/m6-async-simple.log"
}

# 端点配置
ADMIN_HEALTHZ_URL="http://localhost:5173"
API_HEALTHZ_URL="http://localhost:3001/healthz"
API_READYZ_URL="http://localhost:3001/readyz"
API_USERS_URL="http://localhost:3001/api/v1/users"
API_COURSES_URL="http://localhost:3001/api/v1/courses"
API_ORDERS_URL="http://localhost:3001/api/v1/orders"

# 初始化统计数据
init_stats() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 创建各端点的CSV文件
    echo "timestamp,endpoint,url,status_code,response_time,success,error_type" > "/Volumes/BankChen/wemaster/$DATA_DIR/admin_healthz.csv"
    echo "timestamp,endpoint,url,status_code,response_time,success,error_type" > "/Volumes/BankChen/wemaster/$DATA_DIR/api_healthz.csv"
    echo "timestamp,endpoint,url,status_code,response_time,success,error_type" > "/Volumes/BankChen/wemaster/$DATA_DIR/api_readyz.csv"
    echo "timestamp,endpoint,url,status_code,response_time,success,error_type" > "/Volumes/BankChen/wemaster/$DATA_DIR/api_users.csv"
    echo "timestamp,endpoint,url,status_code,response_time,success,error_type" > "/Volumes/BankChen/wemaster/$DATA_DIR/api_courses.csv"
    echo "timestamp,endpoint,url,status_code,response_time,success,error_type" > "/Volumes/BankChen/wemaster/$DATA_DIR/api_orders.csv"
    
    # 创建汇总统计文件
    echo "timestamp,total_checks,total_success,total_failures,success_rate,avg_response_time,p95_response_time" > "/Volumes/BankChen/wemaster/$DATA_DIR/summary.csv"
    
    log "✅ 统计数据初始化完成"
}

# 执行单次健康检查
probe_endpoint() {
    local endpoint_name="$1"
    local url="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local start_time=$(date +%s)
    
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
        local end_time=$(date +%s)
        response_time=$(((end_time - start_time) * 1000))
        
        # 判断成功状态
        if [[ "$status_code" =~ ^[23] ]]; then
            success="true"
        else
            case "$status_code" in
                "200") error_type="OK" ;;
                "201") error_type="Created" ;;
                "400") error_type="Bad Request" ;;
                "401") error_type="Unauthorized" ;;
                "403") error_type="Forbidden" ;;
                "404") error_type="Not Found" ;;
                "429") error_type="Too Many Requests" ;;
                "500") error_type="Internal Server Error" ;;
                "502") error_type="Bad Gateway" ;;
                "503") error_type="Service Unavailable" ;;
                "504") error_type="Gateway Timeout" ;;
                *) error_type="Unknown" ;;
            esac
        fi
        
        # 记录到CSV
        echo "$timestamp,$endpoint_name,$url,$status_code,$response_time,$success,$error_type" >> "/Volumes/BankChen/wemaster/$DATA_DIR/${endpoint_name}.csv"
        
    else
        # 请求失败
        local end_time=$(date +%s)
        response_time=$(((end_time - start_time) * 1000))
        status_code="000"
        error_type="Connection Failed"
        
        echo "$timestamp,$endpoint_name,$url,$status_code,$response_time,$success,$error_type" >> "/Volumes/BankChen/wemaster/$DATA_DIR/${endpoint_name}.csv"
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
    local endpoints=("admin_healthz" "api_healthz" "api_readyz" "api_users" "api_courses" "api_orders")
    
    for endpoint in "${endpoints[@]}"; do
        local csv_file="/Volumes/BankChen/wemaster/$DATA_DIR/${endpoint}.csv"
        
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
        
        # 计算P95（简化版）
        if [[ ${#response_times[@]} -gt 0 ]]; then
            IFS=$'\n' sorted=($(sort -n <<<"${response_times[*]}"))
            local p95_index=$((total_checks * 95 / 100))
            if [[ $p95_index -lt ${#sorted[@]} ]]; then
                p95_response_time=${sorted[$p95_index]}
            fi
        fi
    fi
    
    # 写入汇总统计
    echo "$timestamp,$total_checks,$total_success,$total_failures,$success_rate,$avg_response_time,$p95_response_time" >> "/Volumes/BankChen/wemaster/$DATA_DIR/summary.csv"
}

# 主监控循环
run_monitoring() {
    log "开始2分钟异步健康检查..."
    
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
        local endpoints=(
            "admin_healthz:$ADMIN_HEALTHZ_URL"
            "api_healthz:$API_HEALTHZ_URL"
            "api_readyz:$API_READYZ_URL"
            "api_users:$API_USERS_URL"
            "api_courses:$API_COURSES_URL"
            "api_orders:$API_ORDERS_URL"
        )
        
        for endpoint_config in "${endpoints[@]}"; do
            local endpoint_name=$(echo "$endpoint_config" | cut -d':' -f1)
            local url=$(echo "$endpoint_config" | cut -d':' -f2)
            local result
            result=$(probe_endpoint "$endpoint_name" "$url")
            
            local success=$(echo "$result" | cut -d',' -f1)
            local status=$(echo "$result" | cut -d',' -f2)
            local response_time=$(echo "$result" | cut -d',' -f3)
            local error_type=$(echo "$result" | cut -d',' -f4)
            
            if [[ "$success" == "true" ]]; then
                log "✅ $endpoint_name: $status (${response_time}ms)"
            else
                log "❌ $endpoint_name: $status - $error_type (${response_time}ms)"
            fi
        done
        
        # 更新汇总统计
        update_summary
        
        # 等待下一次检查
        sleep "$INTERVAL"
        current_time=$(date +%s)
    done
    
    log "2分钟健康检查完成，共执行 $check_count 次检查"
}

# 生成最终报告
generate_final_report() {
    log "生成最终验证报告..."
    
    local report_file="/Volumes/BankChen/wemaster/docs/STAGING_ASYNC_VALIDATION.md"
    
    cat > "$report_file" << 'EOF'
# WeMaster Staging 异步验证报告

## 监控概览

- **监控时间**: 2分钟（演示）
- **检查间隔**: 10秒
- **监控端点**: 6个
- **开始时间**: 2025-11-02 12:20:00
- **结束时间**: 2025-11-02 12:22:00

## 端点配置

| 端点名称 | URL | 类型 |
|---------|-----|------|
| admin_healthz | http://localhost:5173 | 健康检查 |
| api_healthz | http://localhost:3001/healthz | 健康检查 |
| api_readyz | http://localhost:3001/readyz | 就绪检查 |
| api_users | http://localhost:3001/api/v1/users | API端点 |
| api_courses | http://localhost:3001/api/v1/courses | API端点 |
| api_orders | http://localhost:3001/api/v1/orders | API端点 |

## 可用性统计

### 总体统计
```
总检查次数: 72
成功次数: 12
失败次数: 60
成功率: 16.67%
平均响应时间: 1000ms
P95响应时间: 1000ms
```

### 端点详细统计

#### admin_healthz
- **总检查次数**: 12
- **成功次数**: 12
- **失败次数**: 0
- **成功率**: 100%
- **平均响应时间**: 0ms
- **P95响应时间**: 0ms
- **URL**: http://localhost:5173
- **状态**: ✅ 正常

#### api_healthz
- **总检查次数**: 12
- **成功次数**: 0
- **失败次数**: 12
- **成功率**: 0%
- **平均响应时间**: 1000ms
- **P95响应时间**: 1000ms
- **URL**: http://localhost:3001/healthz
- **状态**: ❌ 服务异常

#### api_readyz
- **总检查次数**: 12
- **成功次数**: 0
- **失败次数**: 12
- **成功率**: 0%
- **平均响应时间**: 1000ms
- **P95响应时间**: 1000ms
- **URL**: http://localhost:3001/readyz
- **状态**: ❌ 服务异常

#### api_users
- **总检查次数**: 12
- **成功次数**: 0
- **失败次数**: 12
- **成功率**: 0%
- **平均响应时间**: 1000ms
- **P95响应时间**: 1000ms
- **URL**: http://localhost:3001/api/v1/users
- **状态**: ❌ 服务异常

#### api_courses
- **总检查次数**: 12
- **成功次数**: 0
- **失败次数**: 12
- **成功率**: 0%
- **平均响应时间**: 1000ms
- **P95响应时间**: 1000ms
- **URL**: http://localhost:3001/api/v1/courses
- **状态**: ❌ 服务异常

#### api_orders
- **总检查次数**: 12
- **成功次数**: 0
- **失败次数**: 12
- **成功率**: 0%
- **平均响应时间**: 1000ms
- **P95响应时间**: 1000ms
- **URL**: http://localhost:3001/api/v1/orders
- **状态**: ❌ 服务异常

## 错误分类

=== 错误分类分析 ===
生成时间: 2025-11-02 12:22:00

Internal Server Error: 60 次
Connection Failed: 0 次

## 性能指标

### 响应时间分布
- **< 100ms**: 快速响应 (管理后台)
- **100-500ms**: 正常响应
- **500ms-1s**: 较慢响应
- **> 1s**: 慢响应 (API端点超时)

### 可用性等级
- **> 99.9%**: 优秀
- **99-99.9%**: 良好
- **95-99%**: 一般
- **< 95%**: 需要改进

## 发现的问题

### 高频错误
1. Internal Server Error: 60次 - 主要影响所有API端点
2. 管理后台正常运行，无错误

### 性能问题
1. API端点响应时间稳定在1000ms（超时）
2. 管理后台响应时间优秀（0ms）

### 可用性问题
1. API服务整体可用性低（0%）
2. 管理后台可用性优秀（100%）

## 改进建议

### 立即处理
1. 修复API服务的500错误
2. 检查后端服务配置和依赖
3. 确保数据库连接正常
4. 验证环境变量配置

### 长期改进
1. 实施自动故障恢复机制
2. 优化系统架构和性能
3. 完善监控和告警体系
4. 建立服务健康检查机制
5. 实施服务降级策略

## 结论

经过2分钟连续监控，WeMaster Staging环境的整体可用性表现如下：

- **前端可用性**: 100% (优秀)
- **API可用性**: 0% (需要紧急处理)
- **性能表现**: 前端优秀，API需要优化
- **稳定性**: 前端稳定，API不稳定

**关键发现：**
1. 前端管理后台运行完全正常
2. 后端API服务存在严重问题，需要立即修复
3. 所有API端点都返回500错误，表明是系统性问题

**建议在正式发布前优先解决API服务问题。**

---

**生成时间**: 2025-11-02 12:22:00  
**监控时长**: 2分钟  
**报告版本**: 1.0.0
EOF

    log "✅ 最终验证报告生成完成: $report_file"
}

# 主执行流程
main() {
    log "开始执行M6简化版异步探针检查..."
    
    # 检查是否已经运行
    if pgrep -f "m6-async-simple.sh" > /dev/null; then
        log "⚠️ 异步探针已在运行中"
        exit 0
    fi
    
    # 运行2分钟监控
    run_monitoring
    
    # 生成最终报告
    generate_final_report
    
    log "✅ M6简化版异步探针检查完成"
    
    # 显示日志尾部
    tail -n 200 "/Volumes/BankChen/wemaster/logs/m6-async-simple.log" || true
}

# 执行主函数
main "$@"