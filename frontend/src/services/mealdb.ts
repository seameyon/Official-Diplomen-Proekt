
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PROXY_URL = `${API_BASE}/mealdb`;

export interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
}


const AREA_TO_REGION: Record<string, string> = {
  'Chinese': 'liyun',
  'Japanese': 'sakuraya',
  'Thai': 'sakuraya',  // Thai is closer to Japanese/Korean cuisine style
  'Vietnamese': 'liyun',
  'Malaysian': 'liyun',
  'Filipino': 'liyun',
  'Indian': 'sumera',
  'Turkish': 'sumera',
  'Moroccan': 'sumera',
  'Egyptian': 'sumera',
  'Tunisian': 'sumera',
  'Jamaican': 'sumera',
  'Kenyan': 'sumera',
  'Mexican': 'sumera',
  'French': 'fontalis',
  'Italian': 'fontalis',
  'Spanish': 'fontalis',
  'Greek': 'fontalis',
  'Portuguese': 'fontalis',
  'British': 'mondberg',
  'Irish': 'mondberg',
  'American': 'mondberg',
  'Canadian': 'mondberg',
  'Russian': 'mondberg',
  'Polish': 'mondberg',
  'Croatian': 'mondberg',
  'Ukrainian': 'mondberg',
  'Dutch': 'mondberg',
};


const TRANSLATIONS: Record<string, string> = {
  'Chicken': 'Пиле',
  'Beef': 'Телешко',
  'Pork': 'Свинско',
  'Lamb': 'Агнешко',
  'Seafood': 'Морски дарове',
  'Vegetarian': 'Вегетарианско',
  'Pasta': 'Паста',
  'Dessert': 'Десерт',
  'Breakfast': 'Закуска',
  'Side': 'Гарнитура',
  'Starter': 'Предястие',
  'Vegan': 'Веганско',
  'Miscellaneous': 'Други',
  'Goat': 'Козе месо',
};


const parseMeasure = (measure: string | undefined): { amount: number; unit: string } => {
  if (!measure || !measure.trim()) {
    return { amount: 1, unit: '' };
  }
  
  const m = measure.trim();
  
  // Handle fractions like "1/2", "1/4", "3/4", "4/5 cup"
  const fractionMatch = m.match(/^(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1]);
    const denom = parseInt(fractionMatch[2]);
    // Clean the unit - remove leading spaces and slashes
    const unit = (fractionMatch[3] || '').replace(/^[\s\/]+/, '').trim();
    return { amount: num / denom, unit };
  }
  
  // Handle mixed numbers like "1 1/2 cup"
  const mixedMatch = m.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const num = parseInt(mixedMatch[2]);
    const denom = parseInt(mixedMatch[3]);
   
    const unit = (mixedMatch[4] || '').replace(/^[\s\/]+/, '').trim();
    return { amount: whole + (num / denom), unit };
  }
  
  // Handle decimal/integer with unit like "200g", "1.5 cups", "2 large"
  const numberMatch = m.match(/^([\d.]+)\s*(.*)$/);
  if (numberMatch) {
    const amount = parseFloat(numberMatch[1]) || 1;
    const unit = (numberMatch[2] || '').trim();
    return { amount, unit };
  }
  
  return { amount: 1, unit: m.replace(/^[\s\/]+/, '').trim() };
};


export const convertMealDBToRecipe = (meal: MealDBRecipe) => {
  
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDBRecipe] as string;
    const measure = meal[`strMeasure${i}` as keyof MealDBRecipe] as string;
    if (ingredient && ingredient.trim()) {
      const { amount, unit } = parseMeasure(measure);
      ingredients.push({
        name: ingredient.trim(),
        amount,
        unit,
      });
    }
  }


  const steps = meal.strInstructions
    .split(/\r\n|\r|\n/)
    .filter(s => s.trim())
    .map(s => s.trim());

 
  const tags: string[] = [];
  if (meal.strTags) {
    tags.push(...meal.strTags.split(',').map(t => t.trim().toLowerCase()));
  }
  if (meal.strCategory) {
    tags.push(meal.strCategory.toLowerCase());
  }
  if (meal.strArea) {
    tags.push(meal.strArea.toLowerCase());
  }

  const nutrition = {
    calories: Math.round(200 + Math.random() * 300),
    protein: Math.round(10 + Math.random() * 30),
    carbs: Math.round(20 + Math.random() * 50),
    fat: Math.round(5 + Math.random() * 25),
  };

  return {
    _id: `mealdb_${meal.idMeal}`,
    title: meal.strMeal,
    description: '', // Don't include mixed language description
    mainImage: meal.strMealThumb,
    prepTime: 15,
    cookTime: 30 + Math.floor(Math.random() * 30),
    servings: 1, // Base = 1 portion, ingredients are for 1 serving
    difficulty: 'medium',
    region: AREA_TO_REGION[meal.strArea] || 'fontalis',
    ingredients,
    steps,
    tags: [...new Set(tags)],
    nutrition,
    author: {
      _id: 'themealdb',
      username: 'TheMealDB',
      avatar: null,
    },
    isFromAPI: true,
    createdAt: new Date().toISOString(),
  };
};


