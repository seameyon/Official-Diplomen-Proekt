import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useThemeStore } from '../../context/themeStore';

export default function Welcome() {
  const { language } = useThemeStore();

  const t = {
    welcome: language === 'bg' ? 'Добре дошли' : 'Welcome',
    title1: language === 'bg' ? 'Изкуството' : 'The Art',
    title2: language === 'bg' ? 'на готвенето' : 'of Cooking',
    subtitle: language === 'bg' 
      ? 'Открийте вкусове от цял свят. Планирайте храненето си интелигентно. Живейте здравословно.' 
      : 'Discover flavors from around the world. Plan your meals intelligently. Live healthy.',
    startJourney: language === 'bg' ? 'Започни пътешествието' : 'Start your journey',
    login: language === 'bg' ? 'Вече имам акаунт' : 'I already have an account',
    features: [
      {
        title: language === 'bg' ? 'Глобална кухня' : 'Global Cuisine',
        desc: language === 'bg' ? 'Рецепти от 5 уникални региона' : 'Recipes from 5 unique regions',
      },
      {
        title: language === 'bg' ? 'Умен план' : 'Smart Planning',
        desc: language === 'bg' ? 'AI персонализация' : 'AI personalization',
      },
      {
        title: language === 'bg' ? 'Здраве' : 'Health',
        desc: language === 'bg' ? 'Проследяване на цели' : 'Goal tracking',
      },
    ],
  };

  return (
    <>
      {/* Fixed background layer to prevent white overscroll */}
      <div 
        className="fixed inset-0 bg-[#1a1612]" 
        style={{ zIndex: -1 }} 
      />
      
      <div className="min-h-screen bg-[#1a1612] text-white overflow-hidden" style={{ maxWidth: '100vw', width: '100%' }}>
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1612] via-[#1a1612]/60 to-[#1a1612]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1612] via-transparent to-[#1a1612]/90" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-8 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center"
          >
            <img src="/logo.png" alt="Yumly" className="h-14 w-auto" />
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center px-6 sm:px-10 lg:px-20 pb-10">
          <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text */}
            <div>
              {/* Welcome text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-amber-500/90 font-medium tracking-[0.25em] uppercase text-base mb-8"
              >
                — {t.welcome}
              </motion.p>

              {/* Main title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] mb-10"
              >
                <span className="text-[#e8dcc8]">{t.title1}</span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  {t.title2}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-[#b8a88a] max-w-xl mb-12 leading-relaxed"
              >
                {t.subtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-5 mb-14"
              >
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full font-semibold text-lg text-[#1a1612] bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-xl shadow-amber-900/30 transition-all duration-300 transform hover:scale-105"
                >
                  {t.startJourney}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full font-medium text-lg text-[#c4b49a] border border-[#4a3f35] hover:bg-[#2a241f] hover:border-[#5a4f45] transition-all duration-300"
                >
                  {t.login}
                </Link>
              </motion.div>

              {/* Features - minimal style */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="flex flex-wrap gap-10"
              >
                {t.features.map((feature, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <h3 className="text-[#e8dcc8] font-semibold text-lg">{feature.title}</h3>
                    </div>
                    <p className="text-[#7a6f5f] text-base pl-5">{feature.desc}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right side - Images */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="hidden lg:block relative"
            >
              <div className="relative w-full h-[700px]">
                {/* Main large image */}
                <div className="absolute top-20 left-8 w-80 h-80 rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop"
                    alt="Delicious food"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Top right image */}
                <div className="absolute top-0 right-8 w-52 h-52 rounded-2xl overflow-hidden shadow-xl shadow-black/50 border border-white/5 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop"
                    alt="Pancakes"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Bottom image */}
                <div className="absolute bottom-12 right-0 w-64 h-64 rounded-2xl overflow-hidden shadow-xl shadow-black/50 border border-white/5 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop"
                    alt="Fruit tart"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Small accent image */}
                <div className="absolute bottom-44 left-0 w-40 h-40 rounded-xl overflow-hidden shadow-lg shadow-black/40 border border-white/5 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop"
                    alt="Salad"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Decorative elements */}
                <div className="absolute top-36 right-0 w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl" />
                <div className="absolute bottom-36 left-20 w-36 h-36 rounded-full bg-gradient-to-br from-orange-500/15 to-red-500/5 blur-2xl" />
              </div>
            </motion.div>
          </div>
        </main>

        {/* Bottom accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent"
        />

        {/* Footer */}
        <footer className="relative z-10 p-6 text-center">
          <p className="text-[#5a5045] text-sm">
            © 2026 Yumly · {language === 'bg' ? 'Всички права запазени' : 'All rights reserved'}
          </p>
        </footer>
      </div>
    </div>
    </>
  );
}
