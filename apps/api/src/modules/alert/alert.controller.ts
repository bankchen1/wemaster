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
import { AlertService, AlertRule, AlertSeverity } from './alert.service'
import { Alert } from './alert.entity'

class GetAlertsDto {
  @Query('severity')
  severity?: AlertSeverity

  @Query('startDate')
  startDate?: Date

  @Query('endDate')
  endDate?: Date

  @Query('limit')
  limit?: number

  @Query('offset')
  offset?: number
}

class CreateAlertRuleDto implements Omit<AlertRule, 'id'> {
  name: string
  description: string
  metric: string
  condition: {
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
    value: number
  }
  severity: AlertSeverity
  enabled: boolean
  cooldown: number
  notificationChannels: string[]
}

class UpdateAlertRuleDto implements Partial<AlertRule> {
  name?: string
  description?: string
  metric?: string
  condition?: {
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
    value: number
  }
  severity?: AlertSeverity
  enabled?: boolean
  cooldown?: number
  notificationChannels?: string[]
}

@Controller('alerts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  @Roles('admin', 'monitor')
  async getAlerts(
    @Query(ValidationPipe) query: GetAlertsDto
  ): Promise<{ alerts: Alert[]; total: number }> {
    return this.alertService.getAlerts(query)
  }

  @Post(':id/acknowledge')
  @Roles('admin', 'monitor')
  async acknowledgeAlert(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ): Promise<Alert> {
    return this.alertService.acknowledgeAlert(id, user.id)
  }

  @Get('rules')
  @Roles('admin', 'monitor')
  async getAlertRules(): Promise<AlertRule[]> {
    return Array.from(
      (await this.alertService['rules']).values()
    )
  }

  @Get('rules/:id')
  @Roles('admin', 'monitor')
  async getAlertRule(
    @Param('id') id: string
  ): Promise<AlertRule> {
    const rule = await this.alertService.getAlertRule(id)
    if (!rule) {
      throw new Error('Alert rule not found')
    }
    return rule
  }

  @Post('rules')
  @Roles('admin')
  async createAlertRule(
    @Body(ValidationPipe) createDto: CreateAlertRuleDto
  ): Promise<AlertRule> {
    return this.alertService.createAlertRule(createDto)
  }

  @Put('rules/:id')
  @Roles('admin')
  async updateAlertRule(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateAlertRuleDto
  ): Promise<AlertRule> {
    return this.alertService.updateAlertRule(id, updateDto)
  }

  @Delete('rules/:id')
  @Roles('admin')
  async deleteAlertRule(@Param('id') id: string): Promise<void> {
    return this.alertService.deleteAlertRule(id)
  }
}
