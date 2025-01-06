import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from 'typeorm'
import { Tutor } from '../tutor/tutor.entity'
import { Schedule } from '../schedule/schedule.entity'
import { Review } from '../review/review.entity'
import { CourseType } from '@wemaster/shared/types/pricing'
import { LessonStatus } from '@wemaster/shared/types/lesson'

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({
    type: 'enum',
    enum: CourseType,
    default: CourseType.ONE_ON_ONE
  })
  type: CourseType

  @Column('text')
  description: string

  @Column('text', { array: true })
  syllabus: string[]

  @Column('jsonb')
  materials: {
    name: string
    type: string
    url: string
    size: number
  }[]

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number // 导师基础收入

  @Column('decimal', { precision: 10, scale: 2 })
  platformFee: number // 平台服务费

  @Column('decimal', { precision: 10, scale: 2 })
  displayPrice: number // 展示给学生的价格（含税）

  @Column()
  duration: number // 课程时长（分钟）

  @Column({ nullable: true })
  lessonsCount?: number // 课时包数量

  @Column({ default: 1 })
  minStudents: number

  @Column({ default: 1 })
  maxStudents: number

  @Column('jsonb', { nullable: true })
  groupSchedule?: {
    startDate: Date
    endDate: Date
    weekdays: number[]
    time: string
  }

  @Column('jsonb')
  stats: {
    totalStudents: number
    totalSessions: number
    averageRating: number
    reviewCount: number
    completedLessons: number // 已完成课时数
  }

  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.PENDING
  })
  status: LessonStatus;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column('timestamp', { nullable: true })
  completedTime?: Date;

  @Column('timestamp', { nullable: true })
  lastFeedbackTime?: Date;

  @Column('timestamp', { nullable: true })
  lastAppealTime?: Date;

  @Column('jsonb', { nullable: true })
  feedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };

  @Column('jsonb', { nullable: true })
  appeal?: {
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    resolvedAt?: Date;
  };

  @ManyToOne(() => Tutor, tutor => tutor.courses)
  tutor: Tutor

  @OneToMany(() => Schedule, schedule => schedule.course)
  schedules: Schedule[]

  @OneToMany(() => Review, review => review.course)
  reviews: Review[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
