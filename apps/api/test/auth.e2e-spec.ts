import { INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/common/bootstrap/configure-app';
import { PrismaService } from '../src/database/prisma.service';
import { MessagingService, type OtpMessage } from '../src/modules/messaging/messaging.service';
import { seedRolesAndPermissions } from '../prisma/seeds/roles';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const sent: OtpMessage[] = [];
  const email = `e2e-${Date.now()}@gymova.test`;
  const password = 'Strong-pass-123';
  const http = () => request(app.getHttpServer());
  const lastCode = (purpose: OtpMessage['purpose']) => [...sent].reverse().find((m) => m.purpose === purpose)!.code;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MessagingService)
      .useValue({ sendOtp: async (m: OtpMessage) => void sent.push(m) })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    await seedRolesAndPermissions(prisma);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { endsWith: '@gymova.test' } } });
    await app.close();
  });

  // Each test is its own scenario; reset the per-IP limiter so one test's logins don't throttle the next.
  beforeEach(() => {
    const st = (app.get(ThrottlerStorage) as unknown as { storage: Map<string, unknown> }).storage; console.log("THR", st.size, [...st.keys()].slice(0,2)); st.clear();
  });

  it('rate-limits repeated login attempts per client', async () => {
    const codes: number[] = [];
    for (let i = 0; i < 11; i++) {
      codes.push((await http().post('/api/v1/auth/login').send({ email: 'flood@gymova.test', password })).status);
    }
    expect(codes.slice(0, 10).every((c) => c === 401)).toBe(true);
    expect(codes[10]).toBe(429);
  });

  let accessToken = '';
  let refreshToken = '';

  it('rejects weak passwords with field-level i18n keys', async () => {
    const res = await http().post('/api/v1/auth/register').send({ fullName: 'Weak', email: 'weak@gymova.test', password: 'short' }).expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details[0].constraints).toContain('password.min');
  });

  it('registers a member and returns a session', async () => {
    const res = await http()
      .post('/api/v1/auth/register')
      .send({ fullName: 'Amina Yusuf', email: email.toUpperCase(), password, preferredLanguage: 'so' })
      .expect(201);
    const s = res.body.data;
    expect(s.user.email).toBe(email);
    expect(s.user.roles).toEqual(['MEMBER']);
    expect(s.user.permissions).toContain('profile:read:self');
    expect(s.user.emailVerifiedAt).toBeNull();
    expect(s.user).not.toHaveProperty('passwordHash');
    expect(sent.at(-1)).toMatchObject({ purpose: 'EMAIL_VERIFY', to: email, language: 'so' });
    accessToken = s.accessToken;
    refreshToken = s.refreshToken;
  });

  it('refuses a duplicate email', async () => {
    const res = await http().post('/api/v1/auth/register').send({ fullName: 'Dup', email, password }).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('protects /users/me', async () => {
    await http().get('/api/v1/users/me').expect(401);
    const res = await http().get('/api/v1/users/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body.data.fullName).toBe('Amina Yusuf');
  });

  it('verifies email with the code, rejecting a wrong one first', async () => {
    const auth = { Authorization: `Bearer ${accessToken}` };
    const wrong = lastCode('EMAIL_VERIFY') === '000000' ? '111111' : '000000';
    const bad = await http().post('/api/v1/auth/verify').set(auth).send({ purpose: 'EMAIL_VERIFY', code: wrong }).expect(400);
    expect(bad.body.error.code).toBe('OTP_INVALID');
    const ok = await http().post('/api/v1/auth/verify').set(auth).send({ purpose: 'EMAIL_VERIFY', code: lastCode('EMAIL_VERIFY') }).expect(200);
    expect(ok.body.data.emailVerifiedAt).not.toBeNull();
  });

  it('rotates refresh tokens and detects reuse', async () => {
    const first = await http().post('/api/v1/auth/refresh').send({ refreshToken }).expect(200);
    const rotated = first.body.data.refreshToken as string;
    expect(rotated).not.toBe(refreshToken);

    // Replaying the old token revokes the whole family, including the new one.
    const replay = await http().post('/api/v1/auth/refresh').send({ refreshToken }).expect(401);
    expect(replay.body.error.code).toBe('SESSION_EXPIRED');
    await http().post('/api/v1/auth/refresh').send({ refreshToken: rotated }).expect(401);
  });

  it('logs in, and logout revokes the session', async () => {
    const res = await http().post('/api/v1/auth/login').send({ email, password }).expect(200);
    const rt = res.body.data.refreshToken as string;
    await http().post('/api/v1/auth/logout').send({ refreshToken: rt }).expect(204);
    await http().post('/api/v1/auth/refresh').send({ refreshToken: rt }).expect(401);
  });

  it('gives the same error for unknown email and wrong password', async () => {
    const a = await http().post('/api/v1/auth/login').send({ email: 'nobody@gymova.test', password }).expect(401);
    const b = await http().post('/api/v1/auth/login').send({ email, password: 'Wrong-pass-123' }).expect(401);
    expect(a.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(b.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('resets the password with an emailed code and signs out other devices', async () => {
    const login = await http().post('/api/v1/auth/login').send({ email, password }).expect(200);
    const forgot = await http().post('/api/v1/auth/forgot-password').send({ email }).expect(200);
    expect(forgot.body.data).toEqual({ sent: true });
    // Unknown emails get the identical response.
    const ghost = await http().post('/api/v1/auth/forgot-password').send({ email: 'ghost@gymova.test' }).expect(200);
    expect(ghost.body.data).toEqual({ sent: true });

    const newPassword = 'Brand-new-pass-456';
    await http()
      .post('/api/v1/auth/reset-password')
      .send({ email, code: lastCode('PASSWORD_RESET'), password: newPassword })
      .expect(200);
    await http().post('/api/v1/auth/refresh').send({ refreshToken: login.body.data.refreshToken }).expect(401);
    await http().post('/api/v1/auth/login').send({ email, password }).expect(401);
    await http().post('/api/v1/auth/login').send({ email, password: newPassword }).expect(200);
  });

  it('updates profile fields via PATCH /users/me', async () => {
    const login = await http().post('/api/v1/auth/login').send({ email, password: 'Brand-new-pass-456' }).expect(200);
    const res = await http()
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ fullName: 'Amina Y.', themePreference: 'LIGHT', phone: '+252611234567' })
      .expect(200);
    expect(res.body.data).toMatchObject({ fullName: 'Amina Y.', themePreference: 'LIGHT', phone: '+252611234567', phoneVerifiedAt: null });
  });

  it('locks the account after repeated failures', async () => {
    const lockEmail = `lock-${Date.now()}@gymova.test`;
    await http().post('/api/v1/auth/register').send({ fullName: 'Lock Test', email: lockEmail, password }).expect(201);
    for (let i = 0; i < 5; i++) {
      await http().post('/api/v1/auth/login').send({ email: lockEmail, password: 'Wrong-pass-999' }).expect(401);
    }
    const locked = await http().post('/api/v1/auth/login').send({ email: lockEmail, password }).expect(429);
    expect(locked.body.error.code).toBe('ACCOUNT_LOCKED');
  });
});
