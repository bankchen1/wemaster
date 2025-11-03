# M5 Staging 环境回滚操作手册

## 🚨 紧急回滚指南

### 📞 应急联系人
- **技术负责人**: [姓名] - [电话] - [邮箱]
- **运维负责人**: [姓名] - [电话] - [邮箱]
- **产品负责人**: [姓名] - [电话] - [邮箱]
- **安全负责人**: [姓名] - [电话] - [邮箱]

### ⏱️ 回滚时间估算
- **快速回滚**: 5-10分钟
- **完整回滚**: 15-30分钟
- **数据回滚**: 30-60分钟
- **验证测试**: 10-15分钟

---

## 🔄 一键回滚步骤

### 步骤1: 执行回滚脚本
```bash
# 进入项目目录
cd /Volumes/BankChen/wemaster

# 执行一键回滚脚本
chmod +x scripts/rollback-staging.sh
./scripts/rollback-staging.sh
```

### 步骤2: 验证回滚状态
```bash
# 检查服务状态
./scripts/verify-staging.sh

# 查看回滚日志
tail -f logs/m5-delivery-rollback.log
```

### 步骤3: 确认回滚完成
- [ ] 所有服务恢复到上一个稳定版本
- [ ] 数据库状态正常
- [ ] 健康检查通过
- [ ] 监控指标正常

---

## 🗄️ 数据库回滚方案

### 方案A: 使用备份恢复
```bash
# 1. 停止应用服务
fly apps stop wemaster-staging-api

# 2. 恢复数据库备份
fly postgres connect -a wemaster-staging-db
# 在psql中执行:
DROP DATABASE IF EXISTS wemaster_staging;
CREATE DATABASE wemaster_staging;
\q

# 恢复备份文件
fly s3 get backup://wemaster-staging-backup-2025-11-01.sql | \
fly postgres connect -a wemaster-staging-db -c "psql wemaster_staging"

# 3. 重启应用服务
fly apps start wemaster-staging-api
```

### 方案B: 数据库迁移回滚
```bash
# 1. 查看迁移历史
cd wemaster-nest
npx prisma migrate status

# 2. 回滚到指定版本
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

### 方案C: 事务回滚（紧急情况）
```bash
# 连接数据库执行事务回滚
fly postgres connect -a wemaster-staging-db
# 在psql中执行:
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'wemaster_staging' AND pid <> pg_backend_pid();
```

---

## ⚙️ 配置回滚方法

### 环境变量回滚
```bash
# 1. 备份当前配置
fly secrets list -a wemaster-staging-api > current-secrets.txt

# 2. 恢复上一个版本配置
fly secrets set -a wemaster-staging-api \
  DATABASE_URL="postgresql://..." \
  REDIS_URL="redis://..." \
  JWT_SECRET="previous-secret" \
  STRIPE_SECRET_KEY="sk_test_previous"

# 3. 验证配置
fly secrets list -a wemaster-staging-api
```

### Docker配置回滚
```bash
# 1. 回滚Docker镜像
fly deploy --image registry.fly.io/wemaster-staging-api:previous-stable

# 2. 更新fly.toml配置
git checkout HEAD~1 fly.toml
fly deploy --config fly.toml
```

### Nginx配置回滚
```bash
# 1. 回滚配置文件
git checkout HEAD~1 nginx/staging.conf

# 2. 重新加载配置
fly ssh console -a wemaster-staging-web -C "nginx -s reload"
```

---

## 🔄 服务重启流程

### 后端服务重启
```bash
# 1. 停止服务
fly apps stop wemaster-staging-api

# 2. 清理缓存
fly ssh console -a wemaster-staging-api -C "rm -rf /tmp/cache/*"

# 3. 重启服务
fly apps start wemaster-staging-api

# 4. 验证服务
curl -f https://api-staging.wemaster.com/healthz
```

### 前端服务重启
```bash
# 1. 重新构建
cd wemaster-admin
npm run build

# 2. 部署
fly deploy --app wemaster-staging-admin

# 3. 验证
curl -f https://admin-staging.wemaster.com
```

### 数据库服务重启
```bash
# 1. 重启数据库
fly postgres restart -a wemaster-staging-db

