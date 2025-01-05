import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './file.service';
import { SpacesService } from './spaces.service';
import { RedisModule } from '../redis/redis.module';
import { LoggerModule } from '../logger/logger.module';
import { FileController } from './file.controller';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    LoggerModule,
  ],
  controllers: [FileController],
  providers: [FileService, SpacesService],
  exports: [FileService, SpacesService],
})
export class FileModule {}
