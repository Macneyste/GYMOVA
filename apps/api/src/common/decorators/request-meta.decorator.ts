import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestMeta } from '../auth/request-user';

/** Client IP and user agent, used for session records and the audit log. */
export const ReqMeta = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestMeta => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const ua = req.headers['user-agent'];
  return {
    ipAddress: req.ip ?? null,
    userAgent: typeof ua === 'string' ? ua.slice(0, 255) : null,
  };
});
