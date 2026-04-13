import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, Plus, Trash2, Loader2, Image, Clock, Users, 
  ChefHat, Sparkles, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recipeApi } from '../../services/api';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils';
import type { RecipeTag } from '../../types';

const recipeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  prepTime: z.number().min(1).max(1440),
  cookTime: z.number().min(0).max(1440),
  servings: z.number().min(1).max(100),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().min(0.01),
    unit: z.string().min(1),
    notes: z.string().optional(),
  })).min(1),
  steps: z.array(z.object({ value: z.string().min(1) })).min(1),
  tags: z.array(z.string()).min(1),
  mainImage: z.string().optional(),
});

type RecipeForm = z.infer<typeof recipeSchema>;

const ALL_TAGS: RecipeTag[] = [
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert',
  'vegan', 'vegetarian', 'gluten-free', 'dairy-free',
  'high-protein', 'low-carb', 'quick', 'meal-prep', 'budget-friendly'
];

const UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'pinch', 'to taste'];

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [imagePreview, setImagePreview] = useState<string>('');

  const { data, isLoading: isLoadingRecipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeApi.getRecipeById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
  });

  const { fields: ingredientFields, append: addIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: stepFields, append: addStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps',
  });

  const selectedTags = watch('tags') || [];

  useEffect(() => {
    if (data?.recipe) {
      const recipe = data.recipe;
      reset({
        title: recipe.title,
        description: recipe.description,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        ingredients: recipe.ingredients,
        steps: recipe.steps.map((s) => ({ value: s })),
        tags: recipe.tags,
        mainImage: recipe.mainImage,
      });
      setImagePreview(recipe.mainImage || '');
    }
  }, [data, reset]);

  const toggleTag = (tag: string) => {
    const current = selectedTags;
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    setValue('tags', updated);
  };

  const updateMutation = useMutation({
    mutationFn: (formData: RecipeForm) => recipeApi.updateRecipe(id!, {
      ...formData,
      steps: formData.steps.map((s) => s.value),
      tags: formData.tags as RecipeTag[],
    }),
    onSuccess: () => {
      toast.success('Recipe updated! ✨');
      navigate(`/recipes/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update recipe');
    },
  });

  const onSubmit = (formData: RecipeForm) => {
    updateMutation.mutate(formData);
  };

  if (isLoadingRecipe) {
    return (
      <div className="container-page py-6">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="space-y-6">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold">{t('recipes.editRecipe')}</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your recipe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
        {/* Basic Info */}
        <div className="card p-6 space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary-500" />
            Basic Information
          </h2>

          <div>
            <label className="label">Recipe Title *</label>
            <input
              {...register('title')}
              className={cn('input', errors.title && 'input-error')}
            />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              {...register('description')}
              rows={3}
              className={cn('input resize-none', errors.description && 'input-error')}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label flex items-center gap-1">
                <Clock className="w-4 h-4" /> Prep (min)
              </label>
              <input
                type="number"
                {...register('prepTime', { valueAsNumber: true })}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Clock className="w-4 h-4" /> Cook (min)
              </label>
              <input
                type="number"
                {...register('cookTime', { valueAsNumber: true })}
                className="input"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Users className="w-4 h-4" /> Servings
              </label>
              <input
                type="number"
                {...register('servings', { valueAsNumber: true })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1">
              <Image className="w-4 h-4" /> Image URL
            </label>
            <input
              {...register('mainImage')}
              className="input"
              onChange={(e) => setImagePreview(e.target.value)}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-3 rounded-xl max-h-48 object-cover" />
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Tags *
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  selectedTags.includes(tag)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Ingredients *</h2>
          <div className="space-y-3">
            {ingredientFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap sm:flex-nowrap gap-2 items-start"
              >
                <input
                  type="number"
                  step="0.01"
                  {...register(`ingredients.${index}.amount`, { valueAsNumber: true })}
                  className="input w-20"
                />
                <select {...register(`ingredients.${index}.unit`)} className="input w-24">
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <input
                  {...register(`ingredients.${index}.name`)}
                  className="input flex-1 min-w-[120px]"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredientFields.length === 1}
                  className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addIngredient({ name: '', amount: 1, unit: 'g', notes: '' })}
            className="btn-ghost mt-4"
          >
            <Plus className="w-4 h-4" /> Add Ingredient
          </button>
        </div>

        {/* Steps */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Instructions *</h2>
          <div className="space-y-3">
            {stepFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 items-start"
              >
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-sm">
                  {index + 1}
                </div>
                <textarea
                  {...register(`steps.${index}.value`)}
                  rows={2}
                  className="input flex-1 resize-none"
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  disabled={stepFields.length === 1}
                  className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addStep({ value: '' })}
            className="btn-ghost mt-4"
          >
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1">
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
