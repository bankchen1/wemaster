import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import { BatchOperationService } from './batch-operation.service'
import { BatchOperationController } from './batch-operation.controller'
import { BatchOperationProcessor } from './batch-operation.processor'
import { Review } from '../review/review.entity'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { Booking } from '../booking/booking.entity'
import { User } from '../user/user.entity'
import { NotificationModule } from '../notification/notification.module'
import { MonitoringModule } from '../monitoring/monitoring.module'
import { CacheModule } from '../cache/cache.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      TutorProfile,
      Booking,
      User
    ]),
    BullModule.registerQueue({
      name: 'batch-operations',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    }),
    NotificationModule,
    MonitoringModule,
    CacheModule
  ],
  providers: [
    BatchOperationService,
    BatchOperationProcessor
  ],
  controllers: [BatchOperationController],
  exports: [BatchOperationService]
})
export class BatchOperationModule {}
