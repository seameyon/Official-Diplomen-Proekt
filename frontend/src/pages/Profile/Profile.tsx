import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  LogOut,
  ChefHat,
  Heart,
  Calendar,
  Mail,
  Clock,
  Flame,
  Shield,
  Activity,
  Scale,
  Ruler,
  Target,
  Edit3,
  X,
  Save,
  Loader2,
  Camera,
  Trash2,
  TrendingDown,
  Minus,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { recipeApi, favoriteApi, userApi } from '../../services/api';
import { cn } from '../../utils';

interface HealthProfile {
  weight?: number;
  height?: number;
  birthYear?: number;
  sex?: string;
  gender?: string;
  activityLevel?: string;
  goal?: string;
}

interface RecipeItem {
  _id: string;
  title: string;
  mainImage?: string;
  prepTime?: number;
  cookTime?: number;
  nutrition?: {
    calories?: number;
  };
}

interface RecipesResponse {
  recipes: RecipeItem[];
  total?: number;
  page?: number;
  totalPages?: number;
}

interface FavoriteRecipe {
  _id?: string;
  title?: string;
  mainImage?: string;
}

interface FavoriteItem {
  _id: string;
  recipeId?: string;
  recipe?: FavoriteRecipe;
}

interface FavoritesResponse {
  favorites: FavoriteItem[];
}

const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

const getBMICategory = (
  bmi: number,
  language: string
): { label: string; color: string } => {
  if (bmi === 0) {
    return {
      label: language === 'bg' ? 'Няма данни' : 'No data',
      color: 'text-gray-500',
    };
  }
  if (bmi < 18.5) {
    return {
      label: language === 'bg' ? 'Поднормено тегло' : 'Underweight',
      color: 'text-blue-500',
    };
  }
  if (bmi < 25) {
    return {
      label: language === 'bg' ? 'Нормално тегло' : 'Normal weight',
      color: 'text-green-500',
    };
  }
  if (bmi < 30) {
    return {
      label: language === 'bg' ? 'Наднормено тегло' : 'Overweight',
      color: 'text-yellow-500',
    };
  }
  return {
    label: language === 'bg' ? 'Затлъстяване' : 'Obese',
    color: 'text-red-500',
  };
};

