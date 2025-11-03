#!/bin/bash

# WeMaster 监控体系部署脚本
# M5-3 里程碑：完整可观测性部署

set -e

# 颜色定义
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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 检查 Docker 服务状态
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker 服务"
        exit 1
    fi
    
    log_success "系统依赖检查通过"
}

# 创建必要的目录
create_directories() {
    log_info "创建监控数据目录..."
    
    mkdir -p /Volumes/BankChen/wemaster/infra/monitoring/data/{prometheus,grafana,loki,jaeger,alertmanager}
    mkdir -p /Volumes/BankChen/wemaster/infra/monitoring/logs
    
    # 设置权限
    chmod -R 755 /Volumes/BankChen/wemaster/infra/monitoring/data
    
    log_success "目录创建完成"
}

# 部署监控基础设施
deploy_monitoring_infrastructure() {
    log_info "部署监控基础设施..."
    
    cd /Volumes/BankChen/wemaster/infra/monitoring
    
    # 停止现有容器（如果存在）
    log_info "停止现有监控容器..."
    docker-compose -f docker-compose.monitoring.yml down || true
    
    # 拉取最新镜像
    log_info "拉取监控镜像..."
    docker-compose -f docker-compose.monitoring.yml pull
    
    # 启动监控服务
    log_info "启动监控服务..."
    docker-compose -f docker-compose.monitoring.yml up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    log_success "监控基础设施部署完成"
}

# 验证服务状态
verify_services() {
    log_info "验证服务状态..."
    
    # 检查 Prometheus
    if curl -f http://localhost:9090/-/healthy &> /dev/null; then
        log_success "Prometheus 运行正常"
    else
        log_error "Prometheus 启动失败"
        return 1
    fi
    
    # 检查 Grafana
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        log_success "Grafana 运行正常"
    else
        log_error "Grafana 启动失败"
        return 1
    fi
    
    # 检查 Loki
    if curl -f http://localhost:3100/ready &> /dev/null; then
        log_success "Loki 运行正常"
    else
        log_error "Loki 启动失败"
        return 1
    fi
    
    # 检查 Jaeger
    if curl -f http://localhost:16686/ &> /dev/null; then
        log_success "Jaeger 运行正常"
    else
        log_error "Jaeger 启动失败"
        return 1
    fi
    
    # 检查 AlertManager
    if curl -f http://localhost:9093/-/healthy &> /dev/null; then
        log_success "AlertManager 运行正常"
    else
        log_error "AlertManager 启动失败"
        return 1
    fi
    
    log_success "所有服务验证通过"
}

# 配置 Grafana
configure_grafana() {
    log_info "配置 Grafana..."
    
    # 等待 Grafana 完全启动
    sleep 10
    
    # 创建 API Key（如果需要）
    GRAFANA_URL="http://localhost:3001"
    ADMIN_USER="admin"
    ADMIN_PASSWORD="wemaster@2024!"
    
    # 导入仪表板（通过 API）
    log_info "导入 Grafana 仪表板..."
    
    # 系统监控仪表板
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Basic $(echo -n ${ADMIN_USER}:${ADMIN_PASSWORD} | base64)" \
        -d @/Volumes/BankChen/wemaster/infra/monitoring/grafana/dashboards/system/system-overview.json \
        "${GRAFANA_URL}/api/dashboards/db" || log_warning "系统仪表板导入失败"
    
    # PostgreSQL 监控仪表板
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Basic $(echo -n ${ADMIN_USER}:${ADMIN_PASSWORD} | base64)" \
        -d @/Volumes/BankChen/wemaster/infra/monitoring/grafana/dashboards/databases/postgresql-monitoring.json \
        "${GRAFANA_URL}/api/dashboards/db" || log_warning "PostgreSQL 仪表板导入失败"
    
    # Redis 监控仪表板
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Basic $(echo -n ${ADMIN_USER}:${ADMIN_PASSWORD} | base64)" \
        -d @/Volumes/BankChen/wemaster/infra/monitoring/grafana/dashboards/databases/redis-monitoring.json \
        "${GRAFANA_URL}/api/dashboards/db" || log_warning "Redis 仪表板导入失败"
    
    # 网络监控仪表板
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Basic $(echo -n ${ADMIN_USER}:${ADMIN_PASSWORD} | base64)" \
        -d @/Volumes/BankChen/wemaster/infra/monitoring/grafana/dashboards/network/network-monitoring.json \
        "${GRAFANA_URL}/api/dashboards/db" || log_warning "网络仪表板导入失败"
    
    log_success "Grafana 配置完成"
}

