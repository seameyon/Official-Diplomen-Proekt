import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Flame,
  ChefHat,
  Loader2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Globe,
  Target,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { recipeApi } from '../../services/api';
import { mealdbApi } from '../../services/mealdb';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import toast from 'react-hot-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DAYS_BG: Record<string, string> = {
  monday: 'Понеделник',
  tuesday: 'Вторник',
  wednesday: 'Сряда',
  thursday: 'Четвъртък',
  friday: 'Петък',
  saturday: 'Събота',
  sunday: 'Неделя',
};

const DAYS_EN: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const MEAL_TYPES_BG: Record<string, string> = {
  breakfast: 'Закуска',
  lunch: 'Обяд',
  dinner: 'Вечеря',
};

const MEAL_TYPES_EN: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

interface Recipe {
  _id: string;
  title: string;
  mainImage?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  prepTime?: number;
  cookTime?: number;
  isFromAPI?: boolean;
  tags?: string[];
}

interface MealPlanDay {
  [key: string]: Recipe | null;
}

interface MealPlan {
  [key: string]: MealPlanDay;
}

interface HealthProfile {
  weight?: number;
  height?: number;
  birthYear?: number;
  sex?: string;
  gender?: string;
  activityLevel?: string;
  goal?: string;
}

// Common recipe name translations to Bulgarian
const RECIPE_TRANSLATIONS: Record<string, string> = {
  Chicken: 'Пиле',
  Beef: 'Телешко',
  Pork: 'Свинско',
  Lamb: 'Агнешко',
  Fish: 'Риба',
  Salmon: 'Сьомга',
  Tuna: 'Тон',
  Pasta: 'Паста',
  Rice: 'Ориз',
  Soup: 'Супа',
  Salad: 'Салата',
  Curry: 'Къри',
  Stew: 'Яхния',
  Roast: 'Печено',
  Grilled: 'На скара',
  Fried: 'Пържено',
  Baked: 'Печено',
  Pie: 'Пай',
  Cake: 'Торта',
  Pancakes: 'Палачинки',
  Breakfast: 'Закуска',
  and: 'и',
  with: 'с',
  in: 'в',
  Spicy: 'Пикантно',
  Sweet: 'Сладко',
  Sour: 'Кисело',
  Creamy: 'Кремообразно',
  Crispy: 'Хрупкаво',
  Teriyaki: 'Териаки',
  Sushi: 'Суши',
  Noodles: 'Нудълс',
  Dumplings: 'Кнедли',
  Tacos: 'Такос',
  Burger: 'Бургер',
  Pizza: 'Пица',
  Sandwich: 'Сандвич',
  Wrap: 'Рап',
  Bowl: 'Купичка',
  Casserole: 'Гювеч',
  Lasagna: 'Лазаня',
  Risotto: 'Ризото',
  Omelette: 'Омлет',
  Scrambled: 'Бъркани',
  Eggs: 'Яйца',
  Toast: 'Тост',
  Bread: 'Хляб',
  Cheese: 'Сирене',
  Vegetable: 'Зеленчуков',
  Mushroom: 'Гъби',
  Potato: 'Картофи',
  Tomato: 'Домат',
  Onion: 'Лук',
  Garlic: 'Чесън',
  Honey: 'Мед',
  Lemon: 'Лимон',
  Orange: 'Портокал',
  Apple: 'Ябълка',
  Banana: 'Банан',
  Chocolate: 'Шоколад',
  Vanilla: 'Ванилия',
  Cinnamon: 'Канела',
};

// Translate recipe title to Bulgarian
const translateRecipeTitle = (title: string, language: string): string => {
  if (language !== 'bg') return title;

  let translated = title;
  Object.entries(RECIPE_TRANSLATIONS).forEach(([en, bg]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, bg);
  });

  return translated;
};

