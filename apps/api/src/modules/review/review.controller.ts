import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ReviewService } from './review.service'
import { Review } from './review.entity'
import { User } from '../user/user.entity'
import { UserRole } from '../user/user-role.enum'

class CreateReviewDto {
  bookingId: string
  rating: number
  content: string
  isAnonymous?: boolean
  tags?: string[]
}

class UpdateReviewDto {
  rating?: number
  content?: string
  isAnonymous?: boolean
  tags?: string[]
}

class GetReviewsDto {
  @Query('limit')
  limit?: number

  @Query('offset')
  offset?: number

  @Query('sortBy')
  sortBy?: 'recent' | 'rating' | 'helpful'

  @Query('minRating')
  minRating?: number

  @Query('maxRating')
  maxRating?: number

  @Query('withRepliesOnly')
  withRepliesOnly?: boolean
}

@Controller('reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  async createReview(
    @CurrentUser() user: User,
    @Body(ValidationPipe) createDto: CreateReviewDto
  ): Promise<Review> {
    return this.reviewService.createReview(user.id, createDto)
  }

  @Put(':id')
  @Roles(UserRole.STUDENT)
  async updateReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body(ValidationPipe) updateDto: UpdateReviewDto
  ): Promise<Review> {
    return this.reviewService.updateReview(id, user.id, updateDto)
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT)
  async deleteReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<void> {
    return this.reviewService.deleteReview(id, user.id)
  }

  @Post(':id/reply')
  @Roles(UserRole.TUTOR)
  async addTutorReply(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body('reply') reply: string
  ): Promise<Review> {
    return this.reviewService.addTutorReply(id, user.id, reply)
  }

  @Post(':id/helpful')
  @Roles(UserRole.STUDENT)
  async markReviewHelpful(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<Review> {
    return this.reviewService.markReviewHelpful(id, user.id)
  }

  @Get('tutor/:tutorId')
  async getTutorReviews(
    @Param('tutorId', ParseUUIDPipe) tutorId: string,
    @Query(ValidationPipe) query: GetReviewsDto
  ): Promise<{ reviews: Review[]; total: number }> {
    return this.reviewService.getTutorReviews(tutorId, query)
  }
}
