import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like, Between } from 'typeorm'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { BullQueue } from '@nestjs/bull'
import { InjectQueue } from '@nestjs/bull'
import {
  Message,
  MessageType,
  MessageStatus
} from './message.entity'
import { ChatRoom } from './chat-room.entity'
import { User } from '../user/user.entity'
import { NotificationService } from '../notification/notification.service'
import { StorageService } from '../storage/storage.service'
import { createReadStream } from 'fs'
import { join } from 'path'
import * as moment from 'moment'

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: true
})
export class MessageService {
  @WebSocketServer()
  server: Server

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly notificationService: NotificationService,
    private readonly storageService: StorageService,
    @InjectQueue('message')
    private readonly messageQueue: BullQueue
  ) {}

  async createMessage(data: {
    content: string
    senderId: string
    roomId: string
    type: MessageType
    metadata?: any
  }) {
    const { content, senderId, roomId, type, metadata } =
      data

    // 验证聊天室和发送者
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members']
    })
    if (!room) {
      throw new NotFoundException('Chat room not found')
    }

    const sender = await this.userRepository.findOne({
      where: { id: senderId }
    })
    if (!sender) {
      throw new NotFoundException('Sender not found')
    }

    // 检查发送者是否在聊天室中
    if (
      !room.members.some(member => member.id === senderId)
    ) {
      throw new BadRequestException(
        'Sender is not in the chat room'
      )
    }

    // 创建消息
    const message = this.messageRepository.create({
      content,
      sender,
      room,
      type,
      metadata,
      status: MessageStatus.SENT
    })

    await this.messageRepository.save(message)

    // 发送WebSocket通知
    this.server
      .to(roomId)
      .emit('new_message', { message })

    // 为离线用户发送通知
    const offlineMembers = room.members.filter(
      member =>
        member.id !== senderId &&
        !this.server.sockets.adapter.rooms.get(member.id)
    )

    for (const member of offlineMembers) {
      await this.notificationService.send({
        userId: member.id,
        type: 'NEW_MESSAGE',
        title: `来自 ${sender.name} 的新消息`,
        body: content,
        data: {
          roomId,
          messageId: message.id
        }
      })
    }

    // 索引消息用于搜索
    await this.elasticsearchService.index({
      index: 'messages',
      body: {
        id: message.id,
        content,
        senderId,
        roomId,
        type,
        metadata,
        createdAt: message.createdAt
      }
    })

    return message
  }

  async uploadFile(file: Express.Multer.File, roomId: string) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'File type not allowed'
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size exceeds limit'
      )
    }

    // 上传文件到存储服务
    const path = `chat/${roomId}/${Date.now()}-${
      file.originalname
    }`
    const url = await this.storageService.upload(
      file.buffer,
      path,
      {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          size: file.size
        }
      }
    )

    return {
      url,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype
    }
  }

  async searchMessages(params: {
    query: string
    groupId?: string
    userId?: string
    filters?: {
      sender?: string
      dateRange?: string
      type?: string
    }
  }) {
    const { query, groupId, userId, filters } = params

    // 构建Elasticsearch查询
    const should = [
      {
        match: {
          content: {
            query,
            operator: 'and',
            fuzziness: 'AUTO'
          }
        }
      }
    ]

    const must = []

    if (groupId) {
      must.push({ term: { roomId: groupId } })
    }

    if (userId) {
      must.push({ term: { senderId: userId } })
    }

    if (filters?.sender) {
      must.push({ term: { 'sender.name': filters.sender } })
    }

    if (filters?.type) {
      must.push({ term: { type: filters.type } })
    }

    if (filters?.dateRange) {
      const [start, end] = filters.dateRange
        .split(',')
        .map(date => new Date(date))
      must.push({
        range: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      })
    }

    const result = await this.elasticsearchService.search({
      index: 'messages',
      body: {
        query: {
          bool: {
            must,
            should,
            minimum_should_match: 1
          }
        },
        highlight: {
          fields: {
            content: {}
          }
        },
        sort: [{ createdAt: 'desc' }],
        size: 50
      }
    })

    return {
      total: result.hits.total.value,
      results: result.hits.hits.map(hit => ({
        id: hit._source.id,
        content: hit._source.content,
        sender: hit._source.sender,
        createdAt: hit._source.createdAt,
        type: hit._source.type,
        metadata: hit._source.metadata,
        highlights: hit.highlight?.content
      }))
    }
  }

  async getMessageHistory(
    roomId: string,
    params: {
      limit?: number
      before?: Date
      after?: Date
    }
  ) {
    const { limit = 50, before, after } = params

    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.roomId = :roomId', { roomId })
      .leftJoinAndSelect('message.sender', 'sender')
      .orderBy('message.createdAt', 'DESC')
      .take(limit)

    if (before) {
      query.andWhere('message.createdAt < :before', {
        before
      })
    }

    if (after) {
      query.andWhere('message.createdAt > :after', {
        after
      })
    }

    const messages = await query.getMany()
    return messages.reverse()
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['room', 'room.members']
    })

    if (!message) {
      throw new NotFoundException('Message not found')
    }

    if (
      !message.room.members.some(
        member => member.id === userId
      )
    ) {
      throw new BadRequestException(
        'User is not in the chat room'
      )
    }

    message.status = MessageStatus.READ
    await this.messageRepository.save(message)

    // 通知发送者消息已读
    this.server.to(message.sender.id).emit('message_read', {
      messageId,
      userId
    })

    return message
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender']
    })

    if (!message) {
      throw new NotFoundException('Message not found')
    }

    if (message.sender.id !== userId) {
      throw new BadRequestException(
        'Only sender can delete the message'
      )
    }

    // 如果消息发送时间超过24小时，不允许删除
    if (
      moment().diff(message.createdAt, 'hours') > 24
    ) {
      throw new BadRequestException(
        'Cannot delete messages older than 24 hours'
      )
    }

    await this.messageRepository.remove(message)

    // 通知聊天室成员消息已删除
    this.server
      .to(message.room.id)
      .emit('message_deleted', { messageId })

    // 从搜索索引中删除消息
    await this.elasticsearchService.delete({
      index: 'messages',
      id: messageId
    })

    return { success: true }
  }

  // WebSocket事件处理
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string
    if (userId) {
      client.join(userId)
      this.server.emit('user_online', { userId })
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string
    if (userId) {
      this.server.emit('user_offline', { userId })
    }
  }

  // 处理用户正在输入状态
  async handleTyping(roomId: string, userId: string) {
    this.server
      .to(roomId)
      .emit('typing', { roomId, userId })
  }

  // 导出聊天记录
  async exportChatHistory(roomId: string, format: string) {
    const messages = await this.messageRepository.find({
      where: { room: { id: roomId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' }
    })

    const exportPath = join(
      process.cwd(),
      'temp',
      `chat-${roomId}-${Date.now()}.${format}`
    )

    // 添加导出任务到队列
    const job = await this.messageQueue.add('export', {
      messages,
      format,
      exportPath
    })

    return {
      jobId: job.id,
      status: 'processing'
    }
  }

  // 获取导出状态
  async getExportStatus(jobId: string) {
    const job = await this.messageQueue.getJob(jobId)
    if (!job) {
      throw new NotFoundException('Export job not found')
    }

    const state = await job.getState()
    const progress = await job.progress()

    return {
      jobId,
      status: state,
      progress
    }
  }

  // 下载导出文件
  async downloadExport(jobId: string) {
    const job = await this.messageQueue.getJob(jobId)
    if (!job) {
      throw new NotFoundException('Export job not found')
    }

    const { exportPath } = job.returnvalue
    const stream = createReadStream(exportPath)

    return {
      stream,
      filename: exportPath.split('/').pop()
    }
  }
}
