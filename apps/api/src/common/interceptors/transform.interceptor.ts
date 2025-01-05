import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from '../../modules/logger/logger.service';

export interface Response<T> {
  data: T;
  meta?: {
    [key: string]: any;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      map(data => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;

        // 记录请求日志
        this.logger.logPerformance(
          'HTTP',
          request.method + ' ' + request.url,
          duration,
          {
            statusCode: response.statusCode,
            userId: request.user?.id,
          },
        );

        // 如果返回值已经是标准格式，直接返回
        if (data && data.data !== undefined) {
          return data;
        }

        // 包装响应数据
        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            duration,
            path: request.url,
            method: request.method,
          },
        };
      }),
    );
  }
}
