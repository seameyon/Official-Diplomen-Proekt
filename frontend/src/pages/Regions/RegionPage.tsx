import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Clock, Flame, Users, Heart, Loader2, 
  MapPin, ChefHat, Globe, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recipeApi, favoriteApi } from '../../services/api';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { REGIONS, type RegionId } from '../../config/regions';
import { cn } from '../../utils';

const RECIPES_PER_PAGE = 8;

// Use backend proxy to avoid CORS issues
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const MEALDB_PROXY = `${API_BASE}/mealdb`;

// Region hero images - real photos representing each region
const REGION_HERO_IMAGES: Record<string, string> = {
  'liyun': 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1920&q=80', // Chinese temple/landscape
  'sakuraya': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80', // Japanese shrine
  'mondberg': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80', // London/Europe
  'fontalis': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80', // Paris/France
  'sumera': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80', // India/Taj Mahal
};

// Region to TheMealDB area mapping
const REGION_TO_AREAS: Record<string, string[]> = {
  'liyun': ['Chinese', 'Thai', 'Vietnamese', 'Malaysian'],
  'sakuraya': ['Japanese', 'Thai'],
  'mondberg': ['British', 'American', 'Canadian', 'Irish', 'Dutch', 'Polish', 'Russian'],
  'fontalis': ['French', 'Italian', 'Spanish', 'Greek', 'Portuguese'],
  'sumera': ['Indian', 'Turkish', 'Moroccan', 'Egyptian', 'Mexican', 'Tunisian'],
};

// Keywords for searching when area has few results
const REGION_KEYWORDS: Record<string, string[]> = {
  'sakuraya': ['sushi', 'chicken teriyaki', 'salmon'],
  'liyun': ['chicken', 'beef', 'noodle'],
  'mondberg': ['beef', 'lamb', 'pie'],
  'fontalis': ['pasta', 'chicken', 'risotto'],
  'sumera': ['curry', 'lamb', 'chicken'],
};

