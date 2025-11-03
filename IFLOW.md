# iFlow 上下文：WeMaster 教育平台

## 项目概览

WeMaster 是一个综合性在线教育平台，连接学生与专业导师，提供个性化一对一辅导、互动课程和灵活学习路径。该平台采用现代技术栈和最佳实践构建，专注于性能、安全性和可扩展性。

### 核心特性

- **多租户架构** - 支持多个租户，数据完全隔离
- **现代化前端** - Vue 3 + Vite + Element Plus 管理后台
- **高性能后端** - NestJS + Prisma + PostgreSQL + Redis
- **移动端支持** - Flutter 跨平台移动应用
- **实时通信** - WebSocket 支持即时消息和视频通话
- **支付系统** - 集成 Stripe 支付和钱包系统
- **权限控制** - 基于 RBAC 的细粒度权限管理
- **数据可视化** - ECharts 图表展示关键业务指标
- **可观测性系统** - OpenTelemetry + Sentry + Grafana 全链路监控
- **生产级安全** - OWASP ASVS 合规，多层安全防护
- **自动化测试** - E2E + 压测 + 安全扫描完整测试体系

## 项目架构

### 技术栈

#### 管理后台 (wemaster-admin)
- **框架**: Vue 3 + Vite + Vue Router + Pinia
- **UI 组件库**: Element Plus
- **数据可视化**: ECharts
- **API 工具**: Orval (OpenAPI SDK 生成)
- **构建工具**: Vite
- **语言**: JavaScript (ES6+)
- **监控**: OpenTelemetry + Sentry 集成
- **测试**: Playwright E2E 测试

#### 后端 API (wemaster-nest)
- **框架**: NestJS
- **数据库**: PostgreSQL (使用 Prisma ORM)
- **缓存**: Redis
- **支付**: Stripe
- **存储**: AWS S3
- **队列**: BullMQ
- **文档**: Swagger/OpenAPI
- **认证**: JWT + Passport
- **日志**: Pino
- **监控**: OpenTelemetry + Prometheus + Grafana
- **安全**: Helmet + CORS + CSRF + 速率限制
- **审计**: 完整的审计日志系统

#### 移动端应用 (wemaster-app-flutter)
- **框架**: Flutter + Dart (^3.7.2)
- **状态管理**: Riverpod + Provider
- **路由**: Go Router (^14.2.7)
- **实时通信**: Socket.IO
- **视频通话**: Agora RTC (^6.3.2)
- **支付**: Flutter Stripe (^10.1.1)
- **本地存储**: Hive + SharedPreferences
- **测试**: Integration Test + Golden Test
- **网络**: Dio + 缓存拦截器
- **权限**: Permission Handler

#### 核心共享库 (wemaster-core)
- **API 客户端**: OpenAPI 生成的类型安全客户端
- **共享类型**: TypeScript 类型定义
- **工具函数**: 通用工具和验证器

### 目录结构

```
wemaster/
├── wemaster-admin/      # Vue 3 管理后台
│   ├── src/
│   │   ├── api/         # OpenAPI 生成的客户端
│   │   ├── components/  # 可复用组件
│   │   ├── modules/     # 业务模块
│   │   ├── router/      # 路由配置
│   │   ├── store/       # Pinia 状态管理
│   │   └── utils/       # 工具函数
│   └── orval.config.js  # API 生成配置
├── wemaster-nest/       # NestJS 后端 API
│   ├── src/
│   │   ├── core/        # 核心功能 (认证、租户、RBAC、监控)
│   │   ├── modules/     # 业务模块
│   │   ├── infra/       # 基础设施服务
│   │   └── common/      # 共享工具和装饰器
│   └── prisma/          # 数据库模型和种子数据
├── wemaster-app-flutter/ # Flutter 移动应用
│   ├── lib/
│   │   ├── core/        # 核心功能
│   │   ├── pages/       # 页面
│   │   ├── widgets/     # UI 组件
│   │   ├── services/    # 业务服务
│   │   └── routes/      # 路由配置
│   └── pubspec.yaml     # 依赖配置
├── wemaster-core/        # 共享核心库
│   └── src/
│       └── api/         # API 客户端和类型定义
├── scripts/              # 自动化脚本
│   ├── log-control.sh   # 日志控制脚本
│   ├── m6-*.sh         # M6 测试脚本
│   └── rollback-staging.sh # 回滚脚本
├── docs/                 # 项目文档
│   ├── ENDPOINTS_STAGING.md
│   ├── HARDENING_REPORT.md
│   ├── OBSERVABILITY_REPORT.md
│   ├── SECURITY_AUDIT.md
│   └── [其他 M5-M7 文档]
├── infra/                # 基础设施配置
│   └── monitoring/      # 监控配置
├── logs/                 # 执行日志
├── performance-tests/    # 性能测试
└── docker-compose.observability.yml # 可观测性栈
```

## 核心功能模块

