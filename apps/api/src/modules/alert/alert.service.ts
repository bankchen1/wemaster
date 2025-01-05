import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { LoggerService } from '../logger/logger.service'
import { MonitoringService } from '../monitoring/monitoring.service'
import { NotificationService } from '../notification/notification.service'
import { Alert } from './alert.entity'

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AlertRule {
  id: string
  name: string
  description: string
  metric: string
  condition: {
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq'
    value: number
  }
  severity: AlertSeverity
  enabled: boolean
  cooldown: number // 冷却时间（秒）
  notificationChannels: string[] // 通知渠道
}

@Injectable()
export class AlertService implements OnModuleInit {
  private readonly defaultRules: AlertRule[] = [
    {
      id: 'high-cpu-usage',
      name: 'High CPU Usage',
      description: 'CPU usage is above threshold',
      metric: 'system_cpu_usage',
      condition: {
        operator: 'gt',
        value: 80
      },
      severity: AlertSeverity.WARNING,
      enabled: true,
      cooldown: 300,
      notificationChannels: ['email', 'slack']
    },
    {
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      description: 'Memory usage is above threshold',
      metric: 'system_memory_usage',
      condition: {
        operator: 'gt',
        value: 1024 * 1024 * 1024 // 1GB
      },
      severity: AlertSeverity.WARNING,
      enabled: true,
      cooldown: 300,
      notificationChannels: ['email', 'slack']
    },
    {
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'API error rate is above threshold',
      metric: 'api_error_count',
      condition: {
        operator: 'gt',
        value: 100
      },
      severity: AlertSeverity.ERROR,
      enabled: true,
      cooldown: 300,
      notificationChannels: ['email', 'slack']
    },
    {
      id: 'low-cache-hit-rate',
      name: 'Low Cache Hit Rate',
      description: 'Cache hit rate is below threshold',
      metric: 'cache_hit_rate',
      condition: {
        operator: 'lt',
        value: 50
      },
      severity: AlertSeverity.WARNING,
      enabled: true,
      cooldown: 600,
      notificationChannels: ['email']
    }
  ]

