import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Course } from '../../course/entities/course.entity';
import { LiveMessage } from './live-message.entity';

@Entity()
export class LiveClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Course, { nullable: true })
  course: Course;

  @ManyToOne(() => User)
  host: User;

  @Column()
  hostId: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => LiveMessage, message => message.liveClass)
  messages: LiveMessage[];

  @Column({
    type: 'enum',
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled',
  })
  status: 'scheduled' | 'live' | 'ended';

  @Column({ type: 'timestamp' })
  scheduledStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledEndTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ nullable: true })
  whiteboardRoomUUID: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    allowChat: boolean;
    allowRaiseHand: boolean;
    allowScreenShare: boolean;
    autoRecording: boolean;
    participantDefaultAudioOn: boolean;
    participantDefaultVideoOn: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  resources: {
    slides?: string[];
    documents?: string[];
    links?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  recording: {
    videoUrl?: string;
    duration?: number;
    size?: number;
    status?: 'processing' | 'completed' | 'failed';
  };

  @Column({ type: 'jsonb', nullable: true })
  statistics: {
    peakParticipants: number;
    totalParticipants: number;
    averageAttendanceTime: number;
    chatMessages: number;
    questionsAsked: number;
    handRaises: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
