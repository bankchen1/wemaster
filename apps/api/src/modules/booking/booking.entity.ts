import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';
import { TimeSlot } from '../schedule/time-slot.entity';
import { BookingStatus } from '@wemaster/shared/types/booking';

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  tutorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutorId' })
  tutor: User;

  @Column()
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  timeSlotId: string;

  @ManyToOne(() => TimeSlot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timeSlotId' })
  timeSlot: TimeSlot;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  cancelReason?: string;

  @Column({ nullable: true })
  rescheduleReason?: string;

  @Column({ nullable: true })
  appealId?: string;

  @Column({ nullable: true })
  originalTimeSlotId?: string;

  @ManyToOne(() => TimeSlot, { nullable: true })
  @JoinColumn({ name: 'originalTimeSlotId' })
  originalTimeSlot?: TimeSlot;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
