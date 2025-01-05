import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<{
  requestId: string;
  userId?: string;
  [key: string]: any;
}>();

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuidv4();
    const store = {
      requestId,
      userId: req.user?.id,
      startTime: Date.now(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    // 在异步上下文中运行请求
    requestContext.run(store, () => {
      next();
    });
  }
}
