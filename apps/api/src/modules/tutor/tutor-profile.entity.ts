import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index
} from 'typeorm'
import { User } from '../user/user.entity'

@Entity('tutor_profiles')
export class TutorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User, user => user.tutorProfile)
  @JoinColumn()
  user: User

  @Column()
  @Index()
  userId: string

  @Column()
  displayName: string

  @Column()
  title: string

  @Column('text')
  bio: string

  @Column({ nullable: true })
  avatarUrl: string

  @Column({ nullable: true })
  videoIntro: string

  @Column('simple-array')
  subjects: string[]

  @Column('simple-array')
  levels: string[]

  @Column('simple-array')
  languages: string[]

  @Column('text')
  teachingStyle: string

  @Column('jsonb')
  pricing: {
    hourlyRate: number
    trialRate: number
    groupRate: number
    groupSize: number
  }

  @Column('jsonb')
  availability: {
    weekdays: number[]
    timeSlots: Array<{
      start: string
      end: string
    }>
    timezone: string
  }

  @Column('jsonb')
  preferences: {
    instantBooking: boolean
    minimumNotice: number
    cancellationPolicy: string
  }

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ default: 0 })
  totalReviews: number

  @Column({ default: 0 })
  completedSessions: number

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  isVerified: boolean

  @Column({ nullable: true })
  verifiedAt: Date

  @Column({ nullable: true })
  verifiedBy: string

  @Column({ nullable: true })
  lastActiveAt: Date

  @Column({ default: 0 })
  bookingCount: number

  @Column({ default: 0 })
  responseRate: number

  @Column({ default: 0 })
  responseTime: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
