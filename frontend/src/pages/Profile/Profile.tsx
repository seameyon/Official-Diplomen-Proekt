import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, LogOut, ChefHat, Heart, Calendar, 
  Mail, Clock, Flame, Shield, Activity, Scale, Ruler, Target,
  Edit3, X, Save, Loader2, Camera, Trash2, TrendingDown, Minus, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { recipeApi, favoriteApi, userApi } from '../../services/api';
import { cn } from '../../utils';

// Calculate BMI
const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

// Get BMI category
const getBMICategory = (bmi: number, language: string): { label: string; color: string } => {
  if (bmi === 0) return { label: language === 'bg' ? 'Няма данни' : 'No data', color: 'text-gray-500' };
  if (bmi < 18.5) return { label: language === 'bg' ? 'Поднормено тегло' : 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: language === 'bg' ? 'Нормално тегло' : 'Normal weight', color: 'text-green-500' };
  if (bmi < 30) return { label: language === 'bg' ? 'Наднормено тегло' : 'Overweight', color: 'text-yellow-500' };
  return { label: language === 'bg' ? 'Затлъстяване' : 'Obese', color: 'text-red-500' };
};

// Calculate daily calories (BMR with activity factor)
const calculateDailyCalories = (
  weight: number, 
  height: number, 
  age: number, 
  gender: string,
  activityLevel: string
): number => {
  if (!weight || !height || !age) return 0;
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  // Activity multipliers
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
  const [activeTab, setActiveTab] = useState<'recipes' | 'favorites' | 'health'>('health');
  
  // Quick Edit Modal State
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [editWeight, setEditWeight] = useState(0);
  const [editHeight, setEditHeight] = useState(0);
  const [editGoal, setEditGoal] = useState('maintain');

  // Fetch user's recipes
  const { data: recipesData } = useQuery({
    queryKey: ['recipes', 'my', user?._id],
    queryFn: () => recipeApi.getAll({ authorId: user?._id, limit: 20 }),
    enabled: !!user?._id,
  });

  // Fetch favorites
  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteApi.getFavorites(),
    enabled: !!user,
  });

  // Update health profile mutation
  const updateHealthMutation = useMutation({
    mutationFn: (data: any) => userApi.updateHealthProfile(data),
    onSuccess: () => {
      toast.success(language === 'bg' ? 'Данните са актуализирани!' : 'Data updated!');
      checkAuth(); // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
      setShowQuickEdit(false);
    },
    onError: () => {
      toast.error(language === 'bg' ? 'Грешка при актуализиране' : 'Update error');
    },
  });

  const handleQuickEdit = () => {
    const healthProfile = user?.healthProfile || {};
    setEditWeight(healthProfile.weight || 70);
    setEditHeight(healthProfile.height || 170);
    setEditGoal(healthProfile.goal || 'maintain');
    setShowQuickEdit(true);
  };

  const handleSaveQuickEdit = () => {
    const healthProfile = user?.healthProfile || {};
    updateHealthMutation.mutate({
      ...healthProfile,
      weight: editWeight,
      height: editHeight,
      goal: editGoal,
    });
  };

  const isAdmin = user?.email === 'xzvelkosimeon@gmail.com' || user?.isAdmin;

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <User className="w-16 h-16 text-wood-300 dark:text-wood-600 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-wood-800 dark:text-cream-100 mb-2">
          {language === 'bg' ? 'Не сте влезли' : 'Not Logged In'}
        </h2>
        <p className="text-wood-500 dark:text-cream-400 mb-6">
          {language === 'bg' 
            ? 'Влезте в профила си или се регистрирайте' 
            : 'Log in or create an account'}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500 transition-colors"
          >
            {language === 'bg' ? 'Вход' : 'Login'}
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl font-semibold text-wood-700 dark:text-cream-200 border-2 border-wood-300 dark:border-wood-600 hover:border-forest-500 transition-colors"
          >
            {language === 'bg' ? 'Регистрация' : 'Register'}
          </Link>
        </div>
      </div>
    );
  }

  const myRecipes = recipesData?.recipes || [];
  const favorites = favoritesData?.favorites || [];

  // Health data from user profile
  const healthProfile = user.healthProfile || {};
  const weight = healthProfile.weight || 0;
  const height = healthProfile.height || 0;
  
  // Calculate age from birthYear
  const birthYear = healthProfile.birthYear || 0;
  const currentYear = new Date().getFullYear();
  const age = birthYear > 0 ? currentYear - birthYear : 0;
  
  // Use 'sex' field (as saved in Onboarding)
  const gender = healthProfile.sex || healthProfile.gender || 'male';
  const activityLevel = healthProfile.activityLevel || 'moderate';
  const goal = healthProfile.goal || 'maintain';

  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi, language);
  const dailyCalories = calculateDailyCalories(weight, height, age, gender, activityLevel);

  // Profile picture state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error(language === 'bg' ? 'Моля, изберете изображение' : 'Please select an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'bg' ? 'Изображението е твърде голямо (макс. 5MB)' : 'Image too large (max 5MB)');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await userApi.updateAvatar(base64);
        checkAuth(); // Refresh user data
        toast.success(language === 'bg' ? 'Снимката е обновена!' : 'Photo updated!');
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
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
    } catch (error) {
      toast.error(language === 'bg' ? 'Грешка' : 'Error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Format date safely
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

  // Translations
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Quick Edit Modal */}
      <AnimatePresence>
        {showQuickEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuickEdit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-wood-800 rounded-2xl p-6 w-full max-w-md border-2 border-orange-200 dark:border-wood-600"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-cream-100">
                  {t.quickEdit}
                </h2>
                <button
                  onClick={() => setShowQuickEdit(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-wood-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                    <Scale className="w-4 h-4 inline mr-2" />
                    {t.weightKg}
                  </label>
                  <input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500"
                    min={30}
                    max={300}
                    step={0.5}
                  />
                </div>

                {/* Height Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                    <Ruler className="w-4 h-4 inline mr-2" />
                    {language === 'bg' ? 'Височина (см)' : 'Height (cm)'}
                  </label>
                  <input
                    type="number"
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-gray-900 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 dark:focus:ring-forest-500"
                    min={100}
                    max={250}
                    step={1}
                  />
                </div>

                {/* Goal Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-cream-300 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
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
                          'p-3 rounded-xl border-2 transition-all text-center',
                          editGoal === goalOption.value
                            ? 'border-orange-500 dark:border-forest-500 bg-orange-50 dark:bg-forest-900/30'
                            : 'border-orange-200 dark:border-wood-600 hover:border-orange-400'
                        )}
                      >
                        <div className={cn('w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center', goalOption.color, 'bg-current/10')}>
                          <goalOption.icon className={cn('w-5 h-5', goalOption.color)} />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-cream-200">
                          {t.goals[goalOption.value as keyof typeof t.goals]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowQuickEdit(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold border-2 border-orange-200 dark:border-wood-600 text-gray-700 dark:text-cream-300 hover:bg-orange-50 dark:hover:bg-wood-700"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveQuickEdit}
                  disabled={updateHealthMutation.isPending}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateHealthMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t.save}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-wood-800 rounded-2xl p-6 border-2 border-orange-200 dark:border-wood-600 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with upload */}
          <div className="relative group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 dark:from-forest-500 dark:to-forest-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg cursor-pointer overflow-hidden"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            
            {/* Overlay on hover */}
            <div 
              onClick={handleAvatarClick}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
            
            {/* Remove button */}
            {user.avatar && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title={language === 'bg' ? 'Премахни снимка' : 'Remove photo'}
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}
            
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-cream-100 mb-1">
              {user.username}
            </h1>
            <p className="text-gray-500 dark:text-cream-400 flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            {user.bio && (
              <p className="text-gray-600 dark:text-cream-300 mb-3">{user.bio}</p>
            )}
            <p className="text-sm text-gray-400 dark:text-cream-500">
              {t.memberSince}: {formatDate(user.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-gray-700 dark:text-cream-200 border-2 border-orange-200 dark:border-wood-600 hover:border-orange-400 dark:hover:border-forest-500 transition-colors"
            >
              <Settings className="w-4 h-4" />
              {t.settings}
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-amber-700 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              >
                <Shield className="w-4 h-4" />
                {t.admin}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 text-center">
          <ChefHat className="w-6 h-6 text-orange-500 dark:text-forest-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{myRecipes.length}</p>
          <p className="text-sm text-gray-500 dark:text-cream-400">{t.myRecipes}</p>
        </div>
        <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 text-center">
          <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{favorites.length}</p>
          <p className="text-sm text-gray-500 dark:text-cream-400">{t.favorites}</p>
        </div>
        <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 text-center">
          <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">7</p>
          <p className="text-sm text-gray-500 dark:text-cream-400">{language === 'bg' ? 'Дни план' : 'Days'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'health', icon: Activity, label: t.health },
          { id: 'recipes', icon: ChefHat, label: t.myRecipes },
          { id: 'favorites', icon: Heart, label: t.favorites },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white'
                : 'bg-white dark:bg-wood-700 text-gray-600 dark:text-cream-300 border-2 border-orange-200 dark:border-wood-600'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Health Tab */}
      {activeTab === 'health' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {weight && height ? (
            <div className="space-y-6">
              {/* Quick Edit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleQuickEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-orange-600 dark:text-forest-400 border-2 border-orange-300 dark:border-forest-600 hover:bg-orange-50 dark:hover:bg-forest-900/20 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  {t.quickEdit}
                </button>
              </div>

              {/* BMI Card */}
              <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 border-2 border-orange-200 dark:border-wood-600">
                <h3 className="text-xl font-serif font-bold text-gray-800 dark:text-cream-100 mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-orange-500 dark:text-forest-500" />
                  {t.bmiTitle}
                </h3>
                
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center">
                    <p className={cn("text-5xl font-bold", bmiCategory.color)}>{bmi}</p>
                    <p className={cn("text-lg font-medium mt-1", bmiCategory.color)}>{bmiCategory.label}</p>
                  </div>
                </div>

                {/* BMI Scale */}
                <div className="relative h-4 bg-gray-200 dark:bg-wood-700 rounded-full overflow-hidden mb-2">
                  <div className="absolute inset-y-0 left-0 w-[18.5%] bg-blue-400" />
                  <div className="absolute inset-y-0 left-[18.5%] w-[31.5%] bg-green-400" />
                  <div className="absolute inset-y-0 left-[50%] w-[25%] bg-yellow-400" />
                  <div className="absolute inset-y-0 left-[75%] w-[25%] bg-red-400" />
                  {bmi > 0 && (
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-gray-800 dark:bg-white"
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 text-center">
                  <Scale className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{weight} kg</p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">{t.weight}</p>
                </div>
                <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 text-center">
                  <Ruler className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{height} cm</p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">{t.heightLabel}</p>
                </div>
                <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 text-center">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800 dark:text-cream-100">{dailyCalories}</p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">{t.dailyCaloriesLabel}</p>
                </div>
                <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 text-center">
                  <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-800 dark:text-cream-100">{t.goals[goal as keyof typeof t.goals] || goal}</p>
                  <p className="text-sm text-gray-500 dark:text-cream-400">{t.goalLabel}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-cream-400">{t.ageLabel}:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-cream-100">{age} {language === 'bg' ? 'години' : 'years'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-cream-400">{language === 'bg' ? 'Активност' : 'Activity'}:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-cream-100">
                      {t.activityLevels[activityLevel as keyof typeof t.activityLevels] || activityLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-wood-800 rounded-2xl border-2 border-orange-200 dark:border-wood-600">
              <Activity className="w-12 h-12 text-gray-300 dark:text-wood-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-cream-400 mb-4">{t.noHealthData}</p>
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500"
              >
                <Settings className="w-5 h-5" />
                {t.updateInSettings}
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div>
          {myRecipes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-wood-800 rounded-2xl border-2 border-orange-200 dark:border-wood-600">
              <ChefHat className="w-12 h-12 text-gray-300 dark:text-wood-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-cream-400 mb-4">{t.noRecipes}</p>
              <Link
                to="/recipes/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500"
              >
                <ChefHat className="w-5 h-5" />
                {t.createFirst}
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {myRecipes.map((recipe: any) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="flex gap-4 bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 hover:border-orange-400 dark:hover:border-forest-500 transition-colors"
                >
                  <img
                    src={recipe.mainImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                    alt={recipe.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-cream-100 line-clamp-1">{recipe.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-cream-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {(recipe.prepTime || 0) + (recipe.cookTime || 0)} {language === 'bg' ? 'мин' : 'min'}
                      </span>
                      {recipe.nutrition?.calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4" />
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

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-wood-800 rounded-2xl border-2 border-orange-200 dark:border-wood-600">
              <Heart className="w-12 h-12 text-gray-300 dark:text-wood-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-cream-400 mb-4">{t.noFavorites}</p>
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500"
              >
                {language === 'bg' ? 'Разгледай рецепти' : 'Browse Recipes'}
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {favorites.map((fav: any) => (
                <Link
                  key={fav._id}
                  to={`/recipes/${fav.recipe?._id || fav.recipeId}`}
                  className="flex gap-4 bg-white dark:bg-wood-800 rounded-xl p-4 border-2 border-orange-200 dark:border-wood-600 hover:border-orange-400 dark:hover:border-forest-500 transition-colors"
                >
                  <img
                    src={fav.recipe?.mainImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                    alt={fav.recipe?.title || 'Recipe'}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-cream-100 line-clamp-1">
                      {fav.recipe?.title || (language === 'bg' ? 'Рецепта' : 'Recipe')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-cream-400 mt-1">
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
