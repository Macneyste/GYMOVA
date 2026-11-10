import { describe, expect, it } from 'vitest';
import { assessmentSchema, foodLogSchema, passwordSchema, registerSchema } from './index';

describe('shared validation', () => {
  it('rejects weak passwords and accepts strong ones', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false);
    expect(passwordSchema.safeParse('onlylettershere').success).toBe(false);
    expect(passwordSchema.safeParse('StrongPass123').success).toBe(true);
  });

  it('normalises email on register', () => {
    const parsed = registerSchema.parse({
      fullName: 'Ayaan Ali',
      email: '  Ayaan@Example.COM ',
      password: 'StrongPass123',
      acceptTerms: true,
    });
    expect(parsed.email).toBe('ayaan@example.com');
    expect(parsed.preferredLanguage).toBe('en');
  });

  it('enforces plausible body ranges and age', () => {
    const base = {
      birthDate: '1995-05-01',
      sex: 'FEMALE',
      preferredLanguage: 'so',
      heightCm: 165,
      weightKg: 62,
      experience: 'BEGINNER',
      activityLevel: 'LIGHT',
      primaryGoal: 'MAINTAIN',
      workoutDays: [1, 3, 5],
      healthConsent: true,
    };
    expect(assessmentSchema.safeParse(base).success).toBe(true);
    expect(assessmentSchema.safeParse({ ...base, heightCm: 20 }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...base, birthDate: '2020-01-01' }).success).toBe(false);
  });

  it('requires at least one food item in a log', () => {
    expect(foodLogSchema.safeParse({ date: '2026-01-01', mealType: 'LUNCH', items: [] }).success).toBe(false);
  });
});
