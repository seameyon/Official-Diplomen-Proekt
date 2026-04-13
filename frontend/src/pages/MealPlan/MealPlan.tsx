import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, RefreshCw, Clock, Flame, ChefHat, 
  Loader2, ChevronRight, ChevronDown, Sparkles, Globe,
  Target, Scale, Activity, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { recipeApi, mealPlanApi, userApi } from '../../services/api';
import { mealdbApi } from '../../services/mealdb';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';
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
  nutrition?: { calories?: number; protein?: number; carbs?: number; fat?: number };
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

// Common recipe name translations to Bulgarian
const RECIPE_TRANSLATIONS: Record<string, string> = {
  'Chicken': 'Пиле',
  'Beef': 'Телешко',
  'Pork': 'Свинско',
  'Lamb': 'Агнешко',
  'Fish': 'Риба',
  'Salmon': 'Сьомга',
  'Tuna': 'Тон',
  'Pasta': 'Паста',
  'Rice': 'Ориз',
  'Soup': 'Супа',
  'Salad': 'Салата',
  'Curry': 'Къри',
  'Stew': 'Яхния',
  'Roast': 'Печено',
  'Grilled': 'На скара',
  'Fried': 'Пържено',
  'Baked': 'Печено',
  'Pie': 'Пай',
  'Cake': 'Торта',
  'Pancakes': 'Палачинки',
  'Breakfast': 'Закуска',
  'and': 'и',
  'with': 'с',
  'in': 'в',
  'Spicy': 'Пикантно',
  'Sweet': 'Сладко',
  'Sour': 'Кисело',
  'Creamy': 'Кремообразно',
  'Crispy': 'Хрупкаво',
  'Teriyaki': 'Териаки',
  'Sushi': 'Суши',
  'Noodles': 'Нудълс',
  'Dumplings': 'Кнедли',
  'Tacos': 'Такос',
  'Burger': 'Бургер',
  'Pizza': 'Пица',
  'Sandwich': 'Сандвич',
  'Wrap': 'Рап',
  'Bowl': 'Купичка',
  'Casserole': 'Гювеч',
  'Lasagna': 'Лазаня',
  'Risotto': 'Ризото',
  'Omelette': 'Омлет',
  'Scrambled': 'Бъркани',
  'Eggs': 'Яйца',
  'Toast': 'Тост',
  'Bread': 'Хляб',
  'Cheese': 'Сирене',
  'Vegetable': 'Зеленчуков',
  'Mushroom': 'Гъби',
  'Potato': 'Картофи',
  'Tomato': 'Домат',
  'Onion': 'Лук',
  'Garlic': 'Чесън',
  'Honey': 'Мед',
  'Lemon': 'Лимон',
  'Orange': 'Портокал',
  'Apple': 'Ябълка',
  'Banana': 'Банан',
  'Chocolate': 'Шоколад',
  'Vanilla': 'Ванилия',
  'Cinnamon': 'Канела',
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

function MealCard({ meal, mealType, language }: { meal: Recipe | null; mealType: string; language: string }) {
  const mealLabels = language === 'bg' ? MEAL_TYPES_BG : MEAL_TYPES_EN;
  
  if (!meal) {
    return (
      <div className="p-4 rounded-xl border-2 border-dashed border-wood-300 dark:border-wood-600 bg-cream-50 dark:bg-wood-800/50">
        <span className="text-xs font-medium text-wood-400 uppercase">{mealLabels[mealType]}</span>
        <p className="text-wood-400 dark:text-wood-500 mt-2 text-sm italic">
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
      className="block p-4 rounded-xl border-2 border-wood-200 dark:border-wood-600 bg-cream-100 dark:bg-wood-800 hover:border-forest-500 dark:hover:border-forest-500 transition-all group"
    >
      <div className="flex items-start gap-3">
        <img
          src={meal.mainImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop'}
          alt={meal.title}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-wood-500 dark:text-cream-500 uppercase">{mealLabels[mealType]}</span>
            {meal.isFromAPI && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                MealDB
              </span>
            )}
          </div>
          <h4 className="font-semibold text-wood-800 dark:text-cream-100 line-clamp-1 group-hover:text-forest-600">
            {translatedTitle}
          </h4>
          {language === 'bg' && translatedTitle !== meal.title && (
            <p className="text-xs text-wood-400 dark:text-cream-500 line-clamp-1">
              {meal.title}
            </p>
          )}
          <div className="flex gap-3 mt-1 text-xs text-wood-500 dark:text-cream-400">
            {meal.nutrition?.calories && (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-forest-500" />
                {meal.nutrition.calories} {language === 'bg' ? 'ккал' : 'kcal'}
              </span>
            )}
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalTime} {language === 'bg' ? 'мин' : 'min'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function DayCard({ day, dayPlan, language }: { day: string; dayPlan: MealPlanDay; language: string }) {
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
      className="bg-cream-100 dark:bg-wood-800 rounded-2xl border-2 border-wood-200 dark:border-wood-600 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-cream-200 dark:hover:bg-wood-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
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
          <ChevronDown className="w-5 h-5 text-wood-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-wood-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {MEAL_TYPES.map((type) => (
            <MealCard key={type} meal={dayPlan[type]} mealType={type} language={language} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function MealPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { language } = useThemeStore();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);

  // Get health profile data
  const healthProfile = user?.healthProfile || {};
  const weight = healthProfile.weight || 0;
  const height = healthProfile.height || 0;
  const birthYear = healthProfile.birthYear || 0;
  const currentYear = new Date().getFullYear();
  const age = birthYear > 0 ? currentYear - birthYear : 30;
  const gender = healthProfile.sex || healthProfile.gender || 'male';
  const activityLevel = healthProfile.activityLevel || 'moderate';
  const goal = healthProfile.goal || 'maintain';

  // Calculate daily calories based on user profile
  const calculateDailyCalories = (): number => {
    if (!weight || !height) return 2000; // Default
    
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

    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    // Adjust based on goal
    switch (goal) {
      case 'lose':
      case 'lose_weight':
        return Math.round(tdee - 500); // 500 calorie deficit
      case 'gain':
      case 'gain_muscle':
        return Math.round(tdee + 300); // 300 calorie surplus
      default:
        return Math.round(tdee);
    }
  };

  const dailyCalorieTarget = calculateDailyCalories();
  const mealCalorieTargets = {
    breakfast: Math.round(dailyCalorieTarget * 0.25), // 25% of daily
    lunch: Math.round(dailyCalorieTarget * 0.35),     // 35% of daily
    dinner: Math.round(dailyCalorieTarget * 0.35),    // 35% of daily
    // Remaining 5% for snacks
  };

  // Fetch all recipes (user + API)
  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        // Get user recipes
        const userRecipes = await recipeApi.getAll({ limit: 100 });
        
        // Get API recipes
        const apiRecipes = await mealdbApi.getRandom(30);
        
        // Combine
        const combined = [...(userRecipes.recipes || []), ...apiRecipes];
        setAllRecipes(combined);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchAllRecipes();
  }, []);

  // Load saved meal plan
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

  // Find recipe closest to target calories
  const findRecipeByCalories = (recipes: Recipe[], targetCalories: number): Recipe => {
    if (recipes.length === 0) return recipes[0];
    
    // Sort by how close they are to target
    const sorted = [...recipes].sort((a, b) => {
      const aDiff = Math.abs((a.nutrition?.calories || 300) - targetCalories);
      const bDiff = Math.abs((b.nutrition?.calories || 300) - targetCalories);
      return aDiff - bDiff;
    });

    // Pick from top 5 closest (with some randomness)
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
      
      // Group recipes by approximate calorie ranges
      const lightRecipes = allRecipes.filter(r => 
        (r.nutrition?.calories || 300) <= 400
      );
      const mediumRecipes = allRecipes.filter(r => 
        (r.nutrition?.calories || 300) > 400 && (r.nutrition?.calories || 300) <= 600
      );
      const heavyRecipes = allRecipes.filter(r => 
        (r.nutrition?.calories || 300) > 600
      );

      // Use all recipes if categories are empty
      const breakfastPool = lightRecipes.length > 3 ? lightRecipes : allRecipes;
      const lunchPool = mediumRecipes.length > 3 ? mediumRecipes : allRecipes;
      const dinnerPool = mediumRecipes.length > 3 ? [...mediumRecipes, ...heavyRecipes] : allRecipes;

      // Track used recipes to avoid too many repetitions
      const usedRecipes: Set<string> = new Set();

      for (const day of DAYS) {
        // Get available recipes (not used in last 2 days)
        const getAvailable = (pool: Recipe[]) => 
          pool.filter(r => !usedRecipes.has(r._id));

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

        // Mark as used
        usedRecipes.add(breakfast._id);
        usedRecipes.add(lunch._id);
        usedRecipes.add(dinner._id);

        // Clear old used recipes (keep only last 2 days worth)
        if (usedRecipes.size > 18) {
          const arr = Array.from(usedRecipes);
          arr.slice(0, 9).forEach(id => usedRecipes.delete(id));
        }
      }

      // Save to localStorage
      localStorage.setItem('mealPlan', JSON.stringify(plan));
      setMealPlan(plan);
      
      toast.success(language === 'bg' ? 'Планът е генериран!' : 'Plan generated!');
    } catch (error) {
      toast.error(language === 'bg' ? 'Грешка при генериране' : 'Generation error');
    } finally {
      setGenerating(false);
    }
  };

  // Translations
  const t = {
    title: language === 'bg' ? 'AI Хранителен План' : 'AI Meal Plan',
    subtitle: language === 'bg' 
      ? 'Персонализиран план според твоите цели' 
      : 'Personalized plan based on your goals',
    generate: language === 'bg' ? 'Генерирай план' : 'Generate Plan',
    regenerate: language === 'bg' ? 'Генерирай нов' : 'Regenerate',
    generating: language === 'bg' ? 'Генериране...' : 'Generating...',
    noplan: language === 'bg' 
      ? 'Все още нямаш план. Генерирай един!'
      : "You don't have a plan yet. Generate one!",
    recipesAvailable: language === 'bg' 
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
    noProfile: language === 'bg' 
      ? 'Настрой здравния си профил за персонализиран план'
      : 'Set up your health profile for a personalized plan',
    goToProfile: language === 'bg' ? 'Към профила' : 'Go to Profile',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-forest-500 to-forest-600 rounded-xl text-white shadow-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-wood-800 dark:text-cream-100">
              {t.title}
            </h1>
            <p className="text-wood-600 dark:text-cream-400">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Health Profile Summary */}
      {weight && height ? (
        <div className="bg-gradient-to-r from-forest-50 to-orange-50 dark:from-forest-900/30 dark:to-wood-800 rounded-2xl p-4 mb-6 border-2 border-forest-200 dark:border-forest-700">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white dark:bg-wood-700 rounded-lg">
                <Target className="w-5 h-5 text-forest-600 dark:text-forest-400" />
              </div>
              <div>
                <p className="text-xs text-wood-500 dark:text-cream-500">{t.yourGoal}</p>
                <p className="font-semibold text-wood-800 dark:text-cream-100">
                  {t.goals[goal as keyof typeof t.goals] || goal}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white dark:bg-wood-700 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-wood-500 dark:text-cream-500">{t.dailyTarget}</p>
                <p className="font-semibold text-wood-800 dark:text-cream-100">
                  {dailyCalorieTarget} kcal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-white dark:bg-wood-700 rounded-lg">
                <Scale className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-wood-500 dark:text-cream-500">{language === 'bg' ? 'Тегло' : 'Weight'}</p>
                <p className="font-semibold text-wood-800 dark:text-cream-100">{weight} kg</p>
              </div>
            </div>

            <Link 
              to="/profile" 
              className="ml-auto text-sm text-forest-600 dark:text-forest-400 hover:underline"
            >
              {language === 'bg' ? 'Промени' : 'Edit'}
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 mb-6 border-2 border-orange-200 dark:border-orange-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-orange-800 dark:text-orange-200 font-medium">
                {t.noProfile}
              </p>
              <Link 
                to="/settings" 
                className="inline-flex items-center gap-1 mt-2 text-sm text-orange-600 dark:text-orange-400 hover:underline"
              >
                {t.goToProfile} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recipe count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-wood-500 dark:text-cream-500 flex items-center gap-2">
          <ChefHat className="w-4 h-4" />
          {t.recipesAvailable}
        </span>
      </div>

      {/* Generate Button */}
      <div className="mb-8">
        <button
          onClick={generatePlan}
          disabled={generating || allRecipes.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {mealPlan ? t.regenerate : t.generate}
            </>
          )}
        </button>
      </div>

      {/* Meal Plan */}
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

          {/* Weekly Summary */}
          <div className="bg-white dark:bg-wood-800 rounded-2xl p-4 border-2 border-orange-200 dark:border-wood-600">
            <h3 className="font-semibold text-wood-800 dark:text-cream-100 mb-3">
              {language === 'bg' ? 'Седмична статистика' : 'Weekly Summary'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-forest-600 dark:text-forest-400">
                  {Math.round(DAYS.reduce((sum, day) => {
                    const dayPlan = mealPlan[day];
                    return sum + MEAL_TYPES.reduce((mealSum, type) => {
                      return mealSum + (dayPlan?.[type]?.nutrition?.calories || 0);
                    }, 0);
                  }, 0) / 7)}
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
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  21
                </p>
                <p className="text-xs text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Ястия' : 'Meals'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Set(DAYS.flatMap(day => 
                    MEAL_TYPES.map(type => mealPlan[day]?.[type]?._id).filter(Boolean)
                  )).size}
                </p>
                <p className="text-xs text-wood-500 dark:text-cream-400">
                  {language === 'bg' ? 'Уникални' : 'Unique'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-cream-100 dark:bg-wood-800 rounded-2xl border-2 border-wood-200 dark:border-wood-600">
          <Calendar className="w-16 h-16 text-wood-300 dark:text-wood-600 mx-auto mb-4" />
          <h3 className="text-xl font-serif font-semibold text-wood-800 dark:text-cream-100 mb-2">
            {t.noplan}
          </h3>
          <p className="text-wood-500 dark:text-cream-400 mb-6">
            {t.recipesAvailable}
          </p>
        </div>
      )}
    </div>
  );
}
