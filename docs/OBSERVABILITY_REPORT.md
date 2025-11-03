# WeMaster 可观测性系统配置报告

## 概述

本报告详细说明了 WeMaster 平台的可观测性系统配置，包括错误追踪、分布式追踪、指标收集、日志聚合、Uptime 监控和告警系统的完整实现。

**配置日期**: 2025年11月2日  
**版本**: 1.0.0  
**环境**: Staging  

## 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WeMaster API  │───▶│  OTEL Collector  │───▶│   Prometheus    │
│                 │    │                  │    │                 │
│ - Sentry SDK    │    │ - Traces         │    │ - Metrics       │
│ - OTEL SDK      │    │ - Metrics        │    │ - Alerting      │
│ - Custom Logs   │    │ - Logs           │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Sentry      │    │      Jaeger      │    │     Grafana     │
│                 │    │                  │    │                 │
│ - Error Tracking│    │ - Trace UI       │    │ - Dashboards    │
│ - Performance   │    │ - Service Map    │    │ - Visualization│
│ - Releases      │    │ - Dependency Map │    │ - Alerting      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 1. Sentry 错误追踪配置

### 配置详情

**配置文件**: `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/sentry.config.js`

```javascript
module.exports = {
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "staging",
  release: "wemaster@1.0.0",
  tracesSampleRate: 0.1,
  debug: true,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express(),
    new Sentry.Integrations.Prisma(),
    new Sentry.Integrations.Redis()
  ]
};
```

**服务实现**: `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/sentry.service.ts`

### 功能特性

- ✅ **自动错误捕获**: 捕获所有未处理的异常和 Promise 拒绝
- ✅ **分布式追踪**: 10% 采样率的性能追踪
- ✅ **上下文信息**: 用户信息、请求详情、环境变量
- ✅ **源码映射**: 生产环境错误堆栈映射
- ✅ **版本追踪**: 与 Git commit 关联的 release 追踪
- ✅ **自定义面包屑**: 用户操作和系统事件追踪

### 监控指标

- 错误率趋势
- 性能影响分析
- 用户影响范围
- 错误分布（按版本、浏览器、地理位置）

### 仪表盘截图

