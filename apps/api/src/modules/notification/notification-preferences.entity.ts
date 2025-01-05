import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { User } from '../user/user.entity'

@Entity('notification_preferences')
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @Column()
  userId: string

  @Column('jsonb', {
    default: {
      email: {
        schedule_reminder: true,
        schedule_change: true,
        schedule_cancellation: true,
        payment_notification: true,
        system_announcement: true,
        marketing: false
      },
      push: {
        schedule_reminder: true,
        schedule_change: true,
        schedule_cancellation: true,
        payment_notification: true,
        system_announcement: false,
        marketing: false
      },
      sms: {
        schedule_reminder: false,
        schedule_change: false,
        schedule_cancellation: false,
        payment_notification: false,
        system_announcement: false,
        marketing: false
      }
    }
  })
  preferences: {
    email: Record<string, boolean>
    push: Record<string, boolean>
    sms: Record<string, boolean>
  }

  @Column('jsonb', {
    default: {
      reminder_before_class: 30, // minutes
      timezone: 'UTC',
      quiet_hours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      language: 'en'
    }
  })
  settings: {
    reminder_before_class: number
    timezone: string
    quiet_hours: {
      enabled: boolean
      start: string
      end: string
    }
    language: string
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
