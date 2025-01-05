import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { User } from '../user/user.entity';

@Entity('course_progress')
export class CourseProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course)
  @JoinColumn()
  course: Course;

  @ManyToOne(() => User)
  @JoinColumn()
  student: User;

  @Column('jsonb')
  progress: {
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt: Date;
    completedTopics: string[];
    quizScores: {
      quizId: string;
      score: number;
      completedAt: Date;
    }[];
    assignments: {
      assignmentId: string;
      status: 'pending' | 'submitted' | 'graded';
      score?: number;
      submittedAt?: Date;
      gradedAt?: Date;
    }[];
  };

  @Column('jsonb')
  notes: {
    lessonId: string;
    content: string;
    createdAt: Date;
  }[];

  @Column('jsonb')
  achievements: {
    type: string;
    title: string;
    description: string;
    earnedAt: Date;
  }[];

  @Column('float', { default: 0 })
  completionPercentage: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
