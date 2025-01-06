import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { WhiteboardData, ChatMessage, ClassroomSettings } from '../types/classroom';

export class SocketService {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      // 加入教室
      socket.on('join-classroom', (data: { classroomId: string; userId: string }) => {
        socket.join(data.classroomId);
        this.io.to(data.classroomId).emit('user-joined', {
          userId: data.userId,
          socketId: socket.id
        });
      });

      // 离开教室
      socket.on('leave-classroom', (data: { classroomId: string; userId: string }) => {
        socket.leave(data.classroomId);
        this.io.to(data.classroomId).emit('user-left', {
          userId: data.userId,
          socketId: socket.id
        });
      });

      // 白板同步
      socket.on('whiteboard-update', (data: { 
        classroomId: string;
        whiteboardData: WhiteboardData;
        userId: string;
      }) => {
        socket.to(data.classroomId).emit('whiteboard-updated', {
          whiteboardData: data.whiteboardData,
          userId: data.userId
        });
      });

      // 聊天消息
      socket.on('chat-message', (data: {
        classroomId: string;
        message: ChatMessage;
      }) => {
        this.io.to(data.classroomId).emit('new-message', data.message);
      });

      // 举手
      socket.on('raise-hand', (data: {
        classroomId: string;
        userId: string;
        raised: boolean;
      }) => {
        this.io.to(data.classroomId).emit('hand-raised', {
          userId: data.userId,
          raised: data.raised
        });
      });

      // 状态更新
      socket.on('status-update', (data: {
        classroomId: string;
        userId: string;
        status: {
          audio?: boolean;
          video?: boolean;
          screenShare?: boolean;
          reaction?: string;
        };
      }) => {
        socket.to(data.classroomId).emit('user-status-updated', {
          userId: data.userId,
          status: data.status
        });
      });

      // 教室设置更新
      socket.on('settings-update', (data: {
        classroomId: string;
        settings: ClassroomSettings;
      }) => {
        this.io.to(data.classroomId).emit('settings-updated', data.settings);
      });

      // 投票
      socket.on('create-poll', (data: {
        classroomId: string;
        pollData: {
          question: string;
          options: string[];
        };
      }) => {
        this.io.to(data.classroomId).emit('poll-created', data.pollData);
      });

      socket.on('vote', (data: {
        classroomId: string;
        pollId: string;
        userId: string;
        optionIndex: number;
      }) => {
        this.io.to(data.classroomId).emit('vote-recorded', {
          pollId: data.pollId,
          userId: data.userId,
          optionIndex: data.optionIndex
        });
      });

      // 分组讨论室
      socket.on('create-breakout-room', (data: {
        classroomId: string;
        roomData: {
          name: string;
          participants: string[];
        };
      }) => {
        const roomId = `${data.classroomId}-${Date.now()}`;
        this.io.to(data.classroomId).emit('breakout-room-created', {
          id: roomId,
          ...data.roomData
        });
      });

      // 断开连接
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // 公共方法
  public broadcastToClassroom(classroomId: string, event: string, data: any) {
    this.io.to(classroomId).emit(event, data);
  }

  public sendToUser(socketId: string, event: string, data: any) {
    this.io.to(socketId).emit(event, data);
  }
}

export const createSocketService = (httpServer: HttpServer) => {
  return new SocketService(httpServer);
};
