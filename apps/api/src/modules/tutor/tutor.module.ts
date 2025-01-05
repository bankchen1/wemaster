import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { TutorApplicationService } from './tutor-application.service'
import { TutorApplicationController } from './tutor-application.controller'
import { TutorApplication } from './tutor-application.entity'
import { TutorProfile } from './tutor-profile.entity'
import { User } from '../user/user.entity'
import { NotificationModule } from '../notification/notification.module'
import { TutorController } from './tutor.controller'
import { TutorService } from './tutor.service'
import { TutorFavoriteController } from './favorite.controller'
import { TutorFavoriteService } from './favorite.service'
import { Tutor } from './tutor.entity'
import { TutorFavorite } from './favorite.entity'
import { FileModule } from '../file/file.module'
import { RedisModule } from '../redis/redis.module'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([TutorApplication, TutorProfile, User, Tutor, TutorFavorite]),
    EventEmitterModule.forRoot(),
    NotificationModule,
    FileModule,
    RedisModule,
    LoggerModule
  ],
  providers: [TutorApplicationService, TutorService, TutorFavoriteService],
  controllers: [TutorApplicationController, TutorController, TutorFavoriteController],
  exports: [TutorApplicationService, TutorService, TutorFavoriteService]
})
export class TutorModule {}
