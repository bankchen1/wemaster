# 架构铁律 - 前后端分离规范

**创建时间:** 2025-10-27
**目的:** 杜绝前端处理业务逻辑，确保清晰的前后端职责分离

---

## 🚨 核心原则（绝对禁止违反）

### ❌ 前端代码库（wemaster-core）绝对禁止：

1. **禁止直接数据库操作**
   - ❌ 不能有任何 Prisma Client 导入
   - ❌ 不能有任何 SQL 查询
   - ❌ 不能有任何 ORM 操作

2. **禁止业务逻辑**
   - ❌ 不能有邮件发送逻辑
   - ❌ 不能有支付处理逻辑
   - ❌ 不能有密码加密/验证逻辑
   - ❌ 不能有文件上传处理逻辑
   - ❌ 不能有任何业务规则判断

3. **禁止第三方服务集成**
   - ❌ 不能直接调用 Stripe API
   - ❌ 不能直接调用阿里云服务
   - ❌ 不能直接调用任何外部API（除了自己的后端）

4. **禁止敏感操作**
   - ❌ 不能生成JWT token
   - ❌ 不能验证JWT token
   - ❌ 不能存储/读取敏感环境变量（除了公开的NEXT_PUBLIC_*）

---

## ✅ 前端代码库（wemaster-core）只能做：

### 1. UI 渲染（React Components）
```typescript
// ✅ 正确示例
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 2. 调用后端API（通过Orval生成的SDK）
```typescript
// ✅ 正确示例 - 使用Orval SDK
import { authControllerLogin } from '@/lib/api/generated/auth/auth';

async function handleLogin(email: string, password: string) {
  // 调用后端API - localhost:3001
  const response = await authControllerLogin({ email, password });
  return response;
}
```

### 3. 客户端状态管理
```typescript
// ✅ 正确示例 - Zustand store
export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

### 4. 路由和导航
```typescript
// ✅ 正确示例
router.push('/dashboard');
```

---

## ✅ 后端代码库（wemaster-nest）必须做：

### 1. 所有业务逻辑
```typescript
// ✅ 正确示例 - 密码重置逻辑在后端
@Injectable()
export class AuthService {
  async resetPassword(token: string, newPassword: string) {
    // 验证token
    const resetToken = await this.validateResetToken(token);

    // 加密密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新数据库
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword }
    });

    // 使token失效
    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });
  }
}
```

### 2. 数据库操作
```typescript
// ✅ 正确示例 - Prisma在后端
const user = await this.prisma.user.findUnique({
  where: { email }
});
```

### 3. 邮件发送
```typescript
// ✅ 正确示例 - EmailService在后端
@Injectable()
export class EmailService {
  async sendPasswordResetEmail(email: string, resetUrl: string) {
    // 调用阿里云Direct Mail API
    await this.aliyunClient.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `<a href="${resetUrl}">Reset Password</a>`
    });
  }
}
```

### 4. 第三方服务集成
```typescript
// ✅ 正确示例 - Stripe在后端
@Injectable()
export class PaymentService {
  async createPaymentIntent(amount: number) {
    return await this.stripe.paymentIntents.create({ amount });
  }
}
```

---

## 🔍 检查清单（每次修改代码前必查）

### 前端代码审查清单：

```bash
# 在 wemaster-core 目录运行：
cd /Volumes/BankChen/wemaster/wemaster-core

# ❌ 不应该找到这些导入（除了lib/db/prisma.ts中的类型定义）：
grep -r "from '@prisma/client'" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"
grep -r "import.*PrismaClient" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"

# ❌ 不应该找到这些库（业务逻辑库）：
grep -r "import.*bcrypt" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"
grep -r "import.*stripe" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"
grep -r "import.*nodemailer" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"

# ❌ 不应该直接使用这些环境变量：
grep -r "process.env.DATABASE_URL" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"
grep -r "process.env.STRIPE_SECRET" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"
grep -r "process.env.JWT_SECRET" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules"
```

### 后端代码审查清单：

```bash
# 在 wemaster-nest 目录运行：
cd /Volumes/BankChen/wemaster/wemaster-nest

# ✅ 应该只在后端找到这些：
grep -r "PrismaService" --include="*.ts" --exclude-dir="node_modules" | wc -l  # 应该 > 0
grep -r "EmailService" --include="*.ts" --exclude-dir="node_modules" | wc -l   # 应该 > 0
grep -r "@Injectable()" --include="*.ts" --exclude-dir="node_modules" | wc -l  # 应该 > 0
```

---

## 🎯 正确的数据流

```
┌─────────────────────────────────────────────────────────┐
│  前端 (wemaster-core)                                    │
│  - 纯UI组件                                              │
│  - 调用后端API (通过Orval SDK)                          │
│  - 客户端状态管理                                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP Request (POST /api/v1/auth/reset-password)
                  │ Body: { token, newPassword }
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  后端 (wemaster-nest)                                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Controller (auth.controller.ts)                  │  │
│  │  - 接收请求                                       │  │
│  │  - 验证DTO                                        │  │
│  └────────────┬──────────────────────────────────────┘  │
│               │                                          │
│               ▼                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Service (auth.service.ts)                        │  │
│  │  - 业务逻辑                                       │  │
│  │  - 验证token                                      │  │
│  │  - 加密密码                                       │  │
│  └────────────┬──────────────────────────────────────┘  │
│               │                                          │
│               ▼                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Prisma (数据库)                                  │  │
│  │  - 更新用户密码                                   │  │
│  │  - 删除重置token                                  │  │
│  └───────────────────────────────────────────────────┘  │
│               │                                          │
│               ▼                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  EmailService (邮件服务)                          │  │
│  │  - 发送确认邮件                                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP Response 200 OK
                  │ Body: { success: true, message: "..." }
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  前端                                                    │
│  - 显示成功消息                                          │
│  - 重定向到登录页                                        │
└─────────────────────────────────────────────────────────┘
```

