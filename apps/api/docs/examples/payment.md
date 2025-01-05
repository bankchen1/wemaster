# Payment API Examples

## 创建支付意向

### 请求
```http
POST /api/payments/intents
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking-123"
}
```

### 响应
```json
{
  "data": {
    "clientSecret": "pi_123_secret_456"
  }
}
```

## 申请退款

### 请求
```http
POST /api/payments/refunds
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking-123",
  "reason": "学生申请退款"
}
```

### 响应
```json
{
  "data": {
    "id": "refund-123",
    "status": "pending",
    "amount": 10000,
    "reason": "学生申请退款",
    "createdAt": "2025-01-05T22:58:13.000Z"
  }
}
```

## Stripe Webhook 事件

### 支付成功
```http
POST /api/payments/webhook
Stripe-Signature: t=1641456000,v1=...
Content-Type: application/json

{
  "id": "evt_123",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_123",
      "status": "succeeded",
      "amount": 10000,
      "currency": "cny",
      "metadata": {
        "bookingId": "booking-123"
      }
    }
  }
}
```

### 退款成功
```http
POST /api/payments/webhook
Stripe-Signature: t=1641456000,v1=...
Content-Type: application/json

{
  "id": "evt_123",
  "type": "charge.refunded",
  "data": {
    "object": {
      "id": "ch_123",
      "refunded": true,
      "amount_refunded": 10000,
      "metadata": {
        "bookingId": "booking-123"
      }
    }
  }
}
```
