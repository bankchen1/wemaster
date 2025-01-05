# API 文档

## 直播课堂 API

### 创建课堂
```http
POST /api/live/sessions
Content-Type: application/json

{
  "bookingId": "string"
}
```

**响应**
```json
{
  "data": {
    "session": {
      "id": "string",
      "roomName": "string",
      "status": "created",
      "tutorId": "string",
      "studentId": "string"
    },
    "tutorToken": "string",
    "studentToken": "string"
  }
}
```

### 开始课堂
```http
POST /api/live/sessions/{sessionId}/start
```

**响应**
```json
{
  "data": {
    "id": "string",
    "status": "active",
    "actualStartTime": "string"
  }
}
```

### 结束课堂
```http
POST /api/live/sessions/{sessionId}/end
```

**响应**
```json
{
  "data": {
    "id": "string",
    "status": "completed",
    "actualEndTime": "string"
  }
}
```

### 获取参与者列表
```http
GET /api/live/sessions/{sessionId}/participants
```

**响应**
```json
{
  "data": {
    "participants": [
      {
        "id": "string",
        "name": "string",
        "role": "tutor|student",
        "isAudioEnabled": true,
        "isVideoEnabled": true
      }
    ]
  }
}
```

## 支付 API

### 创建支付意向
```http
POST /api/payments/intents
Content-Type: application/json

{
  "bookingId": "string"
}
```

**响应**
```json
{
  "data": {
    "clientSecret": "string"
  }
}
```

### 申请退款
```http
POST /api/payments/refunds
Content-Type: application/json

{
  "bookingId": "string",
  "reason": "string"
}
```

**响应**
```json
{
  "data": {
    "id": "string",
    "status": "pending",
    "amount": 0
  }
}
```

## 提现 API

### 创建导师账户
```http
POST /api/withdrawals/accounts
```

**响应**
```json
{
  "data": {
    "accountId": "string",
    "status": "pending_verification"
  }
}
```

### 获取账户链接
```http
POST /api/withdrawals/accounts/links
Content-Type: application/json

{
  "returnUrl": "string"
}
```

**响应**
```json
{
  "data": {
    "url": "string"
  }
}
```

### 申请提现
```http
POST /api/withdrawals
Content-Type: application/json

{
  "amount": 0
}
```

**响应**
```json
{
  "data": {
    "id": "string",
    "status": "pending",
    "amount": 0
  }
}
```

### 获取收入统计
```http
GET /api/withdrawals/stats
```

**响应**
```json
{
  "data": {
    "totalEarnings": 0,
    "totalWithdrawn": 0,
    "balance": 0,
    "paymentsCount": 0,
    "withdrawalsCount": 0
  }
}
```

## WebSocket 事件

### 连接
```javascript
const socket = io('/live', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

### 事件列表

#### 发送消息
```javascript
socket.emit('message', {
  sessionId: 'string',
  content: 'string'
});
```

#### 接收消息
```javascript
socket.on('message', (data) => {
  // {
  //   id: 'string',
  //   senderId: 'string',
  //   content: 'string',
  //   timestamp: 'string'
  // }
});
```

#### 参与者状态变更
```javascript
socket.on('participant_updated', (data) => {
  // {
  //   participantId: 'string',
  //   updates: {
  //     isAudioEnabled: boolean,
  //     isVideoEnabled: boolean,
  //     isScreenSharing: boolean,
  //     handRaised: boolean
  //   }
  // }
});
```

## 错误处理

所有 API 错误响应的格式如下：

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "timestamp": "2025-01-05T13:33:25-08:00",
  "path": "/api/path",
  "method": "POST"
}
```

### 常见错误代码

- 400 Bad Request: 请求参数错误
- 401 Unauthorized: 未认证或 token 无效
- 403 Forbidden: 无权限访问
- 404 Not Found: 资源不存在
- 409 Conflict: 资源冲突
- 500 Internal Server Error: 服务器内部错误

## 认证

所有 API 请求需要在 Header 中携带 JWT Token：

```http
Authorization: Bearer <token>
```

## 速率限制

- 普通接口: 100 次/分钟
- 支付相关接口: 20 次/分钟
- WebSocket 消息: 60 条/分钟
