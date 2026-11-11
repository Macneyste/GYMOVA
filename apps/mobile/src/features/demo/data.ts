/**
 * Sample content shown by the redesigned tab screens until their API phases ship.
 * Replace each block with the real query when the matching endpoint exists.
 */
import type { Ionicons } from '@expo/vector-icons';

type IconName = keyof typeof Ionicons.glyphMap;

export const weekly = { done: 6, goal: 8, calories: 2350, caloriesGoal: 3000, activeTime: '4h 30m' };

export const todayWorkout = {
  name: 'Push Day',
  muscles: 'Chest, Shoulders, Triceps',
  exercises: 8,
  minutes: 45,
  calories: 320,
};

export interface Exercise {
  name: string;
  group: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms';
  sets: number;
  reps: number;
  icon: IconName;
}

export const pushDayExercises: Exercise[] = [
  { name: 'Bench Press', group: 'Chest', sets: 4, reps: 12, icon: 'barbell' },
  { name: 'Incline Dumbbell Press', group: 'Chest', sets: 4, reps: 12, icon: 'barbell-outline' },
  { name: 'Shoulder Press', group: 'Shoulders', sets: 4, reps: 10, icon: 'fitness' },
  { name: 'Cable Fly', group: 'Chest', sets: 3, reps: 15, icon: 'git-merge-outline' },
  { name: 'Lateral Raise', group: 'Shoulders', sets: 3, reps: 15, icon: 'swap-horizontal' },
  { name: 'Triceps Pushdown', group: 'Arms', sets: 3, reps: 12, icon: 'arrow-down-circle-outline' },
  { name: 'Push Ups', group: 'Chest', sets: 3, reps: 20, icon: 'body' },
  { name: 'Dumbbell Pullover', group: 'Chest', sets: 3, reps: 12, icon: 'repeat' },
];

export const exerciseLibrary: Exercise[] = [
  ...pushDayExercises,
  { name: 'Deadlift', group: 'Back', sets: 4, reps: 6, icon: 'barbell' },
  { name: 'Lat Pulldown', group: 'Back', sets: 4, reps: 10, icon: 'arrow-down' },
  { name: 'Seated Row', group: 'Back', sets: 3, reps: 12, icon: 'swap-horizontal' },
  { name: 'Back Squat', group: 'Legs', sets: 4, reps: 8, icon: 'barbell-outline' },
  { name: 'Leg Press', group: 'Legs', sets: 4, reps: 12, icon: 'footsteps' },
  { name: 'Lunges', group: 'Legs', sets: 3, reps: 12, icon: 'walk' },
  { name: 'Biceps Curl', group: 'Arms', sets: 3, reps: 12, icon: 'fitness' },
];

export const workoutFrequency = [
  { label: 'Mon', value: 3 },
  { label: 'Tue', value: 4 },
  { label: 'Wed', value: 4 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 6 },
  { label: 'Sat', value: 4 },
  { label: 'Sun', value: 0 },
];

export const caloriesTrend = [1600, 1900, 1750, 2100, 1950, 2250, 2350];
export const activeTrend = [40, 55, 48, 62, 58, 70, 75];

export const goal = { name: 'Muscle Gain', done: 8, total: 10 };

export const nutrition = {
  consumed: 1850,
  goal: 2400,
  macros: [
    { key: 'protein', label: 'Protein', value: 120, goal: 160, color: '#9EE52F', icon: 'nutrition' as IconName },
    { key: 'carbs', label: 'Carbs', value: 180, goal: 250, color: '#F5793B', icon: 'leaf' as IconName },
    { key: 'fat', label: 'Fat', value: 60, goal: 80, color: '#A46CF5', icon: 'water' as IconName },
  ],
  meals: [
    { name: 'Breakfast', food: 'Oatmeal with Fruits', kcal: 450, icon: 'cafe' as IconName },
    { name: 'Lunch', food: 'Grilled Chicken Salad', kcal: 650, icon: 'restaurant' as IconName },
    { name: 'Dinner', food: 'Salmon with Quinoa', kcal: 750, icon: 'fish' as IconName },
  ],
};

export const trainer = {
  name: 'James Carter',
  title: 'Certified Personal Trainer',
  rating: 4.9,
  reviews: 128,
  years: 8,
  clients: '250+',
  programs: '120+',
  about: 'Passionate about helping you achieve your fitness goals and live a healthier life.',
  specializations: [
    { label: 'Weight Loss', icon: 'scale-outline' as IconName },
    { label: 'Muscle Gain', icon: 'barbell-outline' as IconName },
    { label: 'Strength', icon: 'flash-outline' as IconName },
    { label: 'HIIT', icon: 'timer-outline' as IconName },
  ],
};
