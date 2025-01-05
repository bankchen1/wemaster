import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UseGuards } from '@nestjs/common'
import { WsJwtGuard } from '../auth/ws-jwt.guard'
import { RedisService } from '../redis/redis.service'
import { LoggerService } from '../logger/logger.service'

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  namespace: '/notifications'
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly userSockets: Map<string, Set<string>> = new Map()
  private readonly socketUsers: Map<string, string> = new Map()

  constructor(
    private redisService: RedisService,
    private loggerService: LoggerService
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      // 验证token
      const token = client.handshake.auth.token
      const userId = await this.validateToken(token)
      
      if (!userId) {
        client.disconnect()
        return
      }

      // 记录用户连接
      this.addUserSocket(userId, client.id)
      
      // 加入用户房间
      await client.join(`user:${userId}`)
      
      this.loggerService.log('websocket', {
        action: 'connection',
        userId,
        socketId: client.id
      })

      // 发送未读消息
      await this.sendUnreadMessages(userId, client)
    } catch (error) {
      this.loggerService.error('websocket', {
        action: 'connection-error',
        error: error.message
      })
      client.disconnect()
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = this.socketUsers.get(client.id)
    if (userId) {
      this.removeUserSocket(userId, client.id)
      this.loggerService.log('websocket', {
        action: 'disconnection',
        userId,
        socketId: client.id
      })
    }
  }

  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set())
    }
    this.userSockets.get(userId).add(socketId)
    this.socketUsers.set(socketId, userId)
  }

  private removeUserSocket(userId: string, socketId: string): void {
    const userSockets = this.userSockets.get(userId)
    if (userSockets) {
      userSockets.delete(socketId)
      if (userSockets.size === 0) {
        this.userSockets.delete(userId)
      }
    }
    this.socketUsers.delete(socketId)
  }

  private async validateToken(token: string): Promise<string | null> {
    try {
      // 实现token验证逻辑
      return 'userId' // 返回验证后的userId
    } catch {
      return null
    }
  }

  private async sendUnreadMessages(userId: string, client: Socket): Promise<void> {
    const unreadMessages = await this.redisService.getObject<any[]>(`unread:${userId}`)
    if (unreadMessages?.length) {
      client.emit('unread-messages', unreadMessages)
      await this.redisService.del(`unread:${userId}`)
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe-course')
  async handleSubscribeCourse(
    @ConnectedSocket() client: Socket,
    @MessageBody() courseId: string
  ): Promise<void> {
    await client.join(`course:${courseId}`)
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe-course')
  async handleUnsubscribeCourse(
    @ConnectedSocket() client: Socket,
    @MessageBody() courseId: string
  ): Promise<void> {
    await client.leave(`course:${courseId}`)
  }

  // 发送通知给特定用户
  async sendToUser(userId: string, event: string, data: any): Promise<void> {
    this.server.to(`user:${userId}`).emit(event, data)
    
    // 如果用户不在线，存储未读消息
    const isOnline = this.userSockets.has(userId)
    if (!isOnline) {
      const unreadMessages = await this.redisService.getObject<any[]>(`unread:${userId}`) || []
      unreadMessages.push({ event, data, timestamp: new Date() })
      await this.redisService.setObject(`unread:${userId}`, unreadMessages, 7 * 24 * 60 * 60) // 7天过期
    }
  }

  // 发送通知给课程的所有参与者
  async sendToCourse(courseId: string, event: string, data: any): Promise<void> {
    this.server.to(`course:${courseId}`).emit(event, data)
  }

  // 广播通知给所有用户
  async broadcast(event: string, data: any): Promise<void> {
    this.server.emit(event, data)
  }
}