# 2. 验证连接
fly postgres connect -a wemaster-staging-db -c "SELECT version();"
```

---

## ✅ 回滚验证检查点

### 功能验证清单
- [ ] **用户认证**
  - [ ] 用户登录正常
  - [ ] 注册功能正常
  - [ ] 密码重置正常

- [ ] **核心业务**
  - [ ] 课程列表显示正常
  - [ ] 订单创建正常
  - [ ] 支付流程正常

- [ ] **管理功能**
  - [ ] 后台登录正常
  - [ ] 数据查询正常
  - [ ] 配置修改正常

### 技术验证清单
- [ ] **性能指标**
  - [ ] 响应时间 < 500ms
  - [ ] 错误率 < 0.5%
  - [ ] CPU使用率 < 70%

- [ ] **监控状态**
  - [ ] 健康检查通过
  - [ ] 监控指标正常
  - [ ] 告警状态正常

- [ ] **数据完整性**
  - [ ] 数据库连接正常
  - [ ] 数据一致性检查
  - [ ] 备份策略正常

---

## 🚨 应急处理预案

### 场景1: 回滚失败
```bash
# 1. 立即停止所有服务
fly apps stop wemaster-staging-api
fly apps stop wemaster-staging-admin
fly apps stop wemaster-staging-web

# 2. 启用维护模式
# 添加维护页面
echo "Maintenance Mode" > public/maintenance.html

# 3. 通知相关人员
# 发送紧急通知
```

### 场景2: 数据丢失
```bash
# 1. 立即停止写入操作
fly apps stop wemaster-staging-api

# 2. 从最新备份恢复
fly s3 get backup://latest-backup.sql | \
fly postgres connect -a wemaster-staging-db -c "psql wemaster_staging"

# 3. 验证数据完整性
fly postgres connect -a wemaster-staging-db -c "SELECT COUNT(*) FROM users;"
```

### 场景3: 服务不可用
```bash
# 1. 检查服务状态
fly status

# 2. 查看日志
fly logs -a wemaster-staging-api --tail 100

# 3. 重启服务
fly apps restart wemaster-staging-api
```

---

## 📋 回滚决策流程

### 触发条件
- [ ] 关键功能不可用
- [ ] 性能严重下降
- [ ] 数据安全问题
- [ ] 用户投诉激增

### 决策步骤
1. **评估影响范围** (2分钟)
   - 确定受影响用户数量
   - 评估业务影响程度

2. **制定回滚方案** (3分钟)
   - 选择回滚策略
   - 准备回滚脚本

3. **执行回滚操作** (5-10分钟)
   - 执行回滚脚本
   - 监控回滚进度

4. **验证回滚结果** (5分钟)
   - 功能验证测试
   - 性能指标检查

5. **通知相关方** (2分钟)
   - 通知业务团队
   - 更新状态页面

---

## 📊 回滚后监控

### 关键指标监控
- **可用性**: 99.9%+
- **响应时间**: P95 < 500ms
- **错误率**: < 0.5%
- **吞吐量**: > 1000 RPS

### 监控工具
- **Grafana**: 性能指标监控
- **Prometheus**: 指标收集
- **Sentry**: 错误追踪
- **Uptime**: 可用性监控

### 告警配置
```yaml
# 回滚后告警规则
groups:
  - name: rollback-alerts
    rules:
      - alert: HighErrorRate
        expr: error_rate > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "回滚后错误率过高"
      
      - alert: SlowResponse
        expr: response_time_p95 > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "回滚后响应时间过慢"
```

---

## 📝 回滚报告模板

### 回滚执行报告
```markdown
# 回滚执行报告

## 基本信息
- **回滚时间**: 2025-11-02 HH:MM:SS
- **回滚原因**: [描述原因]
- **影响范围**: [描述影响]
- **执行人员**: [姓名]

## 回滚过程
- **开始时间**: HH:MM:SS
- **结束时间**: HH:MM:SS
- **总耗时**: X分钟
- **回滚版本**: [版本号]

## 验证结果
- [ ] 功能验证通过
- [ ] 性能验证通过
- [ ] 安全验证通过
- [ ] 监控正常

## 后续行动
- [ ] 问题分析
- [ ] 根因定位
- [ ] 预防措施
- [ ] 改进计划
```

---

**回滚手册版本**: M5-v1.0  
**最后更新**: 2025-11-02  
**维护人员**: DevOps团队  
**审核人员**: 技术负责人