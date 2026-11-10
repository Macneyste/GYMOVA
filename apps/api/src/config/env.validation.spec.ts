import { envValidationSchema } from './env.validation';

const base = {
  DATABASE_URL: 'postgresql://gymova_app:x@db.internal:5432/gymova?schema=public',
  JWT_ACCESS_SECRET: 'a'.repeat(48),
  JWT_REFRESH_SECRET: 'b'.repeat(48),
  QR_TOKEN_SECRET: 'c'.repeat(32),
};
const validate = (env: Record<string, string>) => envValidationSchema.validate(env, { abortEarly: false });

describe('env validation', () => {
  it('accepts a development config without TLS', () => {
    expect(validate({ ...base, NODE_ENV: 'development' }).error).toBeUndefined();
  });

  it('refuses a production database connection without TLS', () => {
    const { error } = validate({ ...base, NODE_ENV: 'production', CORS_ORIGINS: 'https://admin.gymova.app' });
    expect(error?.message).toMatch(/TLS/);
  });

  it('refuses plain-http CORS origins in production', () => {
    const { error } = validate({
      ...base,
      NODE_ENV: 'production',
      DATABASE_URL: `${base.DATABASE_URL}&sslmode=require`,
      CORS_ORIGINS: 'https://admin.gymova.app,http://evil.example',
    });
    expect(error?.message).toMatch(/https/);
  });

  it('accepts a hardened production config', () => {
    const { error } = validate({
      ...base,
      NODE_ENV: 'production',
      DATABASE_URL: `${base.DATABASE_URL}&sslmode=verify-full`,
      CORS_ORIGINS: 'https://admin.gymova.app, https://staff.gymova.app',
    });
    expect(error).toBeUndefined();
  });

  it('requires the server-side AI key when the real provider is enabled', () => {
    expect(validate({ ...base, AI_PROVIDER: 'anthropic' }).error?.message).toMatch(/ANTHROPIC_API_KEY/);
  });
});
