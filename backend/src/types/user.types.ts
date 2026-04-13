import { Document, Types } from 'mongoose';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle';
export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'mediterranean';
export type CookingTime = 'quick' | 'normal' | 'elaborate' | 'meal_prep';
export type Budget = 'low' | 'medium' | 'high';

export interface IHealthProfile {
  // Basic info
  sex?: string;
  birthYear?: number;
  age?: number;
  
  // Body
  height?: number;
  weight?: number;
  targetWeight?: number;
  
  // Activity & Goals
  activityLevel?: string;
  goal?: string;
  
  // Diet
  dietaryPreference?: string;
  allergies?: string[];
  dislikedIngredients?: string[];
  
  // Preferences
  mealsPerDay?: number;
  cookingTime?: string;
  budget?: string;
  equipment?: string[];
  
  // Calculated
  bmr?: number;
  dailyCalorieTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
  completedAt?: Date;
  
  // Allow any other fields
  [key: string]: unknown;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  username: string;
  avatar?: string;
  bio?: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  healthProfile?: IHealthProfile;
  hasCompletedOnboarding: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'bg';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPublic {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

export interface IUserPrivate extends IUserPublic {
  email: string;
  isEmailVerified: boolean;
  isAdmin: boolean;
  healthProfile?: IHealthProfile;
  hasCompletedOnboarding: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'bg';
}
