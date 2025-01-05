import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as winston from 'winston'
import 'winston-daily-rotate-file'
import { ElasticsearchTransport } from 'winston-elasticsearch'

@Injectable()
export class LoggerService {
  private logger: winston.Logger

  constructor(private configService: ConfigService) {
    const environment = this.configService.get('NODE_ENV')
    
    // 定义日志格式
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )

    // 定义传输器
    const transports: winston.transport[] = [
      // 控制台输出
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),

      // 按日期轮转的文件日志
      new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ]

    // 生产环境添加Elasticsearch传输器
    if (environment === 'production') {
      transports.push(
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: this.configService.get('ELASTICSEARCH_NODE'),
            auth: {
              username: this.configService.get('ELASTICSEARCH_USERNAME'),
              password: this.configService.get('ELASTICSEARCH_PASSWORD')
            }
          },
          indexPrefix: 'wemaster-logs'
        })
      )
    }

    // 创建logger实例
    this.logger = winston.createLogger({
      level: environment === 'production' ? 'info' : 'debug',
      format: logFormat,
      transports
    })
  }

  log(context: string, message: any): void {
    this.logger.info(message, { context })
  }

  error(context: string, message: any): void {
    this.logger.error(message, { context })
  }

  warn(context: string, message: any): void {
    this.logger.warn(message, { context })
  }

  debug(context: string, message: any): void {
    this.logger.debug(message, { context })
  }

  // 性能监控
  logPerformance(
    context: string,
    operation: string,
    duration: number,
    metadata?: any
  ): void {
    this.logger.info(
      {
        type: 'performance',
        operation,
        duration,
        ...metadata
      },
      { context }
    )
  }

  // 用户行为跟踪
  logUserActivity(
    userId: string,
    action: string,
    metadata?: any
  ): void {
    this.logger.info(
      {
        type: 'user-activity',
        userId,
        action,
        ...metadata
      },
      { context: 'user-activity' }
    )
  }

  // 系统事件
  logSystemEvent(
    eventType: string,
    message: string,
    metadata?: any
  ): void {
    this.logger.info(
      {
        type: 'system-event',
        eventType,
        message,
        ...metadata
      },
      { context: 'system' }
    )
  }

  // 安全事件
  logSecurityEvent(
    eventType: string,
    message: string,
    metadata?: any
  ): void {
    this.logger.warn(
      {
        type: 'security',
        eventType,
        message,
        ...metadata
      },
      { context: 'security' }
    )
  }

  // API请求日志
  logApiRequest(
    method: string,
    path: string,
    duration: number,
    statusCode: number,
    metadata?: any
  ): void {
    this.logger.info(
      {
        type: 'api-request',
        method,
        path,
        duration,
        statusCode,
        ...metadata
      },
      { context: 'api' }
    )
  }

  // 错误跟踪
  logError(
    error: Error,
    context: string,
    metadata?: any
  ): void {
    this.logger.error(
      {
        type: 'error',
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...metadata
      },
      { context }
    )
  }
}