# 配置应用监控
configure_application_monitoring() {
    log_info "配置应用监控..."
    
    # 检查后端监控配置
    if [ -f "/Volumes/BankChen/wemaster/wemaster-nest/src/common/monitoring/monitoring.module.ts" ]; then
        log_success "后端监控配置已就绪"
    else
        log_error "后端监控配置缺失"
        return 1
    fi
    
    # 检查前端监控配置
    if [ -f "/Volumes/BankChen/wemaster/wemaster-admin/src/utils/monitoring.ts" ]; then
        log_success "前端监控配置已就绪"
    else
        log_error "前端监控配置缺失"
        return 1
    fi
    
    log_success "应用监控配置完成"
}

# 设置告警规则
setup_alert_rules() {
    log_info "设置告警规则..."
    
    # 重新加载 Prometheus 配置
    curl -X POST http://localhost:9090/-/reload || log_warning "Prometheus 配置重载失败"
    
    # 重新加载 AlertManager 配置
    curl -X POST http://localhost:9093/-/reload || log_warning "AlertManager 配置重载失败"
    
    log_success "告警规则设置完成"
}

# 生成访问信息
generate_access_info() {
    log_info "生成访问信息..."
    
    cat > /Volumes/BankChen/wemaster/infra/monitoring/ACCESS_INFO.md << EOF
# WeMaster 监控系统访问信息

## 服务地址

### 核心监控服务
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/wemaster@2024!)
- **Loki**: http://localhost:3100
- **Jaeger**: http://localhost:16686
- **AlertManager**: http://localhost:9093

### 导出器端点
- **Node Exporter**: http://localhost:9100/metrics
- **PostgreSQL Exporter**: http://localhost:9187/metrics
- **Redis Exporter**: http://localhost:9121/metrics
- **cAdvisor**: http://localhost:8080/metrics

### OpenTelemetry Collector
- **OTLP gRPC**: localhost:4317
- **OTLP HTTP**: http://localhost:4318
- **Prometheus Exporter**: http://localhost:8889/metrics

## 仪表板

### 系统监控
- 系统概览: http://localhost:3001/d/system-overview

### 数据库监控
- PostgreSQL: http://localhost:3001/d/postgresql-monitoring
- Redis: http://localhost:3001/d/redis-monitoring

### 网络监控
- 网络监控: http://localhost:3001/d/network-monitoring

## 告警配置

### 告警规则
- 系统资源告警（CPU、内存、磁盘）
- 应用服务告警（服务可用性、响应时间、错误率）
- 数据库告警（连接数、查询性能）
- 业务指标告警（用户活动、支付失败率）

### 通知渠道
- 邮件: alerts@wemaster.com
- Slack: #alerts
- 关键告警: oncall@wemaster.com

## 运维命令

### 查看服务状态
\`\`\`bash
cd /Volumes/BankChen/wemaster/infra/monitoring
docker-compose -f docker-compose.monitoring.yml ps
\`\`\`

### 查看日志
\`\`\`bash
# Prometheus 日志
docker-compose -f docker-compose.monitoring.yml logs -f prometheus

# Grafana 日志
docker-compose -f docker-compose.monitoring.yml logs -f grafana

# Loki 日志
docker-compose -f docker-compose.monitoring.yml logs -f loki
\`\`\`

### 重启服务
\`\`\`bash
docker-compose -f docker-compose.monitoring.yml restart [service_name]
\`\`\`

### 停止所有服务
\`\`\`bash
docker-compose -f docker-compose.monitoring.yml down
\`\`\`

## 故障排除

### 常见问题
1. **Prometheus 无法启动**: 检查配置文件语法和端口占用
2. **Grafana 无法连接数据源**: 检查网络连接和数据源配置
3. **告警不生效**: 检查 AlertManager 配置和通知设置

### 日志位置
- 监控日志: /Volumes/BankChen/wemaster/infra/monitoring/logs/
- 数据目录: /Volumes/BankChen/wemaster/infra/monitoring/data/

## 监控指标

### 关键指标
- 系统资源使用率
- 应用性能指标
- 业务关键指标
- 错误率和可用性

### 自定义指标
- 用户活跃度
- 课程预订成功率
- 支付成功率
- 会话完成率

EOF

    log_success "访问信息已生成"
}

# 主函数
main() {
    log_info "开始部署 WeMaster 监控体系..."
    log_info "M5-3 里程碑：完整可观测性部署"
    
    # 执行部署步骤
    check_dependencies
    create_directories
    deploy_monitoring_infrastructure
    verify_services
    configure_grafana
    configure_application_monitoring
    setup_alert_rules
    generate_access_info
    
    log_success "WeMaster 监控体系部署完成！"
    log_info "请查看 /Volumes/BankChen/wemaster/infra/monitoring/ACCESS_INFO.md 获取访问信息"
    
    # 显示服务状态
    echo
    log_info "当前服务状态："
    cd /Volumes/BankChen/wemaster/infra/monitoring
    docker-compose -f docker-compose.monitoring.yml ps
}

# 执行主函数
main "$@"
