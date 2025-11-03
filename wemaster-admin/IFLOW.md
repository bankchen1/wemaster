# iFlow 上下文：WeMaster Admin

## 项目概览

WeMaster Admin 是一个基于 Vue 3 + Vite + Element Plus 的现代化管理后台系统，专为 WeMaster 在线教育平台设计。该系统提供完整的运营管理功能，覆盖用户管理、课程管理、订单支付、内容营销等全业务流程。

### 核心特性

- **现代化前端架构** - 基于 Vue 3 Composition API 和 Vite 构建
- **响应式设计** - 支持桌面端和移动端访问
- **模块化架构** - 21个业务模块，涵盖平台所有管理功能
- **权限控制** - 基于 RBAC 的细粒度权限管理系统
- **多租户支持** - 支持多租户架构和数据隔离
- **国际化** - 中英文双语支持
- **主题定制** - 深色/浅色主题切换
- **数据可视化** - ECharts 图表展示关键业务指标
- **API 集成** - 基于 OpenAPI 规范的自动生成 SDK

## 技术栈

- **框架**: Vue 3 + Vite + Vue Router + Pinia
- **UI 组件库**: Element Plus
- **数据可视化**: ECharts
- **API 工具**: Orval (OpenAPI SDK 生成)
- **构建工具**: Vite
- **包管理**: npm
- **语言**: JavaScript (ES6+)

## 项目架构

### 目录结构

```
src/
├── api/                # OpenAPI 生成的客户端（只读）
│   ├── endpoints/      # API 端点
│   ├── models/         # 数据模型
│   └── mutator.js      # 请求拦截器
├── store/              # Pinia 状态管理
├── router/             # 路由配置与守卫
├── layouts/            # 布局组件
├── components/         # 可复用组件
│   └── shared/         # 通用组件库
├── modules/            # 业务模块
├── utils/              # 工具函数和拦截器
└── styles/             # 样式和设计令牌
```

### 核心模块

1. **Dashboard** - 系统仪表板，展示关键业务指标
2. **Users** - 用户管理（学生/导师/管理员）+ 合规 KYC
3. **Tutors** - 导师管理（资料/日程/收益/消息）
4. **Students** - 学生管理（资料/学习/权益/钱包）
5. **Courses** - 课程管理（Course + Offering + Variant）
6. **Sessions** - 预约/上课/改期/取消/出勤
7. **Orders** - 订单全生命周期管理
8. **Payments** - 支付/退款/对账/异常处理
9. **Subscriptions** - 订阅(VIP)计划/权益/账单
10. **Wallets** - 钱包/充值/提现/流水
11. **Earnings** - 导师收益/结算/发放/发票
12. **Messages** - 站内信/IM 监管（关键词/举报）
13. **Content** - CMS（文章/公告/FAQ/素材库）
14. **Marketing** - 营销（优惠券/活动/AB 实验/投放）
15. **Analytics** - 数据看板（核心指标、漏斗、财务报表）
16. **Moderation** - 风控审核（内容/聊天/黑白名单）
17. **Tenants** - 多租户配置（品牌/费率/功能开关）
18. **Integrations** - 集成（Stripe、S3、LiveKit、Webhook）
19. **Ops** - 运维（缓存/队列/计划任务/开关/健康）
20. **Settings** - 全局设置（RBAC、权限矩阵、Feature Flags、字典）
21. **Audit** - 审计日志（谁在何时对何数据做了什么）

## 开发环境与运行

### 环境要求

- Node.js >= 20.19.0
- npm >= 6.14.0

### 安装依赖

```bash
npm install
```

### 运行应用

```bash
# 开发模式（带热重载）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

应用将在以下地址可用:
- **开发服务器**: http://localhost:5173
- **生产预览**: http://localhost:4173

## 构建与部署

### 构建命令

```bash
npm run build
```

构建产物将生成在 `dist/` 目录中。

### 部署配置

1. 构建项目：`npm run build`
2. 将 `dist/` 目录中的文件部署到 Web 服务器
3. 配置反向代理指向后端 API 服务
4. 设置环境变量（如果需要）

## API 集成

### OpenAPI SDK 生成

项目使用 Orval 工具基于 OpenAPI 规范自动生成 API 客户端：

```bash
npx orval
```

配置文件：`orval.config.js`

### API 配置

API 客户端配置在 `src/api/mutator.js` 中，包含：
- 请求拦截器
- 响应拦截器
- 租户 ID 注入
- 认证令牌处理

## 权限控制

### RBAC 系统

基于角色的访问控制系统，支持：
- 角色管理
- 权限分配
- 路由守卫
- 组件级权限控制

### 租户隔离

多租户架构支持：
- 请求头 `x-tenant-id` 识别租户
- 数据隔离
- 租户切换功能

## 国际化

### 多语言支持

支持中英文双语：
- 中文语言包：`src/utils/i18n/zh-CN.json`
- 英文语言包：`src/utils/i18n/en-US.json`

### 使用方式

```javascript
$t('dashboard.title')
```

## 主题定制

### 设计令牌

设计令牌定义在 `src/styles/tokens.css` 中：
- 颜色变量
- 间距系统
- 字体大小
- 阴影效果
- 圆角尺寸

### 主题切换

支持深色/浅色主题切换：
- 浅色主题：默认样式
- 深色主题：`[data-theme='dark']` 样式

## 组件库

### 通用组件

1. **XTable** - 表格组件
   - 服务器分页
   - 列筛选
   - 导出 CSV
   - 排序功能

2. **XForm** - 表单组件
   - Schema 驱动
   - 表单校验
   - 支持 Drawer 与 Modal

3. **XFilter** - 筛选组件
   - 多维筛选
   - 文本/选择/日期范围输入

## 开发规范

### 代码风格

- 遵循 Vue 3 Composition API 规范
- 使用 ES6+ 语法特性
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 目录约定

- 每个模块独立目录
- 组件文件以 `View.vue` 结尾
- 工具函数按功能分组
- 样式文件集中管理

### 路由规范

- 一级路由：模块划分
- 二级路由：功能分组
- 三级路由：具体页面
- 权限控制：每个路由声明所需权限

## 测试

### 单元测试

```bash
npm run test
```

### 端到端测试

```bash
npm run test:e2e
```

## 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **开发服务器启动失败**
   ```bash
   npm run dev -- --port 3000
   ```

3. **构建失败**
   ```bash
   npm run build -- --mode development
   ```

### 调试工具

- Vue DevTools 浏览器扩展
- Chrome DevTools
- 网络请求监控
- 控制台日志输出

## 贡献指南

### 开发流程

1. Fork 项目仓库
2. 创建功能分支
3. 编写代码和测试
4. 提交 Pull Request
5. 代码审查和合并

### 代码规范

- 遵循项目现有代码风格
- 添加必要的注释
- 编写单元测试
- 更新相关文档

### 提交约定

- 使用语义化提交信息
- 每次提交只包含一个功能变更
- 提交前运行测试确保通过