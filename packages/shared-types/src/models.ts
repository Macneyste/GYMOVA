import type {
  ActivityLevel,
  AICoachType,
  AIMessageRole,
  AttendanceMethod,
  BookingStatus,
  ChallengeMetric,
  ChallengePeriod,
  ExperienceLevel,
  FoodScanStatus,
  FoodVerification,
  GoalStatus,
  GoalType,
  InvoiceStatus,
  Language,
  MealType,
  NotificationType,
  PaymentMethodType,
  PaymentStatus,
  PlannerItemStatus,
  PlannerItemType,
  Sex,
  SubscriptionStatus,
  ThemePreference,
  WorkoutSessionStatus,
  WorkoutTimePreference,
} from './enums';
import type { Permission } from './permissions';

/** ISO-8601 string. All timestamps are UTC; clients convert to local time. */
export type ISODate = string;
export type UUID = string;

// ---------- Identity ----------
export interface AuthUser {
  id: UUID;
  email: string;
  phone: string | null;
  fullName: string;
  emailVerifiedAt: ISODate | null;
  phoneVerifiedAt: ISODate | null;
  preferredLanguage: Language;
  themePreference: ThemePreference;
  avatarUrl: string | null;
  roles: string[];
  permissions: Permission[];
  /** Gym tenant memberships for staff (gymId + role). Members have none here. */
  staffOf: { gymId: UUID; branchId: UUID | null; role: string }[];
  onboardingCompletedAt: ISODate | null;
  createdAt: ISODate;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** seconds */
  accessTokenExpiresIn: number;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}

// ---------- Profile & assessment ----------
export interface UserProfile {
  userId: UUID;
  birthDate: ISODate | null;
  sex: Sex;
  country: string | null;
  city: string | null;
  bio: string | null;
  timezone: string;
  avatarUrl: string | null;
}

export interface FitnessAssessment {
  id: UUID;
  userId: UUID;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number | null;
  waistCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  hipCm: number | null;
  thighCm: number | null;
  experience: ExperienceLevel;
  activityLevel: ActivityLevel;
  primaryGoal: GoalType;
  workoutPreferences: string[];
  equipment: string[];
  workoutDays: number[];
  preferredTime: WorkoutTimePreference;
  sessionMinutes: number;
  injuries: string[];
  limitations: string[];
  medicalConditions: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  healthConsentAt: ISODate | null;
  createdAt: ISODate;
}

export interface FitnessTargets {
  formulaVersion: string;
  bmi: number;
  bmiCategory: 'UNDERWEIGHT' | 'NORMAL' | 'OVERWEIGHT' | 'OBESE';
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
  weeklyWeightChangeKg: number;
  estimatedWeeksToGoal: number | null;
  isEstimate: true;
  warnings: string[];
}

export interface FitnessGoal {
  id: UUID;
  type: GoalType;
  targetValue: number | null;
  unit: string | null;
  targetDate: ISODate | null;
  status: GoalStatus;
  notes: string | null;
  createdAt: ISODate;
}

// ---------- Workouts ----------
export interface MuscleGroupRef {
  id: UUID;
  slug: string;
  name: string;
}
export interface EquipmentRef {
  id: UUID;
  slug: string;
  name: string;
}

export interface Exercise {
  id: UUID;
  slug: string;
  name: string;
  nameSo: string | null;
  description: string;
  instructions: string[];
  safetyNotes: string[];
  difficulty: ExperienceLevel;
  category: { id: UUID; slug: string; name: string };
  primaryMuscles: MuscleGroupRef[];
  secondaryMuscles: MuscleGroupRef[];
  equipment: EquipmentRef[];
  recommendedSets: number | null;
  recommendedReps: string | null;
  mediaImageUrl: string | null;
  mediaVideoUrl: string | null;
  alternatives: { id: UUID; name: string; slug: string }[];
}

export interface WorkoutPlanExercise {
  id: UUID;
  order: number;
  exercise: Pick<Exercise, 'id' | 'name' | 'slug' | 'difficulty' | 'mediaImageUrl'>;
  sets: number;
  reps: string;
  restSeconds: number;
  targetWeightKg: number | null;
  notes: string | null;
}

