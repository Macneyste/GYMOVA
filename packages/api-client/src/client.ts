import type {
  Achievement,
  AIConversation,
  AIMessage,
  AppNotification,
  Attendance,
  AuthSession,
  AuthTokens,
  AuthUser,
  BodyMeasurement,
  Challenge,
  DailyNutritionSummary,
  Exercise,
  FitnessAssessment,
  FitnessGoal,
  FitnessTargets,
  Food,
  FoodLog,
  FoodScan,
  Gym,
  GymBranch,
  GymClass,
  Habit,
  Invoice,
  MembershipPlan,
  MembershipSubscription,
  NotificationPreferences,
  Paginated,
  Payment,
  PlannerItem,
  ProgressPhoto,
  TrainerProfile,
  TrainingBooking,
  UserProfile,
  WeightLog,
  WorkoutPlan,
  WorkoutSession,
} from '@gymova/shared-types';
import { HttpClient, type HttpClientOptions, type RequestOptions } from './http';

type Query = RequestOptions['query'];

export interface AssessmentResult {
  assessment: FitnessAssessment;
  targets: FitnessTargets | null;
  requiresProfessionalGuidance: boolean;
  guidanceReasons: string[];
}

export interface ProgressSummary {
  startWeightKg: number | null;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  weightChangeKg: number | null;
  workoutsThisWeek: number;
  workoutsLastWeek: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalWorkouts: number;
  totalVolumeKg: number;
  personalRecords: { exerciseId: string; exerciseName: string; bestWeightKg: number; reps: number; achievedAt: string }[];
  weightSeries: { date: string; value: number }[];
  weeklyWorkoutSeries: { weekStart: string; value: number }[];
}

export interface DashboardData {
  user: Pick<AuthUser, 'id' | 'fullName' | 'avatarUrl'>;
  goal: FitnessGoal | null;
  targets: FitnessTargets | null;
  nutrition: DailyNutritionSummary;
  todayWorkout: { planDay: WorkoutPlan['days'][number] | null; session: WorkoutSession | null; isRestDay: boolean } | null;
  planner: PlannerItem[];
  completion: { total: number; completed: number };
  weekly: { workoutsCompleted: number; workoutsPlanned: number; daysLogged: number; avgCalories: number | null };
  unreadNotifications: number;
}

export interface AIChatResponse {
  conversationId: string;
  message: AIMessage;
  usage: { remainingToday: number; dailyLimit: number };
}

export interface MealPlan {
  id: string;
  name: string;
  isActive: boolean;
  weekStart: string;
  dailyCalorieTarget: number;
  days: {
    id: string;
    dayOfWeek: number;
    meals: {
      id: string;
      mealType: string;
      items: { food: Pick<Food, 'id' | 'name' | 'nameSo'>; grams: number; calories: number; proteinG: number; carbsG: number; fatG: number }[];
      totals: { calories: number; proteinG: number; carbsG: number; fatG: number };
    }[];
  }[];
}

export class GymovaApi {
  readonly http: HttpClient;

  constructor(options: HttpClientOptions) {
    this.http = new HttpClient(options);
  }

  // ---------- health ----------
  readonly health = {
    check: () => this.http.request<{ status: string; database: string; version: string }>('/health', { auth: false }),
  };

