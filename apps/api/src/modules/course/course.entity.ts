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

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  type: 'regular' | 'trial' | 'group'

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

  @Column()
  price: number

  @Column()
  duration: number

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
  }

  @Column()
  status: 'active' | 'draft' | 'archived'

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
