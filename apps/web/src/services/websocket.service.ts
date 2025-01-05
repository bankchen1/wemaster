import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/utils/auth';

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(sessionId: string) {
    if (this.socket) {
      this.disconnect();
    }

    const token = getAuthToken();
    
    this.socket = io(`${process.env.NEXT_PUBLIC_API_URL}/live`, {
      auth: {
        token: `Bearer ${token}`,
      },
      query: {
        sessionId,
      },
    });

    // 设置基本事件监听器
    this.setupBaseListeners();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    // 清除所有监听器
    this.listeners.clear();
  }

  private setupBaseListeners() {
    if (!this.socket) return;

    // 连接事件
    this.socket.on('connect', () => {
      this.emit('connection:status', { connected: true });
    });

    // 断开连接事件
    this.socket.on('disconnect', (reason) => {
      this.emit('connection:status', { connected: false, reason });
    });

    // 错误事件
    this.socket.on('error', (error) => {
      this.emit('error', error);
    });

    // 系统消息
    this.socket.on('system:message', (message) => {
      this.emit('system:message', message);
    });
  }

  // 发送聊天消息
  sendChatMessage(content: string) {
    if (!this.socket) return;
    this.socket.emit('chat:message', { content });
  }

  // 发送白板更新
  sendWhiteboardUpdate(action: string, payload: any) {
    if (!this.socket) return;
    this.socket.emit('whiteboard:update', { action, payload });
  }

  // 发送举手信号
  sendHandRaise() {
    if (!this.socket) return;
    this.socket.emit('hand:raise');
  }

  // 开始录制
  startRecording() {
    if (!this.socket) return;
    this.socket.emit('recording:start');
  }

  // 停止录制
  stopRecording() {
    if (!this.socket) return;
    this.socket.emit('recording:stop');
  }

  // 添加事件监听器
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // 如果是已连接的 socket，直接添加监听器
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // 移除事件监听器
  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    }
  }

  // 触发事件
  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // 检查连接状态
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 获取当前 socket 实例
  getSocket(): Socket | null {
    return this.socket;
  }
}