---

## ❌ 违规示例（绝对禁止）

### 示例1：前端直接操作数据库
```typescript
// ❌ 错误 - 前端不能直接用Prisma
import { prisma } from '@/lib/db';

async function updateProfile(userId: string, name: string) {
  await prisma.user.update({  // ❌ 绝对禁止！
    where: { id: userId },
    data: { name }
  });
}
```

### 示例2：前端处理业务逻辑
```typescript
// ❌ 错误 - 前端不能加密密码
import bcrypt from 'bcrypt';

async function registerUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);  // ❌ 应该在后端！
  await fetch('/api/users', {
    body: JSON.stringify({ email, password: hashedPassword })
  });
}
```

### 示例3：前端发送邮件
```typescript
// ❌ 错误 - 前端不能发送邮件
import nodemailer from 'nodemailer';

async function sendWelcomeEmail(email: string) {
  const transporter = nodemailer.createTransport({...});  // ❌ 应该在后端！
  await transporter.sendMail({...});
}
```

---

## ✅ 正确示例

### 示例1：前端调用后端API
```typescript
// ✅ 正确 - 前端只调用API
import { userControllerUpdateProfile } from '@/lib/api/generated/user/user';

async function updateProfile(userId: string, name: string) {
  // 调用后端API，后端处理所有逻辑
  const response = await userControllerUpdateProfile({
    userId,
    name
  });
  return response;
}
```

### 示例2：后端处理注册逻辑
```typescript
// ✅ 正确 - 后端处理所有业务逻辑
// wemaster-nest/src/core/auth/auth.service.ts

@Injectable()
export class AuthService {
  async register(email: string, password: string) {
    // 1. 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. 创建用户
    const user = await this.prisma.user.create({
      data: { email, passwordHash: hashedPassword }
    });

    // 3. 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(email);

    return user;
  }
}
```

---

## 🔧 Next.js Server Actions 规范

**重要说明:** Next.js Server Actions虽然在前端代码库，但运行在服务器端。

### ✅ 允许的Server Actions模式：

```typescript
// lib/auth/actions.ts
'use server';

import { authControllerLogin } from '@/lib/api/generated/auth/auth';

export async function loginAction(email: string, password: string) {
  // ✅ 只能调用后端API，不能有业务逻辑
  const response = await authControllerLogin({ email, password });

  // ✅ 只能处理cookies/session
  cookies().set('auth_token', response.data.accessToken);

  return response;
}
```

### ❌ 禁止的Server Actions模式：

```typescript
// ❌ 错误示例
'use server';

import { prisma } from '@/lib/db';

export async function loginAction(email: string, password: string) {
  // ❌ 不能在Server Action中直接操作数据库
  const user = await prisma.user.findUnique({ where: { email } });

  // ❌ 不能在Server Action中加密密码
  const isValid = await bcrypt.compare(password, user.passwordHash);

  // 这些应该在后端NestJS中完成！
}
```

---

## 📊 职责分配表

| 功能 | 前端 (wemaster-core) | 后端 (wemaster-nest) |
|------|----------------------|----------------------|
| **UI渲染** | ✅ 负责 | ❌ 不负责 |
| **表单验证（前端）** | ✅ 负责 | ✅ 也要验证（双重验证） |
| **API调用** | ✅ 负责 | ❌ 不负责 |
| **业务逻辑** | ❌ 不负责 | ✅ 负责 |
| **数据库操作** | ❌ 绝对禁止 | ✅ 负责 |
| **密码加密** | ❌ 绝对禁止 | ✅ 负责 |
| **JWT生成/验证** | ❌ 绝对禁止 | ✅ 负责 |
| **邮件发送** | ❌ 绝对禁止 | ✅ 负责 |
| **支付处理** | ❌ 绝对禁止 | ✅ 负责 |
| **文件上传处理** | ⚠️ 只能上传 | ✅ 处理和存储 |
| **第三方API** | ❌ 绝对禁止 | ✅ 负责 |
| **Cookies/Session** | ⚠️ Server Actions可以 | ✅ 主要负责 |
| **路由保护** | ⚠️ 检查并重定向 | ✅ 验证权限 |

---

## 🚦 审查流程

### Pull Request 必须检查：

1. **前端PR审查：**
   ```bash
   # 运行检查脚本
   cd wemaster-core
   ./scripts/check-architecture-violations.sh

   # 如果发现违规，拒绝PR
   ```

2. **Code Review必查项：**
   - [ ] 前端代码没有Prisma导入
   - [ ] 前端代码没有bcrypt/crypto等业务库
   - [ ] 前端代码只调用Orval生成的SDK
   - [ ] Server Actions只包装后端API调用
   - [ ] 所有业务逻辑在后端Service中

3. **后端PR审查：**
   - [ ] 所有端点都有DTO验证
   - [ ] 所有业务逻辑在Service中
   - [ ] 数据库操作使用Prisma
   - [ ] 敏感操作有日志记录

---

## 📝 总结

### 🎯 记住这一条：

**"前端是演员，后端是导演。演员只负责表演（UI），导演负责剧情（业务逻辑）。"**

### 违反此规范的后果：

1. 代码Review不通过
2. PR被拒绝
3. 需要重构
4. 可能导致安全漏洞

---

**最后更新:** 2025-10-27
**维护者:** 开发团队
**违规举报:** 立即在PR中提出
