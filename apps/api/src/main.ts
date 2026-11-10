import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { configureApp } from './common/bootstrap/configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  const config = app.get(AppConfigService);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  // JSON API: no HTML is served (except dev Swagger), so the CSP can forbid everything.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: config.swaggerEnabled
        ? undefined
        : { useDefaults: false, directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"], baseUri: ["'none'"], formAction: ["'none'"] } },
      referrerPolicy: { policy: 'no-referrer' },
      hsts: { maxAge: 31_536_000, includeSubDomains: true },
    }),
  );
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));
  app.set('trust proxy', 1);
  app.enableCors({
    origin: (origin, callback) => {
      // Native mobile clients send no Origin header; browsers must match the allow-list.
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'Idempotency-Key', 'X-Client-Version'],
  });

  configureApp(app);

  if (config.swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('GYMOVA API')
        .setDescription('AI-powered personal fitness & gym management platform. Train. Eat. Track. Transform.')
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: true } });
  }

  app.enableShutdownHooks();
  await app.listen(config.port, '0.0.0.0');
  logger.log(`GYMOVA API listening on http://localhost:${config.port}/api/v1 (${config.nodeEnv})`);
}

void bootstrap();
