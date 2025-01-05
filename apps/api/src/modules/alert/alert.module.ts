import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { AlertService } from './alert.service'
import { AlertController } from './alert.controller'
import { Alert } from './alert.entity'
import { MonitoringModule } from '../monitoring/monitoring.module'
import { NotificationModule } from '../notification/notification.module'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert]),
    EventEmitterModule.forRoot(),
    MonitoringModule,
    NotificationModule,
    LoggerModule
  ],
  providers: [AlertService],
  controllers: [AlertController],
  exports: [AlertService]
})
export class AlertModule {}
