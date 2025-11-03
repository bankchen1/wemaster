# 前后端集成完整计划

生成时间：2025-10-27 18:50
项目：wemaster-core (Frontend) + wemaster-nest (Backend)

---

## 📋 执行摘要

| 指标 | 当前状态 | 目标状态 |
|------|---------|---------|
| 构建状态 | ✅ **已修复** - 创建 23 个临时 provider stubs | ✅ 全部迁移到 Orval SDK |
| 页面总数 | 31 个（Student: 18, Tutor: 13） | 31 个全部集成 |
| 已集成页面 | 2 个（Login, Register） | 31 个（100%） |
| 当前集成率 | **6%** | **100%** |
| 预计总时间 | - | **2-3 天**（每页 5-10 分钟） |

---

## 🚨 当前问题总结

### 1. ✅ **构建错误 - 已修复**
- **问题**：28 个文件引用已删除的 `provider.ts`
- **临时方案**：创建 23 个 provider stubs（标记为 TEMPORARY）
- **永久方案**：按照 SYSTEMATIC_FRONTEND_BACKEND_INTEGRATION_SOLUTION.md 迁移

### 2. ⚠️ **运行时错误 - 待修复**
- **问题**：`TypeError: Cannot read properties of undefined (reading 'length')`
- **原因**：Provider stubs 返回空数据 `{ data: [], total: 0 }`
- **解决**：迁移到真实 Orval SDK 调用

### 3. ⚠️ **环境变量不同步**
- **问题**：
  - wemaster-nest/.env（后端）- 有阿里云邮件配置
  - wemaster-core/.env.local（前端）- 可能缺少配置
  - 没有统一的环境变量管理
- **解决**：创建环境变量同步脚本（见下方）

---

## 📚 系统化解决方案（参考文档）

详见：`/Volumes/BankChen/wemaster/wemaster-core/docs/SYSTEMATIC_FRONTEND_BACKEND_INTEGRATION_SOLUTION.md`

### 核心方法论

#### 阶段 1: Orval 配置（自动生成 Zod schemas）
```javascript
// orval.config.js
module.exports = {
  output: {
    override: {
      zod: {
        strict: {
          response: true,
          request: true,
        }
      }
    }
  }
};
```

#### 阶段 2: 前端表单验证
```typescript
// 使用 Zod schema 运行时验证
import { RegisterDtoSchema } from '@/lib/api/generated/schemas/registerDto.zod';

const validated = RegisterDtoSchema.parse(formData); // 拒绝多余字段
await registerAction(validated);
```

#### 阶段 3: Server Component 认证
```typescript
// 已创建：/Volumes/BankChen/wemaster/wemaster-core/lib/api/server-auth-wrapper.ts
import { withServerAuth } from '@/lib/api/server-auth-wrapper';

const data = await withServerAuth(() => studentControllerGetDashboard());
```

---

## 📊 页面集成优先级

### P0 - 关键页面（必须优先）

