import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm'
import { AlertSeverity } from './alert.service'

@Entity('alerts')
@Index(['severity', 'timestamp'])
@Index(['ruleId', 'timestamp'])
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  ruleId: string

  @Column()
  ruleName: string

  @Column('text')
  description: string

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.WARNING
  })
  severity: AlertSeverity

  @Column()
  metric: string

  @Column('float')
  value: number

  @Column({ type: 'timestamp with time zone' })
  timestamp: Date

  @Column({ type: 'timestamp with time zone', nullable: true })
  acknowledgedAt?: Date

  @Column({ nullable: true })
  acknowledgedBy?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
