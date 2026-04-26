import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, Heart, Sparkles, Sun, Moon, ArrowRight, Activity, Home, Calendar } from 'lucide-react';
import { useThemeStore } from '../../context/themeStore';
import { useAuthStore } from '../../context/authStore';
import { ALL_REGIONS } from '../../config/regions';
import { cn } from '../../utils';


const WOOD_TEXTURE_DARK = 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1920&q=80';
const WOOD_TEXTURE_LIGHT = 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=1920&q=80';


const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', // Pizza
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop', // Pancakes
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop', // Salad
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop', // Pasta
];

export default function Landing() {
  const { theme, setTheme, language, setLanguage } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isDark = theme === 'dark';

 
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  const t = {
    home: language === 'bg' ? 'Начало' : 'Home',
    recipes: language === 'bg' ? 'Рецепти' : 'Recipes',
    plan: language === 'bg' ? 'План' : 'Plan',
    favorites: language === 'bg' ? 'Любими' : 'Favorites',
    profile: language === 'bg' ? 'Профил' : 'Profile',
    login: language === 'bg' ? 'Вход' : 'Login',
    heroTitle: language === 'bg' ? 'Твоят Личен Готварски Помощник' : 'Your Personal Cooking Assistant',
    heroSubtitle: language === 'bg' 
      ? 'Открий хиляди рецепти, планирай храненето си и достигни целите си' 
      : 'Discover thousands of recipes, plan your meals and reach your goals',
    startNow: language === 'bg' ? 'Започни Сега' : 'Start Now',
    browseRecipes: language === 'bg' ? 'Разгледай Рецепти' : 'Browse Recipes',
    features: language === 'bg' ? 'Какво предлагаме' : 'What We Offer',
    feature1: language === 'bg' ? 'Вкусни Рецепти' : 'Delicious Recipes',
    feature1Desc: language === 'bg' ? 'Стотици рецепти от цял свят, готови за готвене' : 'Hundreds of recipes from around the world',
    feature2: language === 'bg' ? 'AI Хранителен План' : 'AI Meal Planner',
    feature2Desc: language === 'bg' ? 'Персонализиран седмичен план с AI асистент' : 'Personalized weekly plan with AI assistant',
    feature3: language === 'bg' ? 'Здравен Профил' : 'Health Profile',
    feature3Desc: language === 'bg' ? 'Следи BMI, калории и хранителни цели' : 'Track BMI, calories and nutrition goals',
    feature4: language === 'bg' ? 'Любими' : 'Favorites',
    feature4Desc: language === 'bg' ? 'Запази и организирай любимите си рецепти' : 'Save and organize your favorites',
    regions: language === 'bg' ? 'Кухни от цял свят' : 'World Cuisines',
    regionsDesc: language === 'bg' ? 'Открий автентични рецепти от различни кулинарни традиции' : 'Discover authentic recipes from different culinary traditions',
    viewAll: language === 'bg' ? 'Виж всички' : 'View all',
  };

  const features = [
    { icon: ChefHat, title: t.feature1, desc: t.feature1Desc, color: 'from-orange-500 to-red-500' },
    { icon: Sparkles, title: t.feature2, desc: t.feature2Desc, color: 'from-purple-500 to-indigo-500' },
    { icon: Activity, title: t.feature3, desc: t.feature3Desc, color: 'from-green-500 to-emerald-500' },
    { icon: Heart, title: t.feature4, desc: t.feature4Desc, color: 'from-red-500 to-rose-500' },
  ];

  return (
    <div 
      className="min-h-screen overflow-hidden"
      style={{ maxWidth: '100vw', width: '100%' }}
    >
      <div className={cn(
        "min-h-screen",
        isDark 
          ? 'bg-wood-900' 
          : 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100'
      )}>
      {/* Navigation */}
      <nav 
        className="fixed top-0 left-0 right-0 z-50 shadow-lg border-b-4 border-wood-900 dark:border-wood-950"
        style={{
          backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0",
          isDark ? 'bg-wood-900/80' : 'bg-orange-600/70'
        )} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Yumly" className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[
                { to: '/', icon: Home, label: t.home },
                { to: '/recipes', icon: ChefHat, label: t.recipes },
                { to: '/meal-plan', icon: Calendar, label: t.plan, auth: true },
                { to: '/favorites', icon: Heart, label: t.favorites, auth: true },
              ].map((link) => {
                if (link.auth && !isAuthenticated) return null;
                const isActive = location.pathname === link.to || 
                  (link.to !== '/' && location.pathname.startsWith(link.to));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                      isActive 
                        ? 'bg-forest-600 text-white'
                        : 'text-white/90 hover:bg-white/20'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Language */}
              <button
                onClick={() => setLanguage(language === 'bg' ? 'en' : 'bg')}
                className={cn(
                  "px-3 py-2 rounded-lg font-bold text-sm uppercase transition-all",
                  isDark
                    ? 'bg-wood-700 text-cream-200 hover:bg-wood-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {language}
              </button>

              {/* Theme */}
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isDark
                    ? 'bg-wood-700 text-amber-400 hover:bg-wood-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className={cn(
                    "px-4 py-2 rounded-lg font-semibold transition-all",
                    isDark ? 'bg-forest-600 text-white hover:bg-forest-500' : 'bg-white text-orange-600 hover:bg-orange-50'
                  )}
                >
                  {t.profile}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className={cn(
                    "px-5 py-2 rounded-lg font-semibold transition-all",
                    isDark ? 'bg-forest-600 text-white hover:bg-forest-500' : 'bg-white text-orange-600 hover:bg-orange-50'
                  )}
                >
                  {t.login}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
            alt="Food background"
            className="w-full h-full object-cover"
          />
          <div className={cn(
            "absolute inset-0",
            isDark 
              ? 'bg-gradient-to-r from-wood-900/95 via-wood-900/85 to-wood-900/75'
              : 'bg-gradient-to-r from-orange-700/90 via-orange-600/80 to-amber-500/70'
          )} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight"
              >
                {t.heroTitle}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-white/90 mb-10 leading-relaxed"
              >
                {t.heroSubtitle}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to={isAuthenticated ? '/recipes' : '/register'}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform",
                    isDark ? 'bg-forest-600 text-white hover:bg-forest-500' : 'bg-white text-orange-600 hover:bg-orange-50'
                  )}
                >
                  {t.startNow}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/recipes"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  {t.browseRecipes}
                </Link>
              </motion.div>
            </div>

            {/* Right - Food Images Grid */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-6">
                {FOOD_IMAGES.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, rotate: i % 2 === 0 ? -5 : 5 }}
                    animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -3 : 3 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className="relative"
                  >
                    <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 hover:scale-105 transition-transform duration-300">
                      <img 
                        src={img} 
                        alt={`Food ${i + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop';
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for readability */}
        <div className={cn(
          "absolute inset-0",
          isDark ? 'bg-wood-900/70' : 'bg-orange-50/80'
        )} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
              "text-3xl sm:text-4xl font-serif font-bold text-center mb-4",
              isDark ? 'text-cream-100' : 'text-gray-800'
            )}
          >
            {t.features}
          </motion.h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-6 rounded-2xl text-center transition-all hover:scale-105 backdrop-blur-sm",
                  isDark 
                    ? 'bg-wood-800/90 border-2 border-wood-600 shadow-xl' 
                    : 'bg-white/90 border-2 border-orange-200 shadow-xl'
                )}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br",
                  isDark ? 'from-forest-600 to-forest-700' : f.color
                )}>
                  <f.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={cn(
                  "text-xl font-bold mb-2",
                  isDark ? 'text-cream-100' : 'text-gray-800'
                )}>
                  {f.title}
                </h3>
                <p className={cn(
                  "text-sm",
                  isDark ? 'text-cream-400' : 'text-gray-600'
                )}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions Section */}
      <section className={cn(
        "py-20",
        isDark ? 'bg-wood-900' : 'bg-gradient-to-br from-orange-50 to-amber-50'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "text-3xl sm:text-4xl font-serif font-bold mb-2",
                  isDark ? 'text-cream-100' : 'text-gray-800'
                )}
              >
                {t.regions}
              </motion.h2>
              <p className={cn(
                isDark ? 'text-cream-400' : 'text-gray-600'
              )}>
                {t.regionsDesc}
              </p>
            </div>
            <Link
              to="/recipes"
              className={cn(
                "hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                isDark 
                  ? 'text-forest-400 hover:bg-wood-800' 
                  : 'text-orange-600 hover:bg-orange-100'
              )}
            >
              {t.viewAll}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_REGIONS.map((region, i) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/regions/${region.id}`}
                  className={cn(
                    "block p-6 rounded-2xl transition-all hover:scale-105 group",
                    isDark
                      ? 'bg-wood-800 border-2 border-wood-600 hover:border-forest-500'
                      : 'bg-white border-2 border-orange-200 hover:border-orange-400 shadow-lg'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img 
                        src={region.image} 
                        alt={region.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(
                        "text-xl font-bold mb-1 group-hover:text-orange-500 dark:group-hover:text-forest-400 transition-colors",
                        isDark ? 'text-cream-100' : 'text-gray-800'
                      )}>
                        {language === 'bg' ? region.nameBg : region.name}
                      </h3>
                      <p className={cn(
                        "text-sm line-clamp-2",
                        isDark ? 'text-cream-400' : 'text-gray-500'
                      )}>
                        {language === 'bg' ? region.descriptionBg : region.description}
                      </p>
                    </div>
                    <ArrowRight className={cn(
                      "w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity",
                      isDark ? 'text-forest-400' : 'text-orange-500'
                    )} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0",
          isDark ? 'bg-forest-700/85' : 'bg-orange-500/80'
        )} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
            {language === 'bg' ? 'Готов ли си да започнеш?' : 'Ready to get started?'}
          </h2>
          <p className="text-xl text-white/80 mb-8">
            {language === 'bg' 
              ? 'Присъедини се към хиляди готвачи и открий нови вкусове!' 
              : 'Join thousands of cooks and discover new flavors!'}
          </p>
          <Link
            to={isAuthenticated ? '/recipes' : '/register'}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg bg-white text-orange-600 dark:text-forest-700 hover:scale-105 shadow-xl transition-transform"
          >
            {t.startNow}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-8 border-t border-wood-700 relative overflow-hidden"
        style={{
          backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0",
          isDark ? 'bg-wood-900/85' : 'bg-orange-50/90'
        )} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="Yumly" className="h-8 w-auto" />
          </div>
          <p className={isDark ? 'text-cream-400' : 'text-gray-600'}>
            © 2026 Yumly. {language === 'bg' ? 'Всички права запазени.' : 'All rights reserved.'}
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
