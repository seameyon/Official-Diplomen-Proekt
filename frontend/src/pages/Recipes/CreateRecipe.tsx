import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Plus, Trash2, Loader2, Image, Clock, Users, 
  ChefHat, Sparkles, MapPin, Upload, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { recipeApi } from '../../services/api';
import api from '../../services/api';
import { cn } from '../../utils';
import { ALL_REGIONS } from '../../config/regions';
import { useThemeStore } from '../../context/themeStore';

const ALL_TAGS = [
  { value: 'breakfast', labelBg: 'Закуска', labelEn: 'Breakfast' },
  { value: 'lunch', labelBg: 'Обяд', labelEn: 'Lunch' },
  { value: 'dinner', labelBg: 'Вечеря', labelEn: 'Dinner' },
  { value: 'snack', labelBg: 'Снакс', labelEn: 'Snack' },
  { value: 'dessert', labelBg: 'Десерт', labelEn: 'Dessert' },
  { value: 'vegetarian', labelBg: 'Вегетарианско', labelEn: 'Vegetarian' },
  { value: 'vegan', labelBg: 'Веганско', labelEn: 'Vegan' },
  { value: 'quick', labelBg: 'Бързо', labelEn: 'Quick' },
  { value: 'healthy', labelBg: 'Здравословно', labelEn: 'Healthy' },
  { value: 'spicy', labelBg: 'Лютиво', labelEn: 'Spicy' },
];

const UNITS = ['г', 'кг', 'мл', 'л', 'ч.л.', 'с.л.', 'бр', 'щипка', 'по вкус'];

