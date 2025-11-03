# 前后端集成执行计划 - 详细任务清单

生成时间：2025-10-27 19:00
状态：🟡 执行中
参考文档：FRONTEND_BACKEND_INTEGRATION_PLAN.md + SYSTEMATIC_FRONTEND_BACKEND_INTEGRATION_SOLUTION.md

---

## 📊 执行概览

| 阶段 | 任务数 | 预计时间 | 状态 |
|------|--------|---------|------|
| **Phase 0: 环境准备** | 3 个任务 | 30 分钟 | 🟡 进行中 |
| **Phase 1: 基础设施** | 2 个任务 | 30 分钟 | ⏳ 待执行 |
| **Phase 2: P0 关键页面** | 3 个任务 | 35 分钟 | ⏳ 待执行 |
| **Phase 3: P1 高价值页面** | 5 个任务 | 85 分钟 | ⏳ 待执行 |
| **Phase 4: P2 标准页面** | 8 个任务 | 120 分钟 | ⏳ 待执行 |
| **Phase 5: P3 辅助页面** | 6 个任务 | 90 分钟 | ⏳ 待执行 |
| **Phase 6: 清理与测试** | 4 个任务 | 60 分钟 | ⏳ 待执行 |

**总计**: 31 个任务，约 450 分钟（7.5 小时）

---

## Phase 0: 环境准备 ✅

### Task 0.1: 验证所有服务正常运行 (10分钟)

**目标**: 确保前端、后端、数据库都正常运行

**步骤**:
```bash
# 1. 检查后端
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: wemaster" \
  -d '{"email":"testuser@example.com","password":"Test123456"}'

# 2. 检查前端
curl -s http://localhost:3009 | grep "DOCTYPE"

# 3. 检查数据库
cd /Volumes/BankChen/wemaster/wemaster-nest
npm run db:studio  # 打开 Prisma Studio
```

**验收标准**:
- ✅ 后端返回 `{"success": true}` 和 JWT token
- ✅ 前端页面可以加载
- ✅ Prisma Studio 可以连接数据库

**当前状态**: 🟡 进行中

---

### Task 0.2: 运行环境变量同步脚本 (5分钟)

**目标**: 统一前后端环境变量

**步骤**:
```bash
cd /Volumes/BankChen/wemaster
./scripts/sync-env-vars.sh
```

**验收标准**:
- ✅ 脚本执行成功，无错误
- ✅ `wemaster-core/.env.local` 文件已更新
- ✅ 备份文件已创建

**当前状态**: ⏳ 待执行

---

### Task 0.3: 测试阿里云邮件服务 (15分钟)

**目标**: 验证邮件服务配置正确

**步骤**:
```bash
# 1. 发送测试邮件
curl -X POST http://localhost:3001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: wemaster" \
  -d '{"email":"testuser@example.com"}'

# 2. 检查后端日志
tail -50 /tmp/backend-restart.log | grep -i "email"

# 3. 检查邮箱是否收到邮件
```

**验收标准**:
- ✅ API 返回成功响应
- ✅ 后端日志显示"Email sent successfully"
- ✅ 用户邮箱收到重置密码邮件

**当前状态**: ⏳ 待执行

**注意事项**:
- 阿里云凭证已配置：
  - APP_ID: `nDZnkPCVHSJvcCK8`
  - SECRET: `bkbUL4ycXbL8dswKCTqlIpH5bQhD9zLOPr4O4w8RWazTyOWhVmgmihptJNeysvXS`
- 如果失败，检查：
  1. 发信域名是否验证通过
  2. 发信地址是否创建
  3. AccessKey 是否有 DirectMail 权限

---

## Phase 1: 基础设施 (30分钟)

### Task 1.1: 创建 useValidatedForm Hook (20分钟)

**目标**: 创建可复用的表单验证 Hook，使用 Zod schemas

**文件**: `lib/hooks/useValidatedForm.ts`

**代码**:
```typescript
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';

export function useValidatedForm<T extends z.ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: unknown): z.infer<T> | null => {
    try {
      const validated = schema.parse(data);
      setErrors({});
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        toast.error(error.errors[0].message);
      }
      return null;
    }
  };

  const clearErrors = () => setErrors({});

  return { validate, errors, clearErrors };
}
```

**验收标准**:
- ✅ 文件创建成功
- ✅ TypeScript 类型正确
- ✅ 无编译错误

**当前状态**: ⏳ 待执行

---

### Task 1.2: 验证 withServerAuth 包装器 (10分钟)

**目标**: 确认 `lib/api/server-auth-wrapper.ts` 已存在并可用

