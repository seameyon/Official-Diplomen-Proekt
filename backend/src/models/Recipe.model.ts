import mongoose, { Schema } from 'mongoose';
import { IRecipe, IIngredient, INutrition, RecipeTag } from '../types/recipe.types.js';

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
  notes: { type: String, trim: true },
}, { _id: false });

const NutritionSchema = new Schema<INutrition>({
  calories: { type: Number, required: true, min: 0 },
  protein: { type: Number, min: 0 },
  carbs: { type: Number, min: 0 },
  fat: { type: Number, min: 0 },
  fiber: { type: Number, min: 0 },
  sugar: { type: Number, min: 0 },
  sodium: { type: Number, min: 0 },
}, { _id: false });

const RECIPE_TAGS: RecipeTag[] = [
  'vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free',
  'high-protein', 'low-carb', 'low-fat', 'keto', 'paleo',
  'quick', 'meal-prep', 'budget-friendly',
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert'
];

const REGIONS = ['liyun', 'sakuraya', 'mondberg', 'fontalis', 'sumera'];

const RecipeSchema = new Schema<IRecipe>({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 3,
    maxlength: 150 
  },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 10,
    maxlength: 2000 
  },
  ingredients: { 
    type: [IngredientSchema], 
    required: true,
    validate: {
      validator: (v: IIngredient[]) => v.length > 0,
      message: 'Recipe must have at least one ingredient'
    }
  },
  steps: { 
    type: [String], 
    required: true,
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'Recipe must have at least one step'
    }
  },
  prepTime: { type: Number, required: true, min: 0 },
  cookTime: { type: Number, required: true, min: 0 },
  servings: { type: Number, required: true, min: 1, max: 100 },
  region: { 
    type: String, 
    enum: [...REGIONS, ''],
    default: ''
  },
  tags: { 
    type: [String], 
    validate: {
      validator: (v: string[]) => v.length <= 10,
      message: 'Recipe can have at most 10 tags'
    }
  },
  mainImage: { type: String, required: true },
  gallery: [{ type: String }],
  nutrition: { type: NutritionSchema, required: true },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

RecipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

RecipeSchema.index({ title: 'text', description: 'text' });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ region: 1 });
RecipeSchema.index({ 'nutrition.calories': 1 });
RecipeSchema.index({ createdAt: -1 });
RecipeSchema.index({ authorId: 1, createdAt: -1 });

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);
export default Recipe;
