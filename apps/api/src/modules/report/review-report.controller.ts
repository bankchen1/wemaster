import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  Res,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common'
import { Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { ReviewReportService } from './review-report.service'
import { UserRole } from '../user/user-role.enum'

class ReportFilterDto {
  startDate?: Date
  endDate?: Date
  minRating?: number
  maxRating?: number
  tags?: string[]
  hasReply?: boolean
  isAnonymous?: boolean
}

@Controller('reports/reviews')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReviewReportController {
  constructor(private readonly reportService: ReviewReportService) {}

  @Get('tutor/:id')
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  async generateReport(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @Query(ValidationPipe) filter: ReportFilterDto
  ) {
    return this.reportService.generateReport(tutorId, filter)
  }

  @Get('tutor/:id/excel')
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  async exportToExcel(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @Query(ValidationPipe) filter: ReportFilterDto,
    @Res() res: Response
  ) {
    const buffer = await this.reportService.exportToExcel(tutorId, filter)

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=review-report.xlsx',
      'Content-Length': buffer.length
    })

    res.send(buffer)
  }

  @Get('tutor/:id/pdf')
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  async exportToPdf(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @Query(ValidationPipe) filter: ReportFilterDto,
    @Res() res: Response
  ) {
    const buffer = await this.reportService.exportToPdf(tutorId, filter)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=review-report.pdf',
      'Content-Length': buffer.length
    })

    res.send(buffer)
  }

  @Post('tutor/:id/periodic')
  @Roles(UserRole.TUTOR, UserRole.ADMIN)
  async generatePeriodicReport(
    @Param('id', ParseUUIDPipe) tutorId: string,
    @Body('period') period: 'weekly' | 'monthly'
  ) {
    return this.reportService.generatePeriodicReport(tutorId, period)
  }
}