| 页面 | 路由 | 后端 API | 状态 | 预计时间 |
|------|------|---------|------|---------|
| **登录** | /login | POST /api/v1/auth/login | ✅ **已完成** | - |
| **注册** | /register | POST /api/v1/auth/register | ✅ **已完成** | - |
| **学生控制台** | /student/dashboard | GET /api/v1/student/dashboard | ❌ 待迁移 | 10 分钟 |
| **导师控制台** | /tutor/dashboard | GET /api/v1/tutor/dashboard | ❌ 待迁移 | 10 分钟 |
| **钱包** | /student/wallet | GET /api/v1/student/wallet/* | ❌ 待迁移 | 15 分钟 |

### P1 - 高价值页面

| 页面 | 路由 | 后端 API | 状态 | 预计时间 |
|------|------|---------|------|---------|
| **VIP 会员** | /student/vip | GET /api/v1/student/vip/* | ❌ 待迁移 | 15 分钟 |
| **社区** | /student/community | GET /api/v1/community/* | ❌ 待迁移 | 20 分钟 |
| **课程浏览** | /student/courses | GET /api/v1/courses/* | ❌ 待迁移 | 15 分钟 |
| **导师课程管理** | /tutor/offerings | GET /api/v1/tutor/offerings/* | ❌ 待迁移 | 20 分钟 |
| **导师收益** | /tutor/earnings | GET /api/v1/tutor/earnings/* | ❌ 待迁移 | 15 分钟 |

### P2 - 标准功能页面

| 页面 | 路由 | 后端 API | 状态 | 预计时间 |
|------|------|---------|------|---------|
| **消息** | /student/messages | GET /api/v1/messages/* | ❌ 待迁移 | 15 分钟 |
| **通知** | /student/notifications | GET /api/v1/notifications/* | ❌ 待迁移 | 10 分钟 |
| **日程安排** | /student/schedule | GET /api/v1/student/schedule/* | ❌ 待迁移 | 15 分钟 |
| **作业** | /student/assignments | GET /api/v1/student/assignments/* | ❌ 待迁移 | 15 分钟 |
| **进度** | /student/progress | GET /api/v1/student/progress/* | ❌ 待迁移 | 10 分钟 |
| **学习目标** | /student/learning-goals | GET /api/v1/student/goals/* | ❌ 待迁移 | 10 分钟 |
| **积分** | /student/points | GET /api/v1/student/points/* | ❌ 待迁移 | 10 分钟 |
| **会话历史** | /student/session-history | GET /api/v1/student/sessions/* | ❌ 待迁移 | 10 分钟 |

### P3 - 辅助功能页面

| 页面 | 路由 | 后端 API | 状态 | 预计时间 |
|------|------|---------|------|---------|
| **设置** | /student/settings | GET/PUT /api/v1/user/settings | ❌ 待迁移 | 10 分钟 |
| **支持** | /student/support | GET /api/v1/support/* | ❌ 待迁移 | 10 分钟 |
| **新手引导** | /student/onboarding | - | ❌ 待迁移 | 10 分钟 |
| **导师学生管理** | /tutor/students | GET /api/v1/tutor/students/* | ❌ 待迁移 | 15 分钟 |
| **导师数据分析** | /tutor/analytics | GET /api/v1/tutor/analytics/* | ❌ 待迁移 | 15 分钟 |
| **导师个人资料** | /tutor/profile | GET/PUT /api/v1/tutor/profile | ❌ 待迁移 | 10 分钟 |

---

## 🔄 标准集成流程（每个页面）

### Step 1: 识别后端 API
```bash
# 查看后端可用的 endpoints
ls /Volumes/BankChen/wemaster/wemaster-nest/src/modules/student/
```

### Step 2: 查看 Orval 生成的 SDK
```bash
# 查看已生成的 SDK 函数
ls lib/api/generated/
```

### Step 3: 修改 Server Component
```typescript
// BEFORE
import { getDashboard } from '@/lib/modules/dashboard';
const data = await getDashboard(userId);

// AFTER
import { withServerAuth } from '@/lib/api/server-auth-wrapper';
import { studentControllerGetDashboard } from '@/lib/api/generated/student';

const data = await withServerAuth(() =>
  studentControllerGetDashboard()
);
```

### Step 4: 修改 Client Component
```typescript
// BEFORE
import { createPost } from '@/lib/modules/community/actions';

// AFTER
import { CommunityPostDtoSchema } from '@/lib/api/generated/schemas/communityPostDto.zod';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

const { validate } = useValidatedForm(CommunityPostDtoSchema);
const validated = validate(formData);
if (!validated) return;

const result = await communityControllerCreatePost(validated);
```

### Step 5: 删除旧的 Provider 引用
```bash
# 删除临时 stub（在所有页面迁移完成后）
rm lib/modules/*/provider.ts
```

---

## 🛠️ 环境变量同步方案

### 问题分析

当前有多个 .env 文件：
- `wemaster-nest/.env` - 后端环境变量
- `wemaster-core/.env.local` - 前端环境变量
- 可能还有 `.env.development`, `.env.production`

### 解决方案

#### 方案 A: 统一环境变量文件（推荐）

```bash
# 项目根目录创建 .env.shared
wemaster/
  ├── .env.shared           # 共享环境变量（Git ignored）
  ├── wemaster-nest/
  │   └── .env              # 后端独有变量（symlink 到 .env.shared）
  └── wemaster-core/
      └── .env.local        # 前端独有变量（symlink 到 .env.shared）
```

#### 方案 B: 环境变量同步脚本

创建 `scripts/sync-env-vars.sh`：

```bash
#!/bin/bash
# Sync environment variables from backend to frontend

BACKEND_ENV="/Volumes/BankChen/wemaster/wemaster-nest/.env"
FRONTEND_ENV="/Volumes/BankChen/wemaster/wemaster-core/.env.local"

# Extract NEXT_PUBLIC_* variables from backend
grep "^NEXT_PUBLIC_" "$BACKEND_ENV" > "$FRONTEND_ENV"

# Extract other shared variables
grep "^DATABASE_URL=" "$BACKEND_ENV" >> "$FRONTEND_ENV"
grep "^ALIYUN_" "$BACKEND_ENV" >> "$FRONTEND_ENV"

