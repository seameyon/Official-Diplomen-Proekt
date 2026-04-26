import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';

const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// In-memory cache for MealDB responses
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const getCached = (key: string): any | null => {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key];
    return null;
  }
  return entry.data;
};

const setCache = (key: string, data: any): void => {
  cache[key] = { data, timestamp: Date.now() };
};

// Fetch with retry logic
const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.log(`[MealDB] Attempt ${i + 1} failed for ${url}:`, error.message);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
};


export const searchByName = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  const query = String(q || '');
  const cacheKey = `search:${query}`;
  
 
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[MealDB] Cache hit for search: ${query}`);
    res.json(cached);
    return;
  }
  
  try {
    const data = await fetchWithRetry(`${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('[MealDB] Search error:', error);
    res.json({ meals: null });
  }
});


export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `lookup:${id}`;
  
 
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[MealDB] Cache hit for ID: ${id}`);
    res.json(cached);
    return;
  }
  
  console.log(`[MealDB] Fetching recipe ID: ${id}`);
  
  try {
    const data = await fetchWithRetry(`${MEALDB_BASE_URL}/lookup.php?i=${id}`);
    
    if (data.meals && data.meals[0]) {
      setCache(cacheKey, data);
      console.log(`[MealDB] Found and cached: ${id}`);
    } else {
      console.log(`[MealDB] Not found: ${id}`);
    }
    
    res.json(data);
  } catch (error) {
    console.error('[MealDB] Lookup error:', error);
    res.json({ meals: null });
  }
});


export const getRandom = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = await fetchWithRetry(`${MEALDB_BASE_URL}/random.php`);
    
    
    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];
      setCache(`lookup:${meal.idMeal}`, data);
    }
    
    res.json(data);
  } catch (error) {
    console.error('[MealDB] Random error:', error);
    res.json({ meals: null });
  }
});


export const filterByArea = asyncHandler(async (req: Request, res: Response) => {
  const { area } = req.params;
  const cacheKey = `area:${area}`;
  
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[MealDB] Cache hit for area: ${area}`);
    res.json(cached);
    return;
  }
  
  try {
    const data = await fetchWithRetry(`${MEALDB_BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('[MealDB] Filter by area error:', error);
    res.json({ meals: null });
  }
});


export const filterByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;
  const cacheKey = `category:${category}`;
  
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[MealDB] Cache hit for category: ${category}`);
    res.json(cached);
    return;
  }
  
  try {
    const data = await fetchWithRetry(`${MEALDB_BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('[MealDB] Filter by category error:', error);
    res.json({ meals: null });
  }
});


export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'categories';
  
  const cached = getCached(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }
  
  try {
    const data = await fetchWithRetry(`${MEALDB_BASE_URL}/categories.php`);
    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('[MealDB] Categories error:', error);
    res.json({ categories: null });
  }
});


export const getAreas = asyncHandler(async (_req: Request, res: Response) => {
  const cacheKey = 'areas';
  
  const cached = getCached(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }
  
  try {
    const data = await fetchWithRetry(`${MEALDB_BASE_URL}/list.php?a=list`);
    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('[MealDB] Areas error:', error);
    res.json({ meals: null });
  }
});

export default {
  searchByName,
  getById,
  getRandom,
  filterByArea,
  filterByCategory,
  getCategories,
  getAreas,
};
