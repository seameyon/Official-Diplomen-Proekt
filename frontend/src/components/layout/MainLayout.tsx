import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, ChefHat, Calendar, Heart, User, Settings, 
  LogOut, Sun, Moon, Shield, LogIn, UserPlus
} from 'lucide-react';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { cn } from '../../utils';

// Wood texture backgrounds
const WOOD_TEXTURE_DARK = 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=1920&q=80';
const WOOD_TEXTURE_LIGHT = 'https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?w=1920&q=80';

export default function MainLayout() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, setTheme, language, setLanguage } = useThemeStore();
  
  const isAdmin = user?.email === 'xzvelkosimeon@gmail.com' || user?.isAdmin;
  const isDark = theme === 'dark';
  
  // Don't show layout on landing page
  if (location.pathname === '/') {
    return <Outlet />;
  }

  const t = {
    home: language === 'bg' ? 'Начало' : 'Home',
    recipes: language === 'bg' ? 'Рецепти' : 'Recipes',
    plan: language === 'bg' ? 'План' : 'Plan',
    favorites: language === 'bg' ? 'Любими' : 'Favorites',
    profile: language === 'bg' ? 'Профил' : 'Profile',
    admin: language === 'bg' ? 'Админ' : 'Admin',
    login: language === 'bg' ? 'Вход' : 'Login',
    register: language === 'bg' ? 'Регистрация' : 'Register',
  };

  const navItems = [
    { to: '/', icon: Home, label: t.home, auth: false },
    { to: '/recipes', icon: ChefHat, label: t.recipes, auth: false },
    { to: '/meal-plan', icon: Calendar, label: t.plan, auth: true },
    { to: '/favorites', icon: Heart, label: t.favorites, auth: true },
  ];

  return (
    <div 
      className="min-h-screen pb-20 lg:pb-0 select-none relative overflow-hidden"
      style={{
        backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        maxWidth: '100vw',
        width: '100%',
      }}
    >
      {/* Overlay for readability */}
      <div className={cn(
        "fixed inset-0 pointer-events-none",
        isDark ? 'bg-wood-900/75' : 'bg-orange-50/80'
      )} />

      {/* Desktop Header */}
      <header 
        className="hidden lg:block fixed top-0 left-0 right-0 z-50 shadow-lg border-b-4 border-wood-900"
        style={{
          backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Header overlay */}
        <div className={cn(
          "absolute inset-0",
          isDark ? 'bg-wood-900/85' : 'bg-orange-500/80'
        )} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Yumly" className="h-10 w-auto" />
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                const isActive = location.pathname === item.to || 
                  (item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                      isActive 
                        ? (isDark ? 'bg-forest-600 text-white' : 'bg-white/30 text-white')
                        : 'text-white/90 hover:bg-white/20'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    location.pathname === '/admin'
                      ? 'bg-red-600 text-white'
                      : 'text-white/90 hover:bg-red-600/50'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  {t.admin}
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Language - just BG or EN */}
              <button
                onClick={() => setLanguage(language === 'bg' ? 'en' : 'bg')}
                className={cn(
                  "w-10 h-10 rounded-lg font-bold text-sm uppercase flex items-center justify-center transition-all",
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
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  isDark
                    ? 'bg-wood-700 text-amber-400 hover:bg-wood-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                      location.pathname === '/profile' 
                        ? (isDark ? 'bg-forest-600 text-white' : 'bg-white/30 text-white')
                        : 'text-white/90 hover:bg-white/20'
                    )}
                  >
                    <User className="w-4 h-4" />
                    {t.profile}
                  </Link>
                  <Link
                    to="/settings"
                    className="p-2 rounded-lg text-white/90 hover:bg-white/20"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="p-2 rounded-lg text-white/90 hover:bg-red-600/50"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:bg-white/20 font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    {t.login}
                  </Link>
                  <Link
                    to="/register"
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold",
                      isDark
                        ? 'bg-forest-600 text-white hover:bg-forest-500'
                        : 'bg-white text-orange-600 hover:bg-orange-50'
                    )}
                  >
                    <UserPlus className="w-4 h-4" />
                    {t.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - only add pt-16 on desktop where header is visible */}
      <main className="lg:pt-16 relative z-10">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-wood-600 safe-area-pb"
        style={{
          backgroundImage: `url(${isDark ? WOOD_TEXTURE_DARK : WOOD_TEXTURE_LIGHT})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Mobile nav overlay */}
        <div className={cn(
          "absolute inset-0",
          isDark ? 'bg-wood-900/90' : 'bg-orange-500/85'
        )} />
        
        <div className="flex justify-around py-2 relative z-10">
          {navItems.slice(0, 3).map((item) => {
            if (item.auth && !isAuthenticated) return null;
            const isActive = location.pathname === item.to || 
              (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px]',
                  isActive ? 'text-white' : 'text-white/70'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'scale-110')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Mobile Language */}
          <button
            onClick={() => setLanguage(language === 'bg' ? 'en' : 'bg')}
            className="flex flex-col items-center gap-1 px-3 py-2 text-white/70"
          >
            <span className="text-sm font-bold uppercase">{language}</span>
            <span className="text-xs">Lang</span>
          </button>
          
          {/* Mobile Theme */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex flex-col items-center gap-1 px-3 py-2 text-white/70"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-xs">{isDark ? 'Light' : 'Dark'}</span>
          </button>
          
          {isAuthenticated ? (
            <Link
              to="/profile"
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 min-w-[56px]',
                location.pathname === '/profile' ? 'text-white' : 'text-white/70'
              )}
            >
              <User className="w-5 h-5" />
              <span className="text-xs font-medium">{t.profile}</span>
            </Link>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-1 px-3 py-2 text-white">
              <LogIn className="w-5 h-5" />
              <span className="text-xs">{t.login}</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
