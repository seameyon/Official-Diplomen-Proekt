import mongoose from 'mongoose';
import { Recipe } from '../models/Recipe.model.js';
import { User } from '../models/User.model.js';
import { env } from '../config/env.js';

// Оригинални български рецепти
const bulgarianRecipes = [
  // ЗАКУСКИ
  {
    title: 'Баница със сирене',
    description: 'Традиционна българска баница с домашно точени кори и бяло сирене. Хрупкава отвън, сочна отвътре.',
    ingredients: [
      { name: 'кори за баница', amount: 500, unit: 'g' },
      { name: 'бяло сирене', amount: 400, unit: 'g' },
      { name: 'яйца', amount: 4, unit: 'бр' },
      { name: 'кисело мляко', amount: 400, unit: 'ml' },
      { name: 'олио', amount: 100, unit: 'ml' },
      { name: 'сода бикарбонат', amount: 1, unit: 'ч.л.' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Разбийте яйцата с киселото мляко и содата.' },
      { stepNumber: 2, instruction: 'Разтрошете сиренето и го добавете към сместа.' },
      { stepNumber: 3, instruction: 'Намажете тава с олио и подредете корите, като мажете всяка с олио и смес.' },
      { stepNumber: 4, instruction: 'Печете на 180°C около 40-45 минути до златисто.' },
    ],
    prepTime: 20,
    cookTime: 45,
    servings: 8,
    nutrition: { calories: 320, protein: 12, carbs: 28, fat: 18, fiber: 1 },
    tags: ['breakfast', 'vegetarian', 'bulgarian'],
    difficulty: 'medium',
    mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  },
  {
    title: 'Мекици',
    description: 'Пухкави мекици - класическа българска закуска, поднесена със сирене, мед или конфитюр.',
    ingredients: [
      { name: 'брашно', amount: 500, unit: 'g' },
      { name: 'кисело мляко', amount: 400, unit: 'ml' },
      { name: 'яйца', amount: 2, unit: 'бр' },
      { name: 'мая', amount: 10, unit: 'g' },
      { name: 'захар', amount: 1, unit: 'с.л.' },
      { name: 'сол', amount: 1, unit: 'ч.л.' },
      { name: 'олио за пържене', amount: 500, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Разтворете маята в топло мляко със захарта.' },
      { stepNumber: 2, instruction: 'Добавете яйцата, солта и брашното. Замесете меко тесто.' },
      { stepNumber: 3, instruction: 'Оставете да втаса 1 час на топло.' },
      { stepNumber: 4, instruction: 'Оформете мекиците и пържете в сгорещено олио до златисто.' },
    ],
    prepTime: 15,
    cookTime: 20,
    servings: 6,
    nutrition: { calories: 280, protein: 8, carbs: 35, fat: 12, fiber: 2 },
    tags: ['breakfast', 'vegetarian', 'quick', 'bulgarian'],
    difficulty: 'easy',
    mainImage: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  },
  {
    title: 'Попара',
    description: 'Топла и сърцата закуска от хляб, сирене и масло - перфектна за студени зимни дни.',
    ingredients: [
      { name: 'бял хляб (от предния ден)', amount: 300, unit: 'g' },
      { name: 'бяло сирене', amount: 200, unit: 'g' },
      { name: 'масло', amount: 50, unit: 'g' },
      { name: 'гореща вода', amount: 300, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Нарежете хляба на кубчета и го поставете в купа.' },
      { stepNumber: 2, instruction: 'Залейте с гореща вода и оставете да омекне.' },
      { stepNumber: 3, instruction: 'Добавете разтрошеното сирене и маслото.' },
      { stepNumber: 4, instruction: 'Разбъркайте добре и сервирайте топло.' },
    ],
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    nutrition: { calories: 350, protein: 14, carbs: 30, fat: 20, fiber: 2 },
    tags: ['breakfast', 'vegetarian', 'quick', 'budget-friendly', 'bulgarian'],
    difficulty: 'easy',
    mainImage: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800',
  },

  // СУПИ
  {
    title: 'Таратор',
    description: 'Освежаваща студена супа от кисело мляко, краставици и копър - лятна класика.',
    ingredients: [
      { name: 'кисело мляко', amount: 500, unit: 'ml' },
      { name: 'краставици', amount: 2, unit: 'бр' },
      { name: 'чесън', amount: 3, unit: 'скилидки' },
      { name: 'копър', amount: 1, unit: 'връзка' },
      { name: 'орехи', amount: 50, unit: 'g' },
      { name: 'зехтин', amount: 2, unit: 'с.л.' },
      { name: 'сол', amount: 1, unit: 'ч.л.' },
      { name: 'вода', amount: 200, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Разбъркайте киселото мляко с водата до хомогенна смес.' },
      { stepNumber: 2, instruction: 'Нарежете краставиците на малки кубчета.' },
      { stepNumber: 3, instruction: 'Счукайте чесъна със солта.' },
      { stepNumber: 4, instruction: 'Смесете всичко, добавете нарязания копър, орехите и зехтина.' },
      { stepNumber: 5, instruction: 'Охладете в хладилника поне 1 час преди сервиране.' },
    ],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    nutrition: { calories: 150, protein: 6, carbs: 10, fat: 10, fiber: 2 },
    tags: ['lunch', 'vegetarian', 'gluten-free', 'quick', 'bulgarian'],
    difficulty: 'easy',
    mainImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  },
  {
    title: 'Шкембе чорба',
    description: 'Традиционна българска чорба от шкембе с чесън и оцет - идеална след празник.',
    ingredients: [
      { name: 'шкембе (почистено)', amount: 500, unit: 'g' },
      { name: 'мляко', amount: 500, unit: 'ml' },
      { name: 'брашно', amount: 2, unit: 'с.л.' },
      { name: 'яйца', amount: 2, unit: 'бр' },
      { name: 'чесън', amount: 5, unit: 'скилидки' },
      { name: 'оцет', amount: 3, unit: 'с.л.' },
      { name: 'червен пипер', amount: 1, unit: 'ч.л.' },
      { name: 'сол', amount: 1, unit: 'ч.л.' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Сварете шкембето до омекване (около 2-3 часа).' },
      { stepNumber: 2, instruction: 'Нарежете го на тънки ивици.' },
      { stepNumber: 3, instruction: 'Направете застройка от яйца и мляко с брашно.' },
      { stepNumber: 4, instruction: 'Добавете застройката към бульона.' },
      { stepNumber: 5, instruction: 'Сервирайте с люта чеснова заливка с оцет и червен пипер.' },
    ],
    prepTime: 30,
    cookTime: 180,
    servings: 6,
    nutrition: { calories: 220, protein: 18, carbs: 8, fat: 14, fiber: 0 },
    tags: ['lunch', 'dinner', 'high-protein', 'bulgarian'],
    difficulty: 'hard',
    mainImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  },
  {
    title: 'Боб чорба',
    description: 'Гъста и сита чорба от боб с джоджен и чубрица - вегетарианска наслада.',
    ingredients: [
      { name: 'бял боб', amount: 400, unit: 'g' },
      { name: 'лук', amount: 2, unit: 'бр' },
      { name: 'моркови', amount: 2, unit: 'бр' },
      { name: 'домати (консерва)', amount: 400, unit: 'g' },
      { name: 'чубрица', amount: 1, unit: 'с.л.' },
      { name: 'джоджен', amount: 1, unit: 'ч.л.' },
      { name: 'червен пипер', amount: 1, unit: 'ч.л.' },
      { name: 'олио', amount: 3, unit: 'с.л.' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Накиснете боба за една нощ.' },
      { stepNumber: 2, instruction: 'Сварете боба до мекост.' },
      { stepNumber: 3, instruction: 'Запържете лука и морковите в олиото.' },
      { stepNumber: 4, instruction: 'Добавете доматите и подправките.' },
      { stepNumber: 5, instruction: 'Съединете с боба и оставете да се сготви още 20 минути.' },
    ],
    prepTime: 20,
    cookTime: 90,
    servings: 6,
    nutrition: { calories: 280, protein: 15, carbs: 45, fat: 6, fiber: 12 },
    tags: ['lunch', 'dinner', 'vegan', 'high-protein', 'meal-prep', 'bulgarian'],
    difficulty: 'medium',
    mainImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  },

  // ОСНОВНИ ЯСТИЯ
  {
    title: 'Кавърма',
    description: 'Класическа българска кавърма със свинско месо, лук и чушки - богат вкус в гювеч.',
    ingredients: [
      { name: 'свинско месо', amount: 500, unit: 'g' },
      { name: 'лук', amount: 3, unit: 'бр' },
      { name: 'чушки', amount: 3, unit: 'бр' },
      { name: 'домати', amount: 3, unit: 'бр' },
      { name: 'чубрица', amount: 1, unit: 'с.л.' },
      { name: 'черен пипер', amount: 1, unit: 'ч.л.' },
      { name: 'сол', amount: 1, unit: 'ч.л.' },
      { name: 'олио', amount: 50, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Нарежете месото на кубчета и го запечете.' },
      { stepNumber: 2, instruction: 'Добавете нарязания лук и чушките.' },
      { stepNumber: 3, instruction: 'Добавете доматите и подправките.' },
      { stepNumber: 4, instruction: 'Сложете в гювеч и печете на 180°C за 1 час.' },
    ],
    prepTime: 25,
    cookTime: 60,
    servings: 4,
    nutrition: { calories: 380, protein: 28, carbs: 12, fat: 24, fiber: 3 },
    tags: ['dinner', 'high-protein', 'gluten-free', 'bulgarian'],
    difficulty: 'medium',
    mainImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },
  {
    title: 'Мусака',
    description: 'Българска мусака с картофи и кайма - любимо семейно ястие, идеално за обяд.',
    ingredients: [
      { name: 'картофи', amount: 1000, unit: 'g' },
      { name: 'кайма (смесена)', amount: 500, unit: 'g' },
      { name: 'лук', amount: 2, unit: 'бр' },
      { name: 'домати', amount: 300, unit: 'g' },
      { name: 'яйца', amount: 3, unit: 'бр' },
      { name: 'кисело мляко', amount: 400, unit: 'ml' },
      { name: 'червен пипер', amount: 2, unit: 'ч.л.' },
      { name: 'джоджен', amount: 1, unit: 'ч.л.' },
      { name: 'олио', amount: 100, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Обелете и нарежете картофите на тънки колелца.' },
      { stepNumber: 2, instruction: 'Задушете каймата с лука и доматите.' },
      { stepNumber: 3, instruction: 'Подредете на пластове картофи и кайма в тава.' },
      { stepNumber: 4, instruction: 'Залейте с разбити яйца и кисело мляко.' },
      { stepNumber: 5, instruction: 'Печете на 180°C за 45 минути.' },
    ],
    prepTime: 30,
    cookTime: 45,
    servings: 6,
    nutrition: { calories: 420, protein: 22, carbs: 35, fat: 22, fiber: 4 },
    tags: ['lunch', 'dinner', 'high-protein', 'meal-prep', 'bulgarian'],
    difficulty: 'medium',
    mainImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },
  {
    title: 'Сарми',
    description: 'Традиционни сарми с лозови листа и оризова плънка - перфектни за празници.',
    ingredients: [
      { name: 'лозови листа', amount: 40, unit: 'бр' },
      { name: 'кайма', amount: 400, unit: 'g' },
      { name: 'ориз', amount: 200, unit: 'g' },
      { name: 'лук', amount: 2, unit: 'бр' },
      { name: 'джоджен', amount: 2, unit: 'с.л.' },
      { name: 'чубрица', amount: 1, unit: 'с.л.' },
      { name: 'домати (пюре)', amount: 200, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Измийте листата и ги попарете с гореща вода.' },
      { stepNumber: 2, instruction: 'Смесете каймата с ориза, лука и подправките.' },
      { stepNumber: 3, instruction: 'Завийте плънката в листата.' },
      { stepNumber: 4, instruction: 'Подредете в тенджера, залейте с вода и доматено пюре.' },
      { stepNumber: 5, instruction: 'Варете на тих огън 1.5 часа.' },
    ],
    prepTime: 45,
    cookTime: 90,
    servings: 8,
    nutrition: { calories: 280, protein: 16, carbs: 28, fat: 12, fiber: 2 },
    tags: ['lunch', 'dinner', 'meal-prep', 'bulgarian'],
    difficulty: 'hard',
    mainImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },
  {
    title: 'Пълнени чушки',
    description: 'Чушки, пълнени с ориз и кайма, печени в доматен сос - семеен фаворит.',
    ingredients: [
      { name: 'чушки (големи)', amount: 8, unit: 'бр' },
      { name: 'кайма', amount: 400, unit: 'g' },
      { name: 'ориз', amount: 150, unit: 'g' },
      { name: 'лук', amount: 2, unit: 'бр' },
      { name: 'домати (консерва)', amount: 400, unit: 'g' },
      { name: 'чубрица', amount: 1, unit: 'с.л.' },
      { name: 'кисело мляко', amount: 200, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Почистете чушките от семките.' },
      { stepNumber: 2, instruction: 'Смесете каймата с ориза, лука и подправките.' },
      { stepNumber: 3, instruction: 'Напълнете чушките с плънката.' },
      { stepNumber: 4, instruction: 'Подредете в тава и залейте с доматите.' },
      { stepNumber: 5, instruction: 'Печете на 180°C за 50 минути. Сервирайте с кисело мляко.' },
    ],
    prepTime: 25,
    cookTime: 50,
    servings: 4,
    nutrition: { calories: 350, protein: 20, carbs: 32, fat: 16, fiber: 4 },
    tags: ['lunch', 'dinner', 'gluten-free', 'bulgarian'],
    difficulty: 'medium',
    mainImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },
  {
    title: 'Гювеч',
    description: 'Зеленчуков гювеч със или без месо - лятно ястие с домати, чушки и тиквички.',
    ingredients: [
      { name: 'тиквички', amount: 2, unit: 'бр' },
      { name: 'патладжан', amount: 1, unit: 'бр' },
      { name: 'чушки', amount: 3, unit: 'бр' },
      { name: 'домати', amount: 4, unit: 'бр' },
      { name: 'лук', amount: 2, unit: 'бр' },
      { name: 'яйца', amount: 3, unit: 'бр' },
      { name: 'сирене', amount: 150, unit: 'g' },
      { name: 'олио', amount: 50, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Нарежете всички зеленчуци на кубчета.' },
      { stepNumber: 2, instruction: 'Подредете ги на пластове в глинен съд.' },
      { stepNumber: 3, instruction: 'Залейте с олио и печете на 180°C за 40 минути.' },
      { stepNumber: 4, instruction: 'Добавете разбитите яйца и сиренето.' },
      { stepNumber: 5, instruction: 'Печете още 10 минути до златисто.' },
    ],
    prepTime: 20,
    cookTime: 50,
    servings: 4,
    nutrition: { calories: 250, protein: 12, carbs: 18, fat: 16, fiber: 5 },
    tags: ['lunch', 'dinner', 'vegetarian', 'gluten-free', 'bulgarian'],
    difficulty: 'easy',
    mainImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  },

  // САЛАТИ
  {
    title: 'Шопска салата',
    description: 'Емблематичната българска салата с домати, краставици, чушки и сирене.',
    ingredients: [
      { name: 'домати', amount: 3, unit: 'бр' },
      { name: 'краставици', amount: 2, unit: 'бр' },
      { name: 'чушки', amount: 2, unit: 'бр' },
      { name: 'лук', amount: 1, unit: 'бр' },
      { name: 'сирене', amount: 150, unit: 'g' },
      { name: 'зехтин', amount: 3, unit: 'с.л.' },
      { name: 'оцет', amount: 1, unit: 'с.л.' },
      { name: 'сол', amount: 0.5, unit: 'ч.л.' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Нарежете зеленчуците на кубчета.' },
      { stepNumber: 2, instruction: 'Смесете ги в купа.' },
      { stepNumber: 3, instruction: 'Настържете сиренето отгоре.' },
      { stepNumber: 4, instruction: 'Овкусете със зехтин, оцет и сол.' },
    ],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    nutrition: { calories: 180, protein: 8, carbs: 10, fat: 12, fiber: 3 },
    tags: ['lunch', 'dinner', 'vegetarian', 'gluten-free', 'quick', 'bulgarian'],
    difficulty: 'easy',
    mainImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  },
  {
    title: 'Снежанка',
    description: 'Кремообразна салата от кисело мляко, краставици, чесън и орехи.',
    ingredients: [
      { name: 'цедено кисело мляко', amount: 400, unit: 'g' },
      { name: 'краставици', amount: 2, unit: 'бр' },
      { name: 'чесън', amount: 3, unit: 'скилидки' },
      { name: 'орехи', amount: 50, unit: 'g' },
      { name: 'копър', amount: 1, unit: 'връзка' },
      { name: 'зехтин', amount: 2, unit: 'с.л.' },
      { name: 'сол', amount: 0.5, unit: 'ч.л.' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Настържете краставиците и ги отцедете.' },
      { stepNumber: 2, instruction: 'Смесете киселото мляко с краставиците.' },
      { stepNumber: 3, instruction: 'Добавете счукания чесън и солта.' },
      { stepNumber: 4, instruction: 'Поръсете с орехи, копър и зехтин.' },
    ],
    prepTime: 15,
    cookTime: 0,
    servings: 4,
    nutrition: { calories: 160, protein: 7, carbs: 8, fat: 12, fiber: 2 },
    tags: ['lunch', 'dinner', 'vegetarian', 'gluten-free', 'quick', 'bulgarian'],
    difficulty: 'easy',
    mainImage: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
  },

  // ДЕСЕРТИ
  {
    title: 'Тиквеник',
    description: 'Сладка баница с тиква, орехи и канела - есенен десерт.',
    ingredients: [
      { name: 'кори за баница', amount: 400, unit: 'g' },
      { name: 'тиква', amount: 800, unit: 'g' },
      { name: 'захар', amount: 150, unit: 'g' },
      { name: 'орехи', amount: 100, unit: 'g' },
      { name: 'канела', amount: 2, unit: 'ч.л.' },
      { name: 'олио', amount: 100, unit: 'ml' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Настържете тиквата и я смесете със захарта и канелата.' },
      { stepNumber: 2, instruction: 'Добавете счуканите орехи.' },
      { stepNumber: 3, instruction: 'Навийте в корите и подредете в тава.' },
      { stepNumber: 4, instruction: 'Печете на 180°C за 40 минути.' },
      { stepNumber: 5, instruction: 'Залейте със захарен сироп.' },
    ],
    prepTime: 30,
    cookTime: 40,
    servings: 10,
    nutrition: { calories: 280, protein: 5, carbs: 40, fat: 12, fiber: 3 },
    tags: ['dessert', 'vegetarian', 'bulgarian'],
    difficulty: 'medium',
    mainImage: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800',
  },
  {
    title: 'Млечен кисел',
    description: 'Традиционен български десерт от ориз и мляко с канела.',
    ingredients: [
      { name: 'ориз', amount: 150, unit: 'g' },
      { name: 'мляко', amount: 1000, unit: 'ml' },
      { name: 'захар', amount: 100, unit: 'g' },
      { name: 'ванилия', amount: 1, unit: 'пакетче' },
      { name: 'канела', amount: 1, unit: 'ч.л.' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Сварете ориза в половината мляко.' },
      { stepNumber: 2, instruction: 'Добавете останалото мляко и захарта.' },
      { stepNumber: 3, instruction: 'Варете на тих огън до сгъстяване.' },
      { stepNumber: 4, instruction: 'Добавете ванилията и разлейте в купички.' },
      { stepNumber: 5, instruction: 'Поръсете с канела и охладете.' },
    ],
    prepTime: 10,
    cookTime: 30,
    servings: 6,
    nutrition: { calories: 220, protein: 6, carbs: 42, fat: 4, fiber: 0 },
    tags: ['dessert', 'vegetarian', 'gluten-free', 'bulgarian'],
    difficulty: 'easy',
    mainImage: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Свързване с базата данни...');
    await mongoose.connect(env.mongoUri);
    console.log('✅ Свързано с MongoDB');

    // Create system user for seeded recipes
    let systemUser = await User.findOne({ email: 'system@yumly.bg' });
    
    if (!systemUser) {
      systemUser = await User.create({
        email: 'system@yumly.bg',
        username: 'Yumly_BG',
        password: 'SystemUser123!',
        isEmailVerified: true,
        hasCompletedOnboarding: true,
        language: 'bg',
      });
      console.log('✅ Създаден системен потребител');
    }

    // Clear existing recipes from system user
    await Recipe.deleteMany({ authorId: systemUser._id });
    console.log('🧹 Изчистени стари рецепти');

    // Insert Bulgarian recipes
    const recipesWithAuthor = bulgarianRecipes.map(recipe => ({
      ...recipe,
      authorId: systemUser!._id,
      isPublished: true,
    }));

    await Recipe.insertMany(recipesWithAuthor);
    console.log(`✅ Добавени ${bulgarianRecipes.length} български рецепти`);

    console.log('🎉 Базата данни е успешно заредена!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Грешка:', error);
    process.exit(1);
  }
}

seedDatabase();
