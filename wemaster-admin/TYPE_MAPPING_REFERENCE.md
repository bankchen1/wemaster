# WeMaster API 类型映射关系

## 概述

本文档记录了后端 DTO 与前端生成类型之间的映射关系，确保前后端类型一致性。

## 核心类型映射

### 认证相关

| 后端 DTO | 前端类型 | 描述 |
|---------|---------|------|
| `LoginDto` | `LoginDto` | 登录请求参数 |
| `RegisterDto` | `RegisterDto` | 注册请求参数 |
| `AuthResponseDto` | `AuthResponseDto` | 认证响应数据 |
| `RefreshTokenDto` | `RefreshTokenDto` | 刷新令牌请求 |

### 用户相关

| 后端 DTO | 前端类型 | 描述 |
|---------|---------|------|
| `UserDto` | `UserDto` | 用户基本信息 |
| `UserProfileDto` | `UserProfileDto` | 用户详细资料 |
| `UpdateProfileDto` | `UpdateProfileDto` | 更新用户资料 |

### 课程相关

| 后端 DTO | 前端类型 | 描述 |
|---------|---------|------|
| `CreateOfferingDto` | `CreateOfferingDto` | 创建课程请求 |
| `OfferingDto` | `OfferingDto` | 课程响应数据 |
| `UpdateOfferingDto` | `UpdateOfferingDto` | 更新课程请求 |
| `VariantDto` | `VariantDto` | 课程变体信息 |

### 订单相关

| 后端 DTO | 前端类型 | 描述 |
|---------|---------|------|
| `CreateOrderDto` | `CreateOrderDto` | 创建订单请求 |
| `OrderDto` | `OrderDto` | 订单响应数据 |
| `OrderItemDto` | `OrderItemDto` | 订单项信息 |

### 支付相关

| 后端 DTO | 前端类型 | 描述 |
|---------|---------|------|
| `PaymentDto` | `PaymentDto` | 支付信息 |
| `RefundDto` | `RefundDto` | 退款信息 |

## 枚举类型映射

### 用户角色

```typescript
// 后端
export enum UserRole {
  STUDENT = 'STUDENT',
  TUTOR = 'TUTOR',
  ADMIN = 'ADMIN'
}

// 前端生成
export const RegisterDtoRole = {
  STUDENT: 'STUDENT',
  TUTOR: 'TUTOR',
  ADMIN: 'ADMIN',
} as const;

export type RegisterDtoRole = typeof RegisterDtoRole[keyof typeof RegisterDtoRole];
```

### 课程类型

```typescript
// 后端
export enum OfferingType {
  COURSE = 'COURSE',
  WORKSHOP = 'WORKSHOP',
  WEBINAR = 'WEBINAR'
}

// 前端生成
export const CreateOfferingDtoType = {
  COURSE: 'COURSE',
  WORKSHOP: 'WORKSHOP',
  WEBINAR: 'WEBINAR',
} as const;

export type CreateOfferingDtoType = typeof CreateOfferingDtoType[keyof typeof CreateOfferingDtoType];
```

### 订单状态

```typescript
// 后端
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

// 前端生成
export const OrderDtoStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type OrderDtoStatus = typeof OrderDtoStatus[keyof typeof OrderDtoStatus];
```

## 复杂类型示例

### 用户资料类型

```typescript
// 后端 DTO
export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// 前端生成类型
export interface UserProfileDto {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: RegisterDtoRole;
  createdAt: string;
  updatedAt: string;
}
```

### 课程详情类型

```typescript
// 后端 DTO
export class OfferingDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: OfferingType;

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [VariantDto] })
  variants: VariantDto[];

  @ApiProperty()
  tutorId: string;

  @ApiProperty({ required: false })
  tutor?: UserDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// 前端生成类型
export interface OfferingDto {
  id: string;
  title: string;
  description: string;
  type: CreateOfferingDtoType;
  price: number;
  variants: VariantDto[];
  tutorId: string;
  tutor?: UserDto;
  createdAt: string;
  updatedAt: string;
}
```

## 类型验证规则

### 字符串验证

```typescript
// 后端验证装饰器
export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

// 前端生成类型（包含 JSDoc 注释）
export interface LoginDto {
  email: string;
  /** @minLength 6 */
  password: string;
}
```

### 数值验证

```typescript
// 后端验证装饰器
export class CreateOfferingDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100)
  maxStudents: number;
}

// 前端生成类型
export interface CreateOfferingDto {
  price: number;
  maxStudents: number;
}
```

## 日期时间处理

### 后端到前端的转换

```typescript
// 后端：Date 对象
@ApiProperty()
createdAt: Date;

@ApiProperty()
updatedAt: Date;

// 前端：ISO 字符串
createdAt: string;
updatedAt: string;
```

### 前端使用示例

```javascript
// 转换字符串为 Date 对象
const offering = await offeringsApi.offeringsControllerFindOne(slug)
const createdDate = new Date(offering.data.createdAt)

// 格式化显示
const formattedDate = createdDate.toLocaleDateString()
```

## 可选字段处理

### 后端可选字段

```typescript
// 后端 DTO
export class UpdateProfileDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({ required: false })
  bio?: string;
}

// 前端生成类型
export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
  bio?: string;
}
```

### 前端使用

```javascript
// 只提供需要更新的字段
const updateData = {
  name: 'New Name'
  // avatar 和 bio 会被省略
}

await userApi.updateProfile(updateData)
```

## 数组类型

### 后端数组字段

```typescript
// 后端 DTO
export class OfferingDto {
  @ApiProperty({ type: [VariantDto] })
  variants: VariantDto[];

  @ApiProperty({ type: [String], required: false })
  tags?: string[];
}

// 前端生成类型
export interface OfferingDto {
  variants: VariantDto[];
  tags?: string[];
}
```

## 嵌套对象类型

### 复杂嵌套结构

```typescript
// 后端 DTO
export class OrderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: UserDto;

  @ApiProperty({ type: [OrderItemDto] })
  items: OrderItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  status: OrderStatus;
}

// 前端生成类型
export interface OrderDto {
  id: string;
  user: UserDto;
  items: OrderItemDto[];
  total: number;
  status: OrderDtoStatus;
}
```

## 类型一致性验证

### 自动化检查

可以通过以下方式验证类型一致性：

```bash
# 1. 生成最新的 OpenAPI 规范
cd ../wemaster-nest
npm run swagger:export:simple

# 2. 重新生成前端 SDK
cd ../wemaster-admin
npx orval -i ../wemaster-nest/tmp/openapi-runtime.json -o src/api/core-sdk --client axios --prettier --mode tags-split

# 3. 检查类型错误（如果有 TypeScript 配置）
npx tsc --noEmit
```

### 手动验证步骤

1. 检查后端 DTO 变更
2. 更新 OpenAPI 规范
3. 重新生成前端 SDK
4. 验证前端代码中的类型使用
5. 更新相关的组件和服务

## 最佳实践

1. **保持 DTO 稳定** - 避免频繁修改现有 DTO 结构
2. **版本控制** - 对破坏性变更使用版本控制
3. **文档同步** - 及时更新类型映射文档
4. **自动化测试** - 编写契约测试验证类型一致性
5. **渐进式迁移** - 分阶段更新前端代码以使用新的类型定义