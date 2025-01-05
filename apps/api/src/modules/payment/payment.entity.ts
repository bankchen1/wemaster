import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm'
import { Schedule } from '../schedule/schedule.entity'
import { User } from '../user/user.entity'

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  userId: string

  @Column()
  scheduleId: string

  @Column()
  amount: number

  @Column()
  paymentIntentId: string

  @Column({ nullable: true })
  refundId?: string

  @Column({ nullable: true })
  refundAmount?: number

  @Column({ nullable: true })
  refundReason?: string

  @Column()
  status: 'pending' | 'completed' | 'failed' | 'refunded'

  @Column({ nullable: true })
  error?: string

  @Column({ nullable: true })
  completedAt?: Date

  @ManyToOne(() => Schedule)
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
