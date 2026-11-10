import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Typed access to validated environment configuration. Inject this instead of reading process.env. */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  private get<T = string>(key: string): T {
    return this.config.get<T>(key) as T;
  }

  get nodeEnv(): string {
    return this.get('NODE_ENV');
  }
  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
  get port(): number {
    return Number(this.get('PORT'));
  }
  get publicUrl(): string {
    return this.get('API_PUBLIC_URL');
  }
  get corsOrigins(): string[] {
    return String(this.get('CORS_ORIGINS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  get logLevel(): string {
    return this.get('LOG_LEVEL');
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  /** Swagger is a development aid: it is never served in production, even if the flag is set. */
  get swaggerEnabled(): boolean {
    return !this.isProduction && (this.nodeEnv === 'development' || String(this.get('ENABLE_SWAGGER')) === 'true');
  }

  get jwt() {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      accessTtlSeconds: Number(this.get('JWT_ACCESS_TTL')),
      refreshTtlDays: Number(this.get('JWT_REFRESH_TTL_DAYS')),
    };
  }
  get qrTokenSecret(): string {
    return this.get('QR_TOKEN_SECRET');
  }
  get bootstrapSuperAdminEmails(): string[] {
    return String(this.get('BOOTSTRAP_SUPER_ADMIN_EMAILS') ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  get redisUrl(): string | null {
    const v = this.get<string>('REDIS_URL');
    return v ? v : null;
  }

  get storage() {
    return {
      driver: this.get<'local' | 's3'>('STORAGE_DRIVER'),
      localDir: this.get('STORAGE_LOCAL_DIR'),
      s3: {
        endpoint: this.get('S3_ENDPOINT') || undefined,
        region: this.get('S3_REGION'),
        bucket: this.get('S3_BUCKET'),
        accessKey: this.get('S3_ACCESS_KEY'),
        secretKey: this.get('S3_SECRET_KEY'),
        forcePathStyle: String(this.get('S3_FORCE_PATH_STYLE')) === 'true',
      },
    };
  }

  get messaging() {
    return {
      emailProvider: this.get('EMAIL_PROVIDER'),
      smsProvider: this.get('SMS_PROVIDER'),
      emailFrom: this.get('EMAIL_FROM'),
    };
  }

  get ai() {
    return {
      provider: this.get<'mock' | 'anthropic'>('AI_PROVIDER'),
      anthropicApiKey: this.get<string>('ANTHROPIC_API_KEY') || null,
      model: this.get('AI_MODEL'),
      visionModel: this.get('AI_VISION_MODEL'),
      dailyMessageLimit: Number(this.get('AI_DAILY_MESSAGE_LIMIT')),
      dailyScanLimit: Number(this.get('AI_DAILY_SCAN_LIMIT')),
    };
  }

  get expoAccessToken(): string | null {
    return this.get<string>('EXPO_ACCESS_TOKEN') || null;
  }
}
