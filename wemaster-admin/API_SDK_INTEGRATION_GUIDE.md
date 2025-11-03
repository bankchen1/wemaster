# WeMaster API SDK 集成指南

## 概述

本指南介绍如何使用 WeMaster Admin 前端项目中自动生成的 API SDK。SDK 基于后端 OpenAPI 3.0 规范自动生成，提供类型安全的 API 客户端。

## 生成的文件结构

```
src/api/
├── core-sdk/                      # 生成的核心 SDK
│   ├── auth/                      # 认证相关 API
│   │   └── auth.ts
│   ├── offerings/                 # 课程相关 API
│   │   └── offerings.ts
│   ├── orders/                    # 订单相关 API
│   │   └── orders.ts
│   ├── payments/                  # 支付相关 API
│   │   └── payments.ts
│   └── weMasterAPIGeneratedSpec.schemas.ts  # TypeScript 类型定义
├── index.js                       # 统一 API 客户端
└── mutator.js                     # Axios 拦截器配置
```

## 核心 API 端点

### 认证 API (authApi)

- `authControllerLogin(loginDto)` - 用户登录
- `authControllerRegister(registerDto)` - 用户注册
- `authControllerRefreshToken(refreshTokenDto)` - 刷新访问令牌

### 课程 API (offeringsApi)

- `offeringsControllerFindAll()` - 获取所有课程
- `offeringsControllerFindOne(slug)` - 获取单个课程详情
- `offeringsControllerCreate(createOfferingDto)` - 创建新课程

### 订单 API (ordersApi)

- `ordersControllerCreateDraft(createOrderDto)` - 创建订单草稿
- `ordersControllerFindOne(id)` - 获取订单详情

### 支付 API (paymentsApi)

- `paymentsControllerHandleStripeWebhook()` - 处理 Stripe Webhook

## 使用示例

### 基本用法

```javascript
import { authApi, offeringsApi } from '@/api'

// 登录
const login = async () => {
  try {
    const response = await authApi.authControllerLogin({
      email: 'user@example.com',
      password: 'password123'
    })
    
    // 保存令牌
    localStorage.setItem('authToken', response.data.accessToken)
    console.log('Login successful:', response.data.user)
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message)
  }
}

// 获取课程列表
const fetchOfferings = async () => {
  try {
    const response = await offeringsApi.offeringsControllerFindAll()
    console.log('Offerings:', response.data)
  } catch (error) {
    console.error('Failed to fetch offerings:', error)
  }
}
```

### Vue 组合式 API 示例

```vue
<script setup>
import { ref } from 'vue'
import { authApi } from '@/api'

const loading = ref(false)
const error = ref('')

const handleLogin = async (credentials) => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await authApi.authControllerLogin(credentials)
    // 处理成功响应
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
```

## 类型定义

SDK 包含完整的 TypeScript 类型定义：

```javascript
import type { LoginDto, AuthResponseDto, RegisterDto } from '@/api/core-sdk/weMasterAPIGeneratedSpec.schemas'

// 类型安全的函数参数
const loginData = {
  email: 'user@example.com', // string
  password: 'password123'    // string (minLength: 6)
}

// 类型安全的响应处理
const handleAuthResponse = (response: { data: AuthResponseDto }) => {
  const { accessToken, refreshToken, user } = response.data
  // TypeScript 会提供完整的类型提示
}
```

## 自动拦截器

SDK 配置了自动拦截器来处理：

1. **认证令牌注入** - 自动从 localStorage 获取并添加 Authorization header
2. **租户 ID 注入** - 自动添加 x-tenant-id header 用于多租户支持
3. **全局错误处理** - 统一处理 401、403、404、500 等错误

## 环境配置

通过环境变量配置 API 基础 URL：

```javascript
// .env.local
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

## 错误处理

SDK 提供统一的错误处理：

```javascript
try {
  const response = await authApi.authControllerLogin(credentials)
} catch (error) {
  if (error.response) {
    // 服务器响应错误
    const { status, data } = error.response
    
    switch (status) {
      case 401:
        // 未授权，重定向到登录页
        break
      case 403:
        // 权限不足
        break
      case 404:
        // 资源不存在
        break
      case 500:
        // 服务器错误
        break
    }
    
    console.error('API Error:', data.message)
  } else if (error.request) {
    // 网络错误
    console.error('Network Error:', error.message)
  } else {
    // 其他错误
    console.error('Error:', error.message)
  }
}
```

## 重新生成 SDK

当后端 API 发生变更时，重新生成 SDK：

```bash
# 1. 更新 OpenAPI 规范
cd ../wemaster-nest
npm run swagger:export:simple

# 2. 重新生成前端 SDK
cd ../wemaster-admin
npx orval -i ../wemaster-nest/tmp/openapi-runtime.json -o src/api/core-sdk --client axios --prettier --mode tags-split
```

## 最佳实践

1. **使用类型定义** - 充分利用 TypeScript 类型安全
2. **错误处理** - 始终包装 API 调用在 try-catch 中
3. **加载状态** - 为异步操作提供加载指示器
4. **令牌管理** - 安全地存储和管理认证令牌
5. **环境变量** - 使用环境变量管理不同环境的配置

## 故障排除

### 常见问题

1. **CORS 错误** - 确保后端正确配置了 CORS
2. **401 未授权** - 检查令牌是否正确设置
3. **网络错误** - 验证 API 基础 URL 配置
4. **类型错误** - 重新生成 SDK 以获取最新类型定义

### 调试技巧

```javascript
// 启用详细日志
apiInstance.interceptors.request.use(request => {
  console.log('Request:', request)
  return request
})

apiInstance.interceptors.response.use(response => {
  console.log('Response:', response)
  return response
})
```

## 更新日志

- **v1.0.0** - 初始 SDK 生成，包含核心认证和课程管理功能
- 支持自动令牌注入和多租户请求头
- 完整的 TypeScript 类型定义
- 统一的错误处理机制