function MealCard({
  meal,
  mealType,
  language,
}: {
  meal: Recipe | null;
  mealType: string;
  language: string;
}) {
  const mealLabels = language === 'bg' ? MEAL_TYPES_BG : MEAL_TYPES_EN;

  if (!meal) {
    return (
      <div className="rounded-xl border-2 border-dashed border-wood-300 bg-cream-50 p-4 dark:border-wood-600 dark:bg-wood-800/50">
        <span className="text-xs font-medium uppercase text-wood-400">
          {mealLabels[mealType]}
        </span>
        <p className="mt-2 text-sm italic text-wood-400 dark:text-wood-500">
          {language === 'bg' ? 'Няма избрана рецепта' : 'No recipe selected'}
        </p>
      </div>
    );
  }

  const totalTime = (meal.prepTime || 0) + (meal.cookTime || 0);
  const translatedTitle = translateRecipeTitle(meal.title, language);

  return (
    <Link
      to={meal.isFromAPI ? `/recipes/api/${meal._id}` : `/recipes/${meal._id}`}
      className="group block rounded-xl border-2 border-wood-200 bg-cream-100 p-4 transition-all hover:border-forest-500 dark:border-wood-600 dark:bg-wood-800 dark:hover:border-forest-500"
    >
      <div className="flex items-start gap-3">
        <img
          src={
            meal.mainImage ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'
          }
          alt={meal.title}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium uppercase text-wood-500 dark:text-cream-500">
              {mealLabels[mealType]}
            </span>
            {meal.isFromAPI && (
              <span className="flex items-center gap-1 rounded-full bg-forest-100 px-2 py-0.5 text-xs text-forest-700 dark:bg-forest-900/30 dark:text-forest-400">
                <Globe className="h-3 w-3" />
                MealDB
              </span>
            )}
          </div>
          <h4 className="line-clamp-1 font-semibold text-wood-800 group-hover:text-forest-600 dark:text-cream-100">
            {translatedTitle}
          </h4>
          {language === 'bg' && translatedTitle !== meal.title && (
            <p className="line-clamp-1 text-xs text-wood-400 dark:text-cream-500">{meal.title}</p>
          )}
          <div className="mt-1 flex gap-3 text-xs text-wood-500 dark:text-cream-400">
            {meal.nutrition?.calories && (
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-forest-500" />
                {meal.nutrition.calories} {language === 'bg' ? 'ккал' : 'kcal'}
              </span>
            )}
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {totalTime} {language === 'bg' ? 'мин' : 'min'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function DayCard({
  day,
  dayPlan,
  language,
}: {
  day: string;
  dayPlan: MealPlanDay;
  language: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const dayLabels = language === 'bg' ? DAYS_BG : DAYS_EN;

  const totalCalories = MEAL_TYPES.reduce((sum, type) => {
    const meal = dayPlan[type];
    return sum + (meal?.nutrition?.calories || 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border-2 border-wood-200 bg-cream-100 dark:border-wood-600 dark:bg-wood-800"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-cream-200 dark:hover:bg-wood-700"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-forest-500 to-forest-600 text-lg font-bold text-white shadow-lg">
            {dayLabels[day]?.charAt(0)}
          </div>
          <div className="text-left">
            <h3 className="font-serif font-semibold text-wood-800 dark:text-cream-100">
              {dayLabels[day]}
            </h3>
            <p className="text-sm text-wood-500 dark:text-cream-400">
              {totalCalories} {language === 'bg' ? 'ккал общо' : 'kcal total'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-wood-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-wood-400" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3 p-4 pt-0">
          {MEAL_TYPES.map((type) => (
            <MealCard key={type} meal={dayPlan[type]} mealType={type} language={language} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function MealPlan() {
  const { user } = useAuthStore();
  const { language } = useThemeStore();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  const healthProfile: HealthProfile = user?.healthProfile || {};
  const weight = healthProfile.weight || 0;
  const height = healthProfile.height || 0;
  const birthYear = healthProfile.birthYear || 0;
  const currentYear = new Date().getFullYear();
  const age = birthYear > 0 ? currentYear - birthYear : 30;
  const gender = healthProfile.sex || healthProfile.gender || 'male';
  const activityLevel = healthProfile.activityLevel || 'moderate';
  const goal = healthProfile.goal || 'maintain';

  const calculateDailyCalories = (): number => {
    if (!weight || !height) return 2000;

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

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    switch (goal) {
      case 'lose':
      case 'lose_weight':
        return Math.round(tdee - 500);
      case 'gain':
      case 'gain_muscle':
        return Math.round(tdee + 300);
      default:
        return Math.round(tdee);
    }
  };

  const dailyCalorieTarget = calculateDailyCalories();

  const mealCalorieTargets = {
    breakfast: Math.round(dailyCalorieTarget * 0.25),
    lunch: Math.round(dailyCalorieTarget * 0.35),
    dinner: Math.round(dailyCalorieTarget * 0.35),
  };

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const userRecipes = await recipeApi.getAll({ limit: 100 });
        const apiRecipes = await mealdbApi.getRandom(30);
        const combined = [...(userRecipes.recipes || []), ...apiRecipes];
        setAllRecipes(combined);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchAllRecipes();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('mealPlan');
    if (saved) {
      try {
        setMealPlan(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading meal plan:', e);
      }
    }
  }, []);

  const findRecipeByCalories = (recipes: Recipe[], targetCalories: number): Recipe => {
    if (recipes.length === 0) return recipes[0];

    const sorted = [...recipes].sort((a, b) => {
      const aDiff = Math.abs((a.nutrition?.calories || 300) - targetCalories);
      const bDiff = Math.abs((b.nutrition?.calories || 300) - targetCalories);
      return aDiff - bDiff;
    });

    const topCandidates = sorted.slice(0, Math.min(5, sorted.length));
    return topCandidates[Math.floor(Math.random() * topCandidates.length)];
  };

  const generatePlan = async () => {
    if (allRecipes.length === 0) {
      toast.error(language === 'bg' ? 'Няма налични рецепти' : 'No recipes available');
      return;
    }

    setGenerating(true);

    try {
      const plan: MealPlan = {};

      const lightRecipes = allRecipes.filter((r) => (r.nutrition?.calories || 300) <= 400);
      const mediumRecipes = allRecipes.filter(
        (r) => (r.nutrition?.calories || 300) > 400 && (r.nutrition?.calories || 300) <= 600
      );
      const heavyRecipes = allRecipes.filter((r) => (r.nutrition?.calories || 300) > 600);

      const breakfastPool = lightRecipes.length > 3 ? lightRecipes : allRecipes;
      const lunchPool = mediumRecipes.length > 3 ? mediumRecipes : allRecipes;
      const dinnerPool =
        mediumRecipes.length > 3 ? [...mediumRecipes, ...heavyRecipes] : allRecipes;

      const usedRecipes: Set<string> = new Set();

      for (const day of DAYS) {
        const getAvailable = (pool: Recipe[]) => pool.filter((r) => !usedRecipes.has(r._id));

        const breakfast = findRecipeByCalories(
          getAvailable(breakfastPool).length > 0 ? getAvailable(breakfastPool) : breakfastPool,
          mealCalorieTargets.breakfast
        );

        const lunch = findRecipeByCalories(
          getAvailable(lunchPool).length > 0 ? getAvailable(lunchPool) : lunchPool,
          mealCalorieTargets.lunch
        );

        const dinner = findRecipeByCalories(
          getAvailable(dinnerPool).length > 0 ? getAvailable(dinnerPool) : dinnerPool,
          mealCalorieTargets.dinner
        );

        plan[day] = { breakfast, lunch, dinner };

        usedRecipes.add(breakfast._id);
        usedRecipes.add(lunch._id);
        usedRecipes.add(dinner._id);

        if (usedRecipes.size > 18) {
          const arr = Array.from(usedRecipes);
          arr.slice(0, 9).forEach((id) => usedRecipes.delete(id));
        }
      }

      localStorage.setItem('mealPlan', JSON.stringify(plan));
      setMealPlan(plan);

      toast.success(language === 'bg' ? 'Планът е генериран!' : 'Plan generated!');
    } catch (error) {
      toast.error(language === 'bg' ? 'Грешка при генериране' : 'Generation error');
    } finally {
      setGenerating(false);
    }
  };

  const t = {
    title: language === 'bg' ? 'AI Хранителен План' : 'AI Meal Plan',
    subtitle:
      language === 'bg'
        ? 'Персонализиран план според твоите цели'
        : 'Personalized plan based on your goals',
    generate: language === 'bg' ? 'Генерирай план' : 'Generate Plan',
    regenerate: language === 'bg' ? 'Генерирай нов' : 'Regenerate',
    generating: language === 'bg' ? 'Генериране...' : 'Generating...',
    noplan:
      language === 'bg'
        ? 'Все още нямаш план. Генерирай един!'
        : "You don't have a plan yet. Generate one!",
    recipesAvailable:
      language === 'bg'
        ? `${allRecipes.length} рецепти налични`
        : `${allRecipes.length} recipes available`,
    dailyTarget: language === 'bg' ? 'Дневна цел' : 'Daily Target',
    yourGoal: language === 'bg' ? 'Твоята цел' : 'Your Goal',
    goals: {
      lose: language === 'bg' ? 'Отслабване' : 'Lose weight',
      lose_weight: language === 'bg' ? 'Отслабване' : 'Lose weight',
      maintain: language === 'bg' ? 'Поддържане' : 'Maintain',
      gain: language === 'bg' ? 'Качване' : 'Gain weight',
      gain_muscle: language === 'bg' ? 'Качване' : 'Gain muscle',
    },
    noProfile:
      language === 'bg'
        ? 'Настрой здравния си профил за персонализиран план'
        : 'Set up your health profile for a personalized plan',
    goToProfile: language === 'bg' ? 'Към профила' : 'Go to Profile',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-24 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-forest-500 to-forest-600 p-3 text-white shadow-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-wood-800 dark:text-cream-100 sm:text-3xl">
              {t.title}
            </h1>
            <p className="text-wood-600 dark:text-cream-400">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {weight && height ? (
        <div className="mb-6 rounded-2xl border-2 border-forest-200 bg-gradient-to-r from-forest-50 to-orange-50 p-4 dark:border-forest-700 dark:from-forest-900/30 dark:to-wood-800">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white p-2 dark:bg-wood-700">
                <Target className="h-5 w-5 text-forest-600 dark:text-forest-400" />
              </div>
              <div>
                <p className="text-xs text-wood-500 dark:text-cream-500">{t.yourGoal}</p>
                <p className="font-semibold text-wood-800 dark:text-cream-100">
                  {t.goals[goal as keyof typeof t.goals] || goal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white p-2 dark:bg-wood-700">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-wood-500 dark:text-cream-500">{t.dailyTarget}</p>
                <p className="font-semibold text-wood-800 dark:text-cream-100">
                  {dailyCalorieTarget} kcal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white p-2 dark:bg-wood-700">
                <Scale className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-wood-500 dark:text-cream-500">
                  {language === 'bg' ? 'Тегло' : 'Weight'}
                </p>
                <p className="font-semibold text-wood-800 dark:text-cream-100">{weight} kg</p>
              </div>
            </div>

            <Link
              to="/profile"
              className="ml-auto text-sm text-forest-600 hover:underline dark:text-forest-400"
            >
              {language === 'bg' ? 'Промени' : 'Edit'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
            <div className="flex-1">
              <p className="font-medium text-orange-800 dark:text-orange-200">{t.noProfile}</p>
              <Link
                to="/settings"
                className="mt-2 inline-flex items-center gap-1 text-sm text-orange-600 hover:underline dark:text-orange-400"
              >
                {t.goToProfile} →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm text-wood-500 dark:text-cream-500">
          <ChefHat className="h-4 w-4" />
          {t.recipesAvailable}
        </span>
      </div>

      <div className="mb-8">
        <button
          onClick={generatePlan}
          disabled={generating || allRecipes.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-forest-600 hover:to-forest-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {mealPlan ? t.regenerate : t.generate}
            </>
          )}
        </button>
      </div>

      {mealPlan ? (
        <div className="space-y-4">
          {DAYS.map((day) => (
            <DayCard
              key={day}
              day={day}
              dayPlan={mealPlan[day] || { breakfast: null, lunch: null, dinner: null }}
              language={language}
            />
          ))}

          <div className="rounded-2xl border-2 border-orange-200 bg-white p-4 dark:border-wood-600 dark:bg-wood-800">
            <h3 className="mb-3 font-semibold text-wood-800 dark:text-cream-100">
              {language === 'bg' ? 'Седмична статистика' : 'Weekly Summary'}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
              <div>
                <p className="text-2xl font-bold text-forest-600 dark:text-forest-400">
                  {Math.round(
                    DAYS.reduce((sum, day) => {
                      const dayPlan = mealPlan[day];
                      return (
                        sum +
                        MEAL_TYPES.reduce((mealSum, type) => {
                          return mealSum + (dayPlan?.[type]?.nutrition?.calories || 0);
                        }, 0)
                      );
                    }, 0) / 7
                  )}
                </p>
                <p className="text-xs text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Ср. дневни kcal' : 'Avg daily kcal'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dailyCalorieTarget}
                </p>
                <p className="text-xs text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Цел kcal' : 'Target kcal'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">21</p>
                <p className="text-xs text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Ястия' : 'Meals'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {
                    new Set(
                      DAYS.flatMap((day) =>
                        MEAL_TYPES.map((type) => mealPlan[day]?.[type]?._id).filter(Boolean)
                      )
                    ).size
                  }
                </p>
                <p className="text-xs text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Уникални' : 'Unique'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-wood-200 bg-cream-100 py-16 text-center dark:border-wood-600 dark:bg-wood-800">
          <Calendar className="mx-auto mb-4 h-16 w-16 text-wood-300 dark:text-wood-600" />
          <h3 className="mb-2 text-xl font-semibold font-serif text-wood-800 dark:text-cream-100">
            {t.noplan}
          </h3>
          <p className="text-wood-500 dark:text-cream-400">{t.recipesAvailable}</p>
        </div>
      )}
    </div>
  );
}