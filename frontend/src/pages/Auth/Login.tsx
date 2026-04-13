import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../context/authStore';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { register, handleSubmit } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    if (!data.email || !data.password) {
      toast.error('Моля попълни всички полета');
      return;
    }

    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Добре дошъл!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Грешен имейл или парола');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-semibold text-wood-800 dark:text-cream-100 mb-2">
          Добре Дошъл
        </h1>
        <p className="text-wood-600 dark:text-cream-400">
          Влез в акаунта си за да продължиш
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
              {...register('email')}
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

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Парола
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
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
          <div className="text-right mt-1">
            <Link 
              to="/forgot-password" 
              className="text-sm text-forest-600 hover:text-forest-500 font-medium"
            >
              Забравена парола?
            </Link>
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
            'Вход'
          )}
        </motion.button>
      </form>

      {/* Register link */}
      <p className="mt-8 text-center text-wood-600 dark:text-cream-400">
        Нямаш акаунт?{' '}
        <Link 
          to="/register" 
          className="font-semibold text-forest-600 hover:text-forest-500"
        >
          Регистрирай се
        </Link>
      </p>

      {/* Browse without login */}
      <p className="mt-4 text-center">
        <Link 
          to="/recipes" 
          className="text-sm text-wood-500 dark:text-cream-500 hover:text-forest-600 transition-colors"
        >
          или разгледай рецептите без регистрация →
        </Link>
      </p>
    </div>
  );
}