**步骤**:
```bash
# 检查文件是否存在
ls -lh lib/api/server-auth-wrapper.ts

# 检查导入是否正确
grep "export async function withServerAuth" lib/api/server-auth-wrapper.ts
```

**验收标准**:
- ✅ 文件存在
- ✅ 函数签名正确
- ✅ 可以被导入使用

**当前状态**: ⏳ 待执行

---

## Phase 2: P0 关键页面 (35分钟)

### Task 2.1: 迁移 Student Dashboard (10分钟)

**目标**: 将学生控制台从 mock 数据迁移到真实 API

**文件**: `app/student/dashboard/page.tsx`

**修改步骤**:

1. **查找后端 API**:
```bash
# 查看后端 student controller
grep -r "getDashboard\|getOverview" /Volumes/BankChen/wemaster/wemaster-nest/src/modules/student/
```

2. **修改 Server Component**:
```typescript
// BEFORE
import { getDashboard } from '@/lib/modules/dashboard';
const data = await getDashboard(userId);

// AFTER
import { withServerAuth } from '@/lib/api/server-auth-wrapper';
import { studentControllerGetDashboardOverview } from '@/lib/api/generated/student';

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') redirect('/login');

  const dashboard = await withServerAuth(() =>
    studentControllerGetDashboardOverview()
  );

  return <StudentDashboardClient dashboard={dashboard} user={user} />;
}
```

3. **测试**:
```bash
# 访问页面
open http://localhost:3009/student/dashboard

# 检查控制台无 401 错误
# 检查数据正确显示
```

**验收标准**:
- ✅ 页面无 401/403 错误
- ✅ 显示真实的用户数据
- ✅ Loading 状态正常
- ✅ 错误处理正常

**当前状态**: ⏳ 待执行

---

### Task 2.2: 迁移 Tutor Dashboard (10分钟)

**目标**: 将导师控制台从 mock 数据迁移到真实 API

**文件**: `app/tutor/dashboard/page.tsx`

**修改步骤**: （类似 Task 2.1）

**验收标准**:
- ✅ 页面无 401/403 错误
- ✅ 显示真实的导师数据
- ✅ 收益统计正确
- ✅ 课程列表正确

**当前状态**: ⏳ 待执行

---

### Task 2.3: 迁移 Student Wallet (15分钟)

**目标**: 将学生钱包页面迁移到真实 API

**文件**: `app/student/wallet/page.tsx`

**后端 API**:
- GET `/api/v1/student/wallet/balance`
- GET `/api/v1/student/wallet/transactions`
- POST `/api/v1/student/wallet/add-funds`

**修改步骤**:
```typescript
import { withServerAuth } from '@/lib/api/server-auth-wrapper';
import {
  studentWalletControllerGetWalletBalance,
  studentWalletControllerGetTransactions
} from '@/lib/api/generated/student-wallet';

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [balance, transactions] = await Promise.all([
    withServerAuth(() =>
      studentWalletControllerGetWalletBalance({ includeAnalytics: true })
    ),
    withServerAuth(() =>
      studentWalletControllerGetTransactions({ page: 1, limit: 20 })
    ),
  ]);

  return <WalletClient balance={balance} transactions={transactions} />;
}
```

**验收标准**:
- ✅ 余额显示正确
- ✅ 交易历史显示正确
- ✅ 充值功能正常
- ✅ 分页功能正常

**当前状态**: ⏳ 待执行

---

## Phase 3: P1 高价值页面 (85分钟)

### Task 3.1: 迁移 VIP Membership (15分钟)

**文件**: `app/student/vip/page.tsx`

**后端 API**:
- GET `/api/v1/student/vip/status`
- POST `/api/v1/student/vip/subscribe`
- POST `/api/v1/student/vip/cancel`

**验收标准**:
- ✅ VIP 状态显示正确
- ✅ 订阅功能正常
- ✅ 取消功能正常
- ✅ 权益列表显示正确

**当前状态**: ⏳ 待执行

---

### Task 3.2: 迁移 Community (20分钟)

**文件**: `app/student/community/page.tsx`

**后端 API**:
- GET `/api/v1/community/posts`
- POST `/api/v1/community/posts/create`
- POST `/api/v1/community/posts/:id/like`
- POST `/api/v1/community/posts/:id/comment`

**Client Component 使用 Zod 验证**:
```typescript
'use client';

import { CreatePostDtoSchema } from '@/lib/api/generated/schemas/createPostDto.zod';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

export function CreatePostForm() {
  const { validate, errors } = useValidatedForm(CreatePostDtoSchema);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = { title, content, tags };

    const validated = validate(formData);
    if (!validated) return; // 验证失败

    const result = await communityControllerCreatePost(validated);
    toast.success('Post created!');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      {errors.title && <p className="text-red-500">{errors.title}</p>}
    </form>
  );
}
```

