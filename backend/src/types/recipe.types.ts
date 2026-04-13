import { Document, Types } from 'mongoose';

export interface IIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface INutrition {
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
  | 'dessert';

export interface IRecipe extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  ingredients: IIngredient[];
  steps: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  tags: RecipeTag[];
  mainImage: string;
  gallery?: string[];
  nutrition: INutrition;
  authorId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecipeInput {
  title: string;
  description: string;
  ingredients: IIngredient[];
  steps: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: RecipeTag[];
  mainImage?: string;
  gallery?: string[];
  nutrition?: Partial<INutrition>;
}

export interface IRecipeWithAuthor extends Omit<IRecipe, 'authorId'> {
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
}
