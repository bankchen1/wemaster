import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne
} from 'typeorm'
import { Tutor } from '../tutor/tutor.entity'
import { Course } from '../course/course.entity'
import { User } from '../user/user.entity'
import { Payment } from '../payment/payment.entity'

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Tutor, tutor => tutor.schedules)
  tutor: Tutor

  @ManyToOne(() => Course, course => course.schedules)
  course: Course

  @ManyToOne(() => User)
  student: User

  @Column()
  startTime: Date

  @Column()
  endTime: Date

  @Column()
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'

  @Column('jsonb', { nullable: true })
  cancellation?: {
    time: Date
    reason: string
    initiator: 'tutor' | 'student'
    refundAmount: number
  }

  @Column('jsonb', { nullable: true })
  completion?: {
    attendanceStatus: 'attended' | 'absent' | 'late'
    teacherNotes: string
    homeworkAssigned: boolean
  }

  @OneToOne(() => Payment)
  payment: Payment

  @Column('jsonb')
  meetingInfo: {
    platform: string
    roomId: string
    password?: string
    joinUrl: string
  }

  @Column('text', { nullable: true })
  notes?: string

  @Column('jsonb', { nullable: true })
  reminder: {
    sentToTutor: boolean
    sentToStudent: boolean
    lastSentAt: Date
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
