import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  Flame,
  Edit,
  Trash2,
  Check,
  Loader2,
  ChefHat,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recipeApi, favoriteApi } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';

interface RecipeAuthor {
  _id: string;
  username?: string;
  avatar?: string;
}

interface RecipeIngredient {
  name: string;
  amount?: number;
  unit?: string;
}

interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Recipe {
  _id: string;
  title: string;
  description?: string;
  mainImage?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  nutrition?: RecipeNutrition;
  author?: RecipeAuthor;
  isFavorited?: boolean;
}

interface RecipeResponse {
  recipe: Recipe;
}

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useThemeStore();

  const [servings, setServings] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id?.startsWith('mealdb_')) {
      navigate(`/recipes/api/${id}`, { replace: true });
    }
  }, [id, navigate]);

  const t = {
    loading: language === 'bg' ? 'Зареждане на рецептата...' : 'Loading recipe...',
    notFound: language === 'bg' ? 'Рецептата не е намерена' : 'Recipe not found',
    backToRecipes: language === 'bg' ? 'Към рецептите' : 'Back to recipes',
    ingredients: language === 'bg' ? 'Съставки' : 'Ingredients',
    servings: language === 'bg' ? 'порции' : 'servings',
    steps: language === 'bg' ? 'Стъпки' : 'Steps',
    nutrition: language === 'bg' ? 'Хранителна стойност' : 'Nutrition',
    calories: language === 'bg' ? 'Калории' : 'Calories',
    protein: language === 'bg' ? 'Протеин' : 'Protein',
    carbs: language === 'bg' ? 'Въглехидрати' : 'Carbs',
    fat: language === 'bg' ? 'Мазнини' : 'Fat',
    edit: language === 'bg' ? 'Редактирай' : 'Edit',
    delete: language === 'bg' ? 'Изтрий' : 'Delete',
    deleted: language === 'bg' ? 'Рецептата е изтрита' : 'Recipe deleted',
    addedFav: language === 'bg' ? 'Добавено в любими!' : 'Added to favorites!',
    removedFav: language === 'bg' ? 'Премахнато от любими' : 'Removed from favorites',
    loginFirst: language === 'bg' ? 'Влез в профила си' : 'Please login first',
    min: language === 'bg' ? 'мин' : 'min',
    confirmDelete: language === 'bg' ? 'Сигурен ли си?' : 'Are you sure?',
  };

  const { data, isLoading, error } = useQuery<RecipeResponse>({
    queryKey: ['recipe', id],
    queryFn: () => recipeApi.getRecipeById(id!),
    enabled: !!id && !id.startsWith('mealdb_'),
  });

  const recipe = data?.recipe;
  const isOwner = !!(recipe && user && recipe.author && user._id === recipe.author._id);

  useEffect(() => {
    if (!recipe) return;

    setServings(recipe.servings || 4);
    setIsFavorited(!!recipe.isFavorited);
  }, [recipe]);

  const favoriteMutation = useMutation({
    mutationFn: () => favoriteApi.toggleFavorite(id!),
    onSuccess: (result) => {
      setIsFavorited(result.isFavorited);
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(result.isFavorited ? t.addedFav : t.removedFav);
    },
    onError: () => {
      toast.error(t.loginFirst);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => recipeApi.deleteRecipe(id!),
    onSuccess: () => {
      toast.success(t.deleted);
      navigate('/recipes');
    },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error(t.loginFirst);
      return;
    }

    favoriteMutation.mutate();
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const scaleAmount = (amount: number) => {
    if (!recipe || !recipe.servings) return amount;
    return Math.round((amount / recipe.servings) * servings * 100) / 100;
  };

  if (id?.startsWith('mealdb_')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-forest-600 mx-auto mb-4" />
        <p className="text-wood-500 dark:text-cream-400">{t.loading}</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ChefHat className="w-16 h-16 text-wood-300 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-4">
          {t.notFound}
        </h2>
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500"
        >
          {t.backToRecipes}
        </Link>
      </div>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="pb-20">
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <img
          src={
            recipe.mainImage ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
          }
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wood-900/80 via-wood-900/40 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-cream-100/90 dark:bg-wood-800/90 text-wood-800 dark:text-cream-100 hover:bg-cream-200 dark:hover:bg-wood-700 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleFavorite}
            disabled={favoriteMutation.isPending}
            className={cn(
              'p-3 rounded-full shadow-lg transition-all',
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-cream-100/90 dark:bg-wood-800/90 text-wood-600 hover:bg-red-500 hover:text-white'
            )}
          >
            {favoriteMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={cn('w-5 h-5', isFavorited && 'fill-current')} />
            )}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-cream-100 mb-3">
            {recipe.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-cream-200">
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5 bg-wood-900/50 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                {totalTime} {t.min}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1.5 bg-wood-900/50 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                {recipe.servings} {t.servings}
              </span>
            )}
            {recipe.nutrition?.calories && (
              <span className="flex items-center gap-1.5 bg-wood-900/50 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4" />
                {recipe.nutrition.calories} kcal
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {recipe.description && (
          <p className="text-lg text-wood-600 dark:text-cream-400 mb-8 leading-relaxed">
            {recipe.description}
          </p>
        )}

        {isOwner && (
          <div className="flex gap-3 mb-8">
            <Link
              to={`/recipes/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-600 text-white font-medium hover:bg-forest-500 transition-colors"
            >
              <Edit className="w-4 h-4" />
              {t.edit}
            </Link>
            <button
              onClick={() => {
                if (confirm(t.confirmDelete)) {
                  deleteMutation.mutate();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t.delete}
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-4">
                {t.ingredients}
              </h2>

              <div className="flex items-center gap-3 mb-6 p-3 bg-wood-200 dark:bg-wood-700 rounded-xl">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-8 h-8 rounded-full bg-cream-100 dark:bg-wood-600 text-wood-800 dark:text-cream-100 font-bold hover:bg-forest-500 hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium text-wood-800 dark:text-cream-100">
                  {servings} {t.servings}
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-8 h-8 rounded-full bg-cream-100 dark:bg-wood-600 text-wood-800 dark:text-cream-100 font-bold hover:bg-forest-500 hover:text-white transition-colors"
                >
                  +
                </button>
              </div>

              <ul className="space-y-3">
                {recipe.ingredients?.map((ing, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-wood-700 dark:text-cream-300"
                  >
                    <span className="w-2 h-2 rounded-full bg-forest-500 mt-2 flex-shrink-0" />
                    <span>
                      <strong>
                        {scaleAmount(ing.amount || 1)} {ing.unit || ''}
                      </strong>{' '}
                      {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-6">
              {t.steps}
            </h2>

            <div className="space-y-4">
              {recipe.steps?.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => toggleStep(idx)}
                  className={cn(
                    'flex gap-4 p-4 rounded-xl cursor-pointer transition-all border-2',
                    completedSteps.includes(idx)
                      ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-300 dark:border-forest-700'
                      : 'bg-cream-100 dark:bg-wood-800 border-wood-200 dark:border-wood-600 hover:border-forest-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition-colors',
                      completedSteps.includes(idx)
                        ? 'bg-forest-500 text-white'
                        : 'bg-wood-200 dark:bg-wood-700 text-wood-600 dark:text-cream-300'
                    )}
                  >
                    {completedSteps.includes(idx) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <p
                    className={cn(
                      'flex-1 text-wood-700 dark:text-cream-300 leading-relaxed',
                      completedSteps.includes(idx) && 'line-through opacity-60'
                    )}
                  >
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>

            {recipe.nutrition && (
              <div className="mt-8 bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600">
                <h2 className="text-xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-4">
                  {t.nutrition}
                </h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-forest-600">
                      {recipe.nutrition.calories || 0}
                    </p>
                    <p className="text-sm text-wood-500 dark:text-cream-400">
                      {t.calories}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">
                      {recipe.nutrition.protein || 0}g
                    </p>
                    <p className="text-sm text-wood-500 dark:text-cream-400">
                      {t.protein}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">
                      {recipe.nutrition.carbs || 0}g
                    </p>
                    <p className="text-sm text-wood-500 dark:text-cream-400">
                      {t.carbs}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">
                      {recipe.nutrition.fat || 0}g
                    </p>
                    <p className="text-sm text-wood-500 dark:text-cream-400">
                      {t.fat}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}