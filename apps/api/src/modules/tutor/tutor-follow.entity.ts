import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique
} from 'typeorm'
import { User } from '../user/user.entity'
import { TutorProfile } from './tutor-profile.entity'

@Entity('tutor_follows')
@Unique(['userId', 'tutorId']) // 防止重复关注
export class TutorFollow {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  tutorId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => TutorProfile)
  @JoinColumn({ name: 'tutorId' })
  tutor: TutorProfile

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
