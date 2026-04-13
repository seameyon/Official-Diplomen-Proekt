import mongoose, { Schema } from 'mongoose';
import { IMealPlan, IMealItem, IDayMeals } from '../types/mealPlan.types.js';

const MealItemSchema = new Schema<IMealItem>({
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', default: null },
  title: { type: String, required: true },
  servings: { type: Number, required: true, min: 0.5 },
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, required: true, min: 0 },
  carbs: { type: Number, required: true, min: 0 },
  fat: { type: Number, required: true, min: 0 },
  prepTime: { type: Number, required: true, min: 0 },
  suggested: { type: Boolean, default: false },
  reason: { type: String, required: true },
}, { _id: false });

const DayMealsSchema = new Schema<IDayMeals>({
  breakfast: { type: MealItemSchema, required: true },
  lunch: { type: MealItemSchema, required: true },
  dinner: { type: MealItemSchema, required: true },
  snacks: [{ type: MealItemSchema }],
}, { _id: false });

const MealPlanSchema = new Schema<IMealPlan>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  weekKey: { 
    type: String, 
    required: true,
    match: [/^\d{4}-\d{2}$/, 'Week key must be in format YYYY-WW']
  },
  weeklyPlan: {
    monday: { type: DayMealsSchema, required: true },
    tuesday: { type: DayMealsSchema, required: true },
    wednesday: { type: DayMealsSchema, required: true },
    thursday: { type: DayMealsSchema, required: true },
    friday: { type: DayMealsSchema, required: true },
    saturday: { type: DayMealsSchema, required: true },
    sunday: { type: DayMealsSchema, required: true },
  },
  totalDailyCalories: {
    monday: { type: Number, required: true },
    tuesday: { type: Number, required: true },
    wednesday: { type: Number, required: true },
    thursday: { type: Number, required: true },
    friday: { type: Number, required: true },
    saturday: { type: Number, required: true },
    sunday: { type: Number, required: true },
  },
  nutritionSummary: {
    avgProtein: { type: Number, required: true },
    avgCarbs: { type: Number, required: true },
    avgFat: { type: Number, required: true },
    avgCalories: { type: Number, required: true },
  },
  notes: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  regenerateHistory: [{
    regeneratedAt: { type: Date, required: true },
    reason: { type: String },
  }],
}, { 
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index for user's weekly plans
MealPlanSchema.index({ userId: 1, weekKey: 1 }, { unique: true });
MealPlanSchema.index({ userId: 1, isActive: 1 });
MealPlanSchema.index({ createdAt: -1 });

export const MealPlan = mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);
export default MealPlan;
