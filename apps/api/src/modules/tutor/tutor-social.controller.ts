import {
  Controller,
  Get,
  Post,
  Delete,
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
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator'
import { TutorSocialService } from './tutor-social.service'
import { TutorFollow } from './tutor-follow.entity'
import { TutorProfile } from './tutor-profile.entity'
import { User } from '../user/user.entity'
import { UserRole } from '../user/user-role.enum'

@Controller('tutors/social')
export class TutorSocialController {
  constructor(
    private readonly tutorSocialService: TutorSocialService
  ) {}

  @Post(':id/follow')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  async followTutor(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @CurrentUser() user: User
  ): Promise<TutorFollow> {
    return this.tutorSocialService.followTutor(user.id, tutorId)
  }

  @Delete(':id/follow')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.STUDENT)
  async unfollowTutor(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @CurrentUser() user: User
  ): Promise<void> {
    return this.tutorSocialService.unfollowTutor(user.id, tutorId)
  }

  @Get('following')
  @UseGuards(AuthGuard('jwt'))
  async getFollowedTutors(
    @CurrentUser() user: User,
    @Query('limit', Optional(), ParseIntPipe) limit?: number,
    @Query('offset', Optional(), ParseIntPipe) offset?: number
  ): Promise<{ tutors: TutorProfile[]; total: number }> {
    return this.tutorSocialService.getFollowedTutors(user.id, {
      limit,
      offset
    })
  }

  @Get(':id/followers')
  @UseGuards(AuthGuard('jwt'))
  async getTutorFollowers(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @Query('limit', Optional(), ParseIntPipe) limit?: number,
    @Query('offset', Optional(), ParseIntPipe) offset?: number
  ): Promise<{ followers: User[]; total: number }> {
    return this.tutorSocialService.getTutorFollowers(tutorId, {
      limit,
      offset
    })
  }

  @Get(':id/is-following')
  @UseGuards(AuthGuard('jwt'))
  async isFollowing(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @CurrentUser() user: User
  ): Promise<{ following: boolean }> {
    const following = await this.tutorSocialService.isFollowing(
      user.id,
      tutorId
    )
    return { following }
  }

  @Get(':id/share')
  @OptionalAuth()
  async getShareInfo(
    @Param('id', ParseUUIDPipe) tutorId: string
  ): Promise<{
    url: string
    title: string
    description: string
    image?: string
  }> {
    return this.tutorSocialService.generateShareLink(tutorId)
  }

  @Get('popular')
  @OptionalAuth()
  async getPopularTutors(
    @Query('limit', Optional(), ParseIntPipe) limit?: number
  ): Promise<TutorProfile[]> {
    return this.tutorSocialService.getPopularTutors(limit)
  }
}
