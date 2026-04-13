// Premium Culinary Regions - Inspired by fantasy RPG world design
// Original naming to avoid IP issues, Genshin-level aesthetic

export type RegionId = 'liyun' | 'sakuraya' | 'mondberg' | 'fontalis' | 'sumera';

export interface RegionCharacter {
  name: string;
  title: string;
  titleBg: string;
  description: string;
  philosophy: string;
  philosophyBg: string;
  signatureDish: string;
  visualDirection: string;
}

export interface Region {
  id: RegionId;
  name: string;
  nameBg: string;
  flag: string;
  image: string;
  subtitle: string;
  subtitleBg: string;
  description: string;
  descriptionBg: string;
  lore: string;
  cuisine: string;
  cuisineBg: string;
  inspiration: string;
  colors: {
    primary: string;
    accent: string;
    glow: string;
    gradient: string;
  };
  character: RegionCharacter;
  dishes: string[];
  dishesBg: string[];
  tags: string[];
  ambiance: string;
}

export const REGIONS: Record<RegionId, Region> = {
  'liyun': {
    id: 'liyun',
    name: 'Liyun',
    nameBg: 'Лиюн',
    flag: '🇨🇳',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&h=200&fit=crop',
    subtitle: 'Harbor of Golden Flames',
    subtitleBg: 'Пристанище на Златните Пламъци',
    description: 'An ancient harbor city where culinary traditions have been perfected over millennia. The aroma of wok-seared delicacies fills the moonlit streets.',
    descriptionBg: 'Древен пристанищен град, където кулинарните традиции са усъвършенствани в продължение на хилядолетия. Ароматът на деликатеси от уок изпълва осветените от луната улици.',
    lore: 'Founded by merchants who believed that food carries the essence of prosperity, Liyun became the crossroads of Eastern culinary arts.',
    cuisine: 'Chinese & East Asian',
    cuisineBg: 'Китайска и Източноазиатска',
    inspiration: 'China',
    colors: {
      primary: '#c8a75b',
      accent: '#dc2626',
      glow: 'rgba(200, 167, 91, 0.15)',
      gradient: 'from-amber-900/20 via-red-900/10 to-transparent',
    },
    character: {
      name: 'Master Chen Wei',
      title: 'Guardian of the Golden Wok',
      titleBg: 'Пазител на Златния Уок',
      description: 'A distinguished chef whose family has served Liyun\'s noble houses for twelve generations.',
      philosophy: 'True mastery lies not in complexity, but in understanding the soul of each ingredient.',
      philosophyBg: 'Истинското майсторство не е в сложността, а в разбирането на душата на всяка съставка.',
      signatureDish: 'Imperial Jade Dumplings',
      visualDirection: 'Elegant male, late 30s, traditional robes with gold embroidery, calm dignified expression',
    },
    dishes: ['Xiaolongbao', 'Mapo Tofu', 'Peking Duck', 'Kung Pao Chicken', 'Dim Sum', 'Hot Pot'],
    dishesBg: ['Сяолунбао', 'Мапо Тофу', 'Пекинска Патица', 'Кунг Пао Пиле', 'Дим Сум', 'Хот Пот'],
    tags: ['chinese', 'asian', 'wok', 'dim-sum', 'noodles', 'dumplings', 'spicy'],
    ambiance: 'atmosphere-liyun',
  },
  
  'sakuraya': {
    id: 'sakuraya',
    name: 'Sakuraya',
    nameBg: 'Сакурая',
    flag: '🇯🇵',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop',
    subtitle: 'Isle of Eternal Seasons',
    subtitleBg: 'Остров на Вечните Сезони',
    description: 'A mystical archipelago where cherry blossoms bloom alongside autumn leaves. Here, cuisine is elevated to an art form.',
    descriptionBg: 'Мистичен архипелаг, където черешовите цветове цъфтят заедно с есенните листа. Тук кухнята е издигната до изкуство.',
    lore: 'The islands of Sakuraya exist in a perpetual dance between seasons. Chefs spend decades mastering the art of capturing perfection.',
    cuisine: 'Japanese & Korean',
    cuisineBg: 'Японска и Корейска',
    inspiration: 'Japan & Korea',
    colors: {
      primary: '#c084fc',
      accent: '#f472b6',
      glow: 'rgba(192, 132, 252, 0.15)',
      gradient: 'from-purple-900/20 via-pink-900/10 to-transparent',
    },
    character: {
      name: 'Yuki Hanamoto',
      title: 'Keeper of Silent Umami',
      titleBg: 'Пазителка на Тихия Умами',
      description: 'A renowned chef who trained in solitude for fifteen years, perfecting the art of fermentation.',
      philosophy: 'Silence between flavors is as important as the flavors themselves.',
      philosophyBg: 'Тишината между вкусовете е толкова важна, колкото самите вкусове.',
      signatureDish: 'Seven Seasons Omakase',
      visualDirection: 'Elegant female, early 30s, refined kimono-inspired attire, serene focused expression',
    },
    dishes: ['Ramen', 'Sushi', 'Tempura', 'Kimchi', 'Bibimbap', 'Miso Soup', 'Wagyu'],
    dishesBg: ['Рамен', 'Суши', 'Темпура', 'Кимчи', 'Бибимбап', 'Мисо Супа', 'Вагю'],
    tags: ['japanese', 'korean', 'sushi', 'ramen', 'fermented', 'rice', 'seafood'],
    ambiance: 'atmosphere-sakuraya',
  },
  
  'mondberg': {
    id: 'mondberg',
    name: 'Mondberg',
    nameBg: 'Мондберг',
    flag: '🇩🇪',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&h=200&fit=crop',
    subtitle: 'Valley of Windswept Hearths',
    subtitleBg: 'Долината на Ветровитите Огнища',
    description: 'A pastoral region of rolling vineyards and ancient stone kitchens. Food is the heart of community here.',
    descriptionBg: 'Пасторален регион с хълмисти лозя и древни каменни кухни. Храната е сърцето на общността тук.',
    lore: 'Mondberg\'s culinary heritage was forged in the great hearths of its mountain taverns.',
    cuisine: 'European Continental',
    cuisineBg: 'Европейска Континентална',
    inspiration: 'Germany, Austria, Central Europe',
    colors: {
      primary: '#6a8dff',
      accent: '#34d399',
      glow: 'rgba(106, 141, 255, 0.15)',
      gradient: 'from-blue-900/20 via-emerald-900/10 to-transparent',
    },
    character: {
      name: 'Viktor Aldric',
      title: 'Master of the Stone Hearth',
      titleBg: 'Майстор на Каменното Огнище',
      description: 'A disciplined chef who believes that the best meals bring people together.',
      philosophy: 'Food shared is joy multiplied. Every meal is an invitation to belong.',
      philosophyBg: 'Споделената храна умножава радостта. Всяко ястие е покана да принадлежиш.',
      signatureDish: 'Heritage Schnitzel with Alpine Herbs',
      visualDirection: 'Robust male, mid 40s, rustic refined attire, warm welcoming expression',
    },
    dishes: ['Schnitzel', 'Bratwurst', 'Strudel', 'Goulash', 'Spätzle', 'Sauerbraten'],
    dishesBg: ['Шницел', 'Братвурст', 'Щрудел', 'Гулаш', 'Шпецле', 'Зауербратен'],
    tags: ['european', 'german', 'meat', 'bread', 'hearty', 'traditional'],
    ambiance: 'atmosphere-mondberg',
  },
  
  'fontalis': {
    id: 'fontalis',
    name: 'Fontalis',
    nameBg: 'Фонталис',
    flag: '🇫🇷',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop',
    subtitle: 'Courts of Refined Elegance',
    subtitleBg: 'Дворове на Изтънчена Елегантност',
    description: 'A sophisticated nation of grand palaces and culinary academies where gastronomy is high art.',
    descriptionBg: 'Изтънчена нация от величествени дворци и кулинарни академии, където гастрономията е висше изкуство.',
    lore: 'The academies of Fontalis have produced the world\'s most celebrated chefs.',
    cuisine: 'French & Mediterranean',
    cuisineBg: 'Френска и Средиземноморска',
    inspiration: 'France & Italy',
    colors: {
      primary: '#a855f7',
      accent: '#f59e0b',
      glow: 'rgba(168, 85, 247, 0.15)',
      gradient: 'from-violet-900/20 via-amber-900/10 to-transparent',
    },
    character: {
      name: 'Amélie Beaumont',
      title: 'Dean of the Grand Academy',
      titleBg: 'Декан на Великата Академия',
      description: 'The youngest chef to ever lead the Fontalis Culinary Academy.',
      philosophy: 'Tradition is our foundation, innovation our duty. Excellence admits no compromise.',
      philosophyBg: 'Традицията е нашата основа, иновацията е наш дълг. Съвършенството не допуска компромис.',
      signatureDish: 'Deconstructed Bouillabaisse Moderne',
      visualDirection: 'Elegant female, late 20s, pristine chef attire, confident poised expression',
    },
    dishes: ['Croissant', 'Coq au Vin', 'Bouillabaisse', 'Risotto', 'Ratatouille', 'Crème Brûlée'],
    dishesBg: ['Кроасан', 'Кок о Вен', 'Буйабес', 'Ризото', 'Рататуй', 'Крем Брюле'],
    tags: ['french', 'italian', 'mediterranean', 'pastry', 'wine', 'refined'],
    ambiance: 'atmosphere-fontalis',
  },
  
  'sumera': {
    id: 'sumera',
    name: 'Sumera',
    nameBg: 'Сумера',
    flag: '🇮🇳',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop',
    subtitle: 'Gardens of Ancient Wisdom',
    subtitleBg: 'Градини на Древната Мъдрост',
    description: 'A land where culinary knowledge is preserved in vast libraries. Spices are studied with scholarly precision.',
    descriptionBg: 'Земя, където кулинарното знание се съхранява в огромни библиотеки. Подправките се изучават с научна прецизност.',
    lore: 'The scholars of Sumera believe that cuisine is humanity\'s oldest form of knowledge.',
    cuisine: 'Middle Eastern & South Asian',
    cuisineBg: 'Близкоизточна и Южноазиатска',
    inspiration: 'Middle East, India, Persia',
    colors: {
      primary: '#34d399',
      accent: '#fbbf24',
      glow: 'rgba(52, 211, 153, 0.15)',
      gradient: 'from-emerald-900/20 via-amber-900/10 to-transparent',
    },
    character: {
      name: 'Navid Rashid',
      title: 'Keeper of the Spice Archives',
      titleBg: 'Пазител на Архива на Подправките',
      description: 'A scholar-chef who has dedicated his life to preserving ancient recipes.',
      philosophy: 'Every spice tells a story. To cook is to preserve history.',
      philosophyBg: 'Всяка подправка разказва история. Да готвиш означава да съхраняваш историята.',
      signatureDish: 'Saffron Lamb of the Ancients',
      visualDirection: 'Distinguished male, early 50s, scholarly robes, wise contemplative expression',
    },
    dishes: ['Biryani', 'Shawarma', 'Falafel', 'Kebab', 'Hummus', 'Baklava', 'Curry'],
    dishesBg: ['Бириани', 'Шаурма', 'Фалафел', 'Кебап', 'Хумус', 'Баклава', 'Къри'],
    tags: ['middle-eastern', 'indian', 'spices', 'lamb', 'rice', 'aromatic'],
    ambiance: 'atmosphere-sumera',
  },
};

