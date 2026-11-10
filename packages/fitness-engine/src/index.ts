export type Sex = 'MALE' | 'FEMALE' | 'UNSPECIFIED';
export type Goal = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE';
export type Activity = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE';

export interface FitnessInput {
  sex: Sex; age: number; heightCm: number; weightKg: number; activity: Activity; goal: Goal;
}

const multiplier: Record<Activity, number> = { SEDENTARY: 1.2, LIGHT: 1.375, MODERATE: 1.55, VERY_ACTIVE: 1.725 };

export function calculateTargets(input: FitnessInput) {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  const bmr = Math.round(base + (input.sex === 'MALE' ? 5 : input.sex === 'FEMALE' ? -161 : -78));
  const tdee = Math.round(bmr * multiplier[input.activity]);
  // A modest maximum 500 kcal daily change protects against aggressive targets.
  const calorieTarget = input.goal === 'LOSE_WEIGHT' ? Math.max(1200, tdee - 400) : input.goal === 'GAIN_MUSCLE' ? tdee + 250 : tdee;
  const proteinG = Math.round(input.weightKg * (input.goal === 'GAIN_MUSCLE' ? 1.8 : 1.6));
  const fatG = Math.round(Math.max(input.weightKg * 0.7, calorieTarget * 0.25 / 9));
  const carbsG = Math.max(0, Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4));
  return { formulaVersion: 'mifflin-st-jeor-v1', bmi: round(input.weightKg / ((input.heightCm / 100) ** 2)), bmr, tdee, calorieTarget, proteinG, carbsG, fatG, waterMl: Math.round(input.weightKg * 35) };
}
function round(value: number) { return Math.round(value * 10) / 10; }
