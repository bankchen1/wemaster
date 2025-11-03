# WeMaster 部署操作手册

## 概述

本手册提供了 WeMaster 在线教育平台的完整部署指南，包括环境准备、部署流程、验证检查、故障排除和回滚策略。

**适用环境**: Test → Staging → Production  
**部署方式**: 自动化部署 + 手动验证  
**目标读者**: DevOps 工程师、系统管理员、开发团队

---

## 🚀 部署架构概览

### 环境架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Test        │    │   Staging       │
│                 │    │                 │    │                 │
│ localhost:3001  │───▶│ wemaster-api-   │───▶│ wemaster-api-   │
│ localhost:5173  │    │ test.fly.dev    │    │ staging.fly.dev │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Test DB       │    │ Staging DB      │
                       │   Railway       │    │   Railway       │
                       └─────────────────┘    └─────────────────┘
```

### 服务组件
| 组件 | 技术栈 | 部署平台 | 端口 | 健康检查 |
|------|--------|----------|------|----------|
| 后端 API | NestJS + Node.js | Fly.io | 8080 | /healthz |
| 前端管理 | Vue 3 + Vite | Vercel | 443 | - |
| 数据库 | PostgreSQL 15 | Railway | 5432 | - |
| 缓存 | Redis 7 | Railway | 6379 | - |
| 监控 | Prometheus + Grafana | Railway | 9090 | - |

---

## 📋 部署前检查清单

### 🔧 环境准备检查
- [ ] **代码检查**
  - [ ] 所有代码已提交到 main 分支
  - [ ] 版本号已更新 (package.json)
  - [ ] CHANGELOG 已更新
  - [ ] 代码审查已通过

- [ ] **构建检查**
  - [ ] 后端构建成功 (`npm run build`)
  - [ ] 前端构建成功 (`npm run build`)
  - [ ] 测试全部通过 (`npm test`)
  - [ ] 代码质量检查通过

- [ ] **配置检查**
  - [ ] 环境变量已配置
  - [ ] Doppler 密钥已同步
  - [ ] SSL 证书已配置
  - [ ] 域名 DNS 已解析

- [ ] **依赖检查**
  - [ ] 第三方服务可用性确认
  - [ ] API 密钥有效性验证
  - [ ] 数据库连接测试
  - [ ] 缓存连接测试

### 🔒 安全检查
- [ ] **漏洞扫描**
  - [ ] 依赖漏洞扫描通过
  - [ ] 代码安全扫描通过
  - [ ] OWASP 安全测试通过
  - [ ] 渗透测试通过

- [ ] **权限检查**
  - [ ] API 访问权限配置
  - [ ] 数据库权限设置
  - [ ] 文件系统权限检查
  - [ ] 网络安全组配置

### 📊 资源检查
- [ ] **服务器资源**
  - [ ] CPU 使用率 < 70%
  - [ ] 内存使用率 < 80%
  - [ ] 磁盘空间 > 20%
  - [ ] 网络带宽充足

- [ ] **数据库资源**
  - [ ] 连接池配置合理
  - [ ] 存储空间充足
  - [ ] 备份策略配置
  - [ ] 监控告警设置

---

## 🛠️ 部署流程

### 1. 环境切换
```bash
# 切换到目标环境
./switch-env.sh staging

# 验证环境配置
./verify-doppler-config.sh
```

### 2. 后端部署 (Fly.io)
```bash
# 进入后端目录
cd wemaster-nest

# 运行数据库迁移
npm run prisma:migrate:deploy

# 生成 Prisma 客户端
npm run prisma:generate

# 运行种子数据 (仅首次)
npm run prisma:seed

# 构建应用
npm run build

# 部署到 Fly.io
fly deploy

# 验证部署
fly status
curl https://wemaster-api-staging.fly.dev/healthz
```

### 3. 前端部署 (Vercel)
```bash
# 进入前端目录
cd wemaster-admin

# 生成 API 客户端
npm run generate:api

# 构建应用
npm run build

# 部署到 Vercel
vercel --prod

# 验证部署
curl https://wemaster-admin-staging.vercel.app
```

### 4. 全平台部署
```bash
# 使用一键部署脚本
./deploy-all.sh staging

# 监控部署过程
tail -f deploy.log
```

### 5. 部署验证
```bash
# 运行健康检查
./scripts/health-check.sh staging

# 运行冒烟测试
./scripts/smoke-test.sh staging

# 运行性能测试
./scripts/performance-test.sh staging
```

---

## ✅ 部署后验证

### 健康检查脚本
```bash
#!/bin/bash
# health-check.sh

ENVIRONMENT=${1:-staging}
API_URL="https://wemaster-api-${ENVIRONMENT}.fly.dev"
FRONTEND_URL="https://wemaster-admin-${ENVIRONMENT}.vercel.app"