  // ---------- auth ----------
  readonly auth = {
    register: (body: { fullName: string; email: string; phone?: string; password: string; preferredLanguage?: string }) =>
      this.http.request<AuthSession>('/auth/register', { method: 'POST', body, auth: false }),
    login: (body: { email: string; password: string }) =>
      this.http.request<AuthSession>('/auth/login', { method: 'POST', body, auth: false }),
    refresh: (refreshToken: string) =>
      this.http.request<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken }, auth: false }),
    logout: (refreshToken: string | null) =>
      this.http.request<void>('/auth/logout', { method: 'POST', body: { refreshToken } }),
    verifyEmail: (code: string) => this.http.request<AuthUser>('/auth/verify', { method: 'POST', body: { purpose: 'EMAIL_VERIFY', code } }),
    verifyPhone: (code: string) => this.http.request<AuthUser>('/auth/verify', { method: 'POST', body: { purpose: 'PHONE_VERIFY', code } }),
    resendVerification: (purpose: 'EMAIL_VERIFY' | 'PHONE_VERIFY') =>
      this.http.request<{ sent: boolean; expiresInSeconds: number }>('/auth/verify/resend', { method: 'POST', body: { purpose } }),
    forgotPassword: (email: string) =>
      this.http.request<{ sent: boolean }>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
    resetPassword: (body: { email: string; code: string; password: string }) =>
      this.http.request<{ reset: boolean }>('/auth/reset-password', { method: 'POST', body, auth: false }),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      this.http.request<void>('/auth/change-password', { method: 'POST', body }),
  };

  // ---------- users / profiles ----------
  readonly users = {
    me: () => this.http.request<AuthUser>('/users/me'),
    update: (body: Partial<Pick<AuthUser, 'fullName' | 'phone' | 'preferredLanguage' | 'themePreference'>>) =>
      this.http.request<AuthUser>('/users/me', { method: 'PATCH', body }),
    uploadAvatar: (formData: FormData) => this.http.request<AuthUser>('/users/me/avatar', { method: 'POST', formData }),
    exportData: () => this.http.request<Record<string, unknown>>('/users/me/export'),
    deleteAccount: (password: string) => this.http.request<void>('/users/me', { method: 'DELETE', body: { password } }),
    dashboard: (date?: string) => this.http.request<DashboardData>('/users/me/dashboard', { query: { date } }),
  };

  readonly profiles = {
    me: () => this.http.request<UserProfile>('/profiles/me'),
    update: (body: Partial<Omit<UserProfile, 'userId'>>) => this.http.request<UserProfile>('/profiles/me', { method: 'PATCH', body }),
  };

  // ---------- assessments / goals ----------
  readonly assessments = {
    create: (body: Record<string, unknown>) => this.http.request<AssessmentResult>('/assessments', { method: 'POST', body }),
    me: () => this.http.request<AssessmentResult | null>('/assessments/me'),
    update: (body: Record<string, unknown>) => this.http.request<AssessmentResult>('/assessments/me', { method: 'PATCH', body }),
    targets: () => this.http.request<FitnessTargets | null>('/assessments/me/targets'),
  };

  readonly goals = {
    list: () => this.http.request<FitnessGoal[]>('/goals'),
    create: (body: Partial<FitnessGoal>) => this.http.request<FitnessGoal>('/goals', { method: 'POST', body }),
    update: (id: string, body: Partial<FitnessGoal>) => this.http.request<FitnessGoal>(`/goals/${id}`, { method: 'PATCH', body }),
  };

  // ---------- exercises / workouts ----------
  readonly exercises = {
    list: (query?: Query) => this.http.request<Paginated<Exercise>>('/exercises', { query }),
    get: (id: string) => this.http.request<Exercise>(`/exercises/${id}`),
    filters: () =>
      this.http.request<{ categories: { slug: string; name: string }[]; muscles: { slug: string; name: string }[]; equipment: { slug: string; name: string }[] }>(
        '/exercises/filters',
      ),
  };

  readonly workouts = {
    plans: () => this.http.request<WorkoutPlan[]>('/workouts/plans'),
    activePlan: () => this.http.request<WorkoutPlan | null>('/workouts/plans/active'),
    plan: (id: string) => this.http.request<WorkoutPlan>(`/workouts/plans/${id}`),
    generatePlan: (body?: { weeks?: number }) => this.http.request<WorkoutPlan>('/workouts/plans/generate', { method: 'POST', body: body ?? {} }),
    createPlan: (body: Record<string, unknown>) => this.http.request<WorkoutPlan>('/workouts/plans', { method: 'POST', body }),
    activatePlan: (id: string) => this.http.request<WorkoutPlan>(`/workouts/plans/${id}/activate`, { method: 'PATCH' }),
    templates: () => this.http.request<WorkoutPlan[]>('/workouts/templates'),
    today: () => this.http.request<{ planDay: WorkoutPlan['days'][number] | null; session: WorkoutSession | null; isRestDay: boolean }>('/workouts/today'),
    startSession: (body: { planDayId?: string; name?: string; exercises?: { exerciseId: string; sets: number; reps?: string }[] }) =>
      this.http.request<WorkoutSession>('/workouts/sessions', { method: 'POST', body }),
    activeSession: () => this.http.request<WorkoutSession | null>('/workouts/sessions/active'),
    updateSession: (id: string, body: { exercises: { id: string; sets: Record<string, unknown>[] }[]; notes?: string }) =>
      this.http.request<WorkoutSession>(`/workouts/sessions/${id}`, { method: 'PATCH', body }),
    completeSession: (id: string, body?: { durationSeconds?: number; notes?: string }) =>
      this.http.request<WorkoutSession>(`/workouts/sessions/${id}/complete`, { method: 'POST', body: body ?? {} }),
    abandonSession: (id: string) => this.http.request<WorkoutSession>(`/workouts/sessions/${id}/abandon`, { method: 'POST' }),
    history: (query?: Query) => this.http.request<Paginated<WorkoutSession>>('/workouts/history', { query }),
    records: () => this.http.request<ProgressSummary['personalRecords']>('/workouts/records'),
  };

  // ---------- foods / nutrition ----------
  readonly foods = {
    list: (query?: Query) => this.http.request<Paginated<Food>>('/foods', { query }),
    get: (id: string) => this.http.request<Food>(`/foods/${id}`),
    categories: () => this.http.request<{ category: string; count: number }[]>('/foods/categories'),
  };

  readonly nutrition = {
    logFood: (body: { date: string; mealType: string; items: { foodId: string; servingUnitId?: string; quantity: number; grams?: number }[] }) =>
      this.http.request<FoodLog>('/food-logs', { method: 'POST', body }),
    daily: (date: string) => this.http.request<FoodLog[]>('/food-logs/daily', { query: { date } }),
    deleteItem: (itemId: string) => this.http.request<void>(`/food-logs/items/${itemId}`, { method: 'DELETE' }),
    summary: (date: string) => this.http.request<DailyNutritionSummary>('/nutrition/summary', { query: { date } }),
    weekly: (endDate?: string) =>
      this.http.request<{ days: { date: string; calories: number; proteinG: number; carbsG: number; fatG: number; waterMl: number }[]; targets: DailyNutritionSummary['targets'] }>(
        '/nutrition/weekly',
        { query: { endDate } },
      ),
    logWater: (amountMl: number) => this.http.request<{ totalMl: number }>('/water-logs', { method: 'POST', body: { amountMl } }),
    water: (date: string) => this.http.request<{ totalMl: number; targetMl: number | null; entries: { id: string; amountMl: number; loggedAt: string }[] }>('/water-logs/daily', { query: { date } }),
  };

  readonly mealPlans = {
    list: () => this.http.request<MealPlan[]>('/meal-plans'),
    active: () => this.http.request<MealPlan | null>('/meal-plans/active'),
    get: (id: string) => this.http.request<MealPlan>(`/meal-plans/${id}`),
    generate: (body?: { weekStart?: string }) => this.http.request<MealPlan>('/meal-plans/generate', { method: 'POST', body: body ?? {} }),
    shoppingList: (id: string) => this.http.request<{ name: string; nameSo: string | null; grams: number }[]>(`/meal-plans/${id}/shopping-list`),
  };

  readonly scanner = {
    scan: (formData: FormData) => this.http.request<FoodScan>('/food-scanner', { method: 'POST', formData }),
    get: (id: string) => this.http.request<FoodScan>(`/food-scanner/${id}`),
    confirm: (id: string, body: { date: string; mealType: string; items: { candidateId?: string; foodId: string; grams: number }[] }) =>
      this.http.request<FoodLog>(`/food-scanner/${id}/confirm`, { method: 'POST', body }),
  };

  // ---------- AI ----------
  readonly ai = {
    chat: (body: { conversationId?: string; coachType: 'DIET' | 'WORKOUT' | 'PERSONAL'; message: string }) =>
      this.http.request<AIChatResponse>('/ai/coach/chat', { method: 'POST', body }),
    conversations: () => this.http.request<AIConversation[]>('/ai/conversations'),
    conversation: (id: string) => this.http.request<AIConversation & { messages: AIMessage[] }>(`/ai/conversations/${id}`),
    deleteConversation: (id: string) => this.http.request<void>(`/ai/conversations/${id}`, { method: 'DELETE' }),
    usage: () => this.http.request<{ usedToday: number; dailyLimit: number; remainingToday: number }>('/ai/usage'),
    weeklySummary: () => this.http.request<{ summary: string; generatedAt: string }>('/ai/coach/weekly-summary', { method: 'POST' }),
  };

  // ---------- progress ----------
  readonly progress = {
    summary: () => this.http.request<ProgressSummary>('/progress/summary'),
    weight: (query?: Query) => this.http.request<WeightLog[]>('/progress/weight', { query }),
    logWeight: (body: { weightKg: number; loggedAt?: string; note?: string }) => this.http.request<WeightLog>('/progress/weight', { method: 'POST', body }),
    measurements: () => this.http.request<BodyMeasurement[]>('/progress/measurements'),
    logMeasurement: (body: Partial<BodyMeasurement>) => this.http.request<BodyMeasurement>('/progress/measurements', { method: 'POST', body }),
    photos: () => this.http.request<ProgressPhoto[]>('/progress/photos'),
    uploadPhoto: (formData: FormData) => this.http.request<ProgressPhoto>('/progress/photos', { method: 'POST', formData }),
    deletePhoto: (id: string) => this.http.request<void>(`/progress/photos/${id}`, { method: 'DELETE' }),
    weeklyReport: () => this.http.request<Record<string, unknown>>('/progress/reports/weekly'),
    monthlyReport: () => this.http.request<Record<string, unknown>>('/progress/reports/monthly'),
  };

  // ---------- lifestyle ----------
  readonly lifestyle = {
    logSleep: (body: { date: string; hours: number; quality?: number }) => this.http.request<unknown>('/sleep-logs', { method: 'POST', body }),
    sleep: (query?: Query) => this.http.request<{ id: string; date: string; hours: number; quality: number | null }[]>('/sleep-logs', { query }),
    logRecovery: (body: { date: string; energy: number; fatigue: number; soreness?: number; note?: string }) =>
      this.http.request<unknown>('/recovery-logs', { method: 'POST', body }),
    recovery: (query?: Query) => this.http.request<{ id: string; date: string; energy: number; fatigue: number; soreness: number | null }[]>('/recovery-logs', { query }),
    habits: () => this.http.request<Habit[]>('/habits'),
    createHabit: (body: { name: string; icon?: string; targetPerWeek?: number }) => this.http.request<Habit>('/habits', { method: 'POST', body }),
    updateHabit: (id: string, body: Partial<Habit>) => this.http.request<Habit>(`/habits/${id}`, { method: 'PATCH', body }),
    deleteHabit: (id: string) => this.http.request<void>(`/habits/${id}`, { method: 'DELETE' }),
    logHabit: (id: string, date: string) => this.http.request<Habit>(`/habits/${id}/log`, { method: 'POST', body: { date } }),
  };

  readonly planner = {
    day: (date: string) => this.http.request<PlannerItem[]>('/planner', { query: { date } }),
    generate: (date: string) => this.http.request<PlannerItem[]>('/planner/generate', { method: 'POST', body: { date } }),
    update: (id: string, body: { status?: string; scheduledAt?: string; reminderEnabled?: boolean }) =>
      this.http.request<PlannerItem>(`/planner/${id}`, { method: 'PATCH', body }),
  };

  // ---------- challenges ----------
  readonly challenges = {
    list: () => this.http.request<Challenge[]>('/challenges'),
    mine: () => this.http.request<Challenge[]>('/challenges/me'),
    join: (id: string) => this.http.request<Challenge>(`/challenges/${id}/join`, { method: 'POST' }),
    leaderboard: (id: string) => this.http.request<{ rank: number; name: string; progress: number; isMe: boolean }[]>(`/challenges/${id}/leaderboard`),
    achievements: () => this.http.request<Achievement[]>('/achievements'),
  };

  // ---------- gyms ----------
  readonly gyms = {
    list: (query?: Query) => this.http.request<Paginated<Gym>>('/gyms', { query }),
    get: (id: string) => this.http.request<Gym>(`/gyms/${id}`),
    plans: (id: string) => this.http.request<MembershipPlan[]>(`/gyms/${id}/plans`),
    branches: (id: string) => this.http.request<GymBranch[]>(`/gyms/${id}/branches`),
    classes: (id: string, query?: Query) => this.http.request<GymClass[]>(`/gyms/${id}/classes`, { query }),
  };

  readonly memberships = {
    subscribe: (body: { planId: string; paymentMethod: string; idempotencyKey: string }) =>
      this.http.request<MembershipSubscription>('/memberships', { method: 'POST', body, idempotencyKey: body.idempotencyKey }),
    mine: () => this.http.request<MembershipSubscription[]>('/memberships/me'),
    card: () => this.http.request<{ qrToken: string; expiresAt: string; memberCode: string; subscription: MembershipSubscription | null }>('/memberships/me/card'),
    renew: (id: string, idempotencyKey: string) => this.http.request<MembershipSubscription>(`/memberships/${id}/renew`, { method: 'POST', body: {}, idempotencyKey }),
    cancel: (id: string) => this.http.request<MembershipSubscription>(`/memberships/${id}/cancel`, { method: 'POST' }),
  };

  readonly attendance = {
    checkIn: (body: { branchId: string }) => this.http.request<Attendance>('/attendance/check-in', { method: 'POST', body }),
    history: (query?: Query) => this.http.request<Paginated<Attendance>>('/attendance/history', { query }),
    verifyQr: (body: { qrToken: string; branchId: string }) => this.http.request<Attendance & { memberName: string; subscriptionStatus: string }>('/attendance/verify', { method: 'POST', body }),
    checkOut: (id: string) => this.http.request<Attendance>(`/attendance/${id}/check-out`, { method: 'POST' }),
  };

  readonly trainers = {
    list: (query?: Query) => this.http.request<Paginated<TrainerProfile>>('/trainers', { query }),
    get: (id: string) => this.http.request<TrainerProfile>(`/trainers/${id}`),
    availability: (id: string, date: string) => this.http.request<{ startsAt: string; endsAt: string }[]>(`/trainers/${id}/availability`, { query: { date } }),
    book: (body: { trainerId: string; startsAt: string; durationMinutes?: number; notes?: string }) =>
      this.http.request<TrainingBooking>('/bookings', { method: 'POST', body }),
    myBookings: () => this.http.request<TrainingBooking[]>('/bookings/me'),
    cancelBooking: (id: string) => this.http.request<TrainingBooking>(`/bookings/${id}/cancel`, { method: 'POST' }),
    // trainer-side
    meProfile: () => this.http.request<TrainerProfile | null>('/trainers/me'),
    updateMeProfile: (body: Partial<TrainerProfile>) => this.http.request<TrainerProfile>('/trainers/me', { method: 'PATCH', body }),
    clients: () => this.http.request<{ userId: string; fullName: string; avatarUrl: string | null; lastWorkoutAt: string | null; activePlan: string | null }[]>('/trainers/me/clients'),
    clientDetail: (userId: string) => this.http.request<Record<string, unknown>>(`/trainers/me/clients/${userId}`),
    assignPlan: (userId: string, body: Record<string, unknown>) => this.http.request<WorkoutPlan>(`/trainers/me/clients/${userId}/plans`, { method: 'POST', body }),
    trainerBookings: (query?: Query) => this.http.request<TrainingBooking[]>('/trainers/me/bookings', { query }),
    setBookingStatus: (id: string, status: string) => this.http.request<TrainingBooking>(`/bookings/${id}/status`, { method: 'PATCH', body: { status } }),
  };

  readonly payments = {
    mine: () => this.http.request<Payment[]>('/payments/me'),
    invoices: () => this.http.request<Invoice[]>('/invoices/me'),
    invoice: (id: string) => this.http.request<Invoice>(`/invoices/${id}`),
  };

  readonly notifications = {
    list: (query?: Query) => this.http.request<Paginated<AppNotification>>('/notifications', { query }),
    markRead: (id: string) => this.http.request<AppNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => this.http.request<void>('/notifications/read-all', { method: 'POST' }),
    preferences: () => this.http.request<NotificationPreferences>('/notifications/preferences'),
    updatePreferences: (body: Partial<NotificationPreferences>) => this.http.request<NotificationPreferences>('/notifications/preferences', { method: 'PATCH', body }),
    registerDevice: (body: { token: string; platform: 'android' | 'ios' | 'web' }) => this.http.request<void>('/notifications/devices', { method: 'POST', body }),
  };

  // ---------- admin (gym admin / super admin) ----------
  readonly admin = {
    overview: (gymId?: string) => this.http.request<Record<string, unknown>>('/admin/reports/overview', { query: { gymId } }),
    revenue: (query?: Query) => this.http.request<Record<string, unknown>>('/admin/reports/revenue', { query }),
    attendanceReport: (query?: Query) => this.http.request<Record<string, unknown>>('/admin/reports/attendance', { query }),
    membersReport: (query?: Query) => this.http.request<Record<string, unknown>>('/admin/reports/members', { query }),
    gyms: (query?: Query) => this.http.request<Paginated<Gym>>('/admin/gyms', { query }),
    createGym: (body: Record<string, unknown>) => this.http.request<Gym>('/admin/gyms', { method: 'POST', body }),
    updateGym: (id: string, body: Record<string, unknown>) => this.http.request<Gym>(`/admin/gyms/${id}`, { method: 'PATCH', body }),
    branches: (gymId: string) => this.http.request<GymBranch[]>(`/admin/gyms/${gymId}/branches`),
    createBranch: (gymId: string, body: Record<string, unknown>) => this.http.request<GymBranch>(`/admin/gyms/${gymId}/branches`, { method: 'POST', body }),
    updateBranch: (gymId: string, id: string, body: Record<string, unknown>) => this.http.request<GymBranch>(`/admin/gyms/${gymId}/branches/${id}`, { method: 'PATCH', body }),
    staff: (gymId: string) => this.http.request<Record<string, unknown>[]>(`/admin/gyms/${gymId}/staff`),
    addStaff: (gymId: string, body: Record<string, unknown>) => this.http.request<Record<string, unknown>>(`/admin/gyms/${gymId}/staff`, { method: 'POST', body }),
    removeStaff: (gymId: string, id: string) => this.http.request<void>(`/admin/gyms/${gymId}/staff/${id}`, { method: 'DELETE' }),
    members: (gymId: string, query?: Query) => this.http.request<Paginated<Record<string, unknown>>>(`/admin/gyms/${gymId}/members`, { query }),
    registerMember: (gymId: string, body: Record<string, unknown>) => this.http.request<Record<string, unknown>>(`/admin/gyms/${gymId}/members`, { method: 'POST', body }),
    plans: (gymId: string) => this.http.request<MembershipPlan[]>(`/admin/gyms/${gymId}/plans`),
    createPlan: (gymId: string, body: Record<string, unknown>) => this.http.request<MembershipPlan>(`/admin/gyms/${gymId}/plans`, { method: 'POST', body }),
    updatePlan: (gymId: string, id: string, body: Record<string, unknown>) => this.http.request<MembershipPlan>(`/admin/gyms/${gymId}/plans/${id}`, { method: 'PATCH', body }),
    subscriptions: (gymId: string, query?: Query) => this.http.request<Paginated<MembershipSubscription>>(`/admin/gyms/${gymId}/subscriptions`, { query }),
    createSubscription: (gymId: string, body: Record<string, unknown>) => this.http.request<MembershipSubscription>(`/admin/gyms/${gymId}/subscriptions`, { method: 'POST', body, idempotencyKey: String(body.idempotencyKey ?? '') || undefined }),
    attendance: (gymId: string, query?: Query) => this.http.request<Paginated<Attendance & { memberName: string }>>(`/admin/gyms/${gymId}/attendance`, { query }),
    payments: (gymId: string, query?: Query) => this.http.request<Paginated<Payment>>(`/admin/gyms/${gymId}/payments`, { query }),
    recordPayment: (gymId: string, body: Record<string, unknown>) => this.http.request<Payment>(`/admin/gyms/${gymId}/payments`, { method: 'POST', body, idempotencyKey: String(body.idempotencyKey ?? '') || undefined }),
    invoices: (gymId: string, query?: Query) => this.http.request<Paginated<Invoice>>(`/admin/gyms/${gymId}/invoices`, { query }),
    classes: (gymId: string, query?: Query) => this.http.request<GymClass[]>(`/admin/gyms/${gymId}/classes`, { query }),
    createClass: (gymId: string, body: Record<string, unknown>) => this.http.request<GymClass>(`/admin/gyms/${gymId}/classes`, { method: 'POST', body }),
    trainers: (gymId: string) => this.http.request<TrainerProfile[]>(`/admin/gyms/${gymId}/trainers`),
    sendNotification: (gymId: string, body: { title: string; body: string; audience: 'ALL' | 'ACTIVE' | 'EXPIRING' }) =>
      this.http.request<{ sent: number }>(`/admin/gyms/${gymId}/notifications`, { method: 'POST', body }),
    // platform
    users: (query?: Query) => this.http.request<Paginated<AuthUser>>('/admin/users', { query }),
    setUserRoles: (id: string, roles: string[]) => this.http.request<AuthUser>(`/admin/users/${id}/roles`, { method: 'PATCH', body: { roles } }),
    setUserActive: (id: string, isActive: boolean) => this.http.request<AuthUser>(`/admin/users/${id}/status`, { method: 'PATCH', body: { isActive } }),
    foods: (query?: Query) => this.http.request<Paginated<Food>>('/admin/catalog/foods', { query }),
    upsertFood: (body: Record<string, unknown>, id?: string) => this.http.request<Food>(id ? `/admin/catalog/foods/${id}` : '/admin/catalog/foods', { method: id ? 'PATCH' : 'POST', body }),
    exercises: (query?: Query) => this.http.request<Paginated<Exercise>>('/admin/catalog/exercises', { query }),
    upsertExercise: (body: Record<string, unknown>, id?: string) => this.http.request<Exercise>(id ? `/admin/catalog/exercises/${id}` : '/admin/catalog/exercises', { method: id ? 'PATCH' : 'POST', body }),
    aiConfig: () => this.http.request<Record<string, unknown>>('/admin/ai-config'),
    updateAiConfig: (body: Record<string, unknown>) => this.http.request<Record<string, unknown>>('/admin/ai-config', { method: 'PATCH', body }),
    auditLogs: (query?: Query) => this.http.request<Paginated<Record<string, unknown>>>('/admin/audit-logs', { query }),
    settings: () => this.http.request<Record<string, unknown>>('/admin/settings'),
    updateSettings: (body: Record<string, unknown>) => this.http.request<Record<string, unknown>>('/admin/settings', { method: 'PATCH', body }),
  };
}

export function createApi(options: HttpClientOptions): GymovaApi {
  return new GymovaApi(options);
}