### 1. 用户管理 (Users)
- 用户注册、登录、认证
- 角色权限管理 (学生/导师/管理员)
- KYC 合规验证
- 用户资料管理

### 2. 导师管理 (Tutors)
- 导师资料和资质管理
- 课程发布和管理
- 日程安排和可用性
- 收益统计和结算

### 3. 学生管理 (Students)
- 学生资料和学习进度
- 课程预约和出席
- 权益和会员管理
- 钱包和支付记录

### 4. 课程管理 (Courses)
- 课程创建和发布
- 课程变体和定价
- 课程分类和搜索
- 课程评价和评分

### 5. 预约系统 (Sessions)
- 课程预约和排期
- 座位锁定机制
- 改期和取消处理
- 出勤记录管理

### 6. 订单支付 (Orders & Payments)
- 订单创建和管理
- Stripe 支付集成
- 退款处理
- 交易记录和发票

### 7. 钱包系统 (Wallets)
- 虚拟钱包管理
- 充值和提现
- 交易流水
- 自动充值功能

### 8. 订阅系统 (Subscriptions)
- VIP 会员计划
- 订阅权益管理
- 递归 billing
- 试用期管理

### 9. 消息系统 (Messages)
- 实时聊天功能
- 文件附件支持
- 消息监管和过滤
- 举报处理

### 10. 社区功能 (Community)
- 讨论论坛
- 学习小组
- 用户关注
- 内容收藏和分享

### 11. 数据分析 (Analytics)
- 业务指标看板
- 用户行为分析
- 财务报表
- 性能监控

### 12. 系统管理 (Settings)
- 全局配置
- 权限矩阵
- 功能开关
- 审计日志

## 开发环境与运行

### 环境要求

- Node.js >= 20.19.0 或 >=22.12.0
- PostgreSQL >= 13
- Redis >= 6
- Flutter >= 3.7.2
- Docker (推荐)
- Doppler (环境变量管理)
- Make (构建工具)

### 快速开始

#### 1. 克隆项目
```bash
git clone https://github.com/wemaster/wemaster-platform.git
cd wemaster
```

#### 2. 后端设置 (wemaster-nest)
```bash
cd wemaster-nest
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库和 API 密钥

# 数据库设置
npx prisma generate
npx prisma migrate dev
npx prisma seed

# 启动开发服务器
npm run start:dev
```

#### 3. 管理后台设置 (wemaster-admin)
```bash
cd wemaster-admin
npm install

# 生成 API 客户端
npm run generate:api

# 启动开发服务器
npm run dev
```

#### 4. 移动应用设置 (wemaster-app-flutter)
```bash
cd wemaster-app-flutter
flutter pub get

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置 API 地址

# 运行应用
flutter run
```

### 访问地址

- **后端 API**: http://localhost:3001/api/v1 (开发) / http://localhost:3002/api/v1 (当前运行)
- **API 文档**: http://localhost:3001/docs
- **管理后台**: http://localhost:5173
- **健康检查**: http://localhost:3001/healthz
- **Grafana 监控**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **Jaeger 追踪**: http://localhost:16686

## API 集成

### OpenAPI SDK 生成

项目使用 Orval 工具基于 OpenAPI 规范自动生成 API 客户端：

```bash
# 后端生成 OpenAPI 规范
cd wemaster-nest
npm run swagger:export

# 前端生成 API 客户端
cd wemaster-admin
npm run generate:api
```

### API 配置

API 客户端配置包含：
- 请求拦截器
- 响应拦截器
- 租户 ID 注入
- 认证令牌处理
- 错误处理

## 开发规范

### 代码风格

- **后端**: 遵循 NestJS 最佳实践，使用 TypeScript 严格模式
- **前端**: 遵循 Vue 3 Composition API 规范，使用 ES6+ 语法
- **移动端**: 遵循 Flutter/Dart 官方风格指南

### 提交规范

使用语义化提交信息：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构代码
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

### 分支策略

- `main`: 生产环境分支
- `develop`: 开发环境分支
- `feature/*`: 功能开发分支
- `hotfix/*`: 紧急修复分支

## 测试

### 后端测试
```bash
cd wemaster-nest
npm run test              # 单元测试
npm run test:e2e          # 端到端测试
npm run test:cov          # 测试覆盖率
```

### 前端测试
```bash
cd wemaster-admin
npm run test              # 单元测试
npm run test:e2e          # 端到端测试
```

### 移动端测试
```bash
cd wemaster-app-flutter
flutter test              # 单元测试
flutter drive             # 集成测试
```

## 部署

### 生产环境部署

1. **构建所有服务**
```bash
# 构建后端
cd wemaster-nest
npm run build

# 构建管理后台
cd wemaster-admin
npm run build

# 构建移动应用
cd wemaster-app-flutter
flutter build apk --release
flutter build ios --release
```

2. **数据库迁移**
```bash
cd wemaster-nest
npx prisma migrate deploy
npx prisma db seed
```

