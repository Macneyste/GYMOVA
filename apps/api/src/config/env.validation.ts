import * as Joi from 'joi';

/**
 * Fail fast on misconfiguration. Secrets must be long; AI/storage providers must be known values.
 */
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  API_PUBLIC_URL: Joi.string().uri().default('http://localhost:3000'),
  CORS_ORIGINS: Joi.string().allow('').default('http://localhost:3001'),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info'),

  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().disallow(Joi.ref('JWT_ACCESS_SECRET')),
  JWT_ACCESS_TTL: Joi.number().integer().min(60).max(3600).default(900),
  JWT_REFRESH_TTL_DAYS: Joi.number().integer().min(1).max(90).default(30),
  QR_TOKEN_SECRET: Joi.string().min(16).required(),
  BOOTSTRAP_SUPER_ADMIN_EMAILS: Joi.string().allow('').default(''),

  REDIS_URL: Joi.string().allow('').default(''),

  STORAGE_DRIVER: Joi.string().valid('local', 's3').default('local'),
  STORAGE_LOCAL_DIR: Joi.string().default('./storage'),
  S3_ENDPOINT: Joi.string().allow('').default(''),
  S3_REGION: Joi.string().default('us-east-1'),
  S3_BUCKET: Joi.string().default('gymova'),
  S3_ACCESS_KEY: Joi.string().allow('').default(''),
  S3_SECRET_KEY: Joi.string().allow('').default(''),
  S3_FORCE_PATH_STYLE: Joi.boolean().default(true),

  EMAIL_PROVIDER: Joi.string().valid('console', 'smtp').default('console'),
  SMS_PROVIDER: Joi.string().valid('console').default('console'),
  EMAIL_FROM: Joi.string().default('no-reply@gymova.app'),

  AI_PROVIDER: Joi.string().valid('mock', 'anthropic').default('mock'),
  ANTHROPIC_API_KEY: Joi.string().allow('').default(''),
  AI_MODEL: Joi.string().default('claude-sonnet-5-5'),
  AI_VISION_MODEL: Joi.string().default('claude-sonnet-5-5'),
  AI_DAILY_MESSAGE_LIMIT: Joi.number().integer().min(1).default(40),
  AI_DAILY_SCAN_LIMIT: Joi.number().integer().min(1).default(20),

  EXPO_ACCESS_TOKEN: Joi.string().allow('').default(''),
}).unknown(true);
