import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { TutorService } from './tutor.service'
import {
  CreateTutorDto,
  UpdateTutorDto,
  TutorSearchParams,
  UploadGalleryDto,
  EarningsQueryDto,
  ReviewQueryDto
} from './tutor.dto'

@Controller('tutors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  @Post()
  @Roles('user')
  async create(@Body(ValidationPipe) createTutorDto: CreateTutorDto) {
    return this.tutorService.create(createTutorDto)
  }

  @Get()
  async findAll(@Query(ValidationPipe) params: TutorSearchParams) {
    return this.tutorService.findAll(params)
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutorService.findOne(id)
  }

  @Put(':id')
  @Roles('tutor')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateTutorDto: UpdateTutorDto
  ) {
    return this.tutorService.update(id, updateTutorDto)
  }

  @Put(':id/availability')
  @Roles('tutor')
  async updateAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('availability', ValidationPipe) availability: any
  ) {
    return this.tutorService.updateAvailability(id, availability)
  }

  @Post(':id/gallery')
  @Roles('tutor')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true)
      } else {
        cb(new Error('只支持图片和视频文件'), false)
      }
    }
  }))
  async uploadGallery(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.tutorService.uploadGallery(id, files)
  }

  @Get(':id/schedule')
  async getSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.tutorService.getSchedule(
      id,
      new Date(startDate),
      new Date(endDate)
    )
  }

  @Get(':id/earnings')
  @Roles('tutor')
  async getEarnings(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(ValidationPipe) query: EarningsQueryDto
  ) {
    return this.tutorService.getEarnings(id, query.period)
  }

  @Get(':id/reviews')
  async getReviews(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(ValidationPipe) query: ReviewQueryDto
  ) {
    return this.tutorService.getReviews(id, query.page, query.limit)
  }
}