interface FormData {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  region: string;
  ingredients: { name: string; amount: number; unit: string }[];
  steps: { value: string }[];
  tags: string[];
  mainImage: string;
}

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { language } = useThemeStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    newRecipe: language === 'bg' ? 'Нова рецепта' : 'New Recipe',
    shareCreation: language === 'bg' ? 'Сподели своята кулинарна творба' : 'Share your culinary creation',
    basicInfo: language === 'bg' ? 'Основна информация' : 'Basic Information',
    title: language === 'bg' ? 'Заглавие' : 'Title',
    titlePlaceholder: language === 'bg' ? 'напр. Домашна мусака' : 'e.g. Homemade Moussaka',
    description: language === 'bg' ? 'Описание' : 'Description',
    descriptionPlaceholder: language === 'bg' ? 'Кратко описание на рецептата...' : 'Short description of the recipe...',
    uploadImage: language === 'bg' ? 'Снимка на ястието' : 'Dish Photo',
    chooseImage: language === 'bg' ? 'Избери снимка' : 'Choose Image',
    changeImage: language === 'bg' ? 'Смени снимката' : 'Change Image',
    prepTime: language === 'bg' ? 'Подготовка (мин)' : 'Prep Time (min)',
    cookTime: language === 'bg' ? 'Готвене (мин)' : 'Cook Time (min)',
    servings: language === 'bg' ? 'Порции' : 'Servings',
    region: language === 'bg' ? 'Регион' : 'Region',
    regionOptional: language === 'bg' ? 'Изберете регион (по избор)' : 'Select region (optional)',
    tags: language === 'bg' ? 'Тагове' : 'Tags',
    ingredients: language === 'bg' ? 'Съставки' : 'Ingredients',
    ingredientPlaceholder: language === 'bg' ? 'Съставка' : 'Ingredient',
    addIngredient: language === 'bg' ? 'Добави съставка' : 'Add Ingredient',
    steps: language === 'bg' ? 'Стъпки за приготвяне' : 'Preparation Steps',
    stepPlaceholder: language === 'bg' ? 'Стъпка' : 'Step',
    addStep: language === 'bg' ? 'Добави стъпка' : 'Add Step',
    cancel: language === 'bg' ? 'Отказ' : 'Cancel',
    publish: language === 'bg' ? 'Публикувай рецепта' : 'Publish Recipe',
    creating: language === 'bg' ? 'Създаване...' : 'Creating...',
    required: language === 'bg' ? 'Задължително поле' : 'Required field',
    created: language === 'bg' ? 'Рецептата е създадена!' : 'Recipe created!',
    error: language === 'bg' ? 'Грешка при създаване' : 'Error creating recipe',
    uploadError: language === 'bg' ? 'Грешка при качване на снимката' : 'Error uploading image',
  };

  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      region: '',
      ingredients: [{ name: '', amount: 1, unit: 'г' }],
      steps: [{ value: '' }],
      tags: [],
      mainImage: '',
    },
  });

  const { fields: ingredientFields, append: addIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: stepFields, append: addStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps',
  });

 
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      if (!file.type.startsWith('image/')) {
        toast.error(language === 'bg' ? 'Моля изберете снимка' : 'Please select an image');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'bg' ? 'Снимката е твърде голяма (макс. 5MB)' : 'Image too large (max 5MB)');
        return;
      }
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
     
      let imageUrl = '';
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          toast.error(t.uploadError);
          throw error;
        } finally {
          setUploadingImage(false);
        }
      }
      
      
      return recipeApi.createRecipe({
        ...data,
        mainImage: imageUrl,
      });
    },
    onSuccess: (result) => {
      toast.success(t.created);
      navigate(`/recipes/${result.recipe._id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t.error);
    },
  });

  const onSubmit = (data: FormData) => {
    const recipe = {
      ...data,
      tags: selectedTags,
      steps: data.steps.map(s => s.value),
      nutrition: {
        calories: Math.round(data.servings * 150),
        protein: Math.round(data.servings * 10),
        carbs: Math.round(data.servings * 20),
        fat: Math.round(data.servings * 8),
      },
    };
    createMutation.mutate(recipe);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-orange-100 dark:hover:bg-wood-700 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-cream-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-cream-100">{t.newRecipe}</h1>
          <p className="text-gray-500 dark:text-cream-400">{t.shareCreation}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 border-2 border-orange-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-cream-100">
            <ChefHat className="w-5 h-5 text-orange-500 dark:text-forest-500" />
            {t.basicInfo}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                {t.title} *
              </label>
              <input
                {...register('title', { required: t.required })}
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500 focus:border-transparent"
                placeholder={t.titlePlaceholder}
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                {t.description} *
              </label>
              <textarea
                {...register('description', { required: t.required })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500 resize-none"
                placeholder={t.descriptionPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                <Image className="w-4 h-4 inline mr-1" />
                {t.uploadImage}
              </label>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {/* Image preview or upload button */}
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-orange-200 dark:border-wood-600"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white dark:bg-wood-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-wood-600 transition-colors"
                    >
                      <Upload className="w-4 h-4 text-gray-600 dark:text-cream-300" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-orange-300 dark:border-wood-500 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-orange-500 dark:hover:border-forest-500 hover:bg-orange-50 dark:hover:bg-wood-700/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-wood-700 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-orange-500 dark:text-forest-400" />
                  </div>
                  <span className="text-gray-600 dark:text-cream-300 font-medium">
                    {t.chooseImage}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-cream-500">
                    PNG, JPG, WEBP (макс. 5MB)
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t.prepTime}
                </label>
                <input
                  type="number"
                  {...register('prepTime', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {t.cookTime}
                </label>
                <input
                  type="number"
                  {...register('cookTime', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  {t.servings}
                </label>
                <input
                  type="number"
                  {...register('servings', { valueAsNumber: true })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Region */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 border-2 border-orange-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-cream-100">
            <MapPin className="w-5 h-5 text-orange-500 dark:text-forest-500" />
            {t.region}
          </h2>
          <p className="text-sm text-gray-500 dark:text-cream-400 mb-4">{t.regionOptional}</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {ALL_REGIONS.map((region) => {
              const isSelected = watch('region') === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => setValue('region', isSelected ? '' : region.id)}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    isSelected
                      ? 'border-orange-500 dark:border-forest-500 bg-orange-50 dark:bg-forest-900/30'
                      : 'border-orange-200 dark:border-wood-600 hover:border-orange-400 dark:hover:border-forest-600'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{region.flag}</span>
                    <p className="font-semibold text-gray-900 dark:text-cream-100">
                      {language === 'bg' ? region.nameBg : region.name}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-cream-400">
                    {language === 'bg' ? region.cuisineBg : region.cuisine}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 border-2 border-orange-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-cream-100">
            <Sparkles className="w-5 h-5 text-orange-500 dark:text-forest-500" />
            {t.tags}
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedTags.includes(tag.value)
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white'
                    : 'bg-orange-50 dark:bg-wood-700 text-gray-700 dark:text-cream-300 border-2 border-orange-200 dark:border-wood-600 hover:border-orange-400 dark:hover:border-forest-600'
                )}
              >
                {language === 'bg' ? tag.labelBg : tag.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 border-2 border-orange-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-cream-100">
            {t.ingredients} *
          </h2>

          <div className="space-y-3">
            {ingredientFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 items-start"
              >
                <input
                  {...register(`ingredients.${index}.name` as const)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 text-sm"
                  placeholder={t.ingredientPlaceholder}
                />
                <input
                  type="number"
                  step="0.1"
                  {...register(`ingredients.${index}.amount` as const, { valueAsNumber: true })}
                  className="w-20 px-3 py-2 rounded-lg border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 text-sm"
                  placeholder="100"
                />
                <select
                  {...register(`ingredients.${index}.unit` as const)}
                  className="w-24 px-3 py-2 rounded-lg border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 text-sm"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addIngredient({ name: '', amount: 1, unit: 'г' })}
            className="mt-4 flex items-center gap-2 text-orange-500 dark:text-forest-400 hover:text-orange-600 dark:hover:text-forest-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            {t.addIngredient}
          </button>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 border-2 border-orange-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-cream-100">
            {t.steps} *
          </h2>

          <div className="space-y-3">
            {stepFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2"
              >
                <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <textarea
                  {...register(`steps.${index}.value` as const)}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 text-sm resize-none"
                  placeholder={`${t.stepPlaceholder} ${index + 1}...`}
                />
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addStep({ value: '' })}
            className="mt-4 flex items-center gap-2 text-orange-500 dark:text-forest-400 hover:text-orange-600 dark:hover:text-forest-300 font-medium"
          >
            <Plus className="w-4 h-4" />
            {t.addStep}
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 rounded-xl font-semibold border-2 border-orange-200 dark:border-wood-600 text-gray-700 dark:text-cream-300 hover:bg-orange-50 dark:hover:bg-wood-700 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || uploadingImage}
            className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 hover:from-orange-600 hover:to-amber-600 dark:hover:from-forest-500 dark:hover:to-forest-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {createMutation.isPending || uploadingImage ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploadingImage ? (language === 'bg' ? 'Качване на снимка...' : 'Uploading image...') : t.creating}
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5" />
                {t.publish}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
