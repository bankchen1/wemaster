# Withdrawal API Examples

## 创建 Stripe 账户

### 请求
```http
POST /api/withdrawals/accounts
Authorization: Bearer <token>
```

### 响应
```json
{
  "data": {
    "stripeAccountId": "acct_123",
    "status": "pending_verification"
  }
}
```

## 生成账户链接

### 请求
```http
POST /api/withdrawals/accounts/links
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnUrl": "https://example.com/account/settings"
}
```

### 响应
```json
{
  "data": {
    "url": "https://connect.stripe.com/setup/s/xxxxx"
  }
}
```

## 申请提现

### 请求
```http
POST /api/withdrawals
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000
}
```

### 响应
```json
{
  "data": {
    "id": "withdrawal-123",
    "status": "pending",
    "amount": 10000,
    "createdAt": "2025-01-05T22:58:13.000Z"
  }
}
```

## 获取收入统计

### 请求
```http
GET /api/withdrawals/stats
Authorization: Bearer <token>
```

### 响应
```json
{
  "data": {
    "totalEarnings": 100000,
    "totalWithdrawn": 50000,
    "balance": 50000,
    "paymentsCount": 10,
    "withdrawalsCount": 5
  }
}
```

## Stripe Connect Webhook 事件

### 账户验证完成
```http
POST /api/withdrawals/webhook
Stripe-Signature: t=1641456000,v1=...
Content-Type: application/json

{
  "id": "evt_123",
  "type": "account.updated",
  "data": {
    "object": {
      "id": "acct_123",
      "charges_enabled": true,
      "payouts_enabled": true,
      "metadata": {
        "tutorId": "tutor-123"
      }
    }
  }
}
```

### 提现成功
```http
POST /api/withdrawals/webhook
Stripe-Signature: t=1641456000,v1=...
Content-Type: application/json

{
  "id": "evt_123",
  "type": "payout.paid",
  "data": {
    "object": {
      "id": "po_123",
      "status": "paid",
      "amount": 10000,
      "destination": "acct_123"
    }
  }
}
```
