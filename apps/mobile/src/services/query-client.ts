import { QueryClient } from '@tanstack/react-query';
import { ApiError, NetworkError } from '@gymova/api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: (count, error) => {
        if (error instanceof ApiError && error.status < 500) return false;
        return count < 2;
      },
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (count, error) => error instanceof NetworkError && count < 1,
    },
  },
});

/** Query key factory — one place to keep cache keys consistent across features. */
export const qk = {
  me: ['me'] as const,
  dashboard: (date: string) => ['dashboard', date] as const,
  assessment: ['assessment'] as const,
  goals: ['goals'] as const,
  exercises: (filters: Record<string, unknown>) => ['exercises', filters] as const,
  exercise: (id: string) => ['exercise', id] as const,
  exerciseFilters: ['exercise-filters'] as const,
  plans: ['workout-plans'] as const,
  activePlan: ['workout-plan', 'active'] as const,
  todayWorkout: ['workout', 'today'] as const,
  activeSession: ['workout-session', 'active'] as const,
  history: ['workout-history'] as const,
  records: ['workout-records'] as const,
  foods: (filters: Record<string, unknown>) => ['foods', filters] as const,
  food: (id: string) => ['food', id] as const,
  nutritionSummary: (date: string) => ['nutrition', date] as const,
  nutritionWeekly: ['nutrition', 'weekly'] as const,
  water: (date: string) => ['water', date] as const,
  mealPlans: ['meal-plans'] as const,
  activeMealPlan: ['meal-plan', 'active'] as const,
  scan: (id: string) => ['scan', id] as const,
  conversations: ['ai-conversations'] as const,
  conversation: (id: string) => ['ai-conversation', id] as const,
  aiUsage: ['ai-usage'] as const,
  progressSummary: ['progress', 'summary'] as const,
  weight: ['progress', 'weight'] as const,
  measurements: ['progress', 'measurements'] as const,
  photos: ['progress', 'photos'] as const,
  sleep: ['sleep'] as const,
  recovery: ['recovery'] as const,
  habits: ['habits'] as const,
  planner: (date: string) => ['planner', date] as const,
  challenges: ['challenges'] as const,
  achievements: ['achievements'] as const,
  gyms: (filters: Record<string, unknown>) => ['gyms', filters] as const,
  gym: (id: string) => ['gym', id] as const,
  memberships: ['memberships'] as const,
  memberCard: ['membership-card'] as const,
  attendance: ['attendance'] as const,
  trainers: (filters: Record<string, unknown>) => ['trainers', filters] as const,
  trainer: (id: string) => ['trainer', id] as const,
  bookings: ['bookings'] as const,
  notifications: ['notifications'] as const,
  notificationPrefs: ['notification-preferences'] as const,
  payments: ['payments'] as const,
};
