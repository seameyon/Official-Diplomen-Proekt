import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../context/themeStore';

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop', // Salad bowl
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop', // Pizza
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop', // Pancakes
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop', // Colorful salad
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=400&fit=crop', // Pasta
];

export default function AuthLayout() {
  const { theme, toggleTheme, language } = useThemeStore();
  const isDark = theme === 'dark';

  const t = {
    tagline: language === 'bg' ? 'Открий вкусове от цял свят' : 'Discover flavors from around the world',
    subtitle: language === 'bg' 
      ? 'Присъедини се и създай своя персонализиран хранителен план' 
      : 'Join and create your personalized meal plan',
    feature1: language === 'bg' ? 'Персонализирани рецепти' : 'Personalized recipes',
    feature2: language === 'bg' ? 'AI хранителен план' : 'AI meal planner',
    feature3: language === 'bg' ? 'Кухни от цял свят' : 'World cuisines',
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark 
            ? 'bg-gradient-to-br from-[#1a1612] via-[#2d2118] to-[#1a1612]'
            : 'bg-gradient-to-br from-amber-50 via-orange-50 to-cream-100'
        }`}
      />
      
      {/* Left side - Image Collage */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 z-10 ${
          isDark 
            ? 'bg-gradient-to-r from-transparent via-[#1a1612]/50 to-[#1a1612]'
            : 'bg-gradient-to-r from-transparent via-amber-50/50 to-amber-50'
        }`} />
        
        {/* Image grid */}
        <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8">
          {/* Large image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="col-span-1 row-span-2 rounded-2xl overflow-hidden shadow-2xl"
          >
            <img 
              src={FOOD_IMAGES[0]} 
              alt="Delicious food"
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Smaller images */}
          {FOOD_IMAGES.slice(1).map((img, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (i + 1) }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <img 
                src={img} 
                alt="Delicious food"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`p-6 rounded-2xl backdrop-blur-md ${
              isDark ? 'bg-[#1a1612]/70' : 'bg-white/70'
            } shadow-xl`}
          >
            {/* Logo */}
            <Link to="/" className="inline-block mb-4">
              <img src="/logo.png" alt="Yumly" className="h-14 w-auto" />
            </Link>
            
            {/* Tagline */}
            <h1 className={`text-xl font-serif font-semibold mb-2 ${isDark ? 'text-cream-100' : 'text-wood-800'}`}>
              {t.tagline}
            </h1>
            
            <p className={`text-sm ${isDark ? 'text-cream-400' : 'text-wood-600'}`}>
              {t.subtitle}
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Theme toggle */}
        <div className="flex justify-end p-6">
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-colors ${
              isDark 
                ? 'bg-wood-800 text-amber-400 hover:bg-wood-700' 
                : 'bg-white text-amber-600 hover:bg-amber-50 shadow-md'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-block">
                <img src="/logo.png" alt="Yumly" className="h-16 w-auto mx-auto" />
              </Link>
            </div>
            
            {/* Form card */}
            <div 
              className={`rounded-2xl shadow-xl p-8 ${
                isDark 
                  ? 'bg-wood-800/95 border border-wood-700' 
                  : 'bg-white/95 border border-amber-100'
              }`}
            >
              <Outlet />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
