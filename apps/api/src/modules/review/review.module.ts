import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { ReviewStats } from './review-stats.entity';
import { ReviewService } from './review.service';
import { ReviewStatsService } from './review-stats.service';
import { ReviewController } from './review.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewStats])],
  providers: [ReviewService, ReviewStatsService],
  controllers: [ReviewController],
  exports: [ReviewService, ReviewStatsService],
})
export class ReviewModule {}
