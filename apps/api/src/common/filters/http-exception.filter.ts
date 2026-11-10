import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { ApiErrorBody, ApiErrorCode } from '@gymova/shared-types';
import { AppException } from '../errors/app.errors';

/**
 * Converts every error into the standard envelope: { success:false, error:{ code, message, details, requestId } }.
 * Unknown errors are logged with a request id and never leak internals to clients.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();
    const requestId = request.id ?? (request.headers['x-request-id'] as string | undefined);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiErrorBody['error'] = { code: ApiErrorCode.INTERNAL, message: 'Something went wrong', requestId };

    if (exception instanceof AppException) {
      status = exception.getStatus();
      body = { code: exception.code, message: exception.message, details: exception.details, requestId };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : Array.isArray((res as { message?: unknown }).message)
            ? ((res as { message: string[] }).message[0] ?? exception.message)
            : ((res as { message?: string }).message ?? exception.message);
      body = { code: statusToCode(status), message, requestId };
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        body = { code: ApiErrorCode.CONFLICT, message: 'A record with these values already exists', details: exception.meta, requestId };
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        body = { code: ApiErrorCode.NOT_FOUND, message: 'The requested record was not found', requestId };
      } else {
        this.logger.error(`Prisma error ${exception.code} on ${request.method} ${request.url}`, exception.stack);
      }
    } else {
      const err = exception as Error;
      this.logger.error(`Unhandled error on ${request.method} ${request.url}: ${err?.message}`, err?.stack);
    }

    response.status(status).json({ success: false, error: body } satisfies ApiErrorBody);
  }
}

function statusToCode(status: number): string {
  switch (status) {
    case 400:
      return ApiErrorCode.VALIDATION;
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 409:
      return ApiErrorCode.CONFLICT;
    case 429:
      return ApiErrorCode.RATE_LIMITED;
    default:
      return ApiErrorCode.INTERNAL;
  }
}