**验收标准**:
- ✅ 帖子列表显示正确
- ✅ 发帖功能正常
- ✅ 点赞功能正常
- ✅ 评论功能正常
- ✅ Zod 验证生效

**当前状态**: ⏳ 待执行

---

### Task 3.3: 迁移 Courses Browse (15分钟)

**文件**: `app/student/courses/page.tsx`

**后端 API**:
- GET `/api/v1/offerings`
- GET `/api/v1/offerings/:slug`

**验收标准**:
- ✅ 课程列表显示正确
- ✅ 筛选功能正常
- ✅ 排序功能正常
- ✅ 课程详情正常

**当前状态**: ⏳ 待执行

---

### Task 3.4: 迁移 Tutor Offerings Management (20分钟)

**文件**: `app/tutor/offerings/page.tsx`

**后端 API**:
- GET `/api/v1/tutor/offerings`
- POST `/api/v1/tutor/offerings/create`
- PUT `/api/v1/tutor/offerings/:id`
- DELETE `/api/v1/tutor/offerings/:id`

**验收标准**:
- ✅ 课程列表显示正确
- ✅ 创建课程功能正常
- ✅ 编辑课程功能正常
- ✅ 删除课程功能正常
- ✅ 发布/下架功能正常

**当前状态**: ⏳ 待执行

---

### Task 3.5: 迁移 Tutor Earnings (15分钟)

**文件**: `app/tutor/earnings/page.tsx`

**后端 API**:
- GET `/api/v1/tutor/earnings/summary`
- GET `/api/v1/tutor/earnings/history`
- POST `/api/v1/tutor/earnings/withdraw`

**验收标准**:
- ✅ 收益总览显示正确
- ✅ 收益历史显示正确
- ✅ 提现功能正常
- ✅ 图表显示正常

**当前状态**: ⏳ 待执行

---

## Phase 4: P2 标准功能页面 (120分钟)

以下页面按标准流程迁移，每个约 15 分钟：

### Task 4.1: Messages (15分钟)
- **文件**: `app/student/messages/page.tsx`
- **API**: GET/POST `/api/v1/messages/*`

### Task 4.2: Notifications (10分钟)
- **文件**: `app/student/notifications/page.tsx`
- **API**: GET/PUT `/api/v1/notifications/*`

### Task 4.3: Schedule (15分钟)
- **文件**: `app/student/schedule/page.tsx`
- **API**: GET `/api/v1/student/schedule/*`

### Task 4.4: Assignments (15分钟)
- **文件**: `app/student/assignments/page.tsx`
- **API**: GET/POST `/api/v1/student/assignments/*`

### Task 4.5: Progress (10分钟)
- **文件**: `app/student/progress/page.tsx`
- **API**: GET `/api/v1/student/progress/*`

### Task 4.6: Learning Goals (10分钟)
- **文件**: `app/student/learning-goals/page.tsx`
- **API**: GET/POST `/api/v1/student/goals/*`

### Task 4.7: Points (10分钟)
- **文件**: `app/student/points/page.tsx`
- **API**: GET `/api/v1/student/points/*`

### Task 4.8: Session History (10分钟)
- **文件**: `app/student/session-history/page.tsx`
- **API**: GET `/api/v1/student/sessions/*`

### Task 4.9-4.13: Tutor 页面 (35分钟)
- Tutor Analytics
- Tutor Sessions
- Tutor Students
- Tutor Schedule
- Tutor Profile

**当前状态**: ⏳ 全部待执行

---

## Phase 5: P3 辅助功能页面 (90分钟)

### Task 5.1: Settings (10分钟)
- **文件**: `app/student/settings/page.tsx`
- **API**: GET/PUT `/api/v1/user/settings`

### Task 5.2: Support (10分钟)
- **文件**: `app/student/support/page.tsx`
- **API**: GET/POST `/api/v1/support/*`

### Task 5.3-5.6: 其他辅助页面 (70分钟)
- Onboarding
- Tutor Community
- Tutor Settings
- Tutor Support

**当前状态**: ⏳ 全部待执行

---

## Phase 6: 清理与测试 (60分钟)

### Task 6.1: 删除所有临时 Provider Stubs (15分钟)

