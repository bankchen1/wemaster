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
  ValidationPipe
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { CourseService } from './course.service'
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseScheduleQueryDto,
  MaterialDto
} from './course.dto'

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

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
}
