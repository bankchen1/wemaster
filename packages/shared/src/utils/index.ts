// 时间处理工具
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

// 文件处理工具
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 会议工具
export const generateMeetingId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// 权限检查工具
export const checkPermission = (
  userRole: string,
  requiredRole: string[]
): boolean => {
  const roleHierarchy = ['student', 'teacher', 'admin'];
  const userRoleIndex = roleHierarchy.indexOf(userRole);
  return requiredRole.some(
    role => userRoleIndex >= roleHierarchy.indexOf(role)
  );
};

// 验证工具
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// 错误处理工具
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// WebSocket 事件类型
export enum WebSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  MESSAGE = 'message',
  ERROR = 'error',
  JOIN_ROOM = 'joinRoom',
  LEAVE_ROOM = 'leaveRoom',
  USER_JOINED = 'userJoined',
  USER_LEFT = 'userLeft',
  CHAT_MESSAGE = 'chatMessage',
  HAND_RAISE = 'handRaise',
  SCREEN_SHARE = 'screenShare',
  RECORDING_START = 'recordingStart',
  RECORDING_STOP = 'recordingStop'
}

// 常量
export const Constants = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  DEFAULT_AVATAR: '/assets/default-avatar.png',
  API_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  WEBSOCKET_RECONNECT_INTERVAL: 5000 // 5 seconds
};