  private rules: Map<string, AlertRule> = new Map()
  private lastAlertTime: Map<string, number> = new Map()

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private configService: ConfigService,
    private loggerService: LoggerService,
    private monitoringService: MonitoringService,
    private notificationService: NotificationService,
    private eventEmitter: EventEmitter2
  ) {
    // 初始化告警规则
    this.defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  async onModuleInit() {
    // 启动告警检查
    this.startAlertChecking()
  }

  private startAlertChecking() {
    const checkInterval = this.configService.get('ALERT_CHECK_INTERVAL', 60000) // 默认1分钟

    setInterval(async () => {
      try {
        await this.checkAlerts()
      } catch (error) {
        this.loggerService.error(
          'alert',
          'Error checking alerts',
          error.stack
        )
      }
    }, checkInterval)
  }

  private async checkAlerts() {
    const metrics = await this.monitoringService.getMetricsSnapshot()

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue

      const metricValue = metrics[rule.metric]
      if (metricValue === undefined) continue

      const shouldAlert = this.evaluateCondition(
        metricValue,
        rule.condition
      )

      if (shouldAlert && this.shouldSendAlert(rule)) {
        await this.createAlert(rule, metricValue)
      }
    }
  }

  private evaluateCondition(
    value: number,
    condition: AlertRule['condition']
  ): boolean {
    switch (condition.operator) {
      case 'gt':
        return value > condition.value
      case 'lt':
        return value < condition.value
      case 'gte':
        return value >= condition.value
      case 'lte':
        return value <= condition.value
      case 'eq':
        return value === condition.value
      default:
        return false
    }
  }

  private shouldSendAlert(rule: AlertRule): boolean {
    const lastAlert = this.lastAlertTime.get(rule.id)
    if (!lastAlert) return true

    const now = Date.now()
    return now - lastAlert > rule.cooldown * 1000
  }

  private async createAlert(rule: AlertRule, value: number) {
    try {
      // 创建告警记录
      const alert = this.alertRepository.create({
        ruleId: rule.id,
        ruleName: rule.name,
        description: rule.description,
        severity: rule.severity,
        metric: rule.metric,
        value,
        timestamp: new Date()
      })

      await this.alertRepository.save(alert)

      // 更新最后告警时间
      this.lastAlertTime.set(rule.id, Date.now())

      // 发送通知
      await this.sendAlertNotifications(rule, alert)

      // 触发事件
      this.eventEmitter.emit('alert.created', alert)

      this.loggerService.log(
        'alert',
        `Alert created: ${rule.name} (${value})`
      )
    } catch (error) {
      this.loggerService.error(
        'alert',
        `Error creating alert for rule ${rule.id}`,
        error.stack
      )
    }
  }

  private async sendAlertNotifications(rule: AlertRule, alert: Alert) {
    const promises = rule.notificationChannels.map(channel => {
      switch (channel) {
        case 'email':
          return this.notificationService.sendEmail({
            template: 'alert',
            data: {
              alert,
              rule
            }
          })
        case 'slack':
          return this.notificationService.sendSlackMessage({
            channel: 'alerts',
            text: this.formatAlertMessage(alert, rule)
          })
        default:
          return Promise.resolve()
      }
    })

    try {
      await Promise.all(promises)
    } catch (error) {
      this.loggerService.error(
        'alert',
        `Error sending alert notifications for rule ${rule.id}`,
        error.stack
      )
    }
  }

  private formatAlertMessage(alert: Alert, rule: AlertRule): string {
    return `🚨 *${alert.severity.toUpperCase()}* Alert: ${alert.ruleName}\n` +
      `• Description: ${alert.description}\n` +
      `• Metric: ${alert.metric}\n` +
      `• Value: ${alert.value}\n` +
      `• Threshold: ${rule.condition.operator} ${rule.condition.value}\n` +
      `• Time: ${alert.timestamp.toISOString()}`
  }

  // 公共API

  async getAlerts(params: {
    severity?: AlertSeverity
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }): Promise<{ alerts: Alert[]; total: number }> {
    const query = this.alertRepository.createQueryBuilder('alert')

    if (params.severity) {
      query.andWhere('alert.severity = :severity', {
        severity: params.severity
      })
    }

    if (params.startDate) {
      query.andWhere('alert.timestamp >= :startDate', {
        startDate: params.startDate
      })
    }

    if (params.endDate) {
      query.andWhere('alert.timestamp <= :endDate', {
        endDate: params.endDate
      })
    }

    query
      .orderBy('alert.timestamp', 'DESC')
      .skip(params.offset || 0)
      .take(params.limit || 10)

    const [alerts, total] = await query.getManyAndCount()
    return { alerts, total }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId }
    })

    if (!alert) {
      throw new Error('Alert not found')
    }

    alert.acknowledgedAt = new Date()
    alert.acknowledgedBy = userId

    return this.alertRepository.save(alert)
  }

  async getAlertRule(ruleId: string): Promise<AlertRule | undefined> {
    return this.rules.get(ruleId)
  }

  async updateAlertRule(
    ruleId: string,
    updates: Partial<AlertRule>
  ): Promise<AlertRule> {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      throw new Error('Alert rule not found')
    }

    const updatedRule = {
      ...rule,
      ...updates
    }

    this.rules.set(ruleId, updatedRule)
    return updatedRule
  }

  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const id = Math.random().toString(36).substr(2, 9)
    const newRule: AlertRule = {
      id,
      ...rule
    }

    this.rules.set(id, newRule)
    return newRule
  }

  async deleteAlertRule(ruleId: string): Promise<void> {
    const rule = this.rules.get(ruleId)
    if (!rule) {
      throw new Error('Alert rule not found')
    }

    this.rules.delete(ruleId)
  }
}
