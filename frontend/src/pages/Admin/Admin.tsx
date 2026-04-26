import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ChefHat, Trash2, Search, Users, UserPlus, UserMinus,
  AlertTriangle, Loader2, Eye, ChevronDown, ChevronRight,
  Scale, Ruler, Target, Activity, Mail, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { recipeApi } from '../../services/api';
import api from '../../services/api';
import { cn } from '../../utils';

const ADMIN_EMAIL = 'xzvelkosimeon@gmail.com';


const calculateBMI = (weight: number, height: number): number => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};


const getBMICategory = (bmi: number, language: string): { label: string; color: string } => {
  if (bmi === 0) return { label: language === 'bg' ? 'Няма данни' : 'No data', color: 'text-gray-500' };
  if (bmi < 18.5) return { label: language === 'bg' ? 'Поднормено' : 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: language === 'bg' ? 'Нормално' : 'Normal', color: 'text-green-500' };
  if (bmi < 30) return { label: language === 'bg' ? 'Наднормено' : 'Overweight', color: 'text-yellow-500' };
  return { label: language === 'bg' ? 'Затлъстяване' : 'Obese', color: 'text-red-500' };
};


function UserCard({ user, language, onToggleAdmin, onDeleteUser, isMainAdmin }: any) {
  const [expanded, setExpanded] = useState(false);
  
  const healthProfile = user.healthProfile || {};
  const weight = healthProfile.weight || 0;
  const height = healthProfile.height || 0;
  const birthYear = healthProfile.birthYear || 0;
  const currentYear = new Date().getFullYear();
  const age = birthYear > 0 ? currentYear - birthYear : 0;
  const goal = healthProfile.goal || 'maintain';
  const activityLevel = healthProfile.activityLevel || 'moderate';
  
  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi, language);

  const goalLabels: Record<string, string> = {
    lose_weight: language === 'bg' ? 'Отслабване' : 'Lose weight',
    maintain: language === 'bg' ? 'Поддържане' : 'Maintain',
    gain_muscle: language === 'bg' ? 'Качване' : 'Gain muscle',
  };

  const activityLabels: Record<string, string> = {
    sedentary: language === 'bg' ? 'Заседнал' : 'Sedentary',
    light: language === 'bg' ? 'Лека' : 'Light',
    moderate: language === 'bg' ? 'Умерена' : 'Moderate',
    active: language === 'bg' ? 'Активен' : 'Active',
    very_active: language === 'bg' ? 'Много активен' : 'Very active',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cream-100 dark:bg-wood-800 rounded-xl border-2 border-wood-200 dark:border-wood-600 overflow-hidden"
    >
      {/* Header - clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 hover:bg-wood-50 dark:hover:bg-wood-700/50 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            user.username?.charAt(0).toUpperCase() || 'U'
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-wood-800 dark:text-cream-100 truncate">
              {user.username}
            </span>
            {user.isAdmin && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                Admin
              </span>
            )}
          </div>
          <p className="text-sm text-wood-500 dark:text-cream-400 truncate">{user.email}</p>
        </div>

        {/* BMI Badge */}
        {bmi > 0 && (
          <div className="hidden sm:block text-center px-3">
            <p className={cn("text-lg font-bold", bmiCategory.color)}>{bmi}</p>
            <p className="text-xs text-wood-500 dark:text-cream-400">BMI</p>
          </div>
        )}

        {/* Expand icon */}
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-wood-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-wood-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-wood-200 dark:border-wood-600"
          >
            <div className="p-4 space-y-4">
              {/* User details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-wood-600 dark:text-cream-300">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-wood-600 dark:text-cream-300">
                  <Calendar className="w-4 h-4" />
                  {new Date(user.createdAt).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}
                </div>
              </div>

              {/* Health Stats */}
              {(weight > 0 || height > 0) ? (
                <div className="bg-white dark:bg-wood-700 rounded-xl p-4">
                  <h4 className="font-medium text-wood-800 dark:text-cream-100 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-forest-500" />
                    {language === 'bg' ? 'Здравни данни' : 'Health Data'}
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-cream-50 dark:bg-wood-600 rounded-lg">
                      <Scale className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                      <p className="font-bold text-wood-800 dark:text-cream-100">{weight} kg</p>
                      <p className="text-xs text-wood-500 dark:text-cream-400">
                        {language === 'bg' ? 'Тегло' : 'Weight'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-cream-50 dark:bg-wood-600 rounded-lg">
                      <Ruler className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                      <p className="font-bold text-wood-800 dark:text-cream-100">{height} cm</p>
                      <p className="text-xs text-wood-500 dark:text-cream-400">
                        {language === 'bg' ? 'Височина' : 'Height'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-cream-50 dark:bg-wood-600 rounded-lg">
                      <Scale className="w-4 h-4 mx-auto text-green-500 mb-1" />
                      <p className={cn("font-bold", bmiCategory.color)}>{bmi}</p>
                      <p className="text-xs text-wood-500 dark:text-cream-400">BMI</p>
                    </div>
                    <div className="text-center p-2 bg-cream-50 dark:bg-wood-600 rounded-lg">
                      <Target className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                      <p className="font-bold text-wood-800 dark:text-cream-100 text-sm">
                        {goalLabels[goal] || goal}
                      </p>
                      <p className="text-xs text-wood-500 dark:text-cream-400">
                        {language === 'bg' ? 'Цел' : 'Goal'}
                      </p>
                    </div>
                  </div>

                  {/* BMI Scale */}
                  <div className="mt-3">
                    <div className="relative h-2 bg-gray-200 dark:bg-wood-600 rounded-full overflow-hidden">
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
                    <p className={cn("text-center text-sm mt-1 font-medium", bmiCategory.color)}>
                      {bmiCategory.label}
                    </p>
                  </div>

                  {/* Additional info */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="text-wood-600 dark:text-cream-300">
                      <span className="text-wood-400">{language === 'bg' ? 'Възраст:' : 'Age:'}</span> {age > 0 ? `${age} ${language === 'bg' ? 'г.' : 'y'}` : '-'}
                    </div>
                    <div className="text-wood-600 dark:text-cream-300">
                      <span className="text-wood-400">{language === 'bg' ? 'Активност:' : 'Activity:'}</span> {activityLabels[activityLevel] || activityLevel}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-wood-50 dark:bg-wood-700 rounded-xl p-4 text-center text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Няма здравни данни' : 'No health data'}
                </div>
              )}

              {/* Admin toggle button - only for main admin */}
              {isMainAdmin && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onToggleAdmin(user._id, !user.isAdmin)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors',
                      user.isAdmin
                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700'
                        : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-300 dark:border-amber-700'
                    )}
                  >
                    {user.isAdmin ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        {language === 'bg' ? 'Премахни админ' : 'Remove Admin'}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        {language === 'bg' ? 'Направи админ' : 'Make Admin'}
                      </>
                    )}
                  </button>
                  
                  {/* Delete user button */}
                  <button
                    onClick={() => onDeleteUser(user._id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {language === 'bg' ? 'Изтрий' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { language } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'users' | 'recipes'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearch, setUserSearch] = useState('');

 
  const isMainAdmin = user?.email === ADMIN_EMAIL;
  const hasAdminAccess = isMainAdmin || user?.isAdmin;

  if (!hasAdminAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-wood-800 dark:text-cream-100 mb-2">
          {language === 'bg' ? 'Достъпът е отказан' : 'Access Denied'}
        </h2>
        <p className="text-wood-500 dark:text-cream-400 mb-6">
          {language === 'bg' 
            ? 'Нямате права за достъп до тази страница.' 
            : 'You do not have permission to access this page.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500"
        >
          {language === 'bg' ? 'Към начало' : 'Go Home'}
        </button>
      </div>
    );
  }

  const { data: recipesData, isLoading: recipesLoading } = useQuery({
    queryKey: ['admin', 'recipes'],
    queryFn: () => recipeApi.getAll({ limit: 100 }),
  });

  
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.data;
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id: string) => recipeApi.deleteRecipe(id),
    onSuccess: () => {
      toast.success(language === 'bg' ? 'Рецептата е изтрита' : 'Recipe deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'recipes'] });
    },
    onError: () => {
      toast.error(language === 'bg' ? 'Грешка при изтриване' : 'Error deleting');
    },
  });

  /
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { data } = await api.put(`/admin/users/${userId}/admin`, { isAdmin });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.isAdmin
          ? (language === 'bg' ? 'Потребителят е направен админ' : 'User is now admin')
          : (language === 'bg' ? 'Админ правата са премахнати' : 'Admin rights removed')
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error(language === 'bg' ? 'Грешка' : 'Error');
    },
  });

  
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      toast.success(language === 'bg' ? 'Потребителят е изтрит' : 'User deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => {
      toast.error(language === 'bg' ? 'Грешка при изтриване' : 'Error deleting');
    },
  });

  const recipes = recipesData?.recipes || [];
  const users = usersData?.users || [];
  
  const filteredRecipes = recipes.filter((r: any) =>
    r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredUsers = users.filter((u: any) =>
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const adminCount = users.filter((u: any) => u.isAdmin).length;

  const t = {
    title: language === 'bg' ? 'Админ Панел' : 'Admin Panel',
    users: language === 'bg' ? 'Потребители' : 'Users',
    recipes: language === 'bg' ? 'Рецепти' : 'Recipes',
    search: language === 'bg' ? 'Търсене...' : 'Search...',
    recipe: language === 'bg' ? 'Рецепта' : 'Recipe',
    author: language === 'bg' ? 'Автор' : 'Author',
    created: language === 'bg' ? 'Създадена' : 'Created',
    actions: language === 'bg' ? 'Действия' : 'Actions',
    totalRecipes: language === 'bg' ? 'Общо рецепти' : 'Total Recipes',
    totalUsers: language === 'bg' ? 'Потребители' : 'Users',
    admins: language === 'bg' ? 'Администратори' : 'Admins',
    deleteConfirm: language === 'bg' ? 'Изтрий тази рецепта?' : 'Delete this recipe?',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-wood-800 dark:text-cream-100">
            {t.title}
          </h1>
          <p className="text-wood-500 dark:text-cream-400">{ADMIN_EMAIL}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-cream-100 dark:bg-wood-800 rounded-xl p-6 border-2 border-wood-200 dark:border-wood-600">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-3xl font-bold text-wood-800 dark:text-cream-100">{users.length}</p>
          <p className="text-wood-500 dark:text-cream-400">{t.totalUsers}</p>
        </div>
        <div className="bg-cream-100 dark:bg-wood-800 rounded-xl p-6 border-2 border-wood-200 dark:border-wood-600">
          <Shield className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-3xl font-bold text-wood-800 dark:text-cream-100">{adminCount}</p>
          <p className="text-wood-500 dark:text-cream-400">{t.admins}</p>
        </div>
        <div className="bg-cream-100 dark:bg-wood-800 rounded-xl p-6 border-2 border-wood-200 dark:border-wood-600">
          <ChefHat className="w-8 h-8 text-forest-500 mb-2" />
          <p className="text-3xl font-bold text-wood-800 dark:text-cream-100">{recipes.length}</p>
          <p className="text-wood-500 dark:text-cream-400">{t.totalRecipes}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
            activeTab === 'users'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
              : 'bg-cream-100 dark:bg-wood-700 text-wood-600 dark:text-cream-300 border-2 border-wood-200 dark:border-wood-600'
          )}
        >
          <Users className="w-4 h-4" />
          {t.users} ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
            activeTab === 'recipes'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
              : 'bg-cream-100 dark:bg-wood-700 text-wood-600 dark:text-cream-300 border-2 border-wood-200 dark:border-wood-600'
          )}
        >
          <ChefHat className="w-4 h-4" />
          {t.recipes} ({recipes.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder={language === 'bg' ? 'Търси потребител...' : 'Search users...'}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-100 dark:bg-wood-800 text-wood-800 dark:text-cream-100"
            />
          </div>

          {/* Users List */}
          {usersLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-forest-600 mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((u: any) => (
                <UserCard
                  key={u._id}
                  user={u}
                  language={language}
                  isMainAdmin={isMainAdmin}
                  onToggleAdmin={(userId: string, isAdmin: boolean) => {
                    if (u.email === ADMIN_EMAIL) {
                      toast.error(language === 'bg' ? 'Не можете да премахнете главния админ' : 'Cannot remove main admin');
                      return;
                    }
                    toggleAdminMutation.mutate({ userId, isAdmin });
                  }}
                  onDeleteUser={(userId: string) => {
                    if (u.email === ADMIN_EMAIL) {
                      toast.error(language === 'bg' ? 'Не можете да изтриете главния админ' : 'Cannot delete main admin');
                      return;
                    }
                    if (confirm(language === 'bg' ? `Сигурни ли сте, че искате да изтриете ${u.username}?` : `Are you sure you want to delete ${u.username}?`)) {
                      deleteUserMutation.mutate(userId);
                    }
                  }}
                />
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Няма намерени потребители' : 'No users found'}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recipes Tab */}
      {activeTab === 'recipes' && (
        <div>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-100 dark:bg-wood-800 text-wood-800 dark:text-cream-100"
            />
          </div>

          {/* Recipes Table */}
          <div className="bg-cream-100 dark:bg-wood-800 rounded-2xl border-2 border-wood-200 dark:border-wood-600 overflow-hidden">
            {recipesLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-forest-600 mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-wood-100 dark:bg-wood-700">
                    <tr>
                      <th className="text-left p-4 text-wood-700 dark:text-cream-200 font-medium">{t.recipe}</th>
                      <th className="text-left p-4 text-wood-700 dark:text-cream-200 font-medium">{t.author}</th>
                      <th className="text-left p-4 text-wood-700 dark:text-cream-200 font-medium">{t.created}</th>
                      <th className="text-right p-4 text-wood-700 dark:text-cream-200 font-medium">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecipes.map((recipe: any) => (
                      <motion.tr
                        key={recipe._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-t border-wood-100 dark:border-wood-700 hover:bg-wood-50 dark:hover:bg-wood-700/50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={recipe.mainImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=50&h=50&fit=crop'}
                              alt={recipe.title}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-wood-800 dark:text-cream-100 line-clamp-1">
                              {recipe.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-wood-600 dark:text-cream-300">
                          {recipe.author?.username || 'Unknown'}
                        </td>
                        <td className="p-4 text-wood-600 dark:text-cream-300">
                          {new Date(recipe.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/recipes/${recipe._id}`)}
                              className="p-2 text-forest-600 hover:bg-forest-100 dark:hover:bg-forest-900/30 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(t.deleteConfirm)) {
                                  deleteRecipeMutation.mutate(recipe._id);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