echo "Environment variables synced successfully!"
```

#### 方案 C: 使用 dotenv-vault（推荐生产环境）

```bash
# 安装 dotenv-vault
npm install -g dotenv-vault

# 初始化
dotenv-vault new

# 加密环境变量
dotenv-vault push

# 在不同环境拉取
dotenv-vault pull production
dotenv-vault pull development
```

---

## 📅 实施时间表

### Week 1: 核心功能（P0）
**Day 1-2:**
- ✅ 修复构建错误（已完成）
- ✅ 创建 `withServerAuth()` 函数（已完成）
- ⏳ 迁移学生控制台（2 小时）
- ⏳ 迁移导师控制台（2 小时）

**Day 3:**
- ⏳ 迁移钱包页面（3 小时）
- ⏳ 测试支付流程

### Week 2: 高价值功能（P1）
**Day 4-5:**
- ⏳ 迁移 VIP 会员（3 小时）
- ⏳ 迁移社区功能（4 小时）
- ⏳ 迁移课程浏览（3 小时）

**Day 6-7:**
- ⏳ 迁移导师课程管理（4 小时）
- ⏳ 迁移导师收益（3 小时）

### Week 3: 标准功能（P2）
**Day 8-10:**
- ⏳ 批量迁移 10 个标准页面（10 小时）
- ⏳ 每个页面约 1 小时

### Week 4: 辅助功能 + 清理（P3）
**Day 11-12:**
- ⏳ 迁移辅助功能页面（8 小时）
- ⏳ 删除所有临时 provider stubs
- ⏳ 代码审查和测试

**Day 13-14:**
- ⏳ E2E 测试
- ⏳ 性能优化
- ⏳ 文档更新

---

## ✅ 集成验收标准

对于每个页面，必须满足：

1. ✅ **构建通过** - 无 TypeScript 错误
2. ✅ **运行时无错误** - 页面可以正常加载
3. ✅ **数据正确显示** - 从后端获取真实数据
4. ✅ **交互正常** - 表单提交、按钮点击等
5. ✅ **认证正确** - JWT token 自动携带
6. ✅ **错误处理** - 401/403/500 错误有友好提示
7. ✅ **Loading 状态** - 数据加载时显示骨架屏
8. ✅ **类型安全** - 使用 Zod schema 验证

---

## 🧪 测试清单

### 单元测试
- [ ] Server Actions 单元测试
- [ ] Client Component 交互测试
- [ ] Zod Schema 验证测试

### 集成测试
- [ ] 完整用户注册流程
- [ ] 完整课程购买流程
- [ ] VIP 订阅流程
- [ ] 导师创建课程流程

### E2E 测试
- [ ] Playwright: 学生完整旅程
- [ ] Playwright: 导师完整旅程
- [ ] Playwright: 支付流程

---

## 📈 成功指标

| 指标 | 当前 | 目标 | 进度 |
|------|------|------|------|
| 页面集成率 | 6% (2/31) | 100% (31/31) | ▓░░░░░░░░░ 6% |
| 后端 API 调用率 | ~10% | 100% | ▓░░░░░░░░░ 10% |
| 构建错误 | 0 ✅ | 0 | ✅ 已达成 |
| 运行时错误 | >10 | 0 | ❌ 待修复 |
| E2E 测试覆盖 | 0% | 80% | ░░░░░░░░░░ 0% |

---

## 🚀 下一步行动

### 立即执行（今天）
1. ✅ 修复构建错误（已完成）
2. ⏳ 创建环境变量同步脚本
3. ⏳ 迁移学生控制台（第一个示例）

### 本周执行
4. ⏳ 迁移导师控制台
5. ⏳ 迁移钱包页面
6. ⏳ 迁移 VIP 会员页面
7. ⏳ 迁移社区页面

### 下周执行
8. ⏳ 批量迁移剩余 20+ 个页面
9. ⏳ 删除所有临时 provider stubs
10. ⏳ E2E 测试和文档

---

## 📞 技术支持

### 相关文档
- 系统化解决方案：`docs/SYSTEMATIC_FRONTEND_BACKEND_INTEGRATION_SOLUTION.md`
- 登录邮件状态报告：`LOGIN_AND_EMAIL_STATUS_REPORT.md`
- 后端 API 文档：`http://localhost:3001/api-docs`

### 服务状态
- ✅ 前端：http://localhost:3009
- ✅ 后端：http://localhost:3001
- ✅ 数据库：PostgreSQL (Neon)

---

**文档版本**: v1.0
**最后更新**: 2025-10-27 18:50
**状态**: 🟡 进行中（6% 完成）
