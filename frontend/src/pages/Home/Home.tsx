import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, Calendar, Heart, BookOpen, ArrowRight, 
  Utensils, Users, Sparkles, Leaf
} from 'lucide-react';
import { useAuthStore } from '../../context/authStore';
import { useThemeStore } from '../../context/themeStore';
import { ALL_REGIONS } from '../../config/regions';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { language, theme } = useThemeStore();

  const t = {
    bg: {
      heroTitle: 'Пътят към здравето',
      heroSubtitle: 'Открий вкусни рецепти, планирай храненето си и постигни целите си за здраве',
      startBtn: 'Разгледай рецепти',
      registerBtn: 'Регистрирай се',
      features: 'Какво предлагаме',
      feature1Title: 'Хиляди рецепти',
      feature1Desc: 'Открий рецепти от цял свят - от традиционни български ястия до екзотични кухни',
      feature2Title: 'Седмичен план',
      feature2Desc: 'Планирай храненето си за цялата седмица и следи калориите',
      feature3Title: 'Здравословно хранене',
      feature3Desc: 'Персонализирани препоръки според твоите цели и предпочитания',
      feature4Title: 'Общност',
      feature4Desc: 'Сподели собствени рецепти и открий какво готвят другите',
      regionsTitle: 'Кулинарни региони',
      regionsSubtitle: 'Пътешествай през света на вкусовете',
      ctaTitle: 'Готов ли си да започнеш?',
      ctaSubtitle: 'Присъедини се към хиляди потребители, които вече готвят по-здравословно',
    },
    en: {
      heroTitle: 'Path to Health',
      heroSubtitle: 'Discover delicious recipes, plan your meals and achieve your health goals',
      startBtn: 'Browse Recipes',
      registerBtn: 'Sign Up',
      features: 'What We Offer',
      feature1Title: 'Thousands of Recipes',
      feature1Desc: 'Discover recipes from around the world - from traditional Bulgarian dishes to exotic cuisines',
      feature2Title: 'Weekly Meal Plan',
      feature2Desc: 'Plan your meals for the entire week and track your calories',
      feature3Title: 'Healthy Eating',
      feature3Desc: 'Personalized recommendations based on your goals and preferences',
      feature4Title: 'Community',
      feature4Desc: 'Share your own recipes and discover what others are cooking',
      regionsTitle: 'Culinary Regions',
      regionsSubtitle: 'Travel through the world of flavors',
      ctaTitle: 'Ready to Start?',
      ctaSubtitle: 'Join thousands of users who are already cooking healthier',
    },
  };

  const text = t[language] || t.bg;

  const features = [
    { icon: BookOpen, title: text.feature1Title, desc: text.feature1Desc, color: '#8bc34a' },
    { icon: Calendar, title: text.feature2Title, desc: text.feature2Desc, color: '#ff9800' },
    { icon: Leaf, title: text.feature3Title, desc: text.feature3Desc, color: '#4caf50' },
    { icon: Users, title: text.feature4Title, desc: text.feature4Desc, color: '#2196f3' },
  ];

  // Wood panel style
  const woodPanelStyle = {
    background: theme === 'dark' 
      ? 'linear-gradient(180deg, #2d1f15 0%, #1a1612 100%)'
      : 'linear-gradient(180deg, #6d4c30 0%, #5a3d26 100%)',
    border: `4px solid ${theme === 'dark' ? '#0f0c0a' : '#3d2b1d'}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
  };

  // Green button style
  const greenBtnStyle = {
    background: 'linear-gradient(180deg, #8bc34a 0%, #689f38 100%)',
    border: '3px solid #558b2f',
    boxShadow: '0 4px 15px rgba(104, 159, 56, 0.5)',
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Main wooden panel */}
            <div 
              className="inline-block px-12 py-10 rounded-3xl mb-8"
              style={woodPanelStyle}
            >
              {/* Logo */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div 
                  className="p-4 rounded-2xl"
                  style={greenBtnStyle}
                >
                  <ChefHat className="w-12 h-12 text-white" />
                </div>
              </div>

              <h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
                style={{ 
                  textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Yumly
              </h1>
              
              <p 
                className="text-xl sm:text-2xl text-green-300 mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {text.heroTitle}
              </p>
              
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                {text.heroSubtitle}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/recipes"
                  className="px-8 py-4 rounded-xl text-white font-bold text-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
                  style={greenBtnStyle}
                >
                  <Utensils className="w-5 h-5" />
                  {text.startBtn}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-xl text-white font-bold text-lg border-2 border-white/30 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {text.registerBtn}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div 
              className="rounded-2xl overflow-hidden"
              style={{
                border: `6px solid ${theme === 'dark' ? '#2d1f15' : '#5a3d26'}`,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1200&h=600&fit=crop"
                alt="Fresh vegetables and fruits"
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div 
              className="inline-block px-8 py-4 rounded-2xl mb-6"
              style={woodPanelStyle}
            >
              <h2 
                className="text-3xl font-bold text-white"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {text.features}
              </h2>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl p-6 text-center"
                style={{
                  ...woodPanelStyle,
                  border: `3px solid ${theme === 'dark' ? '#0f0c0a' : '#3d2b1d'}`,
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    backgroundColor: feature.color,
                    boxShadow: `0 4px 15px ${feature.color}50`,
                  }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Regions Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div 
              className="inline-block px-8 py-4 rounded-2xl"
              style={woodPanelStyle}
            >
              <h2 
                className="text-3xl font-bold text-white mb-2"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {text.regionsTitle}
              </h2>
              <p className="text-green-300">{text.regionsSubtitle}</p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_REGIONS.slice(0, 6).map((region, idx) => (
              <motion.div
                key={region.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={`/regions/${region.id}`}
                  className="block rounded-2xl overflow-hidden transition-transform hover:scale-105"
                  style={{
                    border: `4px solid ${theme === 'dark' ? '#2d1f15' : '#5a3d26'}`,
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div 
                    className="h-32 relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${region.colors.primary}60 0%, ${region.colors.accent}60 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ChefHat className="w-12 h-12 text-white/80" />
                    </div>
                  </div>
                  <div 
                    className="p-4"
                    style={woodPanelStyle}
                  >
                    <h3 className="text-lg font-bold text-white">{region.name}</h3>
                    <p className="text-green-300 text-sm">{region.cuisine}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-8 sm:p-12 text-center"
              style={woodPanelStyle}
            >
              <h2 
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
              >
                {text.ctaTitle}
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                {text.ctaSubtitle}
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-lg transition-transform hover:scale-105"
                style={greenBtnStyle}
              >
                <Sparkles className="w-5 h-5" />
                {text.registerBtn}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
