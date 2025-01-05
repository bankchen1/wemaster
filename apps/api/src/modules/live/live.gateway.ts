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
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { LiveClassService } from './live-class.service';
import { LiveMessageService } from './live-message.service';

@WebSocketGateway({
  namespace: 'live',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
@UseGuards(WsAuthGuard)
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly liveClassService: LiveClassService,
    private readonly liveMessageService: LiveMessageService,
  ) {}

  async handleConnection(client: Socket) {
    const { classId, userId } = client.handshake.query;
    
    // 加入房间
    client.join(`class:${classId}`);
    
    // 更新用户状态
    await this.liveClassService.joinClass(classId as string, userId as string);
    
    // 广播用户加入消息
    this.server.to(`class:${classId}`).emit('userJoined', {
      userId,
      timestamp: new Date(),
    });
  }

  async handleDisconnect(client: Socket) {
    const { classId, userId } = client.handshake.query;
    
    // 更新用户状态
    await this.liveClassService.leaveClass(classId as string, userId as string);
    
    // 广播用户离开消息
    this.server.to(`class:${classId}`).emit('userLeft', {
      userId,
      timestamp: new Date(),
    });
    
    // 离开房间
    client.leave(`class:${classId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { classId, userId } = client.handshake.query;
    
    // 保存消息
    const message = await this.liveMessageService.createMessage({
      liveClassId: classId as string,
      senderId: userId as string,
      content: data.content,
      type: data.type,
      metadata: data.metadata,
    });
    
    // 广播消息
    this.server.to(`class:${classId}`).emit('newMessage', message);
  }

  @SubscribeMessage('raiseHand')
  async handleRaiseHand(@ConnectedSocket() client: Socket) {
    const { classId, userId } = client.handshake.query;
    
    // 广播举手消息
    this.server.to(`class:${classId}`).emit('handRaised', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('toggleAudio')
  async handleToggleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { enabled: boolean },
  ) {
    const { classId, userId } = client.handshake.query;
    
    // 广播音频状态变更
    this.server.to(`class:${classId}`).emit('audioStateChanged', {
      userId,
      enabled: data.enabled,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('toggleVideo')
  async handleToggleVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { enabled: boolean },
  ) {
    const { classId, userId } = client.handshake.query;
    
    // 广播视频状态变更
    this.server.to(`class:${classId}`).emit('videoStateChanged', {
      userId,
      enabled: data.enabled,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('startScreenShare')
  async handleStartScreenShare(@ConnectedSocket() client: Socket) {
    const { classId, userId } = client.handshake.query;
    
    // 广播屏幕共享开始
    this.server.to(`class:${classId}`).emit('screenShareStarted', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('stopScreenShare')
  async handleStopScreenShare(@ConnectedSocket() client: Socket) {
    const { classId, userId } = client.handshake.query;
    
    // 广播屏幕共享结束
    this.server.to(`class:${classId}`).emit('screenShareStopped', {
      userId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('endClass')
  async handleEndClass(@ConnectedSocket() client: Socket) {
    const { classId, userId } = client.handshake.query;
    
    // 验证是否为主持人
    const isHost = await this.liveClassService.isClassHost(
      classId as string,
      userId as string,
    );
    
    if (isHost) {
      // 结束课堂
      await this.liveClassService.endClass(classId as string, userId as string);
      
      // 广播课堂结束消息
      this.server.to(`class:${classId}`).emit('classEnded', {
        timestamp: new Date(),
      });
      
      // 断开所有连接
      const sockets = await this.server.in(`class:${classId}`).allSockets();
      sockets.forEach(socketId => {
        this.server.sockets.sockets.get(socketId)?.disconnect(true);
      });
    }
  }
}
