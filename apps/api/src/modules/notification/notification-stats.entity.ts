import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from '../user/user.entity'

@Entity('notification_stats')
export class NotificationStats {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @Column()
  userId: string

  @Column('jsonb', {
    default: {
      total_sent: 0,
      total_read: 0,
      total_clicked: 0,
      by_type: {},
      by_channel: {
        email: 0,
        push: 0,
        sms: 0,
        websocket: 0
      }
    }
  })
  stats: {
    total_sent: number
    total_read: number
    total_clicked: number
    by_type: Record<string, number>
    by_channel: Record<string, number>
  }

  @Column('jsonb', {
    default: {
      last_notification: null,
      last_read: null,
      last_interaction: null
    }
  })
  timestamps: {
    last_notification: Date | null
    last_read: Date | null
    last_interaction: Date | null
  }

  @Column('jsonb', {
    default: {
      delivery_success_rate: 100,
      read_rate: 0,
      click_rate: 0,
      average_read_time: 0
    }
  })
  metrics: {
    delivery_success_rate: number
    read_rate: number
    click_rate: number
    average_read_time: number
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
