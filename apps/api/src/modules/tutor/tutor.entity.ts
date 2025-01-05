import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm'
import { Course } from '../course/course.entity'
import { Schedule } from '../schedule/schedule.entity'
import { Review } from '../review/review.entity'
import { Subject } from '../subject/subject.entity'

@Entity('tutors')
export class Tutor {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  name: string

  @Column()
  title: string

  @Column()
  avatar: string

  @Column('text')
  introduction: string

  @Column('simple-array')
  languages: string[]

  @Column('jsonb')
  education: {
    degree: string
    school: string
    major: string
    graduationYear: number
  }[]

  @Column('jsonb')
  certificates: {
    name: string
    issuer: string
    date: Date
    file: string
  }[]

  @Column('jsonb')
  experience: {
    title: string
    company: string
    startDate: Date
    endDate: Date
    description: string
  }[]

  @Column('jsonb')
  teachingStats: {
    totalStudents: number
    totalHours: number
    completionRate: number
    averageRating: number
    reviewCount: number
  }

  @Column('jsonb')
  gallery: {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }[]

  @Column('jsonb')
  pricing: {
    regular: {
      price: number
      duration: number
    }
    trial: {
      price: number
      duration: number
    }
    group: {
      price: number
      duration: number
      minStudents: number
      maxStudents: number
    }
  }

  @Column('text', { array: true })
  specialties: string[]

  @Column()
  timeZone: string

  @Column('jsonb')
  availability: {
    workingDays: number[]
    workingHours: {
      start: string
      end: string
    }
  }

  @Column('jsonb')
  settings: {
    autoConfirm: boolean
    advanceBooking: number
    cancellationPolicy: {
      deadline: number
      refundRate: number
    }
  }

  @Column()
  status: 'active' | 'inactive' | 'pending' | 'rejected'

  @Column('text', { nullable: true })
  rejectionReason?: string

  @OneToMany(() => Course, course => course.tutor)
  courses: Course[]

  @OneToMany(() => Schedule, schedule => schedule.tutor)
  schedules: Schedule[]

  @OneToMany(() => Review, review => review.tutor)
  reviews: Review[]

  @ManyToMany(() => Subject)
  @JoinTable()
  subjects: Subject[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
