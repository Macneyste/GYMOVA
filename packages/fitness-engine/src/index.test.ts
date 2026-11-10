import { describe, expect, it } from 'vitest';
import { calculateTargets } from './index';

describe('calculateTargets', () => {
  it('uses a bounded calorie deficit and balanced macros', () => {
    const result = calculateTargets({ sex: 'MALE', age: 30, heightCm: 180, weightKg: 80, activity: 'MODERATE', goal: 'LOSE_WEIGHT' });
    expect(result.calorieTarget).toBe(result.tdee - 400);
    expect(result.proteinG).toBe(128);
    expect(result.waterMl).toBe(2800);
    expect(result.formulaVersion).toBe('mifflin-st-jeor-v1');
  });
});
