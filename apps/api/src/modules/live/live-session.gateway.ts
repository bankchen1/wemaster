import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { LiveSessionService } from './live-session.service';
import { LoggerService } from '../logger/logger.service';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_URL,
    credentials: true,
  },
  namespace: 'live',
})
@UseGuards(WsJwtGuard)
export class LiveSessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly liveSessionService: LiveSessionService,
    private readonly logger: LoggerService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.data.user?.id;
    if (!userId) {
      client.disconnect();
      return;
    }

    const sessionId = client.handshake.query.sessionId as string;
    if (!sessionId) {
      client.disconnect();
      return;
    }

    try {
      // 加入房间
      await client.join(sessionId);
      
      // 记录连接事件
      this.logger.logUserActivity(userId, {
        type: 'LIVE_SESSION',
        action: 'CONNECTED',
        metadata: { sessionId },
      });

      // 广播用户加入消息
      this.server.to(sessionId).emit('user:joined', {
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('LiveSessionGateway', {
        message: 'Failed to handle connection',
        error,
        userId,
        sessionId,
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    const sessionId = client.handshake.query.sessionId as string;

    if (userId && sessionId) {
      try {
        // 记录断开连接事件
        this.logger.logUserActivity(userId, {
          type: 'LIVE_SESSION',
          action: 'DISCONNECTED',
          metadata: { sessionId },
        });

        // 广播用户离开消息
        this.server.to(sessionId).emit('user:left', {
          userId,
          timestamp: new Date(),
        });

        // 离开房间
        await client.leave(sessionId);
      } catch (error) {
        this.logger.error('LiveSessionGateway', {
          message: 'Failed to handle disconnection',
          error,
          userId,
          sessionId,
        });
      }
    }
  }

  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string },
  ) {
    const userId = client.data.user?.id;
    const sessionId = client.handshake.query.sessionId as string;

    try {
      // 记录聊天消息
      await this.liveSessionService.logSessionEvent(sessionId, {
        type: 'chat',
        action: 'message_sent',
        userId,
        metadata: { content: data.content },
      });

      // 广播消息给房间内所有用户
      this.server.to(sessionId).emit('chat:message', {
        userId,
        content: data.content,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('LiveSessionGateway', {
        message: 'Failed to handle chat message',
        error,
        userId,
        sessionId,
      });
    }
  }

  @SubscribeMessage('whiteboard:update')
  async handleWhiteboardUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { action: string; payload: any },
  ) {
    const userId = client.data.user?.id;
    const sessionId = client.handshake.query.sessionId as string;

    try {
      // 记录白板更新
      await this.liveSessionService.logSessionEvent(sessionId, {
        type: 'whiteboard',
        action: data.action,
        userId,
        metadata: data.payload,
      });

      // 广播白板更新给房间内所有用户
      this.server.to(sessionId).emit('whiteboard:update', {
        userId,
        action: data.action,
        payload: data.payload,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('LiveSessionGateway', {
        message: 'Failed to handle whiteboard update',
        error,
        userId,
        sessionId,
      });
    }
  }

  @SubscribeMessage('hand:raise')
  async handleHandRaise(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id;
    const sessionId = client.handshake.query.sessionId as string;

    try {
      // 记录举手事件
      await this.liveSessionService.logSessionEvent(sessionId, {
        type: 'hand_raise',
        action: 'raised',
        userId,
      });

      // 广播举手事件给房间内所有用户
      this.server.to(sessionId).emit('hand:raise', {
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('LiveSessionGateway', {
        message: 'Failed to handle hand raise',
        error,
        userId,
        sessionId,
      });
    }
  }

  @SubscribeMessage('recording:start')
  async handleRecordingStart(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id;
    const sessionId = client.handshake.query.sessionId as string;

    try {
      // 检查用户权限
      const session = await this.liveSessionService.getSession(sessionId);
      if (session.tutorId !== userId) {
        throw new Error('Only tutor can start recording');
      }

      // 开始录制
      await this.liveSessionService.startRecording(sessionId);

      // 广播录制开始事件
      this.server.to(sessionId).emit('recording:started', {
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('LiveSessionGateway', {
        message: 'Failed to start recording',
        error,
        userId,
        sessionId,
      });
      
      // 发送错误消息给客户端
      client.emit('error', {
        message: 'Failed to start recording',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('recording:stop')
  async handleRecordingStop(
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.id;
    const sessionId = client.handshake.query.sessionId as string;

    try {
      // 检查用户权限
      const session = await this.liveSessionService.getSession(sessionId);
      if (session.tutorId !== userId) {
        throw new Error('Only tutor can stop recording');
      }

      // 停止录制
      const recordingUrl = await this.liveSessionService.stopRecording(sessionId);

      // 广播录制结束事件
      this.server.to(sessionId).emit('recording:stopped', {
        recordingUrl,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('LiveSessionGateway', {
        message: 'Failed to stop recording',
        error,
        userId,
        sessionId,
      });

      // 发送错误消息给客户端
      client.emit('error', {
        message: 'Failed to stop recording',
        error: error.message,
      });
    }
  }

  // 发送系统消息到房间
  async sendSystemMessage(sessionId: string, message: string) {
    this.server.to(sessionId).emit('system:message', {
      content: message,
      timestamp: new Date(),
    });
  }

  // 发送错误消息到特定用户
  async sendErrorMessage(clientId: string, error: any) {
    this.server.to(clientId).emit('error', {
      message: error.message,
      timestamp: new Date(),
    });
  }
}