export const ALL_REGIONS = Object.values(REGIONS);

export const getRegionById = (id: RegionId): Region | undefined => REGIONS[id];

// Recipe mastery levels (professional naming, no game-like ranks)
export type RecipeRank = 'Apprentice' | 'Journeyman' | 'Artisan' | 'Master' | 'Grandmaster' | 'Legendary';

export const RECIPE_RANKS: Record<RecipeRank, { 
  label: string; 
  tier: number;
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  'Apprentice': { 
    label: 'Apprentice', 
    tier: 1,
    color: 'text-dark-400', 
    bgColor: 'bg-dark-700/50',
    borderColor: 'border-dark-600',
  },
  'Journeyman': { 
    label: 'Journeyman', 
    tier: 2,
    color: 'text-emerald', 
    bgColor: 'bg-emerald/10',
    borderColor: 'border-emerald/30',
  },
  'Artisan': { 
    label: 'Artisan', 
    tier: 3,
    color: 'text-accent-400', 
    bgColor: 'bg-accent-500/10',
    borderColor: 'border-accent-500/30',
  },
  'Master': { 
    label: 'Master', 
    tier: 4,
    color: 'text-mystic-400', 
    bgColor: 'bg-mystic-500/10',
    borderColor: 'border-mystic-500/30',
  },
  'Grandmaster': { 
    label: 'Grandmaster', 
    tier: 5,
    color: 'text-amber', 
    bgColor: 'bg-amber/10',
    borderColor: 'border-amber/30',
  },
  'Legendary': { 
    label: 'Legendary', 
    tier: 6,
    color: 'text-primary-400', 
    bgColor: 'bg-primary-500/15',
    borderColor: 'border-primary-500/40',
  },
};

export const getRankFromComplexity = (prepTime: number, cookTime: number, ingredientCount: number): RecipeRank => {
  const totalTime = prepTime + cookTime;
  const score = totalTime * 0.5 + ingredientCount * 8;
  
  if (score >= 140) return 'Legendary';
  if (score >= 110) return 'Grandmaster';
  if (score >= 80) return 'Master';
  if (score >= 55) return 'Artisan';
  if (score >= 30) return 'Journeyman';
  return 'Apprentice';
};
