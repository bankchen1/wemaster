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
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ValidationPipe,
  BadRequestException
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CourseService } from './course.service'
import { LessonStatusService } from '../lesson/lesson-status.service'
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseScheduleQueryDto,
  MaterialDto
} from './course.dto'
import {
  UpdateStatusDto,
  FeedbackDto,
  AppealDto,
  RescheduleDto
} from './dto/course-status.dto'
import { LessonStatus } from '@wemaster/shared/types/lesson-status'

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly lessonStatusService: LessonStatusService
  ) {}

  @Post(':tutorId')
  @Roles('tutor')
  async create(
    @Param('tutorId', ParseUUIDPipe) tutorId: string,
    @Body(ValidationPipe) createCourseDto: CreateCourseDto
  ) {
    return this.courseService.create(tutorId, createCourseDto)
  }

  @Get('tutor/:tutorId')
  async findAll(@Param('tutorId', ParseUUIDPipe) tutorId: string) {
    return this.courseService.findAll(tutorId)
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.findOne(id)
  }

  @Put(':id')
  @Roles('tutor')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCourseDto: UpdateCourseDto
  ) {
    return this.courseService.update(id, updateCourseDto)
  }

  @Post(':id/materials')
  @Roles('tutor')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: (req, file, cb) => {
      // 允许的文件类型
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ]

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('不支持的文件类型'), false)
      }
    }
  }))
  async uploadMaterial(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.courseService.uploadMaterial(id, file)
  }

  @Delete(':id/materials')
  @Roles('tutor')
  async removeMaterial(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('url') materialUrl: string
  ) {
    return this.courseService.removeMaterial(id, materialUrl)
  }

  @Get(':id/schedules')
  @Roles('tutor')
  async getSchedules(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(ValidationPipe) query: CourseScheduleQueryDto
  ) {
    return this.courseService.getSchedules(
      id,
      new Date(query.startDate),
      new Date(query.endDate)
    )
  }

  @Get(':id/stats')
  @Roles('tutor')
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.getStats(id)
  }

  @Put(':id/archive')
  @Roles('tutor')
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseService.archive(id)
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateStatusDto: UpdateStatusDto
  ) {
    const course = await this.courseService.findOne(id);
    
    if (!this.lessonStatusService.isValidStatusTransition(
      course.status,
      updateStatusDto.status
    )) {
      throw new BadRequestException('Invalid status transition');
    }

    const timeConfig = this.lessonStatusService.getUpdatedTimeConfig(
      course.status,
      updateStatusDto.status,
      {
        startTime: course.startTime,
        endTime: course.endTime,
        completedTime: course.completedTime,
        lastFeedbackTime: course.lastFeedbackTime,
        lastAppealTime: course.lastAppealTime
      }
    );

    return this.courseService.update(id, {
      status: updateStatusDto.status,
      ...timeConfig
    });
  }

  @Post(':id/feedback')
  @Roles('student')
  async addFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) feedbackDto: FeedbackDto
  ) {
    const course = await this.courseService.findOne(id);
    
    if (course.status !== LessonStatus.COMPLETED) {
      throw new BadRequestException('Course must be completed before feedback');
    }

    const businessDays = this.lessonStatusService.getBusinessDaysSinceCompletion(
      course.completedTime
    );
    
    if (businessDays > 7) {
      throw new BadRequestException('Feedback period has expired');
    }

    return this.courseService.update(id, {
      feedback: {
        ...feedbackDto,
        createdAt: new Date()
      },
      lastFeedbackTime: new Date()
    });
  }

  @Post(':id/appeal')
  @Roles('student')
  async submitAppeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) appealDto: AppealDto
  ) {
    const course = await this.courseService.findOne(id);
    
    if (course.status !== LessonStatus.COMPLETED) {
      throw new BadRequestException('Course must be completed before appeal');
    }

    const hoursSinceCompletion = this.lessonStatusService.getHoursSinceCompletion(
      course.completedTime
    );
    
    if (hoursSinceCompletion > 24) {
      throw new BadRequestException('Appeal period has expired');
    }

    return this.courseService.update(id, {
      appeal: {
        ...appealDto,
        status: 'pending',
        createdAt: new Date()
      },
      lastAppealTime: new Date()
    });
  }

  @Put(':id/reschedule')
  @Roles('student', 'tutor')
  async reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) rescheduleDto: RescheduleDto
  ) {
    const course = await this.courseService.findOne(id);
    
    // 检查课程开始时间是否在24小时内
    const isWithin24Hours = this.lessonStatusService.isWithin24Hours(course.startTime);
    
    if (isWithin24Hours) {
      throw new BadRequestException('Cannot modify course within 24 hours of start time');
    }

    // 如果是学生发起的改期，需要导师确认
    if (this.authService.getCurrentUserRole() === 'student') {
      return this.courseService.update(id, {
        status: LessonStatus.RESCHEDULING,
        proposedStartTime: rescheduleDto.startTime,
        proposedEndTime: rescheduleDto.endTime,
        rescheduleReason: rescheduleDto.reason
      });
    }

    // 如果是导师确认改期
    return this.courseService.update(id, {
      status: LessonStatus.RESCHEDULED,
      startTime: rescheduleDto.startTime,
      endTime: rescheduleDto.endTime,
      rescheduleReason: rescheduleDto.reason
    });
  }

  @Put(':id/confirm-reschedule')
  @Roles('tutor')
  async confirmReschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('accepted') accepted: boolean,
    @Body('reason') reason?: string
  ) {
    const course = await this.courseService.findOne(id);
    
    if (course.status !== LessonStatus.RESCHEDULING) {
      throw new BadRequestException('Course is not in rescheduling status');
    }

    if (accepted) {
      return this.courseService.update(id, {
        status: LessonStatus.RESCHEDULED,
        startTime: course.proposedStartTime,
        endTime: course.proposedEndTime
      });
    }

    return this.courseService.update(id, {
      status: LessonStatus.SCHEDULED,
      proposedStartTime: null,
      proposedEndTime: null,
      rescheduleReason: reason
    });
  }

  @Put(':id/cancel')
  @Roles('student', 'tutor')
  async cancelCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string
  ) {
    const course = await this.courseService.findOne(id);
    
    // 检查课程开始时间是否在24小时内
    const isWithin24Hours = this.lessonStatusService.isWithin24Hours(course.startTime);
    
    if (isWithin24Hours) {
      throw new BadRequestException('Cannot cancel course within 24 hours of start time');
    }

    return this.courseService.update(id, {
      status: LessonStatus.CANCELED,
      cancelReason: reason,
      canceledAt: new Date(),
      canceledBy: this.authService.getCurrentUserId()
    });
  }

  @Get(':id/status')
  async getStatus(@Param('id', ParseUUIDPipe) id: string) {
    const course = await this.courseService.findOne(id);
    
    const currentStatus = this.lessonStatusService.getCurrentStatus({
      startTime: course.startTime,
      endTime: course.endTime,
      completedTime: course.completedTime,
      lastFeedbackTime: course.lastFeedbackTime,
      lastAppealTime: course.lastAppealTime
    });

    const buttonStatus = this.lessonStatusService.getButtonStatus(
      currentStatus,
      {
        startTime: course.startTime,
        endTime: course.endTime,
        completedTime: course.completedTime,
        lastFeedbackTime: course.lastFeedbackTime,
        lastAppealTime: course.lastAppealTime
      }
    );

    return {
      status: currentStatus,
      buttonStatus,
      isClickable: this.lessonStatusService.isButtonClickable(currentStatus),
      timeConfig: {
        startTime: course.startTime,
        endTime: course.endTime,
        completedTime: course.completedTime,
        lastFeedbackTime: course.lastFeedbackTime,
        lastAppealTime: course.lastAppealTime
      },
      feedback: course.feedback,
      appeal: course.appeal
    };
  }
}
