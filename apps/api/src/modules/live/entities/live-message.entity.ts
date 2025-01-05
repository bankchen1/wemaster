import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { LiveClass } from './live-class.entity';

@Entity()
export class LiveMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LiveClass, liveClass => liveClass.messages)
  liveClass: LiveClass;

  @ManyToOne(() => User)
  sender: User;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: ['text', 'emoji', 'image', 'system'],
    default: 'text',
  })
  type: 'text' | 'emoji' | 'image' | 'system';

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    replyTo?: string;
    mentions?: string[];
    imageUrl?: string;
    systemAction?: string;
  };

  @CreateDateColumn()
  createdAt: Date;
}
