import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Moon, Sun, Globe, Trash2, Loader2,
  Save, AlertTriangle, Check, Lock, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useThemeStore();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { username?: string; bio?: string }) => userApi.updateSettings(data),
    onSuccess: (_, variables) => {
      updateUser(variables);
      toast.success(language === 'bg' ? 'Настройките са запазени!' : 'Settings saved!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userApi.deleteAccount(deletePassword),
    onSuccess: () => {
      toast.success(language === 'bg' ? 'Акаунтът е изтрит' : 'Account deleted');
      logout();
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error');
    },
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      userApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success(language === 'bg' ? 'Паролата е променена!' : 'Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || (language === 'bg' ? 'Грешка при смяна на паролата' : 'Error changing password'));
    },
  });

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error(language === 'bg' ? 'Паролите не съвпадат!' : 'Passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      toast.error(language === 'bg' ? 'Паролата трябва да е поне 8 символа!' : 'Password must be at least 8 characters!');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const onSubmit = (data: { username: string; bio: string }) => {
    updateMutation.mutate(data);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(
      newTheme === 'dark' 
        ? (language === 'bg' ? 'Тъмна тема активирана' : 'Dark theme activated')
        : (language === 'bg' ? 'Светла тема активирана' : 'Light theme activated')
    );
  };

  const handleLanguageChange = (newLanguage: 'en' | 'bg') => {
    setLanguage(newLanguage);
    toast.success(
      newLanguage === 'bg' 
        ? 'Езикът е променен на български' 
        : 'Language changed to English'
    );
  };

  // Translations
  const t = {
    settings: language === 'bg' ? 'Настройки' : 'Settings',
    managePreferences: language === 'bg' ? 'Управлявай предпочитанията на акаунта си' : 'Manage your account preferences',
    profileSettings: language === 'bg' ? 'Настройки на профила' : 'Profile Settings',
    username: language === 'bg' ? 'Потребителско име' : 'Username',
    usernamePlaceholder: language === 'bg' ? 'Твоето потребителско име' : 'Your username',
    bio: language === 'bg' ? 'Описание' : 'Bio',
    bioPlaceholder: language === 'bg' ? 'Разкажи ни за себе си...' : 'Tell us about yourself...',
    saveChanges: language === 'bg' ? 'Запази промените' : 'Save Changes',
    appearance: language === 'bg' ? 'Външен вид' : 'Appearance',
    themeLabel: language === 'bg' ? 'Тема' : 'Theme',
    light: language === 'bg' ? 'Светла' : 'Light',
    dark: language === 'bg' ? 'Тъмна' : 'Dark',
    languageLabel: language === 'bg' ? 'Език' : 'Language',
    dangerZone: language === 'bg' ? 'Опасна зона' : 'Danger Zone',
    deleteWarning: language === 'bg' 
      ? 'Веднъж изтрит, акаунтът не може да бъде възстановен.' 
      : 'Once deleted, your account cannot be recovered.',
    deleteAccount: language === 'bg' ? 'Изтрий акаунта' : 'Delete Account',
    confirmPassword: language === 'bg' ? 'Въведи паролата си за потвърждение:' : 'Enter your password to confirm:',
    passwordPlaceholder: language === 'bg' ? 'Въведи паролата' : 'Enter password',
    cancel: language === 'bg' ? 'Отказ' : 'Cancel',
    deleteForever: language === 'bg' ? 'Изтрий завинаги' : 'Delete Forever',
    // Password change
    changePassword: language === 'bg' ? 'Смяна на парола' : 'Change Password',
    currentPassword: language === 'bg' ? 'Текуща парола' : 'Current Password',
    newPassword: language === 'bg' ? 'Нова парола' : 'New Password',
    confirmNewPassword: language === 'bg' ? 'Потвърди новата парола' : 'Confirm New Password',
    changePasswordBtn: language === 'bg' ? 'Промени паролата' : 'Change Password',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-wood-200 dark:hover:bg-wood-700 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-wood-600 dark:text-cream-400" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-wood-800 dark:text-cream-100">{t.settings}</h1>
          <p className="text-wood-500 dark:text-cream-400">{t.managePreferences}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-wood-800 dark:text-cream-100">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-forest-600" /> : <Sun className="w-5 h-5 text-forest-600" />}
            {t.appearance}
          </h2>

          <div>
            <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-3">{t.themeLabel}</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3',
                  theme === 'light'
                    ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20'
                    : 'border-wood-200 dark:border-wood-600 hover:border-wood-300 dark:hover:border-wood-500'
                )}
              >
                <div className="w-16 h-16 rounded-xl bg-cream-200 border-2 border-wood-300 flex items-center justify-center">
                  <Sun className="w-8 h-8 text-amber-500" />
                </div>
                <span className="font-medium text-wood-800 dark:text-cream-100">{t.light}</span>
                {theme === 'light' && <Check className="w-5 h-5 text-forest-500" />}
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3',
                  theme === 'dark'
                    ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20'
                    : 'border-wood-200 dark:border-wood-600 hover:border-wood-300 dark:hover:border-wood-500'
                )}
              >
                <div className="w-16 h-16 rounded-xl bg-wood-700 border-2 border-wood-600 flex items-center justify-center">
                  <Moon className="w-8 h-8 text-indigo-400" />
                </div>
                <span className="font-medium text-wood-800 dark:text-cream-100">{t.dark}</span>
                {theme === 'dark' && <Check className="w-5 h-5 text-forest-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-wood-800 dark:text-cream-100">
            <Globe className="w-5 h-5 text-forest-600" />
            {t.languageLabel}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleLanguageChange('bg')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3',
                language === 'bg'
                  ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20'
                  : 'border-wood-200 dark:border-wood-600 hover:border-wood-300 dark:hover:border-wood-500'
              )}
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden flex flex-col">
                <div className="h-1/3 bg-white"></div>
                <div className="h-1/3 bg-green-600"></div>
                <div className="h-1/3 bg-red-600"></div>
              </div>
              <span className="font-medium text-wood-800 dark:text-cream-100">Български</span>
              {language === 'bg' && <Check className="w-5 h-5 text-forest-500" />}
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3',
                language === 'en'
                  ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20'
                  : 'border-wood-200 dark:border-wood-600 hover:border-wood-300 dark:hover:border-wood-500'
              )}
            >
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-blue-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">EN</span>
                </div>
              </div>
              <span className="font-medium text-wood-800 dark:text-cream-100">English</span>
              {language === 'en' && <Check className="w-5 h-5 text-forest-500" />}
            </button>
          </div>
        </div>

        {/* Profile Settings */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-wood-800 dark:text-cream-100">
            <User className="w-5 h-5 text-forest-600" />
            {t.profileSettings}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
                {t.username}
              </label>
              <input
                {...register('username')}
                className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                placeholder={t.usernamePlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
                {t.bio}
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none transition-all"
                placeholder={t.bioPlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t.saveChanges}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Password Change */}
        <div className="bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-wood-200 dark:border-wood-600">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-wood-800 dark:text-cream-100">
            <Lock className="w-5 h-5 text-forest-600" />
            {t.changePassword}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
                {t.currentPassword}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600 dark:hover:text-cream-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
                {t.newPassword}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600 dark:hover:text-cream-300"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
                {t.confirmNewPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-white dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="button"
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || !confirmPassword || passwordMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              {passwordMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  {t.changePasswordBtn}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-cream-100 dark:bg-wood-800 rounded-2xl p-6 border-2 border-red-300 dark:border-red-800">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            {t.dangerZone}
          </h2>
          <p className="text-sm text-wood-600 dark:text-cream-400 mb-4">
            {t.deleteWarning}
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {t.deleteAccount}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {t.confirmPassword}
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 bg-white dark:bg-wood-700 text-wood-800 dark:text-cream-100"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-wood-200 dark:border-wood-600 text-wood-700 dark:text-cream-300 hover:bg-wood-100 dark:hover:bg-wood-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate()}
                  disabled={!deletePassword || deleteMutation.isPending}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    t.deleteForever
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
