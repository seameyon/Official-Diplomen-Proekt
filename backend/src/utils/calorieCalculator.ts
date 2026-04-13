import { ActivityLevel, Goal, IHealthProfile } from '../types/user.types.js';

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  very_active: 1.725,  // Hard exercise 6-7 days/week
};

// Goal adjustments (calories)
const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_weight: -500,   // 500 calorie deficit for ~0.5kg/week loss
  maintain: 0,
  gain_muscle: 300,    // 300 calorie surplus for lean gains
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * This is considered more accurate than Harris-Benedict
 */
export const calculateBMR = (
  weight: number, // kg
  height: number, // cm
  age: number,
  sex?: 'male' | 'female' | 'other'
): number => {
  // Base calculation (using average if sex not specified)
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  switch (sex) {
    case 'male':
      return Math.round(baseBMR + 5);
    case 'female':
      return Math.round(baseBMR - 161);
    default:
      // Use average of male and female formulas
      return Math.round(baseBMR - 78);
  }
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
};

/**
 * Calculate daily calorie target based on goal
 */
export const calculateDailyCalorieTarget = (
  tdee: number,
  goal: Goal
): number => {
  const target = tdee + GOAL_ADJUSTMENTS[goal];
  // Ensure minimum healthy intake
  return Math.max(target, 1200);
};

/**
 * Calculate macronutrient targets in grams
 * Based on common recommendations:
 * - Protein: 1.6-2.2g per kg bodyweight (higher for muscle gain)
 * - Fat: 25-35% of calories
 * - Carbs: Remaining calories
 */
export const calculateMacroTargets = (
  calories: number,
  weight: number,
  goal: Goal
): { protein: number; carbs: number; fat: number } => {
  // Protein calculation based on goal
  let proteinPerKg: number;
  switch (goal) {
    case 'gain_muscle':
      proteinPerKg = 2.0;
      break;
    case 'lose_weight':
      proteinPerKg = 1.8; // Higher protein while cutting to preserve muscle
      break;
    default:
      proteinPerKg = 1.6;
  }
  
  const protein = Math.round(weight * proteinPerKg);
  const proteinCalories = protein * 4;
  
  // Fat: 30% of total calories
  const fatCalories = calories * 0.30;
  const fat = Math.round(fatCalories / 9);
  
  // Carbs: Remaining calories
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(carbCalories / 4);
  
  return { protein, carbs, fat };
};

/**
 * Calculate BMI
 */
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Calculate all health metrics from profile
 */
export const calculateHealthMetrics = (
  profile: Pick<IHealthProfile, 'height' | 'weight' | 'age' | 'sex' | 'activityLevel' | 'goal'>
): {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  macros: { protein: number; carbs: number; fat: number };
  bmi: number;
  bmiCategory: string;
} => {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const dailyCalorieTarget = calculateDailyCalorieTarget(tdee, profile.goal);
  const macros = calculateMacroTargets(dailyCalorieTarget, profile.weight, profile.goal);
  const bmi = calculateBMI(profile.weight, profile.height);
  const bmiCategory = getBMICategory(bmi);
  
  return {
    bmr,
    tdee,
    dailyCalorieTarget,
    macros,
    bmi,
    bmiCategory,
  };
};

export default {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateMacroTargets,
  calculateBMI,
  getBMICategory,
  calculateHealthMetrics,
};