echo "🔍 开始健康检查 - ${ENVIRONMENT} 环境..."

# API 健康检查
echo "检查 API 健康状态..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/healthz")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API 健康检查通过"
else
    echo "❌ API 健康检查失败: HTTP ${API_STATUS}"
    exit 1
fi

# 数据库连接检查
echo "检查数据库连接..."
DB_STATUS=$(curl -s "${API_URL}/health/db" | jq -r '.status')
if [ "$DB_STATUS" = "healthy" ]; then
    echo "✅ 数据库连接正常"
else
    echo "❌ 数据库连接异常"
    exit 1
fi

# Redis 连接检查
echo "检查 Redis 连接..."
REDIS_STATUS=$(curl -s "${API_URL}/health/redis" | jq -r '.status')
if [ "$REDIS_STATUS" = "healthy" ]; then
    echo "✅ Redis 连接正常"
else
    echo "❌ Redis 连接异常"
    exit 1
fi

# 前端可访问性检查
echo "检查前端访问..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ 前端访问正常"
else
    echo "❌ 前端访问失败: HTTP ${FRONTEND_STATUS}"
    exit 1
fi

echo "🎉 健康检查完成 - 所有服务正常"
```

### 冒烟测试脚本
```bash
#!/bin/bash
# smoke-test.sh

ENVIRONMENT=${1:-staging}
API_URL="https://wemaster-api-${ENVIRONMENT}.fly.dev"

echo "💨 开始冒烟测试 - ${ENVIRONMENT} 环境..."

# 用户认证测试
echo "测试用户认证..."
AUTH_RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@wemaster.com","password":"Admin123!@#"}')

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token')
if [ "$TOKEN" != "null" ]; then
    echo "✅ 用户认证测试通过"
else
    echo "❌ 用户认证测试失败"
    exit 1
fi

# API 端点测试
echo "测试核心 API 端点..."

# 测试用户列表
USERS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "${API_URL}/api/v1/users" -H "Authorization: Bearer ${TOKEN}")
if [ "$USERS_STATUS" = "200" ]; then
    echo "✅ 用户列表 API 正常"
else
    echo "❌ 用户列表 API 异常: HTTP ${USERS_STATUS}"
    exit 1
fi

# 测试课程列表
COURSES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    "${API_URL}/api/v1/courses")
if [ "$COURSES_STATUS" = "200" ]; then
    echo "✅ 课程列表 API 正常"
else
    echo "❌ 课程列表 API 异常: HTTP ${COURSES_STATUS}"
    exit 1
fi

echo "🎉 冒烟测试完成 - 所有核心功能正常"
```

### 性能测试脚本
```bash
#!/bin/bash
# performance-test.sh

ENVIRONMENT=${1:-staging}
API_URL="https://wemaster-api-${ENVIRONMENT}.fly.dev"

echo "⚡ 开始性能测试 - ${ENVIRONMENT} 环境..."

# 使用 Artillery 进行性能测试
cat > artillery-config.yml << EOF
config:
  target: "${API_URL}"
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  payload:
    path: "test-data.csv"
    fields:
      - "email"
      - "password"

scenarios:
  - name: "API Load Test"
    weight: 70
    flow:
      - get:
          url: "/api/v1/healthz"
      - get:
          url: "/api/v1/courses"
      - get:
          url: "/api/v1/users"
          
  - name: "Auth Test"
    weight: 30
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
EOF

# 运行性能测试
artillery run artillery-config.yml

echo "🎉 性能测试完成"
```

---

## 🚨 故障排除指南

### 常见问题诊断

#### 1. API 服务无法启动
**症状**: 健康检查失败，API 返回 503
**可能原因**:
- 环境变量配置错误
- 数据库连接失败
- 端口占用
- 依赖安装失败

**排查步骤**:
```bash
# 检查应用日志
fly logs

# 检查环境变量
fly secrets list

# 检查数据库连接
fly ssh console -C "npm run prisma:db:pull"

# 重启服务
fly restart
```

#### 2. 数据库连接失败
**症状**: API 返回数据库连接错误
**可能原因**:
- 数据库服务不可用
- 连接字符串错误
- 网络连接问题
- 认证失败

**排查步骤**:
```bash
# 测试数据库连接
psql $DATABASE_URL -c "SELECT 1;"

# 检查数据库状态
fly ssh console -C "npm run prisma:studio"

# 重置数据库连接
fly ssh console -C "npm run prisma:migrate:reset"
```

#### 3. 前端构建失败
**症状**: Vercel 部署失败
**可能原因**:
- 依赖安装失败
- 环境变量缺失
- 构建脚本错误
- TypeScript 编译错误

**排查步骤**:
```bash
# 本地构建测试
npm run build

