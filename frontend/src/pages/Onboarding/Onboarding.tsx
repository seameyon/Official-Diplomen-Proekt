import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Target,
  Utensils,
  Check,
  Loader2,
  Scale,
  Activity,
  Clock,
  Zap,
  Timer,
  Briefcase,
  Dumbbell,
  Heart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';

const WOOD_TEXTURE_DARK =
  'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1920&q=80';
const WOOD_TEXTURE_LIGHT =
  'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=1920&q=80';

const STEPS = [
  { id: 'basics', title: 'Основни данни', icon: User },
  { id: 'body', title: 'Тяло', icon: Scale },
  { id: 'activity', title: 'Активност', icon: Activity },
  { id: 'goals', title: 'Цели', icon: Target },
  { id: 'diet', title: 'Диета', icon: Utensils },
  { id: 'preferences', title: 'Предпочитания', icon: Clock },
] as const;

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Заседнал', desc: 'Офис работа, малко движение', icon: Briefcase },
  { value: 'light', label: 'Лека активност', desc: '1-2 тренировки седмично', icon: Activity },
  { value: 'moderate', label: 'Умерена активност', desc: '3-5 тренировки седмично', icon: Heart },
  { value: 'active', label: 'Много активен', desc: '6-7 тренировки седмично', icon: Zap },
  {
    value: 'very_active',
    label: 'Професионален атлет',
    desc: 'Интензивни ежедневни тренировки',
    icon: Dumbbell,
  },
] as const;

const GOALS = [
  { value: 'lose_weight', label: 'Отслабване', desc: 'Здравословна загуба на тегло', icon: Scale },
  { value: 'maintain', label: 'Поддържане', desc: 'Запазване на текущото тегло', icon: Heart },
  { value: 'gain_muscle', label: 'Качване на мускули', desc: 'Увеличаване на мускулната маса', icon: Dumbbell },
] as const;

const DIETARY_PREFS = [
  { value: 'none', label: 'Без ограничения', desc: 'Ям всичко' },
  { value: 'vegetarian', label: 'Вегетарианец', desc: 'Без месо' },
  { value: 'vegan', label: 'Веган', desc: 'Без животински продукти' },
  { value: 'keto', label: 'Кето', desc: 'Ниско въглехидратна' },
] as const;

const ALLERGIES = [
  { value: 'gluten', label: 'Глутен' },
  { value: 'lactose', label: 'Лактоза' },
  { value: 'nuts', label: 'Ядки' },
  { value: 'eggs', label: 'Яйца' },
] as const;

const COOKING_TIMES = [
  { value: 'quick', label: 'Бързо', desc: 'До 30 минути', icon: Zap },
  { value: 'normal', label: 'Нормално', desc: '30-60 минути', icon: Timer },
  { value: 'elaborate', label: 'Сложно', desc: 'Над 60 минути', icon: Utensils },
  { value: 'meal_prep', label: 'Meal Prep', desc: 'За цялата седмица', icon: Briefcase },
] as const;

const BUDGETS = [
  { value: 'low', label: 'Икономичен', desc: 'До 50 лв/седмица' },
  { value: 'medium', label: 'Среден', desc: '50-100 лв/седмица' },
  { value: 'high', label: 'Без ограничение', desc: 'Качество над цена' },
] as const;

type SexType = 'male' | 'female' | 'other' | undefined;

interface HealthProfileInput {
  sex?: 'male' | 'female' | 'other';
  birthYear: number;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: string;
  goal: string;
  dietaryPreference: string;
  allergies: string[];
  dislikedIngredients: string[];
  cookingTime: string;
  mealsPerDay: number;
  budget: string;
  equipment: string[];
  hasMedicalCondition: boolean;
}