**步骤**:
```bash
# 检查所有 provider.ts 文件
find lib/modules -name "provider.ts" -exec grep -l "TEMPORARY STUB" {} \;

# 确认所有页面已迁移后删除
rm lib/modules/*/provider.ts

# 删除 provider-factory.ts
rm lib/core/provider-factory.ts

# 验证构建仍然成功
npm run build
```

**验收标准**:
- ✅ 所有临时 stub 已删除
- ✅ 构建成功，无错误
- ✅ 前端可以正常运行

**当前状态**: ⏳ 待执行

---

### Task 6.2: E2E 测试 (20分钟)

**测试场景**:

1. **用户注册 → 登录 → 购买课程**:
```bash
npm run test:e2e -- --grep "完整购买流程"
```

2. **学生控制台完整旅程**:
```bash
npm run test:e2e -- --grep "学生控制台"
```

3. **导师创建课程流程**:
```bash
npm run test:e2e -- --grep "导师创建课程"
```

**验收标准**:
- ✅ 所有 E2E 测试通过
- ✅ 无 401/403 错误
- ✅ 数据正确保存到数据库

**当前状态**: ⏳ 待执行

---

### Task 6.3: 性能优化 (15分钟)

**检查项**:
- ✅ 首屏加载时间 < 2 秒
- ✅ API 响应时间 < 200ms
- ✅ 无内存泄漏
- ✅ 图片已优化

**工具**:
```bash
# Lighthouse 测试
npm run lighthouse

# Bundle 分析
npm run analyze
```

**当前状态**: ⏳ 待执行

---

### Task 6.4: 文档更新 (10分钟)

**更新文档**:
- ✅ README.md - 更新安装和运行步骤
- ✅ ARCHITECTURE.md - 更新架构图
- ✅ API_INTEGRATION.md - 记录所有 API 集成
- ✅ CHANGELOG.md - 记录所有变更

**当前状态**: ⏳ 待执行

---

## 📊 进度追踪

### 总体进度

```
Phase 0: ████░░░░░░ 40% (1/3 完成)
Phase 1: ░░░░░░░░░░  0% (0/2 完成)
Phase 2: ░░░░░░░░░░  0% (0/3 完成)
Phase 3: ░░░░░░░░░░  0% (0/5 完成)
Phase 4: ░░░░░░░░░░  0% (0/8 完成)
Phase 5: ░░░░░░░░░░  0% (0/6 完成)
Phase 6: ░░░░░░░░░░  0% (0/4 完成)

总进度: ███░░░░░░░ 3% (1/31 完成)
```

### 时间估算

| 已用时间 | 剩余时间 | 预计完成时间 |
|---------|---------|-------------|
| 10 分钟 | 440 分钟 | ~7.5 小时 |

---

## 🎯 下一步行动

### 立即执行（接下来 30 分钟）
1. ✅ **完成 Task 0.1** - 验证所有服务
2. ⏳ **执行 Task 0.2** - 运行环境变量同步
3. ⏳ **执行 Task 0.3** - 测试邮件服务

### 今天完成（接下来 2 小时）
4. ⏳ **执行 Phase 1** - 创建基础设施（30 分钟）
5. ⏳ **执行 Phase 2** - 迁移 P0 关键页面（35 分钟）
6. ⏳ **执行 Phase 3 (前 3 个)** - 迁移高价值页面（50 分钟）

### 本周完成
7. ⏳ 完成所有 P1/P2 页面迁移
8. ⏳ 执行 Phase 6 清理与测试

---

## ✅ 成功标准

每个任务完成后必须：
1. ✅ 无 TypeScript 编译错误
2. ✅ 无运行时 JavaScript 错误
3. ✅ 页面可以正常加载和交互
4. ✅ 数据从真实 API 获取
5. ✅ 错误处理完善（401/403/500）
6. ✅ Loading 状态显示正确
7. ✅ Toast 提示用户友好
8. ✅ 代码通过 ESLint 检查

---

## 📞 支持资源

### 文档
- 集成计划：`FRONTEND_BACKEND_INTEGRATION_PLAN.md`
- 系统化方案：`docs/SYSTEMATIC_FRONTEND_BACKEND_INTEGRATION_SOLUTION.md`
- 登录邮件报告：`LOGIN_AND_EMAIL_STATUS_REPORT.md`

### API 文档
- Swagger UI：http://localhost:3001/api-docs
- OpenAPI JSON：http://localhost:3001/api-json

### 服务地址
- 前端：http://localhost:3009
- 后端：http://localhost:3001
- Prisma Studio：http://localhost:5555

---

**文档版本**: v1.0
**最后更新**: 2025-10-27 19:00
**当前任务**: Task 0.1 - 验证所有服务正常运行
