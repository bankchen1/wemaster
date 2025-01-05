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
import { File } from './file.entity';
import { User } from '../user/user.entity';

@Entity('file_shares')
@Index(['fileId', 'userId'])
export class FileShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileId: string;

  @Column()
  userId: string;

  @Column()
  sharedByUserId: string;

  @Column({
    type: 'enum',
    enum: ['view', 'edit', 'admin'],
    default: 'view',
  })
  permission: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'fileId' })
  file: File;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sharedByUserId' })
  sharedByUser: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