interface OnboardingFormData {
  sex: SexType;
  birthYear: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: string;
  goal: string;
  dietaryPreference: string;
  allergies: string[];
  dislikedIngredients: string;
  cookingTime: string;
  mealsPerDay: number;
  budget: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    sex: undefined,
    birthYear: 1995,
    height: 170,
    weight: 70,
    targetWeight: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
    dietaryPreference: 'none',
    allergies: [],
    dislikedIngredients: '',
    cookingTime: 'normal',
    mealsPerDay: 3,
    budget: 'medium',
  });

  const handleNumberChange = (field: keyof OnboardingFormData, value: string) => {
    const num = parseInt(value, 10);

    if (!Number.isNaN(num) && num >= 0) {
      setFormData((prev) => ({ ...prev, [field]: num }));
    } else if (value === '') {
      setFormData((prev) => ({ ...prev, [field]: 0 as never }));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const currentYear = new Date().getFullYear();

      const healthProfile: HealthProfileInput = {
        sex: formData.sex,
        birthYear: formData.birthYear,
        age: formData.birthYear ? currentYear - formData.birthYear : 0,
        height: formData.height,
        weight: formData.weight,
        targetWeight: formData.targetWeight,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        dietaryPreference: formData.dietaryPreference,
        allergies: formData.allergies,
        dislikedIngredients: formData.dislikedIngredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        cookingTime: formData.cookingTime,
        mealsPerDay: formData.mealsPerDay,
        budget: formData.budget,
        equipment: [],
        hasMedicalCondition: false,
      };

    await userApi.updateHealthProfile(healthProfile as any);
      updateUser({ hasCompletedOnboarding: true, healthProfile: healthProfile as any });
      toast.success('Профилът е запазен!');
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Грешка при запазване');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.sex;
      case 1:
        return formData.height > 0 && formData.weight > 0;
      default:
        return true;
    }
  };

  const bmi =
    formData.weight > 0 && formData.height > 0
      ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
      : '0';

  return (
    <div
      className="relative min-h-screen px-4 py-8"
      style={{
        backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div
        className={cn(
          'fixed inset-0 pointer-events-none',
          isDark ? 'bg-wood-900/80' : 'bg-orange-50/85'
        )}
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all',
                    index < currentStep
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : index === currentStep
                        ? 'bg-orange-500 text-white ring-4 ring-orange-500/30'
                        : 'bg-wood-200 text-wood-500 dark:bg-wood-700 dark:text-wood-400'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-1 hidden h-1 w-12 sm:block',
                      index < currentStep ? 'bg-orange-500' : 'bg-wood-200 dark:bg-wood-700'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-wood-800 dark:text-cream-100">
              {STEPS[currentStep].title}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-wood-200 bg-white p-6 shadow-xl dark:border-wood-600 dark:bg-wood-800 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Пол
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'male', label: 'Мъж', icon: User },
                        { value: 'female', label: 'Жена', icon: User },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              sex: option.value as 'male' | 'female',
                            }))
                          }
                          className={cn(
                            'rounded-xl border-2 p-4 text-center transition-all',
                            formData.sex === option.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 bg-cream-50 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700'
                          )}
                        >
                          <option.icon
                            className={cn(
                              'mx-auto mb-2 h-8 w-8',
                              formData.sex === option.value
                                ? 'text-orange-500'
                                : 'text-wood-400 dark:text-wood-500'
                            )}
                          />
                          <span className="font-medium text-wood-800 dark:text-cream-100">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Година на раждане
                    </label>
                    <select
                      value={formData.birthYear}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          birthYear: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border-2 border-wood-200 bg-cream-50 px-4 py-3 text-wood-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-100"
                    >
                      {Array.from(
                        { length: 80 },
                        (_, i) => new Date().getFullYear() - 10 - i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Височина (см)
                    </label>
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => handleNumberChange('height', e.target.value)}
                      className="w-full rounded-xl border-2 border-wood-200 bg-cream-50 px-4 py-3 text-wood-800 placeholder:text-wood-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-100"
                      min={100}
                      max={250}
                      placeholder="170"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Текущо тегло (кг)
                    </label>
                    <input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => handleNumberChange('weight', e.target.value)}
                      className="w-full rounded-xl border-2 border-wood-200 bg-cream-50 px-4 py-3 text-wood-800 placeholder:text-wood-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-100"
                      min={30}
                      max={300}
                      placeholder="70"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Целево тегло (кг)
                    </label>
                    <input
                      type="number"
                      value={formData.targetWeight || ''}
                      onChange={(e) => handleNumberChange('targetWeight', e.target.value)}
                      className="w-full rounded-xl border-2 border-wood-200 bg-cream-50 px-4 py-3 text-wood-800 placeholder:text-wood-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-100"
                      min={30}
                      max={300}
                      placeholder="70"
                    />
                  </div>

                  <div className="rounded-xl border-2 border-orange-200 bg-orange-100 p-4 dark:border-orange-800 dark:bg-orange-900/30">
                    <div className="mb-1 text-sm text-orange-700 dark:text-orange-400">
                      Твоето BMI
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                      {bmi}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-3">
                  {ACTIVITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, activityLevel: level.value }))
                      }
                      className={cn(
                        'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                        formData.activityLevel === level.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                          : 'border-wood-200 bg-cream-50 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700'
                      )}
                    >
                      <level.icon
                        className={cn(
                          'h-6 w-6',
                          formData.activityLevel === level.value
                            ? 'text-orange-500'
                            : 'text-wood-400 dark:text-wood-500'
                        )}
                      />
                      <div>
                        <div className="font-semibold text-wood-800 dark:text-cream-100">
                          {level.label}
                        </div>
                        <div className="text-sm text-wood-500 dark:text-cream-400">
                          {level.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-3">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, goal: goal.value }))}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                        formData.goal === goal.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                          : 'border-wood-200 bg-cream-50 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700'
                      )}
                    >
                      <goal.icon
                        className={cn(
                          'h-8 w-8',
                          formData.goal === goal.value
                            ? 'text-orange-500'
                            : 'text-wood-400 dark:text-wood-500'
                        )}
                      />
                      <div>
                        <div className="font-semibold text-wood-800 dark:text-cream-100">
                          {goal.label}
                        </div>
                        <div className="text-sm text-wood-500 dark:text-cream-400">
                          {goal.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Диетични предпочитания
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {DIETARY_PREFS.map((pref) => (
                        <button
                          key={pref.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              dietaryPreference: pref.value,
                            }))
                          }
                          className={cn(
                            'rounded-xl border-2 p-3 text-left transition-all',
                            formData.dietaryPreference === pref.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 bg-cream-50 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700'
                          )}
                        >
                          <div className="font-medium text-wood-800 dark:text-cream-100">
                            {pref.label}
                          </div>
                          <div className="text-xs text-wood-500 dark:text-cream-400">
                            {pref.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Алергии
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGIES.map((allergy) => (
                        <button
                          key={allergy.value}
                          type="button"
                          onClick={() => {
                            const newAllergies = formData.allergies.includes(allergy.value)
                              ? formData.allergies.filter((a) => a !== allergy.value)
                              : [...formData.allergies, allergy.value];

                            setFormData((prev) => ({
                              ...prev,
                              allergies: newAllergies,
                            }));
                          }}
                          className={cn(
                            'rounded-full border-2 px-4 py-2 text-sm font-medium transition-all',
                            formData.allergies.includes(allergy.value)
                              ? 'border-orange-500 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                              : 'border-wood-200 bg-cream-50 text-wood-600 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-300'
                          )}
                        >
                          {allergy.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Нелюбими продукти (разделени със запетая)
                    </label>
                    <input
                      type="text"
                      value={formData.dislikedIngredients}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dislikedIngredients: e.target.value,
                        }))
                      }
                      placeholder="напр: гъби, маслини"
                      className="w-full rounded-xl border-2 border-wood-200 bg-cream-50 px-4 py-3 text-wood-800 placeholder:text-wood-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-100"
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Време за готвене
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {COOKING_TIMES.map((time) => (
                        <button
                          key={time.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, cookingTime: time.value }))
                          }
                          className={cn(
                            'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                            formData.cookingTime === time.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 bg-cream-50 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700'
                          )}
                        >
                          <time.icon
                            className={cn(
                              'h-5 w-5',
                              formData.cookingTime === time.value
                                ? 'text-orange-500'
                                : 'text-wood-400 dark:text-wood-500'
                            )}
                          />
                          <div>
                            <div className="font-medium text-wood-800 dark:text-cream-100">
                              {time.label}
                            </div>
                            <div className="text-xs text-wood-500 dark:text-cream-400">
                              {time.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Хранения на ден
                    </label>
                    <div className="flex items-center gap-4">
                      {[2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, mealsPerDay: num }))
                          }
                          className={cn(
                            'h-12 w-12 rounded-xl border-2 font-bold transition-all',
                            formData.mealsPerDay === num
                              ? 'border-orange-500 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300'
                              : 'border-wood-200 bg-cream-50 text-wood-600 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700 dark:text-cream-300'
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-medium text-wood-700 dark:text-cream-300">
                      Бюджет
                    </label>
                    <div className="space-y-2">
                      {BUDGETS.map((budget) => (
                        <button
                          key={budget.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, budget: budget.value }))
                          }
                          className={cn(
                            'w-full rounded-xl border-2 p-3 text-left transition-all',
                            formData.budget === budget.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 bg-cream-50 hover:border-orange-300 dark:border-wood-600 dark:bg-wood-700'
                          )}
                        >
                          <div className="font-medium text-wood-800 dark:text-cream-100">
                            {budget.label}
                          </div>
                          <div className="text-xs text-wood-500 dark:text-cream-400">
                            {budget.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex justify-between border-t-2 border-wood-100 pt-6 dark:border-wood-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all',
                currentStep === 0
                  ? 'cursor-not-allowed text-wood-300 dark:text-wood-600'
                  : 'text-wood-600 hover:bg-wood-100 dark:text-cream-300 dark:hover:bg-wood-700'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
              Назад
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all',
                  canProceed()
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:from-orange-600 hover:to-amber-600'
                    : 'cursor-not-allowed bg-wood-200 text-wood-400 dark:bg-wood-700'
                )}
              >
                Напред
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-forest-700 hover:to-forest-600 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Запазване...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Завърши
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}