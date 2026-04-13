import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';

const forgotSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Проверете имейла си!');
    } catch (error: any) {
      // Don't reveal if email exists - always show success
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-serif font-semibold text-wood-800 dark:text-cream-100 mb-2">
          Проверете имейла си
        </h1>
        <p className="text-wood-600 dark:text-cream-400 mb-4 max-w-sm mx-auto">
          Ако акаунт с този имейл съществува, ще получите линк за възстановяване на паролата.
        </p>
        <p className="text-wood-500 dark:text-cream-500 text-sm mb-8">
          Проверете и папка "Spam", ако не виждате имейла.
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-forest-600 hover:text-forest-500 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Обратно към вход
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
          Забравена парола?
        </h1>
        <p className="text-wood-600 dark:text-cream-400">
          Въведи имейла си и ще ти изпратим линк за възстановяване
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">
            Имейл адрес
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
            <input
              type="email"
              {...register('email')}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                errors.email 
                  ? 'border-red-500' 
                  : 'border-wood-200 dark:border-wood-600'
              } bg-white dark:bg-wood-800 text-wood-800 dark:text-cream-100 focus:border-forest-500 focus:outline-none transition-colors`}
              placeholder="tvoyat@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
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
              Изпращане...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Изпрати линк
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
