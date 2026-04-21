import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Image,
  Clock,
  Users,
  ChefHat,
  Sparkles,
  Save,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recipeApi } from '../../services/api';
import api from '../../services/api';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils';
import type { RecipeTag } from '../../types';

const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
  prepTime: z.number().min(1).max(1440),
  cookTime: z.number().min(0).max(1440),
  servings: z.number().min(1).max(100),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, 'Ingredient name is required'),
        amount: z.number().min(0.01, 'Amount must be greater than 0'),
        unit: z.string().min(1, 'Unit is required'),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one ingredient is required'),
  steps: z
    .array(
      z.object({
        value: z.string().min(1, 'Step cannot be empty'),
      })
    )
    .min(1, 'At least one step is required'),
  tags: z.array(z.string()).min(1, 'Select at least one tag'),
  mainImage: z.string().optional(),
});

type RecipeForm = z.infer<typeof recipeSchema>;

const ALL_TAGS: RecipeTag[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'dessert',
  'vegan',
  'vegetarian',
  'gluten-free',
  'dairy-free',
  'high-protein',
  'low-carb',
  'quick',
  'meal-prep',
  'budget-friendly',
];

const UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'pinch', 'to taste'];

export default function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [imagePreview, setImagePreview] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    defaultValues: {
      title: '',
      description: '',
      prepTime: 15,
      cookTime: 0,
      servings: 1,
      ingredients: [{ name: '', amount: 1, unit: 'g', notes: '' }],
      steps: [{ value: '' }],
      tags: [],
      mainImage: '',
    },
  });

  const {
    fields: ingredientFields,
    append: addIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: stepFields,
    append: addStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: 'steps',
  });

  const selectedTags = watch('tags') || [];

  useEffect(() => {
    if (data?.recipe) {
      const recipe = data.recipe;

      reset({
        title: recipe.title ?? '',
        description: recipe.description ?? '',
        prepTime: recipe.prepTime ?? 15,
        cookTime: recipe.cookTime ?? 0,
        servings: recipe.servings ?? 1,
        ingredients:
          recipe.ingredients?.length > 0
            ? recipe.ingredients.map((ingredient: any) => ({
                name: ingredient.name ?? '',
                amount: ingredient.amount ?? 1,
                unit: ingredient.unit ?? 'g',
                notes: ingredient.notes ?? '',
              }))
            : [{ name: '', amount: 1, unit: 'g', notes: '' }],
        steps:
          recipe.steps?.length > 0
            ? recipe.steps.map((step: string) => ({ value: step }))
            : [{ value: '' }],
        tags: recipe.tags ?? [],
        mainImage: recipe.mainImage ?? '',
      });

      setImagePreview(recipe.mainImage ?? '');
      setSelectedImageFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [data, reset]);

  const toggleTag = (tag: string) => {
    const updated = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setValue('tags', updated, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)');
      return;
    }

    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setValue('mainImage', '', {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview('');
    setValue('mainImage', '', {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.url;
  };

  const updateMutation = useMutation({
    mutationFn: (formData: RecipeForm) =>
      recipeApi.updateRecipe(id!, {
        ...formData,
        steps: formData.steps.map((s) => s.value),
        tags: formData.tags as RecipeTag[],
      }),
  onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ['recipe', id] });
  await queryClient.invalidateQueries({ queryKey: ['recipes'] });

  toast.success('Recipe updated! ✨');
  navigate(`/recipes/${id}`);
},
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update recipe');
    },
  });

  const onSubmit = async (formData: RecipeForm) => {
    try {
      let finalImageUrl = formData.mainImage || '';

      if (selectedImageFile) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(selectedImageFile);
        } finally {
          setIsUploadingImage(false);
        }
      }

      updateMutation.mutate({
        ...formData,
        mainImage: finalImageUrl,
      });
    } catch (error) {
      setIsUploadingImage(false);
      toast.error('Image upload failed');
    }
  };

  const mainImageRegister = register('mainImage');

  if (isLoadingRecipe) {
    return (
      <div className="min-h-screen bg-black/30">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-6 h-8 w-56 animate-pulse rounded bg-white/20" />
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-40 animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/30">
      <div className="mx-auto max-w-4xl px-4 py-8 pb-20">
        <div className="mb-8 flex items-center gap-4 text-white">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {t('recipes.editRecipe') || 'Редактирайте рецептата'}
            </h1>
            <p className="text-sm text-white/75">
              {t('recipes.updateRecipe') || 'Обновете рецептата'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ChefHat className="h-5 w-5 text-orange-500" />
              Информация
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Заглавие на рецепта *
                </label>
                <input
                  {...register('title')}
                  className={cn(
                    'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                    'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                    errors.title && 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  )}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Описание *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={cn(
                    'w-full resize-none rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                    'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                    errors.description && 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  )}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4" />
                    Подготовка (мин)
                  </label>
                  <input
                    type="number"
                    {...register('prepTime', { valueAsNumber: true })}
                    className={cn(
                      'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                      'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                      errors.prepTime && 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    )}
                  />
                  {errors.prepTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.prepTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4" />
                    Готвене (мин)
                  </label>
                  <input
                    type="number"
                    {...register('cookTime', { valueAsNumber: true })}
                    className={cn(
                      'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                      'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                      errors.cookTime && 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    )}
                  />
                  {errors.cookTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.cookTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4" />
                    Порции
                  </label>
                  <input
                    type="number"
                    {...register('servings', { valueAsNumber: true })}
                    className={cn(
                      'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                      'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                      errors.servings && 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    )}
                  />
                  {errors.servings && (
                    <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Image className="h-4 w-4" />
                    Качи снимка
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={`${imagePreview}?t=${Date.now()}`}
                        alt="Preview"
                        className="w-full max-h-64 rounded-xl border border-gray-200 object-cover"
                        onError={() => setImagePreview('')}
                      />

                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-full bg-white p-2 shadow hover:bg-gray-100"
                        >
                          <Upload className="h-4 w-4 text-gray-700" />
                        </button>

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="rounded-full bg-red-500 p-2 shadow hover:bg-red-600"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                        <Upload className="h-6 w-6 text-orange-500" />
                      </div>
                      <span className="font-medium text-gray-700">Избери снимка</span>
                      <span className="text-sm text-gray-500">PNG, JPG, WEBP (макс. 5MB)</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Image className="h-4 w-4" />
                    Снимка URL
                  </label>
                  <input
                    {...mainImageRegister}
                    onChange={(e) => {
                      mainImageRegister.onChange(e);
                      setImagePreview(e.target.value);
                      setSelectedImageFile(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className={cn(
                      'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                      'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Тагове *
            </h2>

            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium capitalize transition',
                      isSelected
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {errors.tags && (
              <p className="mt-3 text-sm text-red-600">{errors.tags.message}</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Ingredients *</h2>

            <div className="space-y-3">
              {ingredientFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 md:flex-row md:items-start"
                >
                  <div className="md:w-28">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`ingredients.${index}.amount`, {
                        valueAsNumber: true,
                      })}
                      className={cn(
                        'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                        'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                        errors.ingredients?.[index]?.amount &&
                          'border-red-500 focus:border-red-500 focus:ring-red-200'
                      )}
                    />
                  </div>

                  <div className="md:w-36">
                    <select
                      {...register(`ingredients.${index}.unit`)}
                      className={cn(
                        'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                        'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                        errors.ingredients?.[index]?.unit &&
                          'border-red-500 focus:border-red-500 focus:ring-red-200'
                      )}
                    >
                      {UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <input
                      {...register(`ingredients.${index}.name`)}
                      className={cn(
                        'w-full rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                        'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                        errors.ingredients?.[index]?.name &&
                          'border-red-500 focus:border-red-500 focus:ring-red-200'
                      )}
                      placeholder="Ingredient name"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientFields.length === 1}
                    className="self-start rounded-xl p-3 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {typeof errors.ingredients?.message === 'string' && (
              <p className="mt-3 text-sm text-red-600">{errors.ingredients.message}</p>
            )}

            <button
              type="button"
              onClick={() => addIngredient({ name: '', amount: 1, unit: 'g', notes: '' })}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
              Добавете съставка
            </button>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/95 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Инструкции *</h2>

            <div className="space-y-3">
              {stepFields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <textarea
                      {...register(`steps.${index}.value`)}
                      rows={3}
                      className={cn(
                        'w-full resize-none rounded-xl border bg-white px-4 py-3 text-gray-900 outline-none transition',
                        'border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200',
                        errors.steps?.[index]?.value &&
                          'border-red-500 focus:border-red-500 focus:ring-red-200'
                      )}
                      placeholder={`Step ${index + 1}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    disabled={stepFields.length === 1}
                    className="rounded-xl p-3 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {typeof errors.steps?.message === 'string' && (
              <p className="mt-3 text-sm text-red-600">{errors.steps.message}</p>
            )}

            <button
              type="button"
              onClick={() => addStep({ value: '' })}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
              Добавете стъпка
            </button>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/20"
            >
              Откажете
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending || isUploadingImage}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending || isUploadingImage ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isUploadingImage ? 'Качване на снимка...' : null}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Запазете промените
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}