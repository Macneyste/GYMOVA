/**
 * Domain enums. These mirror the Prisma enums in apps/api/prisma/schema.prisma.
 * Keep both in sync; the API test suite asserts parity.
 */
export const Sex = { MALE: 'MALE', FEMALE: 'FEMALE', UNSPECIFIED: 'UNSPECIFIED' } as const;
export type Sex = (typeof Sex)[keyof typeof Sex];

export const ActivityLevel = {
  SEDENTARY: 'SEDENTARY',
  LIGHT: 'LIGHT',
  MODERATE: 'MODERATE',
  ACTIVE: 'ACTIVE',
  VERY_ACTIVE: 'VERY_ACTIVE',
} as const;
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];

export const GoalType = {
  LOSE_WEIGHT: 'LOSE_WEIGHT',
  MAINTAIN: 'MAINTAIN',
  GAIN_MUSCLE: 'GAIN_MUSCLE',
  IMPROVE_ENDURANCE: 'IMPROVE_ENDURANCE',
  GENERAL_HEALTH: 'GENERAL_HEALTH',
} as const;
export type GoalType = (typeof GoalType)[keyof typeof GoalType];

export const GoalStatus = { ACTIVE: 'ACTIVE', ACHIEVED: 'ACHIEVED', ABANDONED: 'ABANDONED' } as const;
export type GoalStatus = (typeof GoalStatus)[keyof typeof GoalStatus];

export const ExperienceLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const;
export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const Difficulty = ExperienceLevel;
export type Difficulty = ExperienceLevel;

export const WorkoutTimePreference = {
  MORNING: 'MORNING',
  MIDDAY: 'MIDDAY',
  EVENING: 'EVENING',
  FLEXIBLE: 'FLEXIBLE',
} as const;
export type WorkoutTimePreference = (typeof WorkoutTimePreference)[keyof typeof WorkoutTimePreference];

export const MealType = {
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  DINNER: 'DINNER',
  SNACK: 'SNACK',
  PRE_WORKOUT: 'PRE_WORKOUT',
  POST_WORKOUT: 'POST_WORKOUT',
} as const;
export type MealType = (typeof MealType)[keyof typeof MealType];

export const WorkoutSessionStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const;
export type WorkoutSessionStatus = (typeof WorkoutSessionStatus)[keyof typeof WorkoutSessionStatus];

export const RoleName = {
  MEMBER: 'MEMBER',
  TRAINER: 'TRAINER',
  RECEPTIONIST: 'RECEPTIONIST',
  GYM_ADMIN: 'GYM_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const SubscriptionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  FROZEN: 'FROZEN',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethodType = {
  CASH: 'CASH',
  CARD: 'CARD',
  MOBILE_MONEY: 'MOBILE_MONEY',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;
export type PaymentMethodType = (typeof PaymentMethodType)[keyof typeof PaymentMethodType];

export const InvoiceStatus = { DRAFT: 'DRAFT', ISSUED: 'ISSUED', PAID: 'PAID', VOID: 'VOID' } as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const AttendanceMethod = { QR: 'QR', MANUAL: 'MANUAL' } as const;
export type AttendanceMethod = (typeof AttendanceMethod)[keyof typeof AttendanceMethod];

export const NotificationType = {
  WORKOUT_REMINDER: 'WORKOUT_REMINDER',
  MEAL_REMINDER: 'MEAL_REMINDER',
  HYDRATION_REMINDER: 'HYDRATION_REMINDER',
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  SUBSCRIPTION_EXPIRY: 'SUBSCRIPTION_EXPIRY',
  NEW_PLAN: 'NEW_PLAN',
  WEEKLY_PROGRESS: 'WEEKLY_PROGRESS',
  CHALLENGE: 'CHALLENGE',
  ACCOUNT: 'ACCOUNT',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationChannel = { PUSH: 'PUSH', IN_APP: 'IN_APP', EMAIL: 'EMAIL' } as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const ChallengePeriod = { DAILY: 'DAILY', WEEKLY: 'WEEKLY', MONTHLY: 'MONTHLY' } as const;
export type ChallengePeriod = (typeof ChallengePeriod)[keyof typeof ChallengePeriod];

export const ChallengeMetric = {
  WORKOUTS_COMPLETED: 'WORKOUTS_COMPLETED',
  WATER_ML: 'WATER_ML',
  MEALS_LOGGED: 'MEALS_LOGGED',
  STREAK_DAYS: 'STREAK_DAYS',
  SLEEP_HOURS: 'SLEEP_HOURS',
} as const;
export type ChallengeMetric = (typeof ChallengeMetric)[keyof typeof ChallengeMetric];

export const AICoachType = { DIET: 'DIET', WORKOUT: 'WORKOUT', PERSONAL: 'PERSONAL' } as const;
export type AICoachType = (typeof AICoachType)[keyof typeof AICoachType];

export const AIMessageRole = { USER: 'USER', ASSISTANT: 'ASSISTANT', SYSTEM: 'SYSTEM' } as const;
export type AIMessageRole = (typeof AIMessageRole)[keyof typeof AIMessageRole];

export const FoodScanStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  NEEDS_CONFIRMATION: 'NEEDS_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
} as const;
export type FoodScanStatus = (typeof FoodScanStatus)[keyof typeof FoodScanStatus];

export const FoodVerification = {
  VERIFIED: 'VERIFIED',
  PENDING: 'PENDING',
  USER_SUBMITTED: 'USER_SUBMITTED',
} as const;
export type FoodVerification = (typeof FoodVerification)[keyof typeof FoodVerification];

export const PlannerItemType = {
  WAKE_UP: 'WAKE_UP',
  BREAKFAST: 'BREAKFAST',
  LUNCH: 'LUNCH',
  SNACK: 'SNACK',
  PRE_WORKOUT: 'PRE_WORKOUT',
  WORKOUT: 'WORKOUT',
  POST_WORKOUT: 'POST_WORKOUT',
  DINNER: 'DINNER',
  WATER: 'WATER',
  SLEEP: 'SLEEP',
  CUSTOM: 'CUSTOM',
} as const;
export type PlannerItemType = (typeof PlannerItemType)[keyof typeof PlannerItemType];

export const PlannerItemStatus = { PENDING: 'PENDING', COMPLETED: 'COMPLETED', SKIPPED: 'SKIPPED' } as const;
export type PlannerItemStatus = (typeof PlannerItemStatus)[keyof typeof PlannerItemStatus];

export const VerificationPurpose = {
  EMAIL_VERIFY: 'EMAIL_VERIFY',
  PHONE_VERIFY: 'PHONE_VERIFY',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;
export type VerificationPurpose = (typeof VerificationPurpose)[keyof typeof VerificationPurpose];

export const GymStaffRole = {
  RECEPTIONIST: 'RECEPTIONIST',
  TRAINER: 'TRAINER',
  MANAGER: 'MANAGER',
  GYM_ADMIN: 'GYM_ADMIN',
} as const;
export type GymStaffRole = (typeof GymStaffRole)[keyof typeof GymStaffRole];

export const ThemePreference = { SYSTEM: 'SYSTEM', DARK: 'DARK', LIGHT: 'LIGHT' } as const;
export type ThemePreference = (typeof ThemePreference)[keyof typeof ThemePreference];

export const Language = { EN: 'en', SO: 'so' } as const;
export type Language = (typeof Language)[keyof typeof Language];

export const SupportedLanguages: readonly Language[] = ['en', 'so'];
