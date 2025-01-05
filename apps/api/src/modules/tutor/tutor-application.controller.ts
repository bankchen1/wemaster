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
  ValidationPipe,
  ForbiddenException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { TutorApplicationService } from './tutor-application.service'
import { TutorApplication, ApplicationStatus } from './tutor-application.entity'
import { User } from '../user/user.entity'
import { UserRole } from '../user/user-role.enum'
import { CreateTutorApplicationDto } from './dto/create-tutor-application.dto'

class ReviewApplicationDto {
  status: ApplicationStatus
  notes: string
}

@Controller('tutor-applications')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TutorApplicationController {
  constructor(
    private readonly tutorApplicationService: TutorApplicationService
  ) {}

  @Post()
  @Roles(UserRole.STUDENT)
  async submitApplication(
    @CurrentUser() user: User,
    @Body(ValidationPipe) applicationData: CreateTutorApplicationDto
  ): Promise<TutorApplication> {
    return this.tutorApplicationService.submitApplication(
      user.id,
      applicationData
    )
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  async getAllApplications(
    @Query('status') status?: ApplicationStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    return this.tutorApplicationService.getAllApplications({
      status,
      page,
      limit,
      search
    })
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  async getApplicationStats() {
    return this.tutorApplicationService.getApplicationStats()
  }

  @Put(':id/review')
  @Roles(UserRole.ADMIN)
  async reviewApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) reviewData: ReviewApplicationDto,
    @CurrentUser() admin: User
  ): Promise<TutorApplication> {
    return this.tutorApplicationService.reviewApplication(id, {
      ...reviewData,
      reviewedBy: admin.id
    })
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  async getPendingApplications(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<{ applications: TutorApplication[]; total: number }> {
    return this.tutorApplicationService.getPendingApplications({
      limit,
      offset
    })
  }

  @Get('my')
  async getMyApplications(
    @CurrentUser() user: User
  ): Promise<TutorApplication[]> {
    return this.tutorApplicationService.getUserApplications(user.id)
  }

  @Get(':id')
  async getApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<TutorApplication> {
    const application = await this.tutorApplicationService.getApplicationById(id)

    // 只有申请者本人和管理员可以查看申请详情
    if (
      application.userId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You are not allowed to view this application')
    }

    return application
  }

  @Delete(':id')
  async withdrawApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User
  ): Promise<void> {
    return this.tutorApplicationService.withdrawApplication(id, user.id)
  }
}