// Fallback static recipes with REAL MealDB IDs
const FALLBACK_RECIPES: Record<string, Recipe[]> = {
  'sakuraya': [
    { _id: 'mealdb_53065', title: 'Sushi', mainImage: 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg', prepTime: 30, cookTime: 0, servings: 1, nutrition: { calories: 350 }, isFromAPI: true },
    { _id: 'mealdb_52772', title: 'Teriyaki Chicken Casserole', mainImage: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg', prepTime: 15, cookTime: 25, servings: 1, nutrition: { calories: 380 }, isFromAPI: true },
    { _id: 'mealdb_52820', title: 'Katsu Chicken', mainImage: 'https://www.themealdb.com/images/media/meals/vwrpps1503068729.jpg', prepTime: 20, cookTime: 20, servings: 1, nutrition: { calories: 420 }, isFromAPI: true },
  ],
  'liyun': [
    { _id: 'mealdb_52945', title: 'Kung Pao Chicken', mainImage: 'https://www.themealdb.com/images/media/meals/1525872624.jpg', prepTime: 15, cookTime: 20, servings: 1, nutrition: { calories: 420 }, isFromAPI: true },
    { _id: 'mealdb_52844', title: 'Lasagne', mainImage: 'https://www.themealdb.com/images/media/meals/wtsvxx1511296896.jpg', prepTime: 20, cookTime: 45, servings: 1, nutrition: { calories: 480 }, isFromAPI: true },
    { _id: 'mealdb_52770', title: 'Spaghetti Bolognese', mainImage: 'https://www.themealdb.com/images/media/meals/sutysw1468247559.jpg', prepTime: 10, cookTime: 30, servings: 1, nutrition: { calories: 520 }, isFromAPI: true },
  ],
  'mondberg': [
    { _id: 'mealdb_52802', title: 'Fish and Chips', mainImage: 'https://www.themealdb.com/images/media/meals/1550441275.jpg', prepTime: 20, cookTime: 30, servings: 1, nutrition: { calories: 550 }, isFromAPI: true },
    { _id: 'mealdb_52878', title: 'Beef and Mustard Pie', mainImage: 'https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg', prepTime: 30, cookTime: 120, servings: 1, nutrition: { calories: 380 }, isFromAPI: true },
    { _id: 'mealdb_52824', title: 'Roast Beef', mainImage: 'https://www.themealdb.com/images/media/meals/1529444830.jpg', prepTime: 20, cookTime: 90, servings: 1, nutrition: { calories: 420 }, isFromAPI: true },
  ],
  'fontalis': [
    { _id: 'mealdb_52982', title: 'Spaghetti Carbonara', mainImage: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg', prepTime: 10, cookTime: 20, servings: 1, nutrition: { calories: 520 }, isFromAPI: true },
    { _id: 'mealdb_52809', title: 'Risotto', mainImage: 'https://www.themealdb.com/images/media/meals/1529446352.jpg', prepTime: 15, cookTime: 30, servings: 1, nutrition: { calories: 450 }, isFromAPI: true },
    { _id: 'mealdb_52948', title: 'Croissant', mainImage: 'https://www.themealdb.com/images/media/meals/1550441275.jpg', prepTime: 60, cookTime: 20, servings: 1, nutrition: { calories: 280 }, isFromAPI: true },
  ],
  'sumera': [
    { _id: 'mealdb_52940', title: 'Chicken Curry', mainImage: 'https://www.themealdb.com/images/media/meals/1525876468.jpg', prepTime: 20, cookTime: 40, servings: 1, nutrition: { calories: 420 }, isFromAPI: true },
    { _id: 'mealdb_52785', title: 'Dal fridge', mainImage: 'https://www.themealdb.com/images/media/meals/wuxrtu1483564410.jpg', prepTime: 30, cookTime: 45, servings: 1, nutrition: { calories: 380 }, isFromAPI: true },
    { _id: 'mealdb_52939', title: 'Lamb Biryani', mainImage: 'https://www.themealdb.com/images/media/meals/xrttsx1487339558.jpg', prepTime: 30, cookTime: 60, servings: 1, nutrition: { calories: 480 }, isFromAPI: true },
  ],
};

interface Recipe {
  _id: string;
  title: string;
  description?: string;
  mainImage?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  nutrition?: { calories?: number };
  author?: { username?: string };
  isFromAPI?: boolean;
  isFavorited?: boolean;
  ingredients?: any[];
  steps?: string[];
  tags?: string[];
}

// Recipe name translations for Bulgarian - COMPREHENSIVE
const RECIPE_TRANSLATIONS: Record<string, string> = {
  // Japanese
  'Sushi': 'Суши', 'Teriyaki Chicken Casserole': 'Пиле Терияки Касерола', 'Katsu Chicken': 'Пиле Кацу',
  'Chicken Katsu': 'Пиле Кацу', 'Teriyaki Chicken': 'Пиле Терияки', 'Ramen': 'Рамен',
  'Tempura': 'Темпура', 'Miso Soup': 'Мисо супа', 'Udon': 'Удон', 'Soba': 'Соба',
  'Tonkotsu Ramen': 'Тонкоцу Рамен', 'Gyoza': 'Гьоза', 'Onigiri': 'Онигири',
  'Chicken Teriyaki': 'Пиле Терияки',
  
  // Chinese
  'Kung Pao Chicken': 'Пиле Кунг Пао', 'Sweet and Sour Pork': 'Свинско в кисело-сладко',
  'Fried Rice': 'Пържен ориз', 'Chow Mein': 'Чоу Мейн', 'Dim Sum': 'Дим Сум',
  'Spring Rolls': 'Спринг Рол', 'Dumplings': 'Дъмплинги', 'Wonton Soup': 'Уонтон супа',
  'Kung Po Chicken': 'Пиле Кунг Пао', 'General Tso Chicken': 'Пиле на генерал Цо',
  
  // Italian
  'Spaghetti Carbonara': 'Спагети Карбонара', 'Spaghetti Bolognese': 'Спагети Болонезе',
  'Lasagna': 'Лазаня', 'Lasagne': 'Лазаня', 'Risotto': 'Ризото', 'Pizza': 'Пица',
  'Tiramisu': 'Тирамису', 'Panna Cotta': 'Пана Кота', 'Ravioli': 'Равиоли',
  'Fettuccine Alfredo': 'Фетучини Алфредо', 'Gnocchi': 'Ньоки', 'Bruschetta': 'Брускета',
  'Caprese Salad': 'Салата Капрезе', 'Minestrone': 'Минестроне', 'Carbonara': 'Карбонара',
  'Bolognese': 'Болонезе', 'Margherita': 'Маргарита', 'Calzone': 'Калцоне',
  
  // French
  'Croissant': 'Кроасан', 'Creme Brulee': 'Крем брюле', 'Souffle': 'Суфле',
  'Quiche': 'Киш', 'Ratatouille': 'Рататуй', 'Crepe': 'Крепи', 'Crepes': 'Крепи',
  'Bouillabaisse': 'Буйабес', 'Coq au Vin': 'Кок о вен', 'Eclair': 'Еклер',
  'Croissants': 'Кроасани', 'French Onion Soup': 'Френска лучена супа',
  
  // British
  'Fish and Chips': 'Риба с чипс', 'Fish & Chips': 'Риба с чипс',
  'Roast Beef': 'Печено телешко', 'Shepherd Pie': 'Пастирски пай',
  'Shepherds Pie': 'Пастирски пай', "Shepherd's Pie": 'Пастирски пай',
  'Beef and Mustard Pie': 'Пай с телешко и горчица', 'Yorkshire Pudding': 'Йоркширски пудинг',
  'Bangers and Mash': 'Наденички с пюре', 'Cottage Pie': 'Домашен пай',
  'Toad in the Hole': 'Наденички в тесто', 'Full English Breakfast': 'Пълна английска закуска',
  'Scones': 'Сконове', 'Beef Wellington': 'Телешко Уелингтън',
  
  // Indian
  'Chicken Curry': 'Пилешко къри', 'Butter Chicken': 'Пиле в масло',
  'Tandoori Chicken': 'Пиле Тандури', 'Biryani': 'Бирияни', 'Lamb Biryani': 'Агнешко бирияни',
  'Dal': 'Дал', 'Dal fridge': 'Дал', 'Naan': 'Наан', 'Samosa': 'Самоса',
  'Tikka Masala': 'Тика масала', 'Chicken Tikka': 'Пиле Тика', 'Palak Paneer': 'Палак панир',
  'Vindaloo': 'Виндалу', 'Korma': 'Корма', 'Madras': 'Мадрас', 'Jalfrezi': 'Джалфрези',
  
  // Middle Eastern
  'Kebab': 'Кебап', 'Falafel': 'Фалафел', 'Hummus': 'Хумус', 'Shawarma': 'Шаурма',
  'Tabbouleh': 'Табуле', 'Baba Ganoush': 'Баба гануш', 'Pita': 'Пита',
  'Kofta': 'Кюфте', 'Shish Kebab': 'Шиш кебап',
  
  // Mexican
  'Tacos': 'Такос', 'Burrito': 'Бурито', 'Enchiladas': 'Енчиладас',
  'Quesadilla': 'Кесадия', 'Guacamole': 'Гуакамоле', 'Nachos': 'Начос',
  'Churros': 'Чурос', 'Fajitas': 'Фахитас',
  
  // Greek
  'Moussaka': 'Мусака', 'Gyros': 'Гирос', 'Tzatziki': 'Цацики',
  'Baklava': 'Баклава', 'Souvlaki': 'Сувлаки', 'Spanakopita': 'Спанакопита',
  'Greek Salad': 'Гръцка салата', 'Dolma': 'Долма', 'Dolmades': 'Долми',
  
  // Thai
  'Pad Thai': 'Пад Тай', 'Tom Yum': 'Том Ям', 'Green Curry': 'Зелено къри',
  'Red Curry': 'Червено къри', 'Massaman Curry': 'Масаман къри',
  'Thai Green Curry': 'Тайландско зелено къри', 'Som Tam': 'Сом Там',
  
  // Korean
  'Bulgogi': 'Булгоги', 'Bibimbap': 'Бибимбап', 'Kimchi': 'Кимчи',
  'Korean Fried Chicken': 'Корейско пържено пиле', 'Japchae': 'Джапче',
  
  // Vietnamese
  'Pho': 'Фо', 'Banh Mi': 'Бан Ми', 'Spring Roll': 'Спринг Рол',
  
  // American
  'Hamburger': 'Хамбургер', 'Hot Dog': 'Хот дог', 'Mac and Cheese': 'Макарони със сирене',
  'Buffalo Wings': 'Бъфало крилца', 'BBQ Ribs': 'BBQ ребра', 'Pancakes': 'Палачинки',
  'Waffles': 'Гофрети', 'Brownie': 'Брауни', 'Brownies': 'Брауни',
  'Chocolate Chip Cookies': 'Бисквити с шоколад', 'Apple Pie': 'Ябълков пай',
  'Cheesecake': 'Чийзкейк', 'Grilled Cheese': 'Препечен сандвич със сирене',
  'Clam Chowder': 'Супа с миди', 'Fried Chicken': 'Пържено пиле',
  'Meatloaf': 'Руло Стефани', 'Coleslaw': 'Зелева салата',
  
  // Spanish
  'Paella': 'Паеля', 'Tapas': 'Тапас', 'Gazpacho': 'Гаспачо',
  'Tortilla Espanola': 'Испанска тортия', 'Patatas Bravas': 'Пататас бравас',
  
  // Other common dishes
  'Omelette': 'Омлет', 'Caesar Salad': 'Салата Цезар', 'Soup': 'Супа',
  'Stew': 'Яхния', 'Pasta': 'Паста', 'Noodles': 'Нудли', 'Rice': 'Ориз',
  'Bread': 'Хляб', 'Cake': 'Торта', 'Pie': 'Пай', 'Cookies': 'Бисквити',
  'Ice Cream': 'Сладолед', 'Chocolate Cake': 'Шоколадова торта',
  'Chocolate Gateau': 'Шоколадова торта', 'Cupcakes': 'Къпкейкове',
  'Donuts': 'Понички', 'Meatballs': 'Кюфтета', 'Beef Stew': 'Телешка яхния',
  'Roast Chicken': 'Печено пиле', 'Grilled Chicken': 'Пиле на скара',
  'Salmon': 'Сьомга', 'Grilled Salmon': 'Сьомга на скара',
};

const translateRecipeTitle = (title: string, language: string): string => {
  if (language !== 'bg') return title;
  if (RECIPE_TRANSLATIONS[title]) return RECIPE_TRANSLATIONS[title];
  for (const [en, bg] of Object.entries(RECIPE_TRANSLATIONS)) {
    if (title.toLowerCase().includes(en.toLowerCase())) {
      return title.replace(new RegExp(en, 'i'), bg);
    }
  }
  return title;
};

// Convert MealDB recipe to our format
const convertMealDBRecipe = (meal: any): Recipe => {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ name: ing.trim(), amount: 1, unit: measure?.trim() || '' });
    }
  }

  const steps = (meal.strInstructions || '')
    .split(/\r\n|\n/)
    .filter((s: string) => s.trim())
    .map((s: string) => s.trim());

  return {
    _id: `mealdb_${meal.idMeal}`,
    title: meal.strMeal,
    description: `${meal.strCategory || ''} - ${meal.strArea || ''}`,
    mainImage: meal.strMealThumb,
    prepTime: 15,
    cookTime: 30,
    servings: 1, // Base = 1 portion
    tags: [meal.strCategory?.toLowerCase(), meal.strArea?.toLowerCase()].filter(Boolean),
    nutrition: { calories: 300 + Math.floor(Math.random() * 200) },
    ingredients,
    steps,
    isFromAPI: true,
  };
};

