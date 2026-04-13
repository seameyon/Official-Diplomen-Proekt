import { Document, Types } from 'mongoose';

export interface IMealItem {
  recipeId: Types.ObjectId | null;
  title: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  suggested: boolean;
  reason: string;
}

export interface IDayMeals {
  breakfast: IMealItem;
  lunch: IMealItem;
  dinner: IMealItem;
  snacks?: IMealItem[];
}

export interface IWeeklyPlan {
  monday: IDayMeals;
  tuesday: IDayMeals;
  wednesday: IDayMeals;
  thursday: IDayMeals;
  friday: IDayMeals;
  saturday: IDayMeals;
  sunday: IDayMeals;
}

export interface IDailyCalories {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface INutritionSummary {
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgCalories: number;
}

export interface IMealPlan extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  weekKey: string; // Format: YYYY-WW (e.g., 2024-01)
  weeklyPlan: IWeeklyPlan;
  totalDailyCalories: IDailyCalories;
  nutritionSummary: INutritionSummary;
  notes: string;
  isActive: boolean;
  regenerateHistory: Array<{
    regeneratedAt: Date;
    reason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMealPlanGenerateRequest {
  userId: string;
  forceRegenerate?: boolean;
  weekKey?: string;
}