📸 **Sentry 仪表盘**: [https://sentry.io/organizations/wemaster/dashboard/](https://sentry.io/organizations/wemaster/dashboard/)

![Sentry Dashboard](screenshots/sentry-dashboard.png)

## 2. OpenTelemetry 追踪与指标集成

### 配置详情

**配置文件**: `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/otel.config.js`

**服务实现**: `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/otel.service.ts`

### 追踪配置

- **采样率**: 10% (可配置)
- **导出器**: OTLP gRPC
- **资源标签**: 服务名称、版本、环境、团队
- **自动插桩**: HTTP、数据库、Redis、文件系统

### 指标配置

- **收集间隔**: 30秒
- **指标类型**: Counter、Gauge、Histogram
- **自定义指标**: 业务指标、性能指标、错误指标
- **预聚合**: 请求延迟、错误率、吞吐量

### 集成状态

| 组件 | 状态 | 端点 | 描述 |
|------|------|------|------|
| Collector | ✅ 运行中 | http://localhost:4317 | OTLP gRPC 接收器 |
| Jaeger | ✅ 运行中 | http://localhost:16686 | 分布式追踪 UI |
| Prometheus | ✅ 运行中 | http://localhost:9090 | 指标存储和查询 |
| Grafana | ✅ 运行中 | http://localhost:3000 | 可视化仪表盘 |

### 仪表盘配置

📸 **OTEL 追踪仪表盘**: [http://localhost:3000/d/otel-traces](http://localhost:3000/d/otel-traces)

📸 **系统指标仪表盘**: [http://localhost:3000/d/system-metrics](http://localhost:3000/d/system-metrics)

![OTEL Dashboard](screenshots/otel-dashboard.png)

## 3. Uptime 探针配置（60秒间隔）

### 配置详情

**服务实现**: `/Volumes/BankChen/wemaster/infra/monitoring/uptime-probe.service.ts`

### 探针端点

| 探针名称 | 端点 | 方法 | 期望状态 | 超时时间 |
|----------|------|------|----------|----------|
| api-health | `/healthz` | GET | 200 | 10s |
| api-docs | `/docs` | GET | 200 | 10s |
| admin-dashboard | `/` | GET | 200 | 10s |
| database-connection | `/health/db` | GET | 200 | 5s |
| redis-connection | `/health/redis` | GET | 200 | 5s |

### 监控指标

- **可用性百分比**: 最近10次检查的可用性
- **平均响应时间**: 最近10次检查的平均响应时间
- **状态变更时间戳**: 最后一次状态变更时间
- **错误详情**: 失败原因和HTTP状态码

### 告警配置

- **关键告警**: 探针连续失败2分钟
- **警告告警**: 响应时间超过5秒
- **恢复通知**: 服务恢复后自动发送恢复通知

### 日志输出

```
logs/uptime/
├── uptime-2025-11-02.log
├── uptime-2025-11-01.log
└── probe-results.json
```

### 仪表盘截图

📸 **Uptime 监控仪表盘**: [http://localhost:3000/d/uptime-monitoring](http://localhost:3000/d/uptime-monitoring)

![Uptime Dashboard](screenshots/uptime-dashboard.png)

## 4. 日志采集与聚合策略

### 配置详情

**服务实现**: `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/logging.service.ts`

### 日志分类

| 类型 | 路径 | 保留期 | 大小限制 |
|------|------|--------|----------|
| 应用日志 | `logs/application/` | 30天 | 100MB |
| 错误日志 | `logs/error/` | 30天 | 50MB |
| 审计日志 | `logs/audit/` | 365天 | 100MB |
| 性能日志 | `logs/performance/` | 30天 | 50MB |
| 安全日志 | `logs/security/` | 365天 | 50MB |

### 日志格式

```json
{
  "timestamp": "2025-11-02T10:30:00.000Z",
  "level": "info",
  "message": "User login successful",
  "service": "wemaster-api",
  "environment": "staging",
  "hostname": "api-server-01",
  "pid": 12345,
  "userId": "user_123",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req_abc123",
  "duration": 150
}
```

### 专用日志方法

- `audit()`: 审计事件记录
- `performance()`: 性能指标记录
- `security()`: 安全事件记录
- `business()`: 业务事件记录
- `database()`: 数据库操作记录

### 聚合配置

**Loki 配置**: `/Volumes/BankChen/wemaster/infra/monitoring/loki-config.yaml`

**Promtail 配置**: `/Volumes/BankChen/wemaster/infra/monitoring/promtail-config.yml`

- **收集间隔**: 实时
- **批处理**: 1000条或5秒
- **压缩**: gzip
- **标签**: service, environment, level

### 日志查询示例

```logql
{service="wemaster-api"} |= "error" | logfmt | level != "debug"
{service="wemaster-api"} | json | duration > 1000
{service="wemaster-api"} | line_format "{{.message}}" | regexp "(?P<error>\\w+Error)"
```

### 仪表盘截图

📸 **日志分析仪表盘**: [http://localhost:3000/d/log-analysis](http://localhost:3000/d/log-analysis)

![Log Dashboard](screenshots/log-dashboard.png)

## 5. 仪表盘配置

### Grafana 仪表盘列表

| 仪表盘名称 | ID | 描述 | 链接 |
|------------|----|----- |------|
| 系统概览 | 1 | 整体系统健康状况 | [查看](http://localhost:3000/d/system-overview) |
| API 性能 | 2 | API 响应时间和错误率 | [查看](http://localhost:3000/d/api-performance) |
| 数据库监控 | 3 | PostgreSQL 性能指标 | [查看](http://localhost:3000/d/database-monitoring) |
| Redis 监控 | 4 | Redis 性能和内存使用 | [查看](http://localhost:3000/d/redis-monitoring) |
| 业务指标 | 5 | 订单、用户、支付指标 | [查看](http://localhost:3000/d/business-metrics) |
| 错误追踪 | 6 | Sentry 错误统计 | [查看](http://localhost:3000/d/error-tracking) |
| 分布式追踪 | 7 | Jaeger 追踪分析 | [查看](http://localhost:3000/d/distributed-tracing) |
| 日志分析 | 8 | Loki 日志查询和分析 | [查看](http://localhost:3000/d/log-analysis) |
| Uptime 监控 | 9 | 服务可用性监控 | [查看](http://localhost:3000/d/uptime-monitoring) |
| 安全监控 | 10 | 安全事件和异常检测 | [查看](http://localhost:3000/d/security-monitoring) |

### 自定义面板

1. **响应时间分布**: Histogram 展示 API 响应时间分布
2. **错误率趋势**: 时间序列展示错误率变化
3. **用户活跃度**: 实时用户在线统计
4. **订单处理量**: 每分钟订单创建和完成数量
5. **支付成功率**: 支付成功率和失败原因分析
6. **系统资源使用**: CPU、内存、磁盘使用率

### 仪表盘截图占位符

📸 **系统概览仪表盘**: [screenshots/system-overview.png](screenshots/system-overview.png)

📸 **API 性能仪表盘**: [screenshots/api-performance.png](screenshots/api-performance.png)

📸 **业务指标仪表盘**: [screenshots/business-metrics.png](screenshots/business-metrics.png)

## 6. 告警规则配置

### 告警分类

#### 系统告警
- **应用宕机**: 连续1分钟无响应
- **高错误率**: 5分钟内错误率超过5%
- **响应时间**: 95%分位响应时间超过1秒
- **资源使用**: 内存超过512MB，CPU超过80%

#### 基础设施告警
- **数据库连接**: 活跃连接数超过80
- **Redis 连接**: 客户端连接数超过50
- **磁盘空间**: 剩余空间少于20%

#### 业务告警
- **订单失败**: 订单创建失败率超过10%
- **支付失败**: 支付失败率超过10%
- **用户注册**: 注册速率异常（超过100/秒）

#### 安全告警
- **可疑登录**: 5分钟内失败登录超过10次
- **API 限流**: 限流触发频率超过5次/秒

### 告警通道

- **Slack**: 主要告警通道
- **邮件**: 关键告警备份通道
- **短信**: 紧急告警通道
- **钉钉**: 团队协作通道

### 告警配置文件

**Prometheus 规则**: `/Volumes/BankChen/wemaster/infra/monitoring/alert_rules.yml`

**AlertManager 配置**: `/Volumes/BankChen/wemaster/infra/monitoring/alertmanager.yml`

### 告警抑制规则

- **维护窗口**: 计划维护期间自动抑制告警
- **级联告警**: 避免同一故障的重复告警
- **频率限制**: 相同告警1小时内最多发送一次

## 7. 性能监控端点

### 内置端点

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/monitoring/health` | GET | 监控系统健康状态 | 无 |
| `/monitoring/status` | GET | 详细系统状态 | 内部 |
| `/monitoring/uptime` | GET | Uptime 探针状态 | 内部 |
| `/monitoring/logs/stats` | GET | 日志统计信息 | 内部 |
| `/monitoring/metrics` | GET | Prometheus 指标 | 无 |
| `/monitoring/test-error` | POST | 测试错误报告 | 内部 |
| `/monitoring/test-log` | POST | 测试日志记录 | 内部 |

### 健康检查端点

```bash
# 基础健康检查
curl http://localhost:3001/healthz

# 详细健康检查
curl http://localhost:3001/health/detailed

# 数据库连接检查
curl http://localhost:3001/health/db

# Redis 连接检查
curl http://localhost:3001/health/redis
```

### 指标端点

```bash
# Prometheus 格式指标
curl http://localhost:3001/monitoring/metrics

# JSON 格式指标
curl http://localhost:3001/monitoring/metrics?format=json
```

## 8. 部署和运维

### Docker Compose 部署

**配置文件**: `/Volumes/BankChen/wemaster/docker-compose.observability.yml`

```bash
# 启动所有可观测性服务
docker-compose -f docker-compose.observability.yml up -d

# 查看服务状态
docker-compose -f docker-compose.observability.yml ps

# 查看日志
docker-compose -f docker-compose.observability.yml logs -f
```

### 服务列表

| 服务 | 端口 | 描述 |
|------|------|------|
| otel-collector | 4317, 4318 | OpenTelemetry 收集器 |
| prometheus | 9090 | 指标存储 |
| grafana | 3000 | 可视化仪表盘 |
| jaeger | 16686 | 分布式追踪 UI |
| loki | 3100 | 日志存储 |
| promtail | 9080 | 日志收集器 |
| alertmanager | 9093 | 告警管理 |
| node-exporter | 9100 | 系统指标 |
| cadvisor | 8080 | 容器指标 |

### 环境变量配置

**配置文件**: `/Volumes/BankChen/wemaster/.env.observability`

```bash
# 加载可观测性配置
source .env.observability

# 启动应用
npm run start:dev
```

### 监控脚本

**日志控制**: `/Volumes/BankChen/wemaster/scripts/log-control.sh`

```bash
# 查看实时日志
./scripts/log-control.sh console_tail application

# 查看错误日志
./scripts/log-control.sh console_tail error

# 查看性能日志
./scripts/log-control.sh console_tail performance
```

## 9. 故障排除指南

### 常见问题

#### Sentry 不上报错误
1. 检查 `SENTRY_DSN` 环境变量
2. 验证网络连接到 Sentry 服务器
3. 检查采样率配置
4. 查看应用日志中的 Sentry 错误

#### OTEL 追踪数据缺失
1. 检查 OTEL Collector 服务状态
2. 验证应用与 Collector 的连接
3. 检查采样率配置
4. 查看 Collector 日志

#### Uptime 探针失败
1. 检查目标服务是否正常运行
2. 验证网络连通性
3. 检查防火墙设置
4. 查看探针日志

#### 日志不显示在 Grafana
1. 检查 Promtail 服务状态
2. 验证 Loki 服务状态
3. 检查日志文件权限
4. 验证 Promtail 配置

### 调试命令

```bash
# 检查所有服务状态
docker-compose -f docker-compose.observability.yml ps

# 查看 Collector 指标
curl http://localhost:8888/metrics

# 测试 Sentry 配置
curl -X POST http://localhost:3001/monitoring/test-error \
  -H "Content-Type: application/json" \
  -d '{"type": "generic"}'

# 查看 Prometheus 目标
curl http://localhost:9090/api/v1/targets

# 测试 Loki 查询
curl -G -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={service="wemaster-api"}'
```

## 10. 性能优化建议

### 采样策略
- **生产环境**: 错误追踪 100%，性能追踪 1%
- **Staging 环境**: 错误追踪 100%，性能追踪 10%
- **开发环境**: 错误追踪 100%，性能追踪 100%

### 存储优化
- **Prometheus**: 数据保留 15 天
- **Loki**: 日志保留 30 天
- **Jaeger**: 追踪数据保留 7 天

### 网络优化
- 使用批处理减少网络请求
- 启用压缩减少传输大小
- 配置合理的超时时间

## 11. 安全考虑

### 数据保护
- 敏感信息脱敏处理
- 传输层加密 (TLS)
- 访问控制和认证

### 隐私合规
- PII 数据自动过滤
- 数据保留策略
- 访问日志记录

## 12. 下一步计划

### 短期目标 (1-2周)
- [ ] 完善告警规则和阈值调优
- [ ] 添加更多业务指标监控
- [ ] 优化仪表盘布局和可视化
- [ ] 完善文档和运维手册

### 中期目标 (1-2月)
- [ ] 集成 APM 工具 (如 New Relic)
- [ ] 实现智能告警和异常检测
- [ ] 添加容量规划和预测功能
- [ ] 实现多环境监控统一管理

### 长期目标 (3-6月)
- [ ] 构建全链路监控体系
- [ ] 实现自动化运维和自愈
- [ ] 集成混沌工程测试
- [ ] 构建监控即代码 (Monitoring as Code)

## 13. 联系信息

**运维团队**: ops@wemaster.com  
**开发团队**: dev@wemaster.com  
**紧急联系**: +86-xxx-xxxx-xxxx  

---

**报告生成时间**: 2025年11月2日 10:30:00 UTC  
**报告版本**: 1.0.0  
**下次更新**: 2025年11月9日  

## 附录

### A. 配置文件清单
- `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/sentry.config.js`
- `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/sentry.service.ts`
- `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/otel.config.js`
- `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/otel.service.ts`
- `/Volumes/BankChen/wemaster/infra/monitoring/uptime-probe.service.ts`
- `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/logging.service.ts`
- `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/monitoring.module.ts`
- `/Volumes/BankChen/wemaster/wemaster-nest/src/core/monitoring/monitoring.controller.ts`
- `/Volumes/BankChen/wemaster/.env.observability`
- `/Volumes/BankChen/wemaster/docker-compose.observability.yml`
- `/Volumes/BankChen/wemaster/infra/monitoring/otel-collector-config.yaml`
- `/Volumes/BankChen/wemaster/infra/monitoring/prometheus.yml`
- `/Volumes/BankChen/wemaster/infra/monitoring/alert_rules.yml`

### B. 端口映射表
| 服务 | 内部端口 | 外部端口 | 协议 |
|------|----------|----------|------|
| WeMaster API | 3001 | 3001 | HTTP |
| Grafana | 3000 | 3000 | HTTP |
| Prometheus | 9090 | 9090 | HTTP |
| Jaeger | 16686 | 16686 | HTTP |
| Loki | 3100 | 3100 | HTTP |
| AlertManager | 9093 | 9093 | HTTP |
| OTEL Collector | 4317 | 4317 | gRPC |
| OTEL Collector | 4318 | 4318 | HTTP |
| Node Exporter | 9100 | 9100 | HTTP |
| cAdvisor | 8080 | 8080 | HTTP |

### C. 访问凭据
```
Grafana: admin / admin123 (请修改默认密码)
Prometheus: 无认证 (生产环境请配置)
Jaeger: 无认证 (生产环境请配置)
```

---

**注意**: 本报告中的截图链接为占位符，实际部署后需要替换为真实的截图文件。所有配置文件中的敏感信息（如 API 密钥、密码等）都需要在生产环境中替换为实际值。