import { z } from 'zod';
import {
  ActivityLevel,
  ExperienceLevel,
  GoalType,
  MealType,
  Sex,
  WorkoutTimePreference,
} from '@gymova/shared-types';

const enumValues = <T extends Record<string, string>>(e: T) =>
  Object.values(e) as [T[keyof T], ...T[keyof T][]];

// ---------- Auth ----------
export const passwordSchema = z
  .string()
  .min(10, 'password.min')
  .max(128, 'password.max')
  .regex(/[A-Za-z]/, 'password.letter')
  .regex(/[0-9]/, 'password.number');

export const emailSchema = z.string().trim().toLowerCase().email('email.invalid');

/** E.164-ish phone number, e.g. +252611234567 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, 'phone.invalid');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'name.min').max(80, 'name.max'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  password: passwordSchema,
  preferredLanguage: z.enum(['en', 'so']).default('en'),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'terms.required' }) }),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'password.required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'otp.invalid'),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    code: z.string().regex(/^\d{6}$/, 'otp.invalid'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'password.mismatch' });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'password.required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'password.mismatch',
  });

// ---------- Assessment ----------
export const assessmentPersonalSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date.invalid')
    .refine((v) => {
      const age = (Date.now() - new Date(v).getTime()) / 31557600000;
      return age >= 13 && age <= 100;
    }, 'age.range'),
  sex: z.enum(enumValues(Sex)),
  country: z.string().trim().min(2).max(60).optional(),
  preferredLanguage: z.enum(['en', 'so']),
});

export const assessmentBodySchema = z.object({
  heightCm: z.coerce.number().min(100, 'height.range').max(250, 'height.range'),
  weightKg: z.coerce.number().min(25, 'weight.range').max(400, 'weight.range'),
  targetWeightKg: z.coerce.number().min(25).max(400).optional(),
  waistCm: z.coerce.number().min(30).max(250).optional(),
  chestCm: z.coerce.number().min(30).max(250).optional(),
  armCm: z.coerce.number().min(10).max(100).optional(),
  hipCm: z.coerce.number().min(30).max(250).optional(),
  thighCm: z.coerce.number().min(20).max(150).optional(),
});

export const assessmentFitnessSchema = z.object({
  experience: z.enum(enumValues(ExperienceLevel)),
  activityLevel: z.enum(enumValues(ActivityLevel)),
  primaryGoal: z.enum(enumValues(GoalType)),
  workoutPreferences: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),
  workoutDays: z.array(z.number().int().min(0).max(6)).min(1, 'days.min').max(7),
  preferredTime: z.enum(enumValues(WorkoutTimePreference)).default('FLEXIBLE'),
  sessionMinutes: z.coerce.number().int().min(15).max(180).default(45),
});

export const assessmentHealthSchema = z.object({
  injuries: z.array(z.string().max(80)).default([]),
  limitations: z.array(z.string().max(80)).default([]),
  medicalConditions: z.array(z.string().max(80)).default([]),
  allergies: z.array(z.string().max(80)).default([]),
  dietaryRestrictions: z.array(z.string().max(80)).default([]),
  healthConsent: z.boolean(),
});

export const assessmentSchema = assessmentPersonalSchema
  .merge(assessmentBodySchema)
  .merge(assessmentFitnessSchema)
  .merge(assessmentHealthSchema);
export type AssessmentInput = z.infer<typeof assessmentSchema>;

// ---------- Nutrition ----------
export const foodLogItemSchema = z.object({
  foodId: z.string().uuid(),
  servingUnitId: z.string().uuid().optional(),
  quantity: z.coerce.number().positive().max(50),
  grams: z.coerce.number().positive().max(5000).optional(),
});

export const foodLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(enumValues(MealType)),
  items: z.array(foodLogItemSchema).min(1),
});
export type FoodLogInput = z.infer<typeof foodLogSchema>;

export const waterLogSchema = z.object({
  amountMl: z.coerce.number().int().min(10).max(3000),
});

// ---------- Progress ----------
export const weightLogSchema = z.object({
  weightKg: z.coerce.number().min(25).max(400),
  loggedAt: z.string().datetime().optional(),
  note: z.string().max(200).optional(),
});

export const measurementSchema = z
  .object({
    measuredAt: z.string().datetime().optional(),
    waistCm: z.coerce.number().min(30).max(250).optional(),
    chestCm: z.coerce.number().min(30).max(250).optional(),
    armCm: z.coerce.number().min(10).max(100).optional(),
    hipCm: z.coerce.number().min(30).max(250).optional(),
    thighCm: z.coerce.number().min(20).max(150).optional(),
    bodyFatPct: z.coerce.number().min(2).max(70).optional(),
  })
  .refine((v) => Object.entries(v).some(([k, val]) => k !== 'measuredAt' && val !== undefined), {
    message: 'measurement.empty',
  });

export const sleepLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.coerce.number().min(0).max(20),
  quality: z.coerce.number().int().min(1).max(5).optional(),
});

export const recoveryLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  energy: z.coerce.number().int().min(1).max(5),
  fatigue: z.coerce.number().int().min(1).max(5),
  soreness: z.coerce.number().int().min(1).max(5).optional(),
  note: z.string().max(300).optional(),
});

// ---------- Workouts ----------
export const workoutSetSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.coerce.number().int().min(0).max(500).nullable().optional(),
  weightKg: z.coerce.number().min(0).max(1000).nullable().optional(),
  durationSeconds: z.coerce.number().int().min(0).max(7200).nullable().optional(),
  completed: z.boolean().default(false),
});

// ---------- Gym / admin ----------
export const membershipPlanSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().max(500).optional(),
  durationDays: z.coerce.number().int().min(1).max(3650),
  price: z.coerce.number().min(0).max(1_000_000),
  currency: z.string().length(3).default('USD'),
  features: z.array(z.string().max(80)).default([]),
});

export const gymSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().max(1000).optional(),
  phone: phoneSchema.optional().or(z.literal('')),
  email: emailSchema.optional().or(z.literal('')),
});

export const branchSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(80),
  phone: phoneSchema.optional().or(z.literal('')),
});

export const bookingSchema = z.object({
  trainerId: z.string().uuid(),
  startsAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(30).max(180).default(60),
  notes: z.string().max(300).optional(),
});

export const aiChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  coachType: z.enum(['DIET', 'WORKOUT', 'PERSONAL']),
  message: z.string().trim().min(1, 'message.required').max(2000, 'message.max'),
});

export { z };
