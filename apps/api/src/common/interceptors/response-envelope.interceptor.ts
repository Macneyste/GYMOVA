import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { ApiSuccess } from '@gymova/shared-types';

/** Wraps controller return values in { success: true, data }. Streams/undefined (204) pass through. */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccess<unknown> | undefined> {
    const res = context.switchToHttp().getResponse<{ statusCode: number }>();
    return next.handle().pipe(
      map((data: unknown) => {
        if (res.statusCode === 204 || data === undefined) return undefined;
        if (data && typeof data === 'object' && 'success' in (data as object) && 'data' in (data as object)) {
          return data as ApiSuccess<unknown>;
        }
        return { success: true, data };
      }),
    );
  }
}
