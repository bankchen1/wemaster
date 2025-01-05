import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { LoggerService } from '../logger/logger.service'
import { CacheService } from '../cache/cache.service'

@Injectable()
export class MonitoringService implements OnModuleInit {
  private meterProvider: MeterProvider
  private exporter: PrometheusExporter
  private meters: Map<string, any> = new Map()

  // 预定义的指标
  private readonly METRICS = {
    SCHEDULE: {
      SLOTS_CREATED: 'schedule_slots_created',
      SLOTS_BOOKED: 'schedule_slots_booked',
      SLOTS_CANCELLED: 'schedule_slots_cancelled',
      BOOKING_DURATION: 'schedule_booking_duration',
      CONFLICT_COUNT: 'schedule_conflict_count'
    },
    API: {
      REQUEST_DURATION: 'api_request_duration',
      REQUEST_COUNT: 'api_request_count',
      ERROR_COUNT: 'api_error_count',
      ACTIVE_USERS: 'api_active_users'
    },
    CACHE: {
      HIT_COUNT: 'cache_hit_count',
      MISS_COUNT: 'cache_miss_count',
      ERROR_COUNT: 'cache_error_count'
    },
    SYSTEM: {
      CPU_USAGE: 'system_cpu_usage',
      MEMORY_USAGE: 'system_memory_usage',
      ACTIVE_CONNECTIONS: 'system_active_connections'
    }
  }

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
    private cacheService: CacheService
  ) {
    // 初始化 Prometheus 导出器
    this.exporter = new PrometheusExporter({
      port: this.configService.get('PROMETHEUS_PORT', 9464),
      endpoint: this.configService.get('PROMETHEUS_ENDPOINT', '/metrics')
    })

    // 初始化 MeterProvider
    this.meterProvider = new MeterProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'wemaster-api'
      })
    })

    // 设置导出器
    this.meterProvider.addMetricReader(this.exporter)
  }

  async onModuleInit() {
    try {
      // 初始化所有指标
      await this.initializeMetrics()
      
      // 启动系统指标收集
      this.startSystemMetricsCollection()
      
      this.loggerService.log(
        'monitoring',
        'Monitoring service initialized successfully'
      )
    } catch (error) {
      this.loggerService.error(
        'monitoring',
        'Failed to initialize monitoring service',
        error.stack
      )
    }
  }

  private async initializeMetrics() {
    const meter = this.meterProvider.getMeter('default')

    // 预约系统指标
    this.meters.set(
      this.METRICS.SCHEDULE.SLOTS_CREATED,
      meter.createCounter(this.METRICS.SCHEDULE.SLOTS_CREATED, {
        description: 'Number of time slots created'
      })
    )

    this.meters.set(
      this.METRICS.SCHEDULE.SLOTS_BOOKED,
      meter.createCounter(this.METRICS.SCHEDULE.SLOTS_BOOKED, {
        description: 'Number of time slots booked'
      })
    )

    this.meters.set(
      this.METRICS.SCHEDULE.SLOTS_CANCELLED,
      meter.createCounter(this.METRICS.SCHEDULE.SLOTS_CANCELLED, {
        description: 'Number of time slots cancelled'
      })
    )

    this.meters.set(
      this.METRICS.SCHEDULE.BOOKING_DURATION,
      meter.createHistogram(this.METRICS.SCHEDULE.BOOKING_DURATION, {
        description: 'Duration of booking operations'
      })
    )

    this.meters.set(
      this.METRICS.SCHEDULE.CONFLICT_COUNT,
      meter.createCounter(this.METRICS.SCHEDULE.CONFLICT_COUNT, {
        description: 'Number of booking conflicts detected'
      })
    )

    // API 指标
    this.meters.set(
      this.METRICS.API.REQUEST_DURATION,
      meter.createHistogram(this.METRICS.API.REQUEST_DURATION, {
        description: 'Duration of API requests'
      })
    )

    this.meters.set(
      this.METRICS.API.REQUEST_COUNT,
      meter.createCounter(this.METRICS.API.REQUEST_COUNT, {
        description: 'Number of API requests'
      })
    )

    this.meters.set(
      this.METRICS.API.ERROR_COUNT,
      meter.createCounter(this.METRICS.API.ERROR_COUNT, {
        description: 'Number of API errors'
      })
    )

    this.meters.set(
      this.METRICS.API.ACTIVE_USERS,
      meter.createUpDownCounter(this.METRICS.API.ACTIVE_USERS, {
        description: 'Number of active users'
      })
    )

    // 缓存指标
    this.meters.set(
      this.METRICS.CACHE.HIT_COUNT,
      meter.createCounter(this.METRICS.CACHE.HIT_COUNT, {
        description: 'Number of cache hits'
      })
    )

    this.meters.set(
      this.METRICS.CACHE.MISS_COUNT,
      meter.createCounter(this.METRICS.CACHE.MISS_COUNT, {
        description: 'Number of cache misses'
      })
    )

    this.meters.set(
      this.METRICS.CACHE.ERROR_COUNT,
      meter.createCounter(this.METRICS.CACHE.ERROR_COUNT, {
        description: 'Number of cache errors'
      })
    )

    // 系统指标
    this.meters.set(
      this.METRICS.SYSTEM.CPU_USAGE,
      meter.createObservableGauge(this.METRICS.SYSTEM.CPU_USAGE, {
        description: 'CPU usage percentage'
      })
    )

    this.meters.set(
      this.METRICS.SYSTEM.MEMORY_USAGE,
      meter.createObservableGauge(this.METRICS.SYSTEM.MEMORY_USAGE, {
        description: 'Memory usage in bytes'
      })
    )

    this.meters.set(
      this.METRICS.SYSTEM.ACTIVE_CONNECTIONS,
      meter.createObservableGauge(this.METRICS.SYSTEM.ACTIVE_CONNECTIONS, {
        description: 'Number of active connections'
      })
    )
  }

  private startSystemMetricsCollection() {
    setInterval(async () => {
      try {
        // 收集系统指标
        const metrics = await this.collectSystemMetrics()
        
        // 更新指标
        this.meters.get(this.METRICS.SYSTEM.CPU_USAGE).update(metrics.cpuUsage)
        this.meters
          .get(this.METRICS.SYSTEM.MEMORY_USAGE)
          .update(metrics.memoryUsage)
        this.meters
          .get(this.METRICS.SYSTEM.ACTIVE_CONNECTIONS)
          .update(metrics.activeConnections)

        // 缓存指标
        await this.cacheService.set('system_metrics', metrics, 60)
      } catch (error) {
        this.loggerService.error(
          'monitoring',
          'Error collecting system metrics',
          error.stack
        )
      }
    }, 15000) // 每15秒收集一次
  }

  private async collectSystemMetrics() {
    // 这里实现实际的系统指标收集逻辑
    // 可以使用 node-os-utils 或其他库来收集系统指标
    return {
      cpuUsage: process.cpuUsage().user / 1000000,
      memoryUsage: process.memoryUsage().heapUsed,
      activeConnections: 0 // 需要实现实际的连接计数
    }
  }

  // 公共方法用于记录指标
  recordScheduleMetric(metric: string, value: number = 1, labels: Record<string, string> = {}) {
    try {
      const meter = this.meters.get(metric)
      if (meter) {
        meter.add(value, labels)
      }
    } catch (error) {
      this.loggerService.error(
        'monitoring',
        `Error recording schedule metric ${metric}`,
        error.stack
      )
    }
  }

  recordApiMetric(metric: string, value: number = 1, labels: Record<string, string> = {}) {
    try {
      const meter = this.meters.get(metric)
      if (meter) {
        meter.add(value, labels)
      }
    } catch (error) {
      this.loggerService.error(
        'monitoring',
        `Error recording API metric ${metric}`,
        error.stack
      )
    }
  }

  recordCacheMetric(metric: string, value: number = 1, labels: Record<string, string> = {}) {
    try {
      const meter = this.meters.get(metric)
      if (meter) {
        meter.add(value, labels)
      }
    } catch (error) {
      this.loggerService.error(
        'monitoring',
        `Error recording cache metric ${metric}`,
        error.stack
      )
    }
  }

  // 获取指标快照
  async getMetricsSnapshot(): Promise<any> {
    try {
      const snapshot: any = {}
      for (const [name, meter] of this.meters.entries()) {
        snapshot[name] = await meter.getValue()
      }
      return snapshot
    } catch (error) {
      this.loggerService.error(
        'monitoring',
        'Error getting metrics snapshot',
        error.stack
      )
      return {}
    }
  }
}