// Fetch with retry helper
const fetchWithRetry = async (url: string, retries = 2): Promise<any> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)));
    }
  }
};

// Fetch recipes by area with timeout
const fetchByArea = async (area: string): Promise<Recipe[]> => {
  try {
    console.log(`[MealDB] Fetching area: ${area}`);
    
    const listData = await fetchWithRetry(`${MEALDB_PROXY}/filter/area/${encodeURIComponent(area)}`);
    
    if (!listData.meals || listData.meals.length === 0) {
      console.log(`[MealDB] No meals for area: ${area}`);
      return [];
    }

    console.log(`[MealDB] Found ${listData.meals.length} meals for ${area}`);
    
    const meals = listData.meals.slice(0, 8);
    
    // Fetch details in batches of 4 to avoid overwhelming the server
    const recipes: Recipe[] = [];
    for (let i = 0; i < meals.length; i += 4) {
      const batch = meals.slice(i, i + 4);
      const batchPromises = batch.map(async (m: any) => {
        try {
          const data = await fetchWithRetry(`${MEALDB_PROXY}/lookup/${m.idMeal}`);
          return data;
        } catch (err) {
          console.error(`[MealDB] Error fetching meal ${m.idMeal}:`, err);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      const batchRecipes = batchResults
        .filter(d => d && d.meals && d.meals[0])
        .map(d => convertMealDBRecipe(d.meals[0]));
      
      recipes.push(...batchRecipes);
      
      // Small delay between batches
      if (i + 4 < meals.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`[MealDB] Converted ${recipes.length} recipes for ${area}`);
    return recipes;
  } catch (error: any) {
    console.error(`[MealDB] Error fetching area ${area}:`, error);
    return [];
  }
};

// Search by keyword with retry
const searchMealDB = async (keyword: string): Promise<Recipe[]> => {
  try {
    console.log(`[MealDB] Searching: ${keyword}`);
    
    const data = await fetchWithRetry(`${MEALDB_PROXY}/search?q=${encodeURIComponent(keyword)}`);
    console.log(`[MealDB] Search result for ${keyword}:`, data?.meals?.length || 0, 'meals');
    
    if (!data.meals) return [];
    return data.meals.slice(0, 5).map(convertMealDBRecipe);
  } catch (error: any) {
    console.error(`[MealDB] Search error for ${keyword}:`, error);
    return [];
  }
};

function RecipeCard({ recipe, language }: { recipe: Recipe; language: string }) {
  const { isAuthenticated } = useAuthStore();
  const [isFav, setIsFav] = useState(recipe.isFavorited || false);
  const [saving, setSaving] = useState(false);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(language === 'bg' ? 'Влез в профила си' : 'Please login');
      return;
    }

    setSaving(true);
    try {
      let recipeId = recipe._id;
      
      // If API recipe, save it first with properly formatted data
      if (recipe.isFromAPI) {
        // Format ingredients
        const formattedIngredients = (recipe.ingredients || []).map(ing => ({
          name: String(ing.name || 'Съставка').trim() || 'Съставка',
          amount: typeof ing.amount === 'number' && ing.amount > 0 ? ing.amount : 1,
          unit: String(ing.unit || '').trim() || 'бр.'
        }));
        if (formattedIngredients.length === 0) {
          formattedIngredients.push({ name: 'Съставка', amount: 1, unit: 'бр.' });
        }

        // Description
        let description = recipe.description || '';
        if (description.length < 10) {
          description = `${recipe.title} - вкусна рецепта от TheMealDB. Опитайте!`;
        }

        // Steps
        let steps = recipe.steps || [];
        steps = steps.filter(s => s && s.trim()).map(s => s.trim());
        if (steps.length === 0) {
          steps = ['Следвайте инструкциите за приготвяне.'];
        }

        // Image
        const mainImage = recipe.mainImage && recipe.mainImage.startsWith('http') 
          ? recipe.mainImage 
          : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

        const saved = await recipeApi.createRecipe({
          title: recipe.title || 'Рецепта',
          description: description,
          mainImage: mainImage,
          prepTime: recipe.prepTime || 15,
          cookTime: recipe.cookTime || 30,
          servings: recipe.servings || 4,
          ingredients: formattedIngredients,
          steps: steps,
          tags: [],
          nutrition: {
            calories: recipe.nutrition?.calories || 300,
            protein: 20,
            carbs: 30,
            fat: 15,
          },
        });
        recipeId = saved.recipe._id;
      }
      
      const result = await favoriteApi.toggleFavorite(recipeId);
      setIsFav(result.isFavorited);
      toast.success(result.isFavorited 
        ? (language === 'bg' ? 'Добавено!' : 'Added!') 
        : (language === 'bg' ? 'Премахнато' : 'Removed'));
    } catch (err: any) {
      console.error('Favorite error:', err);
      toast.error(err.response?.data?.message || (language === 'bg' ? 'Грешка' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link to={recipe.isFromAPI ? `/recipes/api/${recipe._id}` : `/recipes/${recipe._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-wood-800 rounded-2xl overflow-hidden border-2 border-orange-200 dark:border-wood-600 hover:border-orange-400 dark:hover:border-forest-500 hover:shadow-lg transition-all group select-none"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={recipe.mainImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {isAuthenticated && (
            <button
              onClick={handleFavorite}
              disabled={saving}
              className={cn(
                'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all',
                isFav ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
              )}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={cn('w-4 h-4', isFav && 'fill-current')} />}
            </button>
          )}

          {recipe.isFromAPI && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" />
              MealDB
            </div>
          )}

          {recipe.nutrition?.calories && (
            <div className="absolute bottom-14 right-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {recipe.nutrition.calories} kcal
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-serif font-bold text-white line-clamp-2">
              {recipe.isFromAPI ? translateRecipeTitle(recipe.title, language) : recipe.title}
            </h3>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-cream-400">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {totalTime} {language === 'bg' ? 'мин' : 'min'}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings} {language === 'bg' ? 'порции' : 'servings'}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function RegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const navigate = useNavigate();
  const { language } = useThemeStore();
  const region = REGIONS[regionId as RegionId];
  
  const [apiRecipes, setApiRecipes] = useState<Recipe[]>([]);
  const [loadingApi, setLoadingApi] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const t = {
    notFound: language === 'bg' ? 'Регион не е намерен' : 'Region not found',
    toRecipes: language === 'bg' ? 'Към рецепти' : 'Back to recipes',
    popularDishes: language === 'bg' ? 'Популярни ястия' : 'Popular dishes',
    recipesFrom: language === 'bg' ? 'Рецепти от' : 'Recipes from',
    recipes: language === 'bg' ? 'рецепти' : 'recipes',
    loading: language === 'bg' ? 'Зареждане...' : 'Loading...',
    noRecipes: language === 'bg' ? 'Няма намерени рецепти' : 'No recipes found',
    refresh: language === 'bg' ? 'Презареди' : 'Refresh',
  };

  // Fetch user recipes for this region
  const { data: userRecipesData, isLoading: loadingUser } = useQuery({
    queryKey: ['recipes', 'region', regionId],
    queryFn: () => recipeApi.getAll({ region: regionId as any, limit: 50 }),
    enabled: !!region,
  });

  // Fetch API recipes
  const loadApiRecipes = async () => {
    if (!regionId) {
      console.log('[RegionPage] No regionId');
      return;
    }
    
    console.log('[RegionPage] Starting to load recipes for region:', regionId);
    setLoadingApi(true);
    
    try {
      const areas = REGION_TO_AREAS[regionId] || [];
      console.log('[RegionPage] Areas for region:', areas);
      
      if (areas.length === 0) {
        console.log('[RegionPage] No areas mapped for this region');
        setLoadingApi(false);
        return;
      }
      
      let allRecipes: Recipe[] = [];
      
      // Fetch from all areas in parallel
      const areaPromises = areas.map(area => fetchByArea(area));
      const areaResults = await Promise.all(areaPromises);
      
      for (const recipes of areaResults) {
        allRecipes = [...allRecipes, ...recipes];
      }
      
      console.log('[RegionPage] Got', allRecipes.length, 'recipes from areas');
      
      // If we got few results, search by keywords
      if (allRecipes.length < 10) {
        const keywords = REGION_KEYWORDS[regionId] || [];
        console.log('[RegionPage] Searching keywords:', keywords);
        
        for (const keyword of keywords) {
          if (allRecipes.length >= 20) break;
          const searchResults = await searchMealDB(keyword);
          // Add only new recipes
          for (const recipe of searchResults) {
            if (!allRecipes.some(r => r._id === recipe._id)) {
              allRecipes.push(recipe);
            }
          }
        }
      }
      
      // Remove duplicates
      const uniqueRecipes = allRecipes.filter((recipe, index, self) =>
        index === self.findIndex(r => r._id === recipe._id)
      );
      
      console.log('[RegionPage] Final:', uniqueRecipes.length, 'unique recipes');
      
      // If still no recipes, use fallback
      if (uniqueRecipes.length === 0) {
        console.log('[RegionPage] Using fallback recipes for', regionId);
        const fallback = FALLBACK_RECIPES[regionId] || [];
        setApiRecipes(fallback);
      } else {
        setApiRecipes(uniqueRecipes);
      }
    } catch (error) {
      console.error('[RegionPage] Error loading API recipes:', error);
      // Use fallback on error
      const fallback = FALLBACK_RECIPES[regionId] || [];
      console.log('[RegionPage] Using fallback recipes due to error');
      setApiRecipes(fallback);
    } finally {
      setLoadingApi(false);
    }
  };

  // Load when regionId changes
  useEffect(() => {
    console.log('[RegionPage] useEffect triggered, regionId:', regionId);
    if (regionId) {
      loadApiRecipes();
    }
  }, [regionId]); // Only depend on regionId

  const handleBack = () => {
    navigate('/recipes');
  };

  if (!region) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-cream-100 mb-4">{t.notFound}</h2>
        <Link 
          to="/recipes" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500"
        >
          {t.toRecipes}
        </Link>
      </div>
    );
  }

  const userRecipes = userRecipesData?.recipes || [];
  
  // Combine user recipes and API recipes, user recipes first
  const allRecipes = [
    ...userRecipes,
    ...apiRecipes.filter(api => !userRecipes.some((user: Recipe) => user.title.toLowerCase() === api.title.toLowerCase()))
  ];

  const isLoading = loadingUser || loadingApi;
  const totalPages = Math.ceil(allRecipes.length / RECIPES_PER_PAGE);
  const paginatedRecipes = allRecipes.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-24 select-none">
      {/* Hero Section with Background Image */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${REGION_HERO_IMAGES[regionId as string] || ''}')`,
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-wood-900 dark:to-wood-900" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-4xl">{region.flag}</span>
                <MapPin className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white/90">
                  {region.inspiration}
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-3 drop-shadow-lg">
                {language === 'bg' ? region.nameBg : region.name}
              </h1>
              <p className="text-xl text-white/90 mb-2 drop-shadow-md">
                {language === 'bg' ? region.subtitleBg : region.subtitle}
              </p>
              <p className="text-lg font-medium text-amber-300 drop-shadow-md">
                {language === 'bg' ? region.cuisineBg : region.cuisine}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Region Description */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 mb-8 border-2 border-orange-200 dark:border-wood-600">
          <p className="text-gray-600 dark:text-cream-300 text-lg leading-relaxed">
            {language === 'bg' ? region.descriptionBg : region.description}
          </p>
          <div className="mt-4 pt-4 border-t border-orange-100 dark:border-wood-600">
            <h3 className="font-semibold text-gray-900 dark:text-cream-100 mb-2">{t.popularDishes}:</h3>
            <div className="flex flex-wrap gap-2">
              {(language === 'bg' ? region.dishesBg : region.dishes).map((dish, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${region.colors.primary}20`, color: region.colors.primary }}
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chef Character */}
        <div className="bg-white dark:bg-wood-800 rounded-2xl p-6 mb-8 border-2 border-orange-200 dark:border-wood-600">
          <div className="flex items-start gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: region.colors.primary }}
            >
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-cream-100 text-lg">{region.character.name}</h3>
              <p className="text-sm font-medium mb-2" style={{ color: region.colors.accent }}>
                {language === 'bg' ? region.character.titleBg : region.character.title}
              </p>
              <p className="text-gray-600 dark:text-cream-400 italic">
                "{language === 'bg' ? region.character.philosophyBg : region.character.philosophy}"
              </p>
            </div>
          </div>
        </div>

        {/* Recipes Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-cream-100">
            {t.recipesFrom} {language === 'bg' ? region.nameBg : region.name}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 dark:text-cream-400">{allRecipes.length} {t.recipes}</span>
            <button
              onClick={loadApiRecipes}
              disabled={loadingApi}
              className="p-2 rounded-lg bg-orange-100 dark:bg-wood-700 text-orange-600 dark:text-forest-400 hover:bg-orange-200 dark:hover:bg-wood-600 transition-colors"
            >
              <RefreshCw className={cn('w-5 h-5', loadingApi && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 dark:text-forest-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-cream-400">{t.loading}</p>
          </div>
        )}

        {/* No Recipes */}
        {!isLoading && allRecipes.length === 0 && (
          <div className="text-center py-16 bg-orange-50 dark:bg-wood-800 rounded-2xl">
            <ChefHat className="w-16 h-16 text-orange-300 dark:text-wood-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-cream-400 mb-4">{t.noRecipes}</p>
            <button
              onClick={loadApiRecipes}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500"
            >
              {t.refresh}
            </button>
          </div>
        )}

        {/* Recipe Grid */}
        {!isLoading && paginatedRecipes.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} language={language} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    currentPage === 1
                      ? 'text-gray-300 dark:text-wood-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-cream-300 hover:bg-orange-100 dark:hover:bg-wood-700'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={cn(
                      'w-10 h-10 rounded-lg font-semibold transition-all',
                      currentPage === page
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-forest-600 dark:to-forest-500 text-white shadow-lg'
                        : 'bg-orange-50 dark:bg-wood-700 text-gray-700 dark:text-cream-200 hover:bg-orange-100 dark:hover:bg-wood-600'
                    )}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    currentPage === totalPages
                      ? 'text-gray-300 dark:text-wood-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-cream-300 hover:bg-orange-100 dark:hover:bg-wood-700'
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
