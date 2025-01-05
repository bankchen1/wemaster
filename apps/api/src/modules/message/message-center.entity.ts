import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { User } from '../user/user.entity'

@Entity('messages')
@Index(['receiverId', 'createdAt'])
@Index(['senderId', 'createdAt'])
@Index(['type', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: [
      'CHAT', // 即时通讯消息
      'SYSTEM', // 系统通知
      'MARKETING', // 营销消息
      'EVENT', // 事件通知
      'REMINDER' // 提醒消息
    ]
  })
  type: string

  @Column({ nullable: true })
  senderId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User

  @Column()
  receiverId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User

  @Column()
  title: string

  @Column('text')
  content: string

  @Column('jsonb', { nullable: true })
  metadata: {
    templateId?: string
    campaignId?: string
    eventType?: string
    action?: {
      type: string
      url?: string
      data?: any
    }
  }

  @Column('jsonb', { nullable: true })
  status: {
    read: boolean
    readAt?: Date
    clicked?: boolean
    clickedAt?: Date
    archived?: boolean
    archivedAt?: Date
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

@Entity('message_templates')
export class MessageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({
    type: 'enum',
    enum: ['SYSTEM', 'MARKETING', 'EVENT', 'REMINDER']
  })
  type: string

  @Column()
  title: string

  @Column('text')
  content: string

  @Column('jsonb')
  metadata: {
    variables: string[]
    triggers?: {
      event?: string
      schedule?: string
      condition?: any
    }
    audience?: {
      roles?: string[]
      tags?: string[]
      filters?: any
    }
    action?: {
      type: string
      url?: string
      data?: any
    }
  }

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

@Entity('message_campaigns')
export class MessageCampaign {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  templateId: string

  @Column('jsonb')
  audience: {
    roles?: string[]
    tags?: string[]
    filters?: any
  }

  @Column('jsonb')
  schedule: {
    startAt: Date
    endAt?: Date
    frequency?: string
    timezone?: string
  }

  @Column('jsonb')
  stats: {
    total: number
    sent: number
    read: number
    clicked: number
    converted: number
  }

  @Column({ default: 'draft' })
  status: 'draft' | 'active' | 'paused' | 'completed'

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column('text', { nullable: true })
  description: string

  @Column('simple-array')
  participantIds: string[]

  @Column({
    type: 'enum',
    enum: ['private', 'group'],
    default: 'private'
  })
  type: string

  @Column('jsonb', { nullable: true })
  metadata: {
    courseId?: string
    questionId?: string
    lastMessage?: {
      content: string
      senderId: string
      sentAt: Date
    }
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
