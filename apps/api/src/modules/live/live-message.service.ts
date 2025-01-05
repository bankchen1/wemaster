import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveMessage } from './entities/live-message.entity';

@Injectable()
export class LiveMessageService {
  constructor(
    @InjectRepository(LiveMessage)
    private readonly liveMessageRepository: Repository<LiveMessage>,
  ) {}

  async createMessage(data: {
    liveClassId: string;
    senderId: string;
    content: string;
    type: string;
    metadata?: any;
  }) {
    const message = this.liveMessageRepository.create({
      liveClass: { id: data.liveClassId },
      sender: { id: data.senderId },
      content: data.content,
      type: data.type,
      metadata: data.metadata,
    });

    return this.liveMessageRepository.save(message);
  }

  async getClassMessages(classId: string, options?: {
    limit?: number;
    before?: Date;
    after?: Date;
  }) {
    const queryBuilder = this.liveMessageRepository
      .createQueryBuilder('message')
      .where('message.liveClassId = :classId', { classId })
      .leftJoinAndSelect('message.sender', 'sender')
      .orderBy('message.createdAt', 'DESC');

    if (options?.limit) {
      queryBuilder.take(options.limit);
    }

    if (options?.before) {
      queryBuilder.andWhere('message.createdAt < :before', {
        before: options.before,
      });
    }

    if (options?.after) {
      queryBuilder.andWhere('message.createdAt > :after', {
        after: options.after,
      });
    }

    return queryBuilder.getMany();
  }

  async deleteClassMessages(classId: string) {
    return this.liveMessageRepository.delete({
      liveClass: { id: classId },
    });
  }
}
