import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@gymova/shared-types';

/**
 * Application error carrying a stable machine-readable code.
 * Thrown from services; the HttpExceptionFilter serialises it into the API envelope.
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
    public readonly details?: unknown,
  ) {
    super({ code, message, details }, status);
  }
}

export class ValidationException extends AppException {
  constructor(details: unknown) {
    super(ApiErrorCode.VALIDATION, 'Validation failed', HttpStatus.BAD_REQUEST, details);
  }
}

export class NotFoundError extends AppException {
  constructor(entity: string, id?: string) {
    super(ApiErrorCode.NOT_FOUND, id ? `${entity} ${id} was not found` : `${entity} was not found`, HttpStatus.NOT_FOUND);
  }
}

export class ConflictError extends AppException {
  constructor(message: string, details?: unknown) {
    super(ApiErrorCode.CONFLICT, message, HttpStatus.CONFLICT, details);
  }
}

export class UnauthorizedError extends AppException {
  constructor(message = 'Authentication required', code: string = ApiErrorCode.UNAUTHORIZED) {
    super(code, message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppException {
  constructor(message = 'You do not have permission to perform this action') {
    super(ApiErrorCode.FORBIDDEN, message, HttpStatus.FORBIDDEN);
  }
}

export class RateLimitedError extends AppException {
  constructor(message = 'Too many requests, please slow down') {
    super(ApiErrorCode.RATE_LIMITED, message, HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class BusinessRuleError extends AppException {
  constructor(code: string, message: string, details?: unknown) {
    super(code, message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}
