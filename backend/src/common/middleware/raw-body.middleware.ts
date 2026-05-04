import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const webhookPath = '/api/payments/crypto/webhook';
    if (req.originalUrl?.startsWith(webhookPath)) {
      if (req.body && Object.keys(req.body).length > 0) {
        (req as any).rawBody = JSON.stringify(req.body);
      }
    }
    next();
  }
}
