import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TutorProfile } from '../tutor/tutor-profile.entity';
import { Course } from '../course/course.entity';

@Entity('review_stats')
export class ReviewStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  tutorId: string;

  @Column({ nullable: true })
  courseId: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  teachingQuality: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  communicationSkills: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  professionalism: number;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  punctuality: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column('jsonb')
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };

  @Column('jsonb')
  commonTags: {
    tag: string;
    count: number;
  }[];

  @OneToOne(() => TutorProfile, { nullable: true })
  @JoinColumn({ name: 'tutorId' })
  tutor: TutorProfile;

  @OneToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
