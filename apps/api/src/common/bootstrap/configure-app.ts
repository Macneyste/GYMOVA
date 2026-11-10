import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { ResponseEnvelopeInterceptor } from '../interceptors/response-envelope.interceptor';
import { ValidationException } from '../errors/app.errors';

/**
 * Shared between main.ts and the e2e test harness so both run the identical pipeline.
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) =>
        new ValidationException(
          errors.map((e) => ({
            field: e.property,
            constraints: Object.values(e.constraints ?? {}),
            children: e.children?.length ? e.children.map((c) => c.property) : undefined,
          })),
        ),
    }),
  );
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
}
