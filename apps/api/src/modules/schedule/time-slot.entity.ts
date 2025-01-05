import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm'
import { User } from '../user/user.entity'

export enum TimeSlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly'
}

@Entity('time_slots')
@Index(['tutorId', 'startTime'])
@Index(['tutorId', 'status'])
export class TimeSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  tutor: User

  @Column()
  tutorId: string

  @Column({ type: 'timestamp with time zone' })
  startTime: Date

  @Column({ type: 'timestamp with time zone' })
  endTime: Date

  @Column({
    type: 'enum',
    enum: TimeSlotStatus,
    default: TimeSlotStatus.AVAILABLE
  })
  status: TimeSlotStatus

  @Column({
    type: 'enum',
    enum: RecurrenceType,
    default: RecurrenceType.NONE
  })
  recurrenceType: RecurrenceType

  @Column({ nullable: true })
  recurrenceEndDate: Date

  @Column('jsonb', {
    nullable: true,
    default: {
      daysOfWeek: [], // For weekly recurrence
      dayOfMonth: null, // For monthly recurrence
      excludeDates: [], // Specific dates to exclude
      timezone: 'UTC'
    }
  })
  recurrenceRule: {
    daysOfWeek: number[]
    dayOfMonth?: number
    excludeDates: string[]
    timezone: string
  }

  @Column({ type: 'int', default: 60 }) // Duration in minutes
  duration: number

  @Column('jsonb', {
    default: {
      maxStudents: 1, // 1 for 1-on-1, >1 for group classes
      price: null,
      subjects: [],
      requirements: null
    }
  })
  settings: {
    maxStudents: number
    price?: number
    subjects: string[]
    requirements?: string
  }

  @Column('jsonb', { default: [] })
  bookedBy: string[] // Array of student IDs

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  lastRecurrenceGeneration: Date
}
