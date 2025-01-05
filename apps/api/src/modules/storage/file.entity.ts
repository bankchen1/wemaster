import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';

export enum FileAccessLevel {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
}

export enum FileCategory {
  COURSE_MATERIAL = 'course_material',
  ASSIGNMENT = 'assignment',
  SUBMISSION = 'submission',
  PROFILE = 'profile',
  OTHER = 'other',
}

@Entity('files')
@Index(['userId', 'category'])
@Index(['courseId', 'category'])
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  extension: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  courseId: string;

  @Column({
    type: 'enum',
    enum: FileAccessLevel,
    default: FileAccessLevel.PRIVATE,
  })
  accessLevel: FileAccessLevel;

  @Column({
    type: 'enum',
    enum: FileCategory,
    default: FileCategory.OTHER,
  })
  category: FileCategory;

  @Column('text', { nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
    thumbnail?: string;
  };

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ default: 0 })
  downloads: number;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
