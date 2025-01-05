import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm'
import { User } from '../user/user.entity'
import { TutorProfile } from '../tutor/tutor-profile.entity'

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column('text')
  content: string

  @Column()
  type: string

  @Column({
    type: 'enum',
    enum: ['pending', 'answered', 'closed'],
    default: 'pending'
  })
  status: string

  @Column({ nullable: true })
  studentId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User

  @Column({ nullable: true })
  tutorId: string

  @ManyToOne(() => TutorProfile)
  @JoinColumn({ name: 'tutorId' })
  tutor: TutorProfile

  @OneToMany(() => QuestionReply, reply => reply.question)
  replies: QuestionReply[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

@Entity('question_replies')
export class QuestionReply {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  content: string

  @Column({ nullable: true })
  questionId: string

  @ManyToOne(() => Question, question => question.replies)
  @JoinColumn({ name: 'questionId' })
  question: Question

  @Column({ nullable: true })
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
