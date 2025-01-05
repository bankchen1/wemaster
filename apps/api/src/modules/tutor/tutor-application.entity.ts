import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { User } from '../user/user.entity'

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('tutor_applications')
export class TutorApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, user => user.tutorApplications)
  @JoinColumn()
  user: User

  @Column()
  userId: string

  @Column()
  name: string

  @Column()
  title: string

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
    endDate?: Date
    description: string
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

  @Column('jsonb')
  availability: {
    workingDays: number[]
    workingHours: {
      start: string
      end: string
    }
  }

  @Column('simple-array')
  subjects: string[]

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING
  })
  status: ApplicationStatus

  @Column({ nullable: true })
  reviewedBy: string

  @Column({ type: 'text', nullable: true })
  reviewNotes: string

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
