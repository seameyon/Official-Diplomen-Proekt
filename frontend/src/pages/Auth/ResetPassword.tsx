import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';

const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'Паролата трябва да е поне 8 символа'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Паролите не съвпадат',
  path: ['confirmPassword'],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast.error('Невалиден линк');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Паролата е променена!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Грешка при промяна на паролата';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-wood-800 dark:text-cream-100 mb-2">
          Невалиден линк
        </h1>
        <p className="text-wood-600 dark:text-cream-400 mb-8">
          Линкът за възстановяване е невалиден или изтекъл.
        </p>
        <Link 
          to="/forgot-password" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500 transition-colors"
        >
          Поискай нов линк
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-wood-800 dark:text-cream-100 mb-2">
          Паролата е променена! 🎉
        </h1>
        <p className="text-wood-600 dark:text-cream-400 mb-4">
          Сега можеш да влезеш с новата си парола.
        </p>
        <p className="text-wood-500 dark:text-cream-500 text-sm mb-8">
          Пренасочване към вход...
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500 transition-colors"
        >
          Към вход
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-wood-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-forest-400 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Обратно към вход
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-serif font-semibold text-wood-800 dark:text-cream-100 mb-2">
          Нова парола
        </h1>
        <p className="text-wood-600 dark:text-cream-400">
          Въведи новата си парола
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Нова парола
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                errors.password 
                  ? 'border-red-500' 
                  : 'border-wood-200 dark:border-wood-600'
              } bg-white dark:bg-wood-800 text-wood-800 dark:text-cream-100 focus:border-forest-500 focus:outline-none transition-colors`}
              placeholder="Минимум 8 символа"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Потвърди парола
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${
                errors.confirmPassword 
                  ? 'border-red-500' 
                  : 'border-wood-200 dark:border-wood-600'
              } bg-white dark:bg-wood-800 text-wood-800 dark:text-cream-100 focus:border-forest-500 focus:outline-none transition-colors`}
              placeholder="Повтори паролата"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Запазване...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Запази нова парола
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
