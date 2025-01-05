import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
  Res
} from '@nestjs/common'
import { Response } from 'express'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { BatchOperationService } from './batch-operation.service'
import { UserRole } from '../user/user-role.enum'

class SendRemindersDto {
  type: 'upcoming-class' | 'review-request' | 'inactive-user'
  userIds?: string[]
  data?: any
}

class ExportDataDto {
  type: 'reviews' | 'bookings' | 'users'
  filters: any
  format: 'csv' | 'excel'
}

class ImportDataDto {
  type: 'reviews' | 'bookings' | 'users'
  data: any[]
}

class MarketingEmailDto {
  template: string
  userIds: string[]
  data: any
}

class GenerateReportsDto {
  type: 'tutor' | 'student' | 'platform'
  period: 'daily' | 'weekly' | 'monthly'
  ids: string[]
}

class UpdateUserStatusesDto {
  userIds: string[]
  status: string
  reason?: string
}

@Controller('batch')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BatchOperationController {
  constructor(
    private readonly batchService: BatchOperationService
  ) {}

  @Post('reminders')
  @Roles(UserRole.ADMIN)
  async sendBatchReminders(
    @Body(ValidationPipe) dto: SendRemindersDto
  ) {
    return this.batchService.sendBatchReminders(dto)
  }

  @Post('ratings')
  @Roles(UserRole.ADMIN)
  async updateBatchRatings(@Body('tutorIds') tutorIds: string[]) {
    return this.batchService.updateBatchRatings(tutorIds)
  }

  @Post('bookings/expired')
  @Roles(UserRole.ADMIN)
  async processExpiredBookings() {
    return this.batchService.processExpiredBookings()
  }

  @Post('cache/cleanup')
  @Roles(UserRole.ADMIN)
  async cleanupCache(@Body('patterns') patterns: string[]) {
    return this.batchService.cleanupCache(patterns)
  }

  @Post('export')
  @Roles(UserRole.ADMIN)
  async exportData(
    @Body(ValidationPipe) dto: ExportDataDto,
    @Res() res: Response
  ) {
    const result = await this.batchService.exportBatchData(dto)

    if (dto.format === 'csv') {
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=${dto.type}.csv`
      })
    } else {
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=${dto.type}.xlsx`
      })
    }

    res.send(result)
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  async importData(@Body(ValidationPipe) dto: ImportDataDto) {
    return this.batchService.importBatchData(dto)
  }

  @Post('marketing/emails')
  @Roles(UserRole.ADMIN)
  async sendMarketingEmails(
    @Body(ValidationPipe) dto: MarketingEmailDto
  ) {
    return this.batchService.sendMarketingEmails(dto)
  }

  @Post('reports')
  @Roles(UserRole.ADMIN)
  async generateBatchReports(
    @Body(ValidationPipe) dto: GenerateReportsDto
  ) {
    return this.batchService.generateBatchReports(dto)
  }

  @Post('users/status')
  @Roles(UserRole.ADMIN)
  async updateUserStatuses(
    @Body(ValidationPipe) dto: UpdateUserStatusesDto
  ) {
    return this.batchService.updateUserStatuses(dto)
  }

  @Post('sync')
  @Roles(UserRole.ADMIN)
  async syncData(
    @Body('type') type: string,
    @Body('source') source: string,
    @Body('target') target: string,
    @Body('ids') ids: string[]
  ) {
    return this.batchService.syncBatchData({
      type,
      source,
      target,
      ids
    })
  }

  @Post('cleanup')
  @Roles(UserRole.ADMIN)
  async cleanupData(
    @Body('type') type: string,
    @Body('before') before: Date,
    @Body('condition') condition?: any
  ) {
    return this.batchService.cleanupBatchData({
      type,
      before,
      condition
    })
  }
}
