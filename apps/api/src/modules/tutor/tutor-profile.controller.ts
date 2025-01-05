import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TutorProfileService } from './tutor-profile.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { User } from '../user/user.entity';
import { UserRole } from '../user/user-role.enum';

@Controller('tutor-profiles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TutorProfileController {
  constructor(private readonly profileService: TutorProfileService) {}

  @Post()
  @Roles(UserRole.TUTOR)
  async createProfile(
    @CurrentUser() user: User,
    @Body(ValidationPipe) dto: CreateTutorProfileDto,
  ) {
    return this.profileService.createProfile(user.id, dto);
  }

  @Put()
  @Roles(UserRole.TUTOR)
  async updateProfile(
    @CurrentUser() user: User,
    @Body(ValidationPipe) dto: UpdateTutorProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Get('me')
  @Roles(UserRole.TUTOR)
  async getMyProfile(@CurrentUser() user: User) {
    return this.profileService.getProfile(user.id);
  }

  @Get('search')
  async searchProfiles(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('subjects') subjects?: string[],
    @Query('languages') languages?: string[],
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('rating') rating?: number,
    @Query('weekdays') weekdays?: number[],
    @Query('timeStart') timeStart?: string,
    @Query('timeEnd') timeEnd?: string,
  ) {
    return this.profileService.getVerifiedProfiles({
      page,
      limit,
      subjects,
      languages,
      minPrice,
      maxPrice,
      rating,
      availability: timeStart && timeEnd
        ? {
            weekdays,
            timeRange: {
              start: timeStart,
              end: timeEnd,
            },
          }
        : undefined,
    });
  }

  @Get(':id')
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.profileService.getProfileById(id);
  }

  @Put(':id/verify')
  @Roles(UserRole.ADMIN)
  async verifyProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: User,
    @Body('verified') verified: boolean,
    @Body('notes') notes?: string,
  ) {
    if (verified === undefined) {
      throw new BadRequestException('Verification status is required');
    }
    return this.profileService.verifyProfile(id, admin.id, verified, notes);
  }

  @Put(':id/stats')
  @Roles(UserRole.ADMIN)
  async updateStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() stats: {
      rating?: number;
      totalReviews?: number;
      completedSessions?: number;
      bookingCount?: number;
      responseRate?: number;
      responseTime?: number;
    },
  ) {
    return this.profileService.updateStats(id, stats);
  }
}
