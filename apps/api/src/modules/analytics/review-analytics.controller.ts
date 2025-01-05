import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  Optional
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ReviewAnalyticsService } from './review-analytics.service'
import { TutorProfile } from '../tutor/tutor-profile.entity'
import { User } from '../user/user.entity'
import { UserRole } from '../user/user-role.enum'

@Controller('analytics/reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReviewAnalyticsController {
  constructor(
    private readonly reviewAnalyticsService: ReviewAnalyticsService
  ) {}

  @Get('tutor/:id')
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  async getTutorAnalytics(
    @Param('id', ParseUUIDPipe) tutorId: string
  ) {
    return this.reviewAnalyticsService.getTutorAnalytics(tutorId)
  }

  @Get('tutor/:id/insights')
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  async getReviewInsights(
    @Param('id', ParseUUIDPipe) tutorId: string
  ) {
    return this.reviewAnalyticsService.getReviewInsights(tutorId)
  }

  @Get('tutor/:id/similar')
  async getSimilarTutors(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @Query('limit', Optional(), ParseIntPipe) limit?: number
  ): Promise<TutorProfile[]> {
    return this.reviewAnalyticsService.getSimilarTutors(tutorId, limit)
  }

  @Get('recommended')
  async getRecommendedTutors(
    @CurrentUser() user: User,
    @Query('limit', Optional(), ParseIntPipe) limit?: number
  ): Promise<TutorProfile[]> {
    return this.reviewAnalyticsService.getRecommendedTutors(
      user.id,
      limit
    )
  }
}