export const mealdbApi = {
  
  searchByName: async (query: string) => {
    try {
      const res = await fetch(`${PROXY_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      return (data.meals || []).map(convertMealDBToRecipe);
    } catch (error) {
      console.error('MealDB search error:', error);
      return [];
    }
  },

  
  getRandom: async (count: number = 8) => {
    try {
      const recipes: any[] = [];
      const batchSize = 3;
      
      for (let i = 0; i < count; i += batchSize) {
        const batchPromises = Array(Math.min(batchSize, count - i)).fill(null).map(() =>
          fetch(`${PROXY_URL}/random`).then(r => r.json()).catch(() => null)
        );
        const batchResults = await Promise.all(batchPromises);
        const batchRecipes = batchResults
          .filter(r => r && r.meals && r.meals[0])
          .map(r => convertMealDBToRecipe(r.meals[0]));
        recipes.push(...batchRecipes);
        
        
        if (i + batchSize < count) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      return recipes;
    } catch (error) {
      console.error('MealDB random error:', error);
      return [];
    }
  },

 
  getByArea: async (area: string) => {
    try {
      console.log(`Fetching recipes for area: ${area}`);
      
      const listRes = await fetch(`${PROXY_URL}/filter/area/${encodeURIComponent(area)}`);
      const listData = await listRes.json();
      
      console.log(`Found ${listData.meals?.length || 0} meals for ${area}`);
      
      if (!listData.meals || listData.meals.length === 0) {
        console.log(`No meals found for area: ${area}`);
        return [];
      }

      
      const meals = listData.meals.slice(0, 15);
      const detailPromises = meals.map((m: any) =>
        fetch(`${PROXY_URL}/lookup/${m.idMeal}`)
          .then(r => r.json())
          .catch((err) => {
            console.error(`Error fetching meal ${m.idMeal}:`, err);
            return null;
          })
      );
      
      const details = await Promise.all(detailPromises);
      const recipes = details
        .filter(d => d && d.meals && d.meals[0])
        .map(d => convertMealDBToRecipe(d.meals[0]));
      
      console.log(`Converted ${recipes.length} recipes for ${area}`);
      return recipes;
    } catch (error) {
      console.error('MealDB area error:', error);
      return [];
    }
  },


  getByCategory: async (category: string) => {
    try {
      const listRes = await fetch(`${PROXY_URL}/filter/category/${encodeURIComponent(category)}`);
      const listData = await listRes.json();
      
      if (!listData.meals) return [];

      const meals = listData.meals.slice(0, 12);
      const detailPromises = meals.map((m: any) =>
        fetch(`${PROXY_URL}/lookup/${m.idMeal}`)
          .then(r => r.json())
          .catch(() => null)
      );
      
      const details = await Promise.all(detailPromises);
      return details
        .filter(d => d && d.meals && d.meals[0])
        .map(d => convertMealDBToRecipe(d.meals[0]));
    } catch (error) {
      console.error('MealDB category error:', error);
      return [];
    }
  },

  
  getById: async (id: string) => {
    try {
      
      let mealId = id;
      if (mealId.startsWith('mealdb_')) {
        mealId = mealId.replace('mealdb_', '');
      }
      
      if (mealId.startsWith('fallback_') || !mealId.match(/^\d+$/)) {
        console.warn('Invalid MealDB ID:', id);
        return null;
      }
      
      console.log('Fetching recipe by ID:', mealId);
      
  
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(`${PROXY_URL}/lookup/${mealId}`);
          
          if (!res.ok) {
            console.error(`MealDB lookup attempt ${attempt} failed:`, res.status);
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 500 * attempt));
              continue;
            }
            return null;
          }
          
          const data = await res.json();
          if (data.meals && data.meals[0]) {
            console.log('Recipe found:', mealId);
            return convertMealDBToRecipe(data.meals[0]);
          }
          
          console.warn('No meal in response for ID:', mealId);
          return null;
        } catch (error) {
          console.error(`MealDB lookup attempt ${attempt} error:`, error);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('MealDB getById error:', error);
      return null;
    }
  },

  
  getAreas: async () => {
    try {
      const res = await fetch(`${PROXY_URL}/areas`);
      const data = await res.json();
      return data.meals?.map((m: any) => m.strArea) || [];
    } catch (error) {
      console.error('MealDB areas error:', error);
      return [];
    }
  },

  
  getAreasForRegion: (regionId: string): string[] => {
    const mapping: Record<string, string[]> = {
      'liyun': ['Chinese', 'Thai', 'Vietnamese', 'Malaysian', 'Filipino'],
      'sakuraya': ['Japanese', 'Thai', 'Vietnamese'],  // Added Thai & Vietnamese as fallback since TheMealDB has limited Japanese
      'mondberg': ['British', 'Irish', 'American', 'Canadian', 'Russian', 'Polish', 'Croatian', 'Ukrainian', 'Dutch'],
      'fontalis': ['French', 'Italian', 'Spanish', 'Greek', 'Portuguese'],
      'sumera': ['Indian', 'Turkish', 'Moroccan', 'Egyptian', 'Mexican', 'Tunisian', 'Jamaican', 'Kenyan'],
    };
    return mapping[regionId] || [];
  },

  
  searchByKeyword: async (keyword: string) => {
    try {
      const res = await fetch(`${PROXY_URL}/search?q=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      return (data.meals || []).map(convertMealDBToRecipe);
    } catch (error) {
      console.error('MealDB search error:', error);
      return [];
    }
  },
};

export default mealdbApi;