# 检查依赖
npm ls

# 清理缓存
rm -rf node_modules package-lock.json
npm install

# 检查环境变量
vercel env ls
```

#### 4. 缓存服务异常
**症状**: 缓存相关功能异常
**可能原因**:
- Redis 服务不可用
- 连接配置错误
- 内存不足
- 网络连接问题

**排查步骤**:
```bash
# 测试 Redis 连接
redis-cli -u $REDIS_URL ping

# 检查 Redis 状态
redis-cli -u $REDIS_URL info

# 清理缓存
redis-cli -u $REDIS_URL flushall
```

### 紧急响应流程

#### P0 - 系统完全不可用
1. **立即响应** (5分钟内)
   - 通知所有相关人员
   - 启动应急响应小组
   - 评估影响范围

2. **快速诊断** (15分钟内)
   - 检查所有服务状态
   - 查看监控告警
   - 分析错误日志

3. **紧急修复** (30分钟内)
   - 尝试服务重启
   - 回滚到上一版本
   - 切换到备用方案

4. **恢复验证** (45分钟内)
   - 验证核心功能
   - 监控系统状态
   - 通知用户恢复

#### P1 - 核心功能异常
1. **响应时间**: 30分钟内
2. **解决时间**: 2小时内
3. **通知范围**: 技术团队 + 产品团队
4. **升级条件**: 1小时内无进展

#### P2 - 部分功能异常
1. **响应时间**: 2小时内
2. **解决时间**: 8小时内
3. **通知范围**: 相关技术团队
4. **升级条件**: 4小时内无进展

---

## 🔄 回滚策略

### 回滚触发条件
- [ ] 健康检查失败超过 5分钟
- [ ] 核心功能异常影响用户
- [ ] 性能指标下降超过 50%
- [ ] 安全漏洞发现
- [ ] 数据一致性问题

### 自动回滚脚本
```bash
#!/bin/bash
# rollback.sh

ENVIRONMENT=${1:-staging}
BACKUP_VERSION=${2:-previous}

echo "🔄 开始回滚 - ${ENVIRONMENT} 环境..."

# 1. 备份当前版本
echo "备份当前版本..."
./scripts/backup-current-version.sh ${ENVIRONMENT}

# 2. 数据库回滚
echo "回滚数据库..."
cd wemaster-nest
npm run prisma:migrate:rollback
npm run prisma:db:seed

# 3. 后端回滚
echo "回滚后端服务..."
fly deploy --config fly.${BACKUP_VERSION}.toml

# 4. 前端回滚
echo "回滚前端服务..."
cd ../wemaster-admin
vercel rollback ${BACKUP_VERSION}

# 5. 验证回滚
echo "验证回滚结果..."
./scripts/health-check.sh ${ENVIRONMENT}

echo "🎉 回滚完成"
```

### 数据库回滚
```bash
#!/bin/bash
# rollback-database.sh

ENVIRONMENT=${1:-staging}
MIGRATION_ID=${2:-latest}

echo "🗄️ 开始数据库回滚..."

# 备份当前数据
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# 回滚迁移
cd wemaster-nest
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed

# 验证数据一致性
npm run consistency-check

echo "✅ 数据库回滚完成"
```

### 配置回滚
```bash
#!/bin/bash
# rollback-config.sh

ENVIRONMENT=${1:-staging}

echo "⚙️ 开始配置回滚..."

# 恢复环境变量
doppler secrets download --env=${ENVIRONMENT} --format=env

# 重启服务
fly restart

# 验证配置
./verify-doppler-config.sh

echo "✅ 配置回滚完成"
```

---

## 📊 监控和告警

### 关键监控指标
```yaml
# 业务指标
business_metrics:
  - name: user_registrations_total
    threshold: 10/min
    severity: warning
  - name: course_enrollments_total  
    threshold: 5/min
    severity: warning
  - name: payment_success_rate
    threshold: 95%
    severity: critical

# 技术指标
technical_metrics:
  - name: http_request_duration_seconds
    threshold: 500ms
    severity: warning
  - name: error_rate
    threshold: 5%
    severity: critical
  - name: cpu_usage
    threshold: 80%
    severity: warning
  - name: memory_usage
    threshold: 85%
    severity: critical
```

### 告警配置
```yaml
# Prometheus 告警规则
groups:
  - name: wemaster_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
```

### 监控面板
- **Grafana 仪表板**: https://grafana.wemaster.com
- **Sentry 错误追踪**: https://sentry.io/wemaster
- **日志聚合**: https://logs.wemaster.com

---

## 🔧 维护操作

### 定期维护任务
```bash
#!/bin/bash
# maintenance.sh

echo "🔧 开始定期维护..."

