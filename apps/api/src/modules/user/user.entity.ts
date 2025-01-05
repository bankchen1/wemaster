import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany
} from 'typeorm'
import { UserRole } from './user-role.enum'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { TutorApplication } from '../tutor/tutor-application.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT
  })
  role: UserRole

  @Column({ default: true })
  isActive: boolean

  @OneToOne(() => TutorProfile, profile => profile.user)
  tutorProfile: TutorProfile

  @OneToMany(() => TutorApplication, application => application.user)
  tutorApplications: TutorApplication[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // 虚拟属性，不存储在数据库中
  @Column({ select: false, insert: false, update: false })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }
}
