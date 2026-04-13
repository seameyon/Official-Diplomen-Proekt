import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, Clock, Flame, Plus, Loader2, X, Users, Heart, Globe, ChefHat
} from 'lucide-react';
import toast from 'react-hot-toast';
import { recipeApi, favoriteApi } from '../../services/api';
import { mealdbApi } from '../../services/mealdb';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { ALL_REGIONS } from '../../config/regions';

interface Recipe {
  _id: string;
  title: string;
  description?: string;
  mainImage?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
  region?: string;
  nutrition?: {
    calories?: number;
  };
  author?: {
    username?: string;
  };
  isFavorited?: boolean;
  isFromAPI?: boolean;
}

function RecipeCard({ recipe, onFavorite }: { recipe: Recipe; onFavorite?: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const { theme, language } = useThemeStore();
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const [isFav, setIsFav] = useState(recipe.isFavorited || false);
  
  const imageUrl = recipe.mainImage || 
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error(language === 'en' ? 'Login to add favorites' : 'Влез, за да добавиш в любими');
      return;
    }

    try {
      const result = await favoriteApi.toggleFavorite(recipe._id);
      setIsFav(result.isFavorited);
      toast.success(result.isFavorited 
        ? (language === 'en' ? 'Added to favorites!' : 'Добавено в любими!')
        : (language === 'en' ? 'Removed from favorites' : 'Премахнато от любими')
      );
      onFavorite?.();
    } catch {
      toast.error(language === 'en' ? 'Error' : 'Грешка');
    }
  };

  return (
    <Link to={recipe.isFromAPI ? `/recipes/api/${recipe._id}` : `/recipes/${recipe._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="recipe-card-wood group"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Favorite button */}
          {isAuthenticated && (
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isFav ? '#ef4444' : 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Heart className={`w-4 h-4 text-white ${isFav ? 'fill-current' : ''}`} />
            </button>
          )}
          
          {/* API badge */}
          {recipe.isFromAPI && (
            <div 
              className="absolute top-3 left-3 px-2 py-1 text-white text-xs font-medium rounded-full flex items-center gap-1"
              style={{ background: 'rgba(59, 130, 246, 0.8)', backdropFilter: 'blur(4px)' }}
            >
              <Globe className="w-3 h-3" />
              MealDB
            </div>
          )}

          {/* Calories badge */}
          {recipe.nutrition?.calories && (
            <div 
              className="absolute bottom-14 right-3 px-2 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #8bc34a 0%, #689f38 100%)' }}
            >
              <Flame className="w-3 h-3" />
              {recipe.nutrition.calories} {language === 'en' ? 'cal' : 'ккал'}
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white line-clamp-2" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
              {recipe.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {recipe.description && (
            <p 
              className="text-sm line-clamp-2 mb-3"
              style={{ color: theme === 'dark' ? '#a89880' : '#7a5d3e' }}
            >
              {recipe.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div 
              className="flex items-center gap-4"
              style={{ color: theme === 'dark' ? '#a89880' : '#7a5d3e' }}
            >
              {totalTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {totalTime} {language === 'en' ? 'min' : 'мин'}
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {recipe.servings}
                </span>
              )}
            </div>
            
            {recipe.author?.username && (
              <span className="text-xs font-medium" style={{ color: '#8bc34a' }}>
                {recipe.author.username}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function RecipeList() {
  const { isAuthenticated } = useAuthStore();
  const { theme, language } = useThemeStore();
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [apiRecipes, setApiRecipes] = useState<Recipe[]>([]);
  const [loadingApi, setLoadingApi] = useState(true);

  const t = {
    title: language === 'en' ? 'Recipes' : 'Рецепти',
    subtitle: language === 'en' ? 'Discover delicious recipes from around the world' : 'Открий вкусни рецепти от цял свят',
    addRecipe: language === 'en' ? 'Add Recipe' : 'Добави рецепта',
    search: language === 'en' ? 'Search recipes...' : 'Търси рецепти...',
    all: language === 'en' ? 'All' : 'Всички',
    loading: language === 'en' ? 'Loading recipes...' : 'Зареждане на рецепти...',
    noResults: language === 'en' ? 'No recipes found' : 'Няма намерени рецепти',
    tryDifferent: language === 'en' ? 'Try a different search' : 'Опитай с различно търсене',
    createFirst: language === 'en' ? 'Create the first recipe' : 'Създай първата рецепта',
  };

  // Fetch user recipes
  const { data: userRecipesData, isLoading: loadingUser, refetch } = useQuery({
    queryKey: ['recipes', search, selectedRegion],
    queryFn: () => recipeApi.getAll({ 
      search: search || undefined,
      limit: 50,
    }),
  });

  // Fetch API recipes
  useEffect(() => {
    const fetchApiRecipes = async () => {
      setLoadingApi(true);
      try {
        let recipes: Recipe[] = [];
        
        if (search) {
          recipes = await mealdbApi.searchByName(search);
        } else if (selectedRegion) {
          const areas = mealdbApi.getAreasForRegion(selectedRegion);
          const promises = areas.map(area => mealdbApi.getByArea(area));
          const results = await Promise.all(promises);
          recipes = results.flat();
        } else {
          recipes = await mealdbApi.getRandom(12);
        }
        
        setApiRecipes(recipes);
      } catch (error) {
        console.error('Error fetching API recipes:', error);
      } finally {
        setLoadingApi(false);
      }
    };

    fetchApiRecipes();
  }, [search, selectedRegion]);

  const userRecipes = userRecipesData?.recipes || [];
  const allRecipes = [...userRecipes, ...apiRecipes.filter(
    api => !userRecipes.some(user => user.title.toLowerCase() === api.title.toLowerCase())
  )];

  const isLoading = loadingUser || loadingApi;

  return (
    <div 
      className="min-h-screen py-6 px-4"
      style={{ backgroundColor: theme === 'dark' ? '#1a1612' : '#f5f0e8' }}
    >
      <div className="max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 
                className="text-3xl font-bold mb-1"
                style={{ 
                  color: theme === 'dark' ? '#e8dcc8' : '#4a3525',
                  fontFamily: 'Georgia, serif',
                }}
              >
                {t.title}
              </h1>
              <p style={{ color: theme === 'dark' ? '#a89880' : '#7a5d3e' }}>
                {t.subtitle}
              </p>
            </div>
            
            {isAuthenticated && (
              <Link to="/recipes/create" className="btn-green flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t.addRecipe}
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: '#a89880' }} 
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="input-wood pl-12 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: '#a89880' }}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Region filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion(null)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={!selectedRegion ? {
                background: 'linear-gradient(180deg, #8bc34a 0%, #689f38 100%)',
                border: '2px solid #558b2f',
                color: 'white',
              } : {
                background: theme === 'dark' ? '#2d2520' : '#faf8f5',
                border: `2px solid ${theme === 'dark' ? '#5a4535' : '#c49a6c'}`,
                color: theme === 'dark' ? '#e8dcc8' : '#4a3525',
              }}
            >
              {t.all}
            </button>
            {ALL_REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={selectedRegion === region.id ? {
                  background: 'linear-gradient(180deg, #8bc34a 0%, #689f38 100%)',
                  border: '2px solid #558b2f',
                  color: 'white',
                } : {
                  background: theme === 'dark' ? '#2d2520' : '#faf8f5',
                  border: `2px solid ${theme === 'dark' ? '#5a4535' : '#c49a6c'}`,
                  color: theme === 'dark' ? '#e8dcc8' : '#4a3525',
                }}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#8bc34a' }} />
            <p style={{ color: theme === 'dark' ? '#a89880' : '#7a5d3e' }}>{t.loading}</p>
          </div>
        )}

        {/* No recipes */}
        {!isLoading && allRecipes.length === 0 && (
          <div 
            className="text-center py-20 rounded-2xl"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(145deg, #2d2520 0%, #252019 100%)'
                : 'linear-gradient(145deg, #faf8f5 0%, #f0ebe0 100%)',
              border: `3px solid ${theme === 'dark' ? '#5a4535' : '#c49a6c'}`,
            }}
          >
            <ChefHat className="w-16 h-16 mx-auto mb-4" style={{ color: theme === 'dark' ? '#5a4535' : '#c49a6c' }} />
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: theme === 'dark' ? '#e8dcc8' : '#4a3525' }}
            >
              {t.noResults}
            </h3>
            <p className="mb-6" style={{ color: theme === 'dark' ? '#a89880' : '#7a5d3e' }}>
              {search ? t.tryDifferent : ''}
            </p>
            {isAuthenticated && (
              <Link to="/recipes/create" className="btn-green inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t.createFirst}
              </Link>
            )}
          </div>
        )}

        {/* Recipes grid */}
        {!isLoading && allRecipes.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allRecipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} onFavorite={() => refetch()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
