import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, Flame, Search, Trash2, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { favoriteApi } from '../../services/api';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';

interface Recipe {
  _id: string;
  title: string;
  description?: string;
  mainImage?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
  nutrition?: {
    calories?: number;
  };
  author?: {
    username?: string;
  };
}

function FavoriteCard({ recipe, onRemove, language }: { 
  recipe: Recipe; 
  onRemove: () => void;
  language: string;
}) {
  const [removing, setRemoving] = useState(false);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const imageUrl = recipe.mainImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    try {
      await onRemove();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-cream-100 dark:bg-wood-800 rounded-2xl overflow-hidden border-2 border-wood-200 dark:border-wood-600 hover:border-forest-500 transition-all group"
    >
      <Link to={`/recipes/${recipe._id}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wood-900/70 to-transparent" />
          
          {/* Heart icon */}
          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-serif font-bold text-cream-100 line-clamp-2">
              {recipe.title}
            </h3>
          </div>
        </div>

        <div className="p-4">
          {recipe.description && (
            <p className="text-sm text-wood-600 dark:text-cream-400 line-clamp-2 mb-3">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-wood-500 dark:text-cream-400 mb-3">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {totalTime} {language === 'bg' ? 'мин' : 'min'}
              </span>
            )}
            {recipe.nutrition?.calories && (
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-forest-500" />
                {recipe.nutrition.calories} {language === 'bg' ? 'ккал' : 'kcal'}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Remove button */}
      <div className="px-4 pb-4">
        <button
          onClick={handleRemove}
          disabled={removing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
        >
          {removing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              {language === 'bg' ? 'Премахни от любими' : 'Remove from favorites'}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default function Favorites() {
  const { language } = useThemeStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  
  const t = {
    title: language === 'bg' ? 'Любими рецепти' : 'Favorite Recipes',
    savedRecipes: language === 'bg' ? 'запазени рецепти' : 'saved recipes',
    noFavorites: language === 'bg' ? 'Нямаш любими рецепти' : 'No favorite recipes yet',
    startAdding: language === 'bg' 
      ? 'Добави рецепти в любими, за да ги намираш лесно' 
      : 'Add recipes to favorites to find them easily',
    browseRecipes: language === 'bg' ? 'Разгледай рецепти' : 'Browse Recipes',
    removed: language === 'bg' ? 'Премахнато от любими' : 'Removed from favorites',
    loading: language === 'bg' ? 'Зареждане...' : 'Loading...',
  };

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', page],
    queryFn: () => favoriteApi.getFavorites(page, 12),
  });

  const removeMutation = useMutation({
    mutationFn: (recipeId: string) => favoriteApi.toggleFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(t.removed);
    },
    onError: () => {
      toast.error(language === 'bg' ? 'Грешка' : 'Error');
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold flex items-center gap-3 text-wood-800 dark:text-cream-100">
          <Heart className="w-8 h-8 text-red-500 fill-current" />
          {t.title}
        </h1>
        <p className="text-wood-600 dark:text-cream-400 mt-1">
          {data?.total || 0} {t.savedRecipes}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-forest-600 mx-auto mb-4" />
          <p className="text-wood-500 dark:text-cream-400">{t.loading}</p>
        </div>
      ) : data?.recipes.length === 0 ? (
        <div className="text-center py-20 bg-cream-100 dark:bg-wood-800 rounded-2xl border-2 border-wood-200 dark:border-wood-600">
          <div className="w-24 h-24 bg-wood-200 dark:bg-wood-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-wood-400 dark:text-wood-500" />
          </div>
          <h3 className="text-xl font-serif font-semibold mb-2 text-wood-800 dark:text-cream-100">
            {t.noFavorites}
          </h3>
          <p className="text-wood-500 dark:text-cream-400 mb-6 max-w-md mx-auto">
            {t.startAdding}
          </p>
          <Link 
            to="/recipes" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-forest-600 hover:bg-forest-500 transition-colors"
          >
            <Search className="w-4 h-4" />
            {t.browseRecipes}
          </Link>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.recipes.map((recipe: Recipe) => (
                <FavoriteCard
                  key={recipe._id}
                  recipe={recipe}
                  onRemove={() => removeMutation.mutate(recipe._id)}
                  language={language}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(data.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    'w-10 h-10 rounded-xl font-medium transition-all',
                    page === i + 1
                      ? 'bg-forest-600 text-white'
                      : 'bg-wood-200 dark:bg-wood-700 text-wood-700 dark:text-cream-200 hover:bg-wood-300 dark:hover:bg-wood-600'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
