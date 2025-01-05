# Live Session API Examples

## 创建课堂会话

### 请求
```http
POST /api/live/sessions
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
    "session": {
      "id": "session-123",
      "roomName": "class_booking-123",
      "status": "created",
      "tutorId": "tutor-123",
      "studentId": "student-123",
      "createdAt": "2025-01-05T22:58:13.000Z"
    },
    "tutorToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "studentToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 开始课堂

### 请求
```http
POST /api/live/sessions/session-123/start
Authorization: Bearer <token>
```

### 响应
```json
{
  "data": {
    "id": "session-123",
    "status": "active",
    "actualStartTime": "2025-01-05T22:58:13.000Z"
  }
}
```

## 结束课堂

### 请求
```http
POST /api/live/sessions/session-123/end
Authorization: Bearer <token>
```

### 响应
```json
{
  "data": {
    "id": "session-123",
    "status": "completed",
    "actualEndTime": "2025-01-05T23:58:13.000Z"
  }
}
```

## 获取参与者列表

### 请求
```http
GET /api/live/sessions/session-123/participants
Authorization: Bearer <token>
```

### 响应
```json
{
  "data": {
    "participants": [
      {
        "id": "tutor-123",
        "name": "John Doe",
        "role": "tutor",
        "isAudioEnabled": true,
        "isVideoEnabled": true,
        "joinedAt": "2025-01-05T22:58:13.000Z"
      },
      {
        "id": "student-123",
        "name": "Jane Smith",
        "role": "student",
        "isAudioEnabled": true,
        "isVideoEnabled": true,
        "joinedAt": "2025-01-05T22:59:13.000Z"
      }
    ]
  }
}
```
