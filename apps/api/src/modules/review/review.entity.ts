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
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { Booking } from '../booking/booking.entity'

@Entity('reviews')
@Index(['tutorId', 'createdAt'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  tutorId: string

  @Column()
  bookingId: string

  @Column('decimal', { precision: 2, scale: 1 })
  rating: number

  @Column('text')
  content: string

  @Column({ default: false })
  isAnonymous: boolean

  @Column({ default: false })
  isEdited: boolean

  @Column({ type: 'jsonb', nullable: true })
  tags: string[]

  @Column({ default: 0 })
  helpfulCount: number

  @Column({ type: 'jsonb', default: [] })
  helpfulUsers: string[]

  @Column({ nullable: true, type: 'text' })
  tutorReply: string

  @Column({ nullable: true })
  tutorReplyAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => TutorProfile)
  @JoinColumn({ name: 'tutorId' })
  tutor: TutorProfile

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
