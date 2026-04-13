import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../context/authStore';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    // Validate
    if (!data.email || !data.email.includes('@')) {
      toast.error('Моля въведи валиден имейл');
      return;
    }
    if (!data.username || data.username.length < 3) {
      toast.error('Потребителското име трябва да е поне 3 символа');
      return;
    }
    if (!data.password || data.password.length < 8) {
      toast.error('Паролата трябва да е поне 8 символа');
      return;
    }
    if (data.password !== data.confirmPassword) {
      toast.error('Паролите не съвпадат');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(data.email, data.password, data.username);
      toast.success('Акаунтът е създаден успешно!');
      navigate('/onboarding');
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.errors || 'Нещо се обърка';
      if (typeof message === 'object') {
        toast.error(Object.values(message).join(', '));
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-semibold text-wood-800 dark:text-cream-100 mb-2">
          Създай Акаунт
        </h1>
        <p className="text-wood-600 dark:text-cream-400">
          Започни своето кулинарно приключение
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Имейл
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type="email"
              {...register('email', { required: true })}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all
                bg-white dark:bg-wood-700 
                border-wood-200 dark:border-wood-600
                text-wood-800 dark:text-cream-100
                placeholder-wood-400 dark:placeholder-wood-500
                focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              placeholder="tvoiat@email.com"
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Потребителско Име
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type="text"
              {...register('username', { required: true })}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all
                bg-white dark:bg-wood-700 
                border-wood-200 dark:border-wood-600
                text-wood-800 dark:text-cream-100
                placeholder-wood-400 dark:placeholder-wood-500
                focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              placeholder="готвач123"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Парола (минимум 8 символа)
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: true })}
              className="w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all
                bg-white dark:bg-wood-700 
                border-wood-200 dark:border-wood-600
                text-wood-800 dark:text-cream-100
                placeholder-wood-400 dark:placeholder-wood-500
                focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Потвърди Парола
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword', { required: true })}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all
                bg-white dark:bg-wood-700 
                border-wood-200 dark:border-wood-600
                text-wood-800 dark:text-cream-100
                placeholder-wood-400 dark:placeholder-wood-500
                focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white
            bg-forest-600 hover:bg-forest-500
            focus:ring-4 focus:ring-forest-500/30
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200 shadow-lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Създай Акаунт'
          )}
        </motion.button>
      </form>

      {/* Login link */}
      <p className="mt-8 text-center text-wood-600 dark:text-cream-400">
        Вече имаш акаунт?{' '}
        <Link 
          to="/login" 
          className="font-semibold text-forest-600 hover:text-forest-500"
        >
          Влез
        </Link>
      </p>
    </div>
  );
}
