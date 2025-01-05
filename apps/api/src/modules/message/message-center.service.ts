import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import {
  Message,
  MessageTemplate,
  MessageCampaign,
  ChatRoom
} from './message-center.entity'
import { User } from '../user/user.entity'
import { WebSocketGateway } from '../websocket/websocket.gateway'
import { CacheService } from '../cache/cache.service'
import { MonitoringService } from '../monitoring/monitoring.service'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'

@Injectable()
export class MessageCenterService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(MessageTemplate)
    private templateRepo: Repository<MessageTemplate>,
    @InjectRepository(MessageCampaign)
    private campaignRepo: Repository<MessageCampaign>,
    @InjectRepository(ChatRoom)
    private chatRoomRepo: Repository<ChatRoom>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private wsGateway: WebSocketGateway,
    private cacheService: CacheService,
    private monitoringService: MonitoringService,
    @InjectQueue('message-center')
    private messageQueue: Queue
  ) {}

  // 发送即时消息
  async sendChatMessage(data: {
    senderId: string
    receiverId: string
    content: string
    roomId?: string
  }) {
    let room = data.roomId
      ? await this.chatRoomRepo.findOne({
          where: { id: data.roomId }
        })
      : await this.findOrCreatePrivateRoom(
          data.senderId,
          data.receiverId
        )

    const message = await this.messageRepo.save({
      type: 'CHAT',
      senderId: data.senderId,
      receiverId: data.receiverId,
      title: '新消息',
      content: data.content,
      status: { read: false }
    })

    // 更新聊天室最后消息
    await this.chatRoomRepo.update(room.id, {
      metadata: {
        ...room.metadata,
        lastMessage: {
          content: data.content,
          senderId: data.senderId,
          sentAt: new Date()
        }
      }
    })

    // 通过 WebSocket 发送消息
    this.wsGateway.sendMessage(data.receiverId, {
      type: 'new_message',
      data: message
    })

    return message
  }

  // 发送系统通知
  async sendSystemNotification(data: {
    receiverId: string
    title: string
    content: string
    metadata?: any
  }) {
    const message = await this.messageRepo.save({
      type: 'SYSTEM',
      senderId: null, // 系统消息没有发送者
      receiverId: data.receiverId,
      title: data.title,
      content: data.content,
      metadata: data.metadata,
      status: { read: false }
    })

    // 通过 WebSocket 发送通知
    this.wsGateway.sendMessage(data.receiverId, {
      type: 'system_notification',
      data: message
    })

    return message
  }

  // 发送营销消息
  async sendMarketingMessage(data: {
    templateId: string
    receiverId: string
    variables?: any
    campaignId?: string
  }) {
    const template = await this.templateRepo.findOne({
      where: { id: data.templateId }
    })

    if (!template) {
      throw new Error('Template not found')
    }

    const content = this.processTemplate(
      template.content,
      data.variables
    )

    const message = await this.messageRepo.save({
      type: 'MARKETING',
      senderId: null,
      receiverId: data.receiverId,
      title: template.title,
      content,
      metadata: {
        templateId: template.id,
        campaignId: data.campaignId,
        action: template.metadata.action
      },
      status: { read: false }
    })

    // 通过 WebSocket 发送营销消息
    this.wsGateway.sendMessage(data.receiverId, {
      type: 'marketing_message',
      data: message
    })

    return message
  }

  // 创建消息模板
  async createTemplate(data: {
    name: string
    type: string
    title: string
    content: string
    metadata: any
  }) {
    return await this.templateRepo.save(data)
  }

  // 创建营销活动
  async createCampaign(data: {
    name: string
    templateId: string
    audience: any
    schedule: any
  }) {
    const campaign = await this.campaignRepo.save({
      ...data,
      stats: {
        total: 0,
        sent: 0,
        read: 0,
        clicked: 0,
        converted: 0
      },
      status: 'draft'
    })

    // 如果活动立即开始，加入队列
    if (
      campaign.status === 'active' &&
      new Date(campaign.schedule.startAt) <= new Date()
    ) {
      await this.messageQueue.add('process-campaign', {
        campaignId: campaign.id
      })
    }

    return campaign
  }

  // 获取用户的消息列表
  async getUserMessages(
    userId: string,
    options: {
      type?: string
      page?: number
      limit?: number
      unreadOnly?: boolean
    }
  ) {
    const query = this.messageRepo
      .createQueryBuilder('message')
      .where('message.receiverId = :userId', { userId })

    if (options.type) {
      query.andWhere('message.type = :type', {
        type: options.type
      })
    }

    if (options.unreadOnly) {
      query.andWhere("message.status->>'read' = 'false'")
    }

    const [messages, total] = await query
      .orderBy('message.createdAt', 'DESC')
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount()

    return {
      messages,
      total,
      page: options.page,
      limit: options.limit
    }
  }

  // 获取用户的聊天室列表
  async getUserChatRooms(userId: string) {
    return await this.chatRoomRepo
      .createQueryBuilder('room')
      .where(':userId = ANY(room.participantIds)', { userId })
      .orderBy(
        "room.metadata->'lastMessage'->'sentAt'",
        'DESC'
      )
      .getMany()
  }

  // 标记消息为已读
  async markMessageAsRead(messageId: string) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId }
    })

    if (!message) {
      throw new Error('Message not found')
    }

    await this.messageRepo.update(messageId, {
      status: {
        ...message.status,
        read: true,
        readAt: new Date()
      }
    })

    // 如果是营销消息，更新活动统计
    if (
      message.type === 'MARKETING' &&
      message.metadata?.campaignId
    ) {
      await this.updateCampaignStats(
        message.metadata.campaignId,
        'read'
      )
    }
  }

  // 处理消息点击
  async handleMessageClick(messageId: string) {
    const message = await this.messageRepo.findOne({
      where: { id: messageId }
    })

    if (!message) {
      throw new Error('Message not found')
    }

    await this.messageRepo.update(messageId, {
      status: {
        ...message.status,
        clicked: true,
        clickedAt: new Date()
      }
    })

    // 如果是营销消息，更新活动统计
    if (
      message.type === 'MARKETING' &&
      message.metadata?.campaignId
    ) {
      await this.updateCampaignStats(
        message.metadata.campaignId,
        'clicked'
      )
    }

    return message.metadata?.action
  }

  // 获取未读消息数
  async getUnreadCount(userId: string, type?: string) {
    const query = this.messageRepo
      .createQueryBuilder('message')
      .where('message.receiverId = :userId', { userId })
      .andWhere("message.status->>'read' = 'false'")

    if (type) {
      query.andWhere('message.type = :type', { type })
    }

    return await query.getCount()
  }

  private async findOrCreatePrivateRoom(
    user1Id: string,
    user2Id: string
  ) {
    const room = await this.chatRoomRepo
      .createQueryBuilder('room')
      .where('room.type = :type', { type: 'private' })
      .andWhere(':user1Id = ANY(room.participantIds)', {
        user1Id
      })
      .andWhere(':user2Id = ANY(room.participantIds)', {
        user2Id
      })
      .getOne()

    if (room) {
      return room
    }

    return await this.chatRoomRepo.save({
      name: 'Private Chat',
      type: 'private',
      participantIds: [user1Id, user2Id]
    })
  }

  private async updateCampaignStats(
    campaignId: string,
    type: 'sent' | 'read' | 'clicked' | 'converted'
  ) {
    await this.campaignRepo
      .createQueryBuilder()
      .update()
      .set({
        stats: () =>
          `jsonb_set(stats, '{${type}}', (COALESCE(stats->>'${type}','0')::int + 1)::text::jsonb)`
      })
      .where('id = :id', { id: campaignId })
      .execute()
  }

  private processTemplate(
    template: string,
    variables?: any
  ): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables?.[key] || match
    })
  }
}