const calculateDailyCalories = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string
): number => {
  if (!weight || !height || !age) return 0;

  let bmr: number;
  if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const multiplier = activityMultipliers[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
};

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const { language } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'recipes' | 'favorites' | 'health'>(
    'health'
  );
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editWeight, setEditWeight] = useState(0);
  const [editHeight, setEditHeight] = useState(0);
  const [editGoal, setEditGoal] = useState('maintain');

  const { data: recipesData } = useQuery<RecipesResponse>({
    queryKey: ['recipes', 'my', user?._id],
    queryFn: () => recipeApi.getAll({ authorId: user?._id, limit: 20 }),
    enabled: !!user?._id,
  });

  const { data: favoritesData } = useQuery<FavoritesResponse>({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getFavorites(),
    enabled: !!user,
  });

  const updateHealthMutation = useMutation({
    mutationFn: (data: Partial<HealthProfile>) => userApi.updateHealthProfile(data),
    onSuccess: () => {
      toast.success(language === 'bg' ? 'Данните са актуализирани!' : 'Data updated!');
      checkAuth();
      queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
      setShowQuickEdit(false);
    },
    onError: () => {
      toast.error(language === 'bg' ? 'Грешка при актуализиране' : 'Update error');
    },
  });

  const handleQuickEdit = () => {
    const healthProfile: HealthProfile = (user?.healthProfile || {}) as HealthProfile;
    setEditWeight(healthProfile.weight || 70);
    setEditHeight(healthProfile.height || 170);
    setEditGoal(healthProfile.goal || 'maintain');
    setShowQuickEdit(true);
  };

  const handleSaveQuickEdit = () => {
    const healthProfile: HealthProfile = (user?.healthProfile || {}) as HealthProfile;
    updateHealthMutation.mutate({
      ...healthProfile,
      weight: editWeight,
      height: editHeight,
      goal: editGoal,
    });
  };

  const isAdmin = user?.email === 'xzvelkosimeon@gmail.com' || user?.isAdmin;

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <User className="mx-auto mb-4 h-16 w-16 text-wood-300 dark:text-wood-600" />
        <h2 className="mb-2 text-2xl font-bold font-serif text-wood-800 dark:text-cream-100">
          {language === 'bg' ? 'Не сте влезли' : 'Not Logged In'}
        </h2>
        <p className="mb-6 text-wood-500 dark:text-cream-400">
          {language === 'bg'
            ? 'Влезте в профила си или се регистрирайте'
            : 'Log in or create an account'}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="rounded-xl bg-forest-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-forest-500"
          >
            {language === 'bg' ? 'Вход' : 'Login'}
          </Link>
          <Link
            to="/register"
            className="rounded-xl border-2 border-wood-300 px-6 py-3 font-semibold text-wood-700 transition-colors hover:border-forest-500 dark:border-wood-600 dark:text-cream-200"
          >
            {language === 'bg' ? 'Регистрация' : 'Register'}
          </Link>
        </div>
      </div>
    );
  }

  const myRecipes = recipesData?.recipes || [];
  const favorites = favoritesData?.favorites || [];

  const healthProfile: HealthProfile = (user.healthProfile || {}) as HealthProfile;
  const weight = healthProfile.weight || 0;
  const height = healthProfile.height || 0;
  const birthYear = healthProfile.birthYear || 0;
  const currentYear = new Date().getFullYear();
  const age = birthYear > 0 ? currentYear - birthYear : 0;
  const gender = healthProfile.sex || healthProfile.gender || 'male';
  const activityLevel = healthProfile.activityLevel || 'moderate';
  const goal = healthProfile.goal || 'maintain';

  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi, language);
  const dailyCalories = calculateDailyCalories(weight, height, age, gender, activityLevel);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bg' ? 'Моля, изберете изображение' : 'Please select an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        language === 'bg'
          ? 'Изображението е твърде голямо (макс. 5MB)'
          : 'Image too large (max 5MB)'
      );
      return;
    }

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await userApi.updateAvatar(base64);
        checkAuth();
        toast.success(language === 'bg' ? 'Снимката е обновена!' : 'Photo updated!');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error(language === 'bg' ? 'Грешка при качване' : 'Upload error');
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await userApi.updateAvatar('');
      checkAuth();
      toast.success(language === 'bg' ? 'Снимката е премахната' : 'Photo removed');
    } catch {
      toast.error(language === 'bg' ? 'Грешка' : 'Error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return language === 'bg' ? 'Неизвестно' : 'Unknown';
    try {
      return new Date(date).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return language === 'bg' ? 'Неизвестно' : 'Unknown';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const t = {
    settings: language === 'bg' ? 'Настройки' : 'Settings',
    logout: language === 'bg' ? 'Изход' : 'Logout',
    myRecipes: language === 'bg' ? 'Моите рецепти' : 'My Recipes',
    favorites: language === 'bg' ? 'Любими' : 'Favorites',
    health: language === 'bg' ? 'Здраве' : 'Health',
    memberSince: language === 'bg' ? 'Член от' : 'Member since',
    noRecipes: language === 'bg' ? 'Все още нямате рецепти' : 'No recipes yet',
    noFavorites: language === 'bg' ? 'Няма любими рецепти' : 'No favorites yet',
    createFirst: language === 'bg' ? 'Създайте първата си рецепта' : 'Create your first recipe',
    admin: language === 'bg' ? 'Админ панел' : 'Admin Panel',
    bmiTitle: language === 'bg' ? 'Индекс на телесна маса (BMI)' : 'Body Mass Index (BMI)',
    weight: language === 'bg' ? 'Тегло' : 'Weight',
    heightLabel: language === 'bg' ? 'Височина' : 'Height',
    ageLabel: language === 'bg' ? 'Възраст' : 'Age',
    dailyCaloriesLabel: language === 'bg' ? 'Дневни калории' : 'Daily Calories',
    goalLabel: language === 'bg' ? 'Цел' : 'Goal',
    noHealthData: language === 'bg' ? 'Няма въведени здравни данни' : 'No health data entered',
    updateInSettings: language === 'bg' ? 'Актуализирайте в настройките' : 'Update in settings',
    goals: {
      lose: language === 'bg' ? 'Отслабване' : 'Lose weight',
      lose_weight: language === 'bg' ? 'Отслабване' : 'Lose weight',
      maintain: language === 'bg' ? 'Поддържане' : 'Maintain weight',
      gain: language === 'bg' ? 'Качване' : 'Gain weight',
      gain_muscle: language === 'bg' ? 'Качване' : 'Gain muscle',
    },
    activityLevels: {
      sedentary: language === 'bg' ? 'Заседнал' : 'Sedentary',
      light: language === 'bg' ? 'Лека активност' : 'Light activity',
      moderate: language === 'bg' ? 'Умерена активност' : 'Moderate activity',
      active: language === 'bg' ? 'Активен' : 'Active',
      veryActive: language === 'bg' ? 'Много активен' : 'Very active',
    },
    quickEdit: language === 'bg' ? 'Бърза редакция' : 'Quick Edit',
    updateData: language === 'bg' ? 'Актуализирай данни' : 'Update Data',
    save: language === 'bg' ? 'Запази' : 'Save',
    cancel: language === 'bg' ? 'Отказ' : 'Cancel',
    saving: language === 'bg' ? 'Запазване...' : 'Saving...',
    weightKg: language === 'bg' ? 'Тегло (кг)' : 'Weight (kg)',
    selectGoal: language === 'bg' ? 'Избери цел' : 'Select Goal',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6">
      <AnimatePresence>
        {showQuickEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowQuickEdit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border-2 border-orange-200 bg-white p-6 dark:border-wood-600 dark:bg-wood-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-cream-100">
                  {t.quickEdit}
                </h2>
                <button
                  onClick={() => setShowQuickEdit(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-wood-700"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-cream-300">
                    <Scale className="mr-2 inline h-4 w-4" />
                    {t.weightKg}
                  </label>
                  <input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-orange-200 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-orange-500 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-100 dark:focus:ring-forest-500"
                    min={30}
                    max={300}
                    step={0.5}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-cream-300">
                    <Ruler className="mr-2 inline h-4 w-4" />
                    {language === 'bg' ? 'Височина (см)' : 'Height (cm)'}
                  </label>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-orange-200 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-orange-500 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-100 dark:focus:ring-forest-500"
                    min={100}
                    max={250}
                    step={1}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-cream-300">
                    <Target className="mr-2 inline h-4 w-4" />
                    {t.selectGoal}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'lose_weight', icon: TrendingDown, color: 'text-blue-500' },
                      { value: 'maintain', icon: Minus, color: 'text-green-500' },
                      { value: 'gain_muscle', icon: TrendingUp, color: 'text-orange-500' },
                    ] as const).map((goalOption) => (
                      <button
                        key={goalOption.value}
                        type="button"
                        onClick={() => setEditGoal(goalOption.value)}
                        className={cn(
                          'rounded-xl border-2 p-3 text-center transition-all',
                          editGoal === goalOption.value
                            ? 'border-orange-500 bg-orange-50 dark:border-forest-500 dark:bg-forest-900/30'
                            : 'border-orange-200 hover:border-orange-400 dark:border-wood-600'
                        )}
                      >
                        <div
                          className={cn(
                            'mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-current/10',
                            goalOption.color
                          )}
                        >
                          <goalOption.icon className={cn('h-5 w-5', goalOption.color)} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-cream-200">
                          {t.goals[goalOption.value as keyof typeof t.goals]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowQuickEdit(false)}
                  className="flex-1 rounded-xl border-2 border-orange-200 px-4 py-3 font-semibold text-gray-700 hover:bg-orange-50 dark:border-wood-600 dark:text-cream-300 dark:hover:bg-wood-700"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveQuickEdit}
                  disabled={updateHealthMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 font-semibold text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 dark:from-forest-600 dark:to-forest-500"
                >
                  {updateHealthMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t.save}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border-2 border-orange-200 bg-white p-6 dark:border-wood-600 dark:bg-wood-800"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="group relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div
              onClick={handleAvatarClick}
              className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-3xl font-bold text-white shadow-lg dark:from-forest-500 dark:to-forest-600"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <div
              onClick={handleAvatarClick}
              className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Camera className="h-6 w-6 text-white" />
            </div>

            {user.avatar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAvatar();
                }}
                className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
                title={language === 'bg' ? 'Премахни снимка' : 'Remove photo'}
              >
                <Trash2 className="h-4 w-4 text-white" />
              </button>
            )}

            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 shadow-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="mb-1 text-2xl font-bold font-serif text-gray-800 dark:text-cream-100">
              {user.username}
            </h1>
            <p className="mb-2 flex items-center justify-center gap-2 text-gray-500 dark:text-cream-400 sm:justify-start">
              <Mail className="h-4 w-4" />
              {user.email}
            </p>
            {user.bio && <p className="mb-3 text-gray-600 dark:text-cream-300">{user.bio}</p>}
            <p className="text-sm text-gray-400 dark:text-cream-500">
              {t.memberSince}: {formatDate(user.createdAt)}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:border-orange-400 dark:border-wood-600 dark:text-cream-200 dark:hover:border-forest-500"
            >
              <Settings className="h-4 w-4" />
              {t.settings}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-300 px-4 py-2 font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Shield className="h-4 w-4" />
                {t.admin}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center dark:border-wood-600 dark:bg-wood-800">
          <ChefHat className="mx-auto mb-2 h-6 w-6 text-orange-500 dark:text-forest-500" />
          <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{myRecipes.length}</p>
          <p className="text-sm text-gray-500 dark:text-cream-400">{t.myRecipes}</p>
        </div>
        <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center dark:border-wood-600 dark:bg-wood-800">
          <Heart className="mx-auto mb-2 h-6 w-6 text-red-500" />
          <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{favorites.length}</p>
          <p className="text-sm text-gray-500 dark:text-cream-400">{t.favorites}</p>
        </div>
        <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center dark:border-wood-600 dark:bg-wood-800">
          <Calendar className="mx-auto mb-2 h-6 w-6 text-blue-500" />
          <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">7</p>
          <p className="text-sm text-gray-500 dark:text-cream-400">
            {language === 'bg' ? 'Дни план' : 'Days'}
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'health', icon: Activity, label: t.health },
          { id: 'recipes', icon: ChefHat, label: t.myRecipes },
          { id: 'favorites', icon: Heart, label: t.favorites },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'health' | 'recipes' | 'favorites')}
            className={cn(
              'whitespace-nowrap rounded-xl px-4 py-2 font-medium transition-all flex items-center gap-2',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white dark:from-forest-600 dark:to-forest-500'
                : 'border-2 border-orange-200 bg-white text-gray-600 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-300'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'health' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {weight && height ? (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={handleQuickEdit}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-300 px-4 py-2 font-medium text-orange-600 transition-colors hover:bg-orange-50 dark:border-forest-600 dark:text-forest-400 dark:hover:bg-forest-900/20"
                >
                  <Edit3 className="h-4 w-4" />
                  {t.quickEdit}
                </button>
              </div>

              <div className="rounded-2xl border-2 border-orange-200 bg-white p-6 dark:border-wood-600 dark:bg-wood-800">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold font-serif text-gray-800 dark:text-cream-100">
                  <Scale className="h-6 w-6 text-orange-500 dark:text-forest-500" />
                  {t.bmiTitle}
                </h3>

                <div className="mb-6 flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className={cn('text-5xl font-bold', bmiCategory.color)}>{bmi}</p>
                    <p className={cn('mt-1 text-lg font-medium', bmiCategory.color)}>
                      {bmiCategory.label}
                    </p>
                  </div>
                </div>

                <div className="relative mb-2 h-4 overflow-hidden rounded-full bg-gray-200 dark:bg-wood-700">
                  <div className="absolute inset-y-0 left-0 w-[18.5%] bg-blue-400" />
                  <div className="absolute inset-y-0 left-[18.5%] w-[31.5%] bg-green-400" />
                  <div className="absolute inset-y-0 left-[50%] w-[25%] bg-yellow-400" />
                  <div className="absolute inset-y-0 left-[75%] w-[25%] bg-red-400" />
                  {bmi > 0 && (
                    <div
                      className="absolute bottom-0 top-0 w-1 bg-gray-800 dark:bg-white"
                      style={{ left: `${Math.min(Math.max((bmi / 40) * 100, 0), 100)}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-cream-400">
                  <span>16</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center dark:border-wood-600 dark:bg-wood-800">
                  <Scale className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{weight} kg</p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">{t.weight}</p>
                </div>
                <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center dark:border-wood-600 dark:bg-wood-800">
                  <Ruler className="mx-auto mb-2 h-6 w-6 text-purple-500" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{height} cm</p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">{t.heightLabel}</p>
                </div>
                <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center dark:border-wood-600 dark:bg-wood-800">
                  <Flame className="mx-auto mb-2 h-6 w-6 text-orange-500" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">
                    {dailyCalories}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">
                    {t.dailyCaloriesLabel}
                  </p>
                </div>
                <div className="rounded-xl border-2 border-orange-200 bg-white p-4 text-center dark:border-wood-600 dark:bg-wood-800">
                  <Target className="mx-auto mb-2 h-6 w-6 text-green-500" />
                  <p className="text-lg font-bold text-gray-800 dark:text-cream-100">
                    {t.goals[goal as keyof typeof t.goals] || goal}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">{t.goalLabel}</p>
                </div>
              </div>

              <div className="rounded-xl border-2 border-orange-200 bg-white p-4 dark:border-wood-600 dark:bg-wood-800">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-cream-400">{t.ageLabel}:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-cream-100">
                      {age} {language === 'bg' ? 'години' : 'years'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-cream-400">
                      {language === 'bg' ? 'Активност' : 'Activity'}:
                    </span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-cream-100">
                      {t.activityLevels[
                        activityLevel as keyof typeof t.activityLevels
                      ] || activityLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-orange-200 bg-white py-12 text-center dark:border-wood-600 dark:bg-wood-800">
              <Activity className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-wood-600" />
              <p className="mb-4 text-gray-500 dark:text-cream-400">{t.noHealthData}</p>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white dark:from-forest-600 dark:to-forest-500"
              >
                <Settings className="h-5 w-5" />
                {t.updateInSettings}
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'recipes' && (
        <div>
          {myRecipes.length === 0 ? (
            <div className="rounded-2xl border-2 border-orange-200 bg-white py-12 text-center dark:border-wood-600 dark:bg-wood-800">
              <ChefHat className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-wood-600" />
              <p className="mb-4 text-gray-500 dark:text-cream-400">{t.noRecipes}</p>
              <Link
                to="/recipes/create"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white dark:from-forest-600 dark:to-forest-500"
              >
                <ChefHat className="h-5 w-5" />
                {t.createFirst}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="flex gap-4 rounded-xl border-2 border-orange-200 bg-white p-4 transition-colors hover:border-orange-400 dark:border-wood-600 dark:bg-wood-800 dark:hover:border-forest-500"
                >
                  <img
                    src={
                      recipe.mainImage ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                    }
                    alt={recipe.title}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 font-semibold text-gray-800 dark:text-cream-100">
                      {recipe.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-500 dark:text-cream-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)}{' '}
                        {language === 'bg' ? 'мин' : 'min'}
                      </span>
                      {recipe.nutrition?.calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {recipe.nutrition.calories} {language === 'bg' ? 'ккал' : 'kcal'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="rounded-2xl border-2 border-orange-200 bg-white py-12 text-center dark:border-wood-600 dark:bg-wood-800">
              <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-wood-600" />
              <p className="mb-4 text-gray-500 dark:text-cream-400">{t.noFavorites}</p>
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white dark:from-forest-600 dark:to-forest-500"
              >
                {language === 'bg' ? 'Разгледай рецепти' : 'Browse Recipes'}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
             {favorites.map((fav: FavoriteItem) => (
                <Link
                  key={fav._id}
                  to={`/recipes/${fav.recipe?._id || fav.recipeId}`}
                  className="flex gap-4 rounded-xl border-2 border-orange-200 bg-white p-4 transition-colors hover:border-orange-400 dark:border-wood-600 dark:bg-wood-800 dark:hover:border-forest-500"
                >
                  <img
                    src={
                      fav.recipe?.mainImage ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                    }
                    alt={fav.recipe?.title || 'Recipe'}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 font-semibold text-gray-800 dark:text-cream-100">
                      {fav.recipe?.title || (language === 'bg' ? 'Рецепта' : 'Recipe')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-cream-400">
                      {language === 'bg' ? 'Добавено в любими' : 'Added to favorites'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}