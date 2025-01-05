import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../modules/logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 获取状态码和错误消息
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception.message;

    // 记录错误日志
    this.logger.error('HttpException', {
      status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV !== 'production' && { stack: exception.stack }),
    });

    // 构建错误响应
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(message),
      ...(process.env.NODE_ENV !== 'production' && {
        stack: exception.stack,
        details: this.getErrorDetails(message),
      }),
    };

    // 发送响应
    response.status(status).json(errorResponse);
  }

  private getErrorMessage(message: any): string {
    if (typeof message === 'string') {
      return message;
    }
    if (typeof message === 'object') {
      return message.message || message.error || '发生未知错误';
    }
    return '发生未知错误';
  }

  private getErrorDetails(message: any): any {
    if (typeof message === 'object') {
      const { message: msg, error, ...rest } = message;
      return rest;
    }
    return null;
  }
}
