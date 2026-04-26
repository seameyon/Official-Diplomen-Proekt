
export type RegionId = 'liyun' | 'sakuraya' | 'mondberg' | 'fontalis' | 'sumera';
export type RecipeRank = 'Apprentice' | 'Journeyman' | 'Artisan' | 'Master' | 'Grandmaster' | 'Legendary';


export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle';
export type DietaryPreference = 'vegan' | 'vegetarian' | 'pescatarian' | 'none';
export type MealsPerDay = 2 | 3 | 4 | 5;
export type CookingTime = 'quick' | 'normal' | 'meal_prep';
export type Budget = 'low' | 'medium' | 'flexible';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'bg';

export interface HealthProfile {
  height: number;
  weight: number;
  age: number;
  sex?: 'male' | 'female' | 'other';
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryPreference: DietaryPreference;
  allergies: string[];
  dislikedIngredients: string[];
  mealsPerDay: MealsPerDay;
  cookingTime: CookingTime;
  budget: Budget;
  equipment: string[];
  hasMedicalCondition: boolean;
  bmr?: number;
  dailyCalorieTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  completedAt?: string;
  favoriteRegion?: RegionId; // User's preferred culinary region
}

export interface User {
  _id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  hasCompletedOnboarding: boolean;
  healthProfile?: HealthProfile;
  theme: Theme;
  language: Language;
  cookingLevel?: number; // Gamification - cooking XP level
  spiritsUnlocked?: string[]; // Unlocked region mascots
  isAdmin?: boolean; // Admin flag
  createdAt: string;
}

export interface UserPublic {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}


export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface Nutrition {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export type RecipeTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'high-protein'
  | 'low-carb'
  | 'low-fat'
  | 'keto'
  | 'paleo'
  | 'quick'
  | 'meal-prep'
  | 'budget-friendly'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  // Region-specific tags
  | 'chinese'
  | 'asian'
  | 'japanese'
  | 'korean'
  | 'european'
  | 'german'
  | 'italian'
  | 'french'
  | 'spicy'
  | 'fermented'
  | 'noodles'
  | 'dumplings'
  | 'sushi'
  | 'ramen'
  | 'pasta'
  | 'bread'
  | 'baked';

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: RecipeTag[];
  mainImage: string;
  gallery?: string[];
  nutrition: Nutrition;
  region?: RegionId; // Which culinary region this belongs to
  rank?: RecipeRank; // Recipe difficulty/rarity rank
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeInput {
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: RecipeTag[];
  mainImage?: string;
  gallery?: string[];
  nutrition?: Partial<Nutrition>;
}


export interface MealItem {
  recipeId: string | null;
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

export interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snacks?: MealItem[];
}

export interface WeeklyPlan {
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
  sunday: DayMeals;
}

export interface DailyCalories {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface NutritionSummary {
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgCalories: number;
}

export interface MealPlan {
  _id: string;
  userId: string;
  weekKey: string;
  weeklyPlan: WeeklyPlan;
  totalDailyCalories: DailyCalories;
  nutritionSummary: NutritionSummary;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}


export interface RecipeFilters {
  search?: string;
  tags?: RecipeTag[];
  region?: RegionId; // Filter by culinary region
  maxCalories?: number;
  minCalories?: number;
  maxTime?: number;
  authorId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}


export interface HealthMetrics {
  bmi: number;
  bmiCategory: string;
  tdee: number;
}