3. **启动服务**
```bash
# 后端服务
cd wemaster-nest
npm run start:prod

# 前端服务 (使用 nginx 或其他 Web 服务器)
# 部署 wemaster-admin/dist 目录
```

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

## 监控与日志

### 应用监控

- **性能指标**: Prometheus + Grafana (10个专业仪表盘)
- **错误追踪**: Sentry (10% 性能追踪采样率)
- **日志聚合**: Loki + Promtail
- **分布式追踪**: OpenTelemetry + Jaeger
- **健康检查**: 内置健康端点 + Uptime 探针
- **告警系统**: 多维度告警规则

### 可观测性栈

```bash
# 启动完整可观测性栈
docker-compose -f docker-compose.observability.yml up -d

# 访问监控面板
open http://localhost:3000  # Grafana
open http://localhost:9090  # Prometheus
open http://localhost:16686 # Jaeger
```

### 关键指标

- API 响应时间 < 500ms (当前: 1200ms，优化中)
- 数据库查询时间 < 20ms
- 缓存命中率 > 90%
- 系统正常运行时间 > 99.9%
- 错误率 < 0.5% (当前: 15.38%，优化中)

## 安全

### 安全措施

- **认证**: JWT 令牌 (15分钟) + 刷新令牌 (7天) 机制
- **授权**: RBAC 基于角色的访问控制
- **数据加密**: 传输层 (TLS 1.3) 和存储层加密
- **输入验证**: class-validator 和 Zod 验证
- **速率限制**: IP维度100/min + 租户维度500/min + 用户维度200/min
- **安全扫描**: OWASP ASVS B+ 评级，依赖漏洞扫描
- **CSRF 保护**: 状态改变请求保护
- **安全头**: Helmet 完整安全头配置
- **审计日志**: Redis缓冲 + 数据库落库

### 合规性

- **OWASP Top 10**: 8/10 完全合规，2/10 部分合规
- **数据隐私**: GDPR 合规
- **支付安全**: PCI DSS 标准
- **数据保护**: 定期备份和恢复测试
- **安全评级**: B+ (良好)

## 故障排除

### 常见问题

1. **依赖安装失败**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **数据库连接失败**
- 检查 PostgreSQL 服务状态
- 验证 DATABASE_URL 配置
- 确认数据库权限设置

3. **Redis 连接问题**
- 检查 Redis 服务状态
- 验证 REDIS_URL 配置
- 检查防火墙设置

4. **API 请求失败**
- 检查后端服务状态
- 验证 API 地址配置
- 检查 CORS 设置

### 调试工具

- **后端**: NestJS DevTools, Chrome DevTools
- **前端**: Vue DevTools, Chrome DevTools
- **移动端**: Flutter DevTools
- **数据库**: Prisma Studio
- **API**: Swagger UI

## 贡献指南

### 开发流程

1. Fork 项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request
5. 代码审查和合并

### 代码审查

- 遵循项目代码风格
- 添加必要的测试
- 更新相关文档
- 确保所有检查通过

## 测试与质量保证

### 测试框架

- **后端测试**: Jest + Supertest
- **前端测试**: Playwright E2E + Vue Test Utils
- **移动端测试**: Flutter Integration Test + Golden Test
- **性能测试**: K6 + Locust 压测
- **安全测试**: OWASP ZAP + 依赖扫描
- **容器扫描**: Trivy 镜像安全扫描

### 质量指标

- **代码覆盖率**: 目标 80%+
- **E2E 测试通过率**: 目标 90%+
- **安全漏洞**: 0 高危，< 5 中危
- **性能基准**: P95 < 500ms
- **可用性**: > 99.9%

## 部署与运维

### 部署架构

- **环境管理**: Doppler 环境变量管理
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions 自动化流水线
- **基础设施**: Terraform + Fly.io + Vercel
- **监控**: 完整可观测性栈

### 部署脚本

```bash
# 环境切换
./switch-env.sh staging

# 一键部署
./deploy-staging.sh

# 回滚操作
./rollback-staging.sh
```

## 项目里程碑

### 已完成里程碑

- **M0-M4**: 核心功能开发完成 ✅
- **M5**: Staging 环境与生产前硬化 ✅
- **M6**: 端到端集成验证 ✅
- **M7**: 生产就绪关账 ✅ (有条件通过)

### 当前状态

- **生产就绪度**: 80% (阻塞修复后 95%+)
- **决策状态**: NO-GO (3个阻塞项待修复)
- **预计完成时间**: 2025-11-02 18:34:00

## 联系方式

- **项目维护者**: WeMaster 开发团队
- **问题反馈**: GitHub Issues
- **技术支持**: tech-support@wemaster.com

---

**最后更新**: 2025年11月2日  
**版本**: 1.0.0  
**状态**: 生产就绪 (有条件通过)  
**M5-M7 执行**: 长线程、多子代理、无人值守、纯CLI 模式完成