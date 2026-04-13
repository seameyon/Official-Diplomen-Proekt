import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, User, Target, Utensils, 
  Check, Loader2, Scale, Activity, Clock,
  Zap, Timer, Briefcase, Dumbbell, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';

// Wood texture backgrounds
const WOOD_TEXTURE_DARK = 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1920&q=80';
const WOOD_TEXTURE_LIGHT = 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=1920&q=80';

const STEPS = [
  { id: 'basics', title: 'Основни данни', icon: User },
  { id: 'body', title: 'Тяло', icon: Scale },
  { id: 'activity', title: 'Активност', icon: Activity },
  { id: 'goals', title: 'Цели', icon: Target },
  { id: 'diet', title: 'Диета', icon: Utensils },
  { id: 'preferences', title: 'Предпочитания', icon: Clock },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Заседнал', desc: 'Офис работа, малко движение', icon: Briefcase },
  { value: 'light', label: 'Лека активност', desc: '1-2 тренировки седмично', icon: Activity },
  { value: 'moderate', label: 'Умерена активност', desc: '3-5 тренировки седмично', icon: Heart },
  { value: 'active', label: 'Много активен', desc: '6-7 тренировки седмично', icon: Zap },
  { value: 'very_active', label: 'Професионален атлет', desc: 'Интензивни ежедневни тренировки', icon: Dumbbell },
];

const GOALS = [
  { value: 'lose_weight', label: 'Отслабване', desc: 'Здравословна загуба на тегло', icon: Scale },
  { value: 'maintain', label: 'Поддържане', desc: 'Запазване на текущото тегло', icon: Heart },
  { value: 'gain_muscle', label: 'Качване на мускули', desc: 'Увеличаване на мускулната маса', icon: Dumbbell },
];

const DIETARY_PREFS = [
  { value: 'none', label: 'Без ограничения', desc: 'Ям всичко' },
  { value: 'vegetarian', label: 'Вегетарианец', desc: 'Без месо' },
  { value: 'vegan', label: 'Веган', desc: 'Без животински продукти' },
  { value: 'keto', label: 'Кето', desc: 'Ниско въглехидратна' },
];

const ALLERGIES = [
  { value: 'gluten', label: 'Глутен' },
  { value: 'lactose', label: 'Лактоза' },
  { value: 'nuts', label: 'Ядки' },
  { value: 'eggs', label: 'Яйца' },
];

const COOKING_TIMES = [
  { value: 'quick', label: 'Бързо', desc: 'До 30 минути', icon: Zap },
  { value: 'normal', label: 'Нормално', desc: '30-60 минути', icon: Timer },
  { value: 'elaborate', label: 'Сложно', desc: 'Над 60 минути', icon: Utensils },
  { value: 'meal_prep', label: 'Meal Prep', desc: 'За цялата седмица', icon: Briefcase },
];

const BUDGETS = [
  { value: 'low', label: 'Икономичен', desc: 'До 50 лв/седмица' },
  { value: 'medium', label: 'Среден', desc: '50-100 лв/седмица' },
  { value: 'high', label: 'Без ограничение', desc: 'Качество над цена' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    sex: '' as 'male' | 'female' | '',
    birthYear: 1995,
    height: 170,
    weight: 70,
    targetWeight: 70,
    activityLevel: 'moderate',
    goal: 'maintain',
    dietaryPreference: 'none',
    allergies: [] as string[],
    dislikedIngredients: '',
    cookingTime: 'normal',
    mealsPerDay: 3,
    budget: 'medium',
  });

  const handleNumberChange = (field: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setFormData({ ...formData, [field]: num });
    } else if (value === '') {
      setFormData({ ...formData, [field]: 0 });
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const healthProfile = {
        sex: formData.sex,
        birthYear: formData.birthYear,
        height: formData.height,
        weight: formData.weight,
        targetWeight: formData.targetWeight,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        dietaryPreference: formData.dietaryPreference,
        allergies: formData.allergies,
        dislikedIngredients: formData.dislikedIngredients.split(',').map(s => s.trim()).filter(Boolean),
        cookingTime: formData.cookingTime,
        mealsPerDay: formData.mealsPerDay,
        budget: formData.budget,
      };

      await userApi.updateHealthProfile(healthProfile);
      updateUser({ hasCompletedOnboarding: true, healthProfile });
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
      case 0: return formData.sex !== '';
      case 1: return formData.height > 0 && formData.weight > 0;
      default: return true;
    }
  };

  const bmi = formData.weight > 0 && formData.height > 0 
    ? (formData.weight / Math.pow(formData.height / 100, 2)).toFixed(1)
    : '0';

  return (
    <div 
      className="min-h-screen py-8 px-4 relative"
      style={{
        backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay */}
      <div className={cn(
        "fixed inset-0 pointer-events-none",
        isDark ? 'bg-wood-900/80' : 'bg-orange-50/85'
      )} />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  index < currentStep 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    : index === currentStep
                    ? 'bg-orange-500 text-white ring-4 ring-orange-500/30'
                    : 'bg-wood-200 dark:bg-wood-700 text-wood-500 dark:text-wood-400'
                )}>
                  {index < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    'hidden sm:block w-12 h-1 mx-1',
                    index < currentStep ? 'bg-orange-500' : 'bg-wood-200 dark:bg-wood-700'
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-wood-800 dark:text-cream-100">{STEPS[currentStep].title}</h2>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-wood-200 dark:border-wood-600">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 0: Basics */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-3">Пол</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'male', label: 'Мъж', icon: User },
                        { value: 'female', label: 'Жена', icon: User },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, sex: option.value as 'male' | 'female' })}
                          className={cn(
                            'p-4 rounded-xl border-2 transition-all text-center',
                            formData.sex === option.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 dark:border-wood-600 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                          )}
                        >
                          <option.icon className={cn(
                            'w-8 h-8 mx-auto mb-2',
                            formData.sex === option.value ? 'text-orange-500' : 'text-wood-400 dark:text-wood-500'
                          )} />
                          <span className="font-medium text-wood-800 dark:text-cream-100">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">Година на раждане</label>
                    <select
                      value={formData.birthYear}
                      onChange={(e) => setFormData({ ...formData, birthYear: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-50 dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 10 - i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 1: Body */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">Височина (см)</label>
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => handleNumberChange('height', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-50 dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min={100}
                      max={250}
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">Текущо тегло (кг)</label>
                    <input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => handleNumberChange('weight', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-50 dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min={30}
                      max={300}
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">Целево тегло (кг)</label>
                    <input
                      type="number"
                      value={formData.targetWeight || ''}
                      onChange={(e) => handleNumberChange('targetWeight', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-50 dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      min={30}
                      max={300}
                      placeholder="70"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-800">
                    <div className="text-sm text-orange-700 dark:text-orange-400 mb-1">Твоето BMI</div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">{bmi}</div>
                  </div>
                </div>
              )}

              {/* Step 2: Activity */}
              {currentStep === 2 && (
                <div className="space-y-3">
                  {ACTIVITY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4',
                        formData.activityLevel === level.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                          : 'border-wood-200 dark:border-wood-600 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                      )}
                    >
                      <level.icon className={cn(
                        'w-6 h-6',
                        formData.activityLevel === level.value ? 'text-orange-500' : 'text-wood-400 dark:text-wood-500'
                      )} />
                      <div>
                        <div className="font-semibold text-wood-800 dark:text-cream-100">{level.label}</div>
                        <div className="text-sm text-wood-500 dark:text-cream-400">{level.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setFormData({ ...formData, goal: goal.value })}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4',
                        formData.goal === goal.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                          : 'border-wood-200 dark:border-wood-600 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                      )}
                    >
                      <goal.icon className={cn(
                        'w-8 h-8',
                        formData.goal === goal.value ? 'text-orange-500' : 'text-wood-400 dark:text-wood-500'
                      )} />
                      <div>
                        <div className="font-semibold text-wood-800 dark:text-cream-100">{goal.label}</div>
                        <div className="text-sm text-wood-500 dark:text-cream-400">{goal.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4: Diet */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-3">Диетични предпочитания</label>
                    <div className="grid grid-cols-2 gap-3">
                      {DIETARY_PREFS.map((pref) => (
                        <button
                          key={pref.value}
                          onClick={() => setFormData({ ...formData, dietaryPreference: pref.value })}
                          className={cn(
                            'p-3 rounded-xl border-2 text-left transition-all',
                            formData.dietaryPreference === pref.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 dark:border-wood-600 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                          )}
                        >
                          <div className="font-medium text-wood-800 dark:text-cream-100">{pref.label}</div>
                          <div className="text-xs text-wood-500 dark:text-cream-400">{pref.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-3">Алергии</label>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGIES.map((allergy) => (
                        <button
                          key={allergy.value}
                          onClick={() => {
                            const newAllergies = formData.allergies.includes(allergy.value)
                              ? formData.allergies.filter(a => a !== allergy.value)
                              : [...formData.allergies, allergy.value];
                            setFormData({ ...formData, allergies: newAllergies });
                          }}
                          className={cn(
                            'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all',
                            formData.allergies.includes(allergy.value)
                              ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                              : 'border-wood-200 dark:border-wood-600 text-wood-600 dark:text-cream-300 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                          )}
                        >
                          {allergy.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">Нелюбими продукти (разделени със запетая)</label>
                    <input
                      type="text"
                      value={formData.dislikedIngredients}
                      onChange={(e) => setFormData({ ...formData, dislikedIngredients: e.target.value })}
                      placeholder="напр: гъби, маслини"
                      className="w-full px-4 py-3 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-50 dark:bg-wood-700 text-wood-800 dark:text-cream-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-wood-400"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Preferences */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-3">Време за готвене</label>
                    <div className="grid grid-cols-2 gap-3">
                      {COOKING_TIMES.map((time) => (
                        <button
                          key={time.value}
                          onClick={() => setFormData({ ...formData, cookingTime: time.value })}
                          className={cn(
                            'p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                            formData.cookingTime === time.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 dark:border-wood-600 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                          )}
                        >
                          <time.icon className={cn(
                            'w-5 h-5',
                            formData.cookingTime === time.value ? 'text-orange-500' : 'text-wood-400 dark:text-wood-500'
                          )} />
                          <div>
                            <div className="font-medium text-wood-800 dark:text-cream-100">{time.label}</div>
                            <div className="text-xs text-wood-500 dark:text-cream-400">{time.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-2">Хранения на ден</label>
                    <div className="flex items-center gap-4">
                      {[2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setFormData({ ...formData, mealsPerDay: num })}
                          className={cn(
                            'w-12 h-12 rounded-xl border-2 font-bold transition-all',
                            formData.mealsPerDay === num
                              ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
                              : 'border-wood-200 dark:border-wood-600 text-wood-600 dark:text-cream-300 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-wood-700 dark:text-cream-300 mb-3">Бюджет</label>
                    <div className="space-y-2">
                      {BUDGETS.map((budget) => (
                        <button
                          key={budget.value}
                          onClick={() => setFormData({ ...formData, budget: budget.value })}
                          className={cn(
                            'w-full p-3 rounded-xl border-2 text-left transition-all',
                            formData.budget === budget.value
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-wood-200 dark:border-wood-600 hover:border-orange-300 bg-cream-50 dark:bg-wood-700'
                          )}
                        >
                          <div className="font-medium text-wood-800 dark:text-cream-100">{budget.label}</div>
                          <div className="text-xs text-wood-500 dark:text-cream-400">{budget.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-wood-100 dark:border-wood-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
                currentStep === 0
                  ? 'text-wood-300 dark:text-wood-600 cursor-not-allowed'
                  : 'text-wood-600 dark:text-cream-300 hover:bg-wood-100 dark:hover:bg-wood-700'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
                  canProceed()
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg'
                    : 'bg-wood-200 dark:bg-wood-700 text-wood-400 cursor-not-allowed'
                )}
              >
                Напред
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-forest-600 to-forest-500 text-white hover:from-forest-700 hover:to-forest-600 shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Запазване...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
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