export interface WorkoutPlanDay {
  id: UUID;
  dayOfWeek: number;
  title: string;
  isRestDay: boolean;
  focus: string | null;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlan {
  id: UUID;
  name: string;
  description: string | null;
  goal: GoalType;
  difficulty: ExperienceLevel;
  weeks: number;
  isTemplate: boolean;
  isActive: boolean;
  source: 'GENERATED' | 'TRAINER' | 'TEMPLATE' | 'USER';
  days: WorkoutPlanDay[];
  createdAt: ISODate;
}

export interface WorkoutSet {
  id: UUID;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  completed: boolean;
}

export interface WorkoutSession {
  id: UUID;
  planDayId: UUID | null;
  name: string;
  status: WorkoutSessionStatus;
  startedAt: ISODate;
  completedAt: ISODate | null;
  durationSeconds: number | null;
  notes: string | null;
  exercises: {
    id: UUID;
    exercise: Pick<Exercise, 'id' | 'name' | 'slug'>;
    order: number;
    sets: WorkoutSet[];
  }[];
}

// ---------- Nutrition ----------
export interface ServingUnit {
  id: UUID;
  label: string;
  labelSo: string | null;
  grams: number;
  isDefault: boolean;
}

export interface FoodNutrition {
  /** per 100 g */
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number | null;
  sodiumMg: number | null;
}

export interface Food {
  id: UUID;
  slug: string;
  name: string;
  nameSo: string | null;
  category: string;
  cuisine: 'SOMALI' | 'INTERNATIONAL';
  description: string | null;
  nutrition: FoodNutrition;
  servings: ServingUnit[];
  ingredients: { id: UUID; name: string; nameSo: string | null; isAllergen: boolean }[];
  allergens: string[];
  source: string;
  verification: FoodVerification;
  imageUrl: string | null;
}

export interface FoodLogItem {
  id: UUID;
  food: Pick<Food, 'id' | 'name' | 'nameSo' | 'slug'>;
  servingLabel: string;
  quantity: number;
  grams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface FoodLog {
  id: UUID;
  date: string;
  mealType: MealType;
  loggedAt: ISODate;
  items: FoodLogItem[];
}

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface DailyNutritionSummary {
  date: string;
  totals: MacroTotals;
  byMeal: Record<MealType, MacroTotals>;
  waterMl: number;
  targets: Pick<FitnessTargets, 'calorieTarget' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG' | 'waterMl'> | null;
  logs: FoodLog[];
}

// ---------- AI ----------
export interface AIMessage {
  id: UUID;
  role: AIMessageRole;
  content: string;
  createdAt: ISODate;
  /** Structured suggestions the client can act on (e.g. foods/exercises referenced). */
  references?: { type: 'food' | 'exercise'; id: UUID; name: string }[];
}

export interface AIConversation {
  id: UUID;
  coachType: AICoachType;
  title: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  lastMessagePreview: string | null;
}

export interface FoodScanCandidate {
  id: UUID;
  label: string;
  confidence: number;
  food: Pick<Food, 'id' | 'name' | 'nameSo' | 'slug'> | null;
  estimatedGrams: number | null;
  estimatedGramsLow: number | null;
  estimatedGramsHigh: number | null;
  ingredients: string[];
}

export interface FoodScan {
  id: UUID;
  status: FoodScanStatus;
  imageUrl: string | null;
  candidates: FoodScanCandidate[];
  disclaimer: string;
  failureReason: string | null;
  createdAt: ISODate;
}

// ---------- Progress ----------
export interface WeightLog {
  id: UUID;
  weightKg: number;
  loggedAt: ISODate;
  note: string | null;
}

export interface BodyMeasurement {
  id: UUID;
  measuredAt: ISODate;
  waistCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  hipCm: number | null;
  thighCm: number | null;
  bodyFatPct: number | null;
}

export interface ProgressPhoto {
  id: UUID;
  imageUrl: string;
  takenAt: ISODate;
  note: string | null;
}

// ---------- Planner & lifestyle ----------
export interface PlannerItem {
  id: UUID;
  date: string;
  type: PlannerItemType;
  title: string;
  scheduledAt: ISODate;
  status: PlannerItemStatus;
  completedAt: ISODate | null;
  reminderEnabled: boolean;
}

export interface Habit {
  id: UUID;
  name: string;
  icon: string | null;
  targetPerWeek: number;
  isActive: boolean;
  completedToday: boolean;
  streak: number;
}

// ---------- Challenges ----------
export interface Challenge {
  id: UUID;
  title: string;
  description: string;
  period: ChallengePeriod;
  metric: ChallengeMetric;
  targetValue: number;
  startsAt: ISODate;
  endsAt: ISODate;
  isJoined: boolean;
  progress: number;
  participantCount: number;
}

export interface Achievement {
  id: UUID;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: ISODate | null;
}

// ---------- Gym ----------
export interface Gym {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  branches: GymBranch[];
}

export interface GymBranch {
  id: UUID;
  gymId: UUID;
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  openingHours: { day: number; open: string; close: string; closed: boolean }[];
  isActive: boolean;
}

export interface MembershipPlan {
  id: UUID;
  gymId: UUID;
  name: string;
  description: string | null;
  durationDays: number;
  price: string;
  currency: string;
  features: string[];
  isActive: boolean;
}

export interface MembershipSubscription {
  id: UUID;
  gymId: UUID;
  gym: Pick<Gym, 'id' | 'name' | 'logoUrl'>;
  plan: Pick<MembershipPlan, 'id' | 'name' | 'durationDays' | 'price' | 'currency'>;
  status: SubscriptionStatus;
  startsAt: ISODate;
  endsAt: ISODate;
  autoRenew: boolean;
  memberCode: string;
}

export interface Attendance {
  id: UUID;
  gymId: UUID;
  branchId: UUID;
  branchName: string;
  method: AttendanceMethod;
  checkedInAt: ISODate;
  checkedOutAt: ISODate | null;
}

export interface TrainerProfile {
  id: UUID;
  userId: UUID;
  fullName: string;
  avatarUrl: string | null;
  gymId: UUID | null;
  gymName: string | null;
  bio: string | null;
  specialties: string[];
  certifications: string[];
  yearsExperience: number;
  hourlyRate: string | null;
  currency: string;
  isAcceptingClients: boolean;
  rating: number | null;
}

export interface TrainingBooking {
  id: UUID;
  trainer: Pick<TrainerProfile, 'id' | 'fullName' | 'avatarUrl'>;
  memberUserId: UUID;
  memberName: string;
  startsAt: ISODate;
  endsAt: ISODate;
  status: BookingStatus;
  notes: string | null;
}

export interface GymClass {
  id: UUID;
  gymId: UUID;
  branchId: UUID;
  title: string;
  description: string | null;
  trainerName: string | null;
  startsAt: ISODate;
  endsAt: ISODate;
  capacity: number;
  bookedCount: number;
}

// ---------- Finance ----------
export interface Payment {
  id: UUID;
  gymId: UUID;
  amount: string;
  currency: string;
  method: PaymentMethodType;
  status: PaymentStatus;
  reference: string | null;
  paidAt: ISODate | null;
  createdAt: ISODate;
}

export interface Invoice {
  id: UUID;
  number: string;
  gymId: UUID;
  status: InvoiceStatus;
  subtotal: string;
  tax: string;
  total: string;
  currency: string;
  issuedAt: ISODate | null;
  dueAt: ISODate | null;
  paidAt: ISODate | null;
  lines: { description: string; quantity: number; unitPrice: string; total: string }[];
}

// ---------- Notifications ----------
export interface AppNotification {
  id: UUID;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: ISODate | null;
  createdAt: ISODate;
}

export interface NotificationPreferences {
  workoutReminders: boolean;
  mealReminders: boolean;
  hydrationReminders: boolean;
  appointmentReminders: boolean;
  subscriptionAlerts: boolean;
  weeklyProgress: boolean;
  challengeUpdates: boolean;
  marketing: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}