# 1. 数据库维护
echo "执行数据库维护..."
cd wemaster-nest
npm run prisma:migrate:deploy
npm run db:optimize
npm run db:vacuum

# 2. 缓存清理
echo "清理缓存..."
redis-cli -u $REDIS_URL flushall

# 3. 日志清理
echo "清理日志..."
find . -name "*.log" -mtime +7 -delete

# 4. 依赖更新
echo "检查依赖更新..."
npm audit fix
npm update

# 5. 备份验证
echo "验证备份..."
./scripts/verify-backups.sh

echo "✅ 维护完成"
```

### 备份策略
```bash
#!/bin/bash
# backup.sh

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "💾 开始备份 - ${ENVIRONMENT} 环境..."

# 数据库备份
pg_dump $DATABASE_URL > backup-db-${ENVIRONMENT}-${TIMESTAMP}.sql

# 配置备份
doppler secrets download --env=${ENVIRONMENT} --format=env > backup-config-${ENVIRONMENT}-${TIMESTAMP}.env

# 代码备份
git archive --format=tar.gz main > backup-code-${ENVIRONMENT}-${TIMESTAMP}.tar.gz

# 上传到云存储
aws s3 cp backup-db-${ENVIRONMENT}-${TIMESTAMP}.sql s3://wemaster-backups/
aws s3 cp backup-config-${ENVIRONMENT}-${TIMESTAMP}.env s3://wemaster-backups/
aws s3 cp backup-code-${ENVIRONMENT}-${TIMESTAMP}.tar.gz s3://wemaster-backups/

echo "✅ 备份完成"
```

---

## 📋 Staging 环境晋级检查清单

### 功能验证
- [ ] **用户认证**
  - [ ] 用户注册流程正常
  - [ ] 用户登录功能正常
  - [ ] 密码重置功能正常
  - [ ] JWT 令牌刷新正常

- [ ] **课程管理**
  - [ ] 课程创建功能正常
  - [ ] 课程列表显示正常
  - [ ] 课程搜索功能正常
  - [ ] 课程详情显示正常

- [ ] **订单支付**
  - [ ] 订单创建流程正常
  - [ ] Stripe 支付集成正常
  - [ ] 支付成功回调正常
  - [ ] 订单状态更新正常

- [ ] **钱包系统**
  - [ ] 钱包余额显示正常
  - [ ] 充值功能正常
  - [ ] 提现功能正常
  - [ ] 交易记录显示正常

### 性能验证
- [ ] **API 响应时间**
  - [ ] 平均响应时间 < 200ms
  - [ ] 95% 分位数 < 500ms
  - [ ] 99% 分位数 < 1000ms

- [ ] **系统吞吐量**
  - [ ] 支持 1000 并发用户
  - [ ] 支持 10000 QPS
  - [ ] 数据库连接池正常

- [ ] **资源使用率**
  - [ ] CPU 使用率 < 70%
  - [ ] 内存使用率 < 80%
  - [ ] 磁盘使用率 < 85%

### 安全验证
- [ ] **认证安全**
  - [ ] 密码强度验证
  - [ ] 会话管理正常
  - [ ] 权限控制有效

- [ ] **数据安全**
  - [ ] 传输加密正常
  - [ ] 存储加密正常
  - [ ] 敏感数据脱敏

- [ ] **API 安全**
  - [ ] 速率限制有效
  - [ ] 输入验证完整
  - [ ] 错误处理安全

### 监控验证
- [ ] **健康检查**
  - [ ] API 健康检查正常
  - [ ] 数据库连接正常
  - [ ] 缓存服务正常

- [ ] **日志记录**
  - [ ] 应用日志完整
  - [ ] 错误日志记录
  - [ ] 审计日志完整

- [ ] **告警配置**
  - [ ] 关键指标监控
  - [ ] 告警规则配置
  - [ ] 通知渠道正常

---

## 🎯 生产部署准备

### 最终检查清单
- [ ] 所有测试通过
- [ ] 性能指标达标
- [ ] 安全扫描通过
- [ ] 监控配置完成
- [ ] 备份策略就绪
- [ ] 回滚方案验证
- [ ] 团队培训完成
- [ ] 用户通知准备

### 部署时间窗口
- **建议时间**: 周末凌晨 2:00-4:00
- **维护窗口**: 4小时
- **通知时间**: 提前 48 小时
- ** rollback 时间**: 30分钟内

### 应急联系方式
- **技术负责人**: [姓名] - [电话]
- **运维负责人**: [姓名] - [电话]
- **产品负责人**: [姓名] - [电话]
- **客服负责人**: [姓名] - [电话]

---

**文档版本**: v1.0  
**最后更新**: 2025年11月2日  
**维护团队**: WeMaster DevOps 团队  
**审核人**: [技术负责人]