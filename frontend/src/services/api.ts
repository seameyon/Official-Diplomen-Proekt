import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils';
import type {
  ApiResponse,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Recipe,
  RecipeInput,
  RecipeFilters,
  MealPlan,
  HealthProfile,
  HealthMetrics,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read from zustand persisted storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth storage');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    // Don't logout on rate limit errors (429)
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded, please wait...');
      return Promise.reject(error);
    }
    
    // Only handle 401 errors for actual auth failures
    if (error.response?.status === 401) {
      // Only redirect if not already on auth pages
      const isAuthPage = window.location.pathname.startsWith('/login') || 
                         window.location.pathname.startsWith('/register') ||
                         window.location.pathname.startsWith('/forgot-password') ||
                         window.location.pathname.startsWith('/welcome');
      
      // Check if it's an actual auth failure vs other 401
      const message = error.response?.data?.message || '';
      const isTokenError = message.includes('token') || message.includes('authorized');
      
      if (!isAuthPage && isTokenError) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Auth API ====================

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    return data.data!;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return data.data!;
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  resendVerification: async (email: string): Promise<void> => {
    await api.post('/auth/resend-verification', { email });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post(`/auth/reset-password/${token}`, { password });
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data.data!;
  },
};

// ==================== User API ====================

export const userApi = {
  updateHealthProfile: async (
    profile: HealthProfile
  ): Promise<{ healthProfile: HealthProfile; metrics: HealthMetrics }> => {
    const { data } = await api.put<
      ApiResponse<{ healthProfile: HealthProfile; metrics: HealthMetrics }>
    >('/users/health-profile', profile);
    return data.data!;
  },

  getHealthProfile: async (): Promise<{
    healthProfile: HealthProfile | null;
    metrics?: HealthMetrics;
  }> => {
    const { data } = await api.get<
      ApiResponse<{ healthProfile: HealthProfile | null; metrics?: HealthMetrics }>
    >('/users/health-profile');
    return data.data!;
  },

  updateSettings: async (settings: {
    username?: string;
    bio?: string;
    theme?: 'light' | 'dark';
    language?: 'en' | 'bg';
  }): Promise<void> => {
    await api.put('/users/settings', settings);
  },

  updateAvatar: async (avatar: string): Promise<void> => {
    await api.put('/users/avatar', { avatar });
  },

  getPublicProfile: async (username: string): Promise<{ user: User }> => {
    const { data } = await api.get<ApiResponse<{ user: User }>>(`/users/profile/${username}`);
    return data.data!;
  },

  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/users/account', { data: { password } });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/users/change-password', { currentPassword, newPassword });
  },
};

// ==================== Recipe API ====================

export const recipeApi = {
  getAll: async (
    filters: RecipeFilters = {}
  ): Promise<{
    recipes: Recipe[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.tags?.length) filters.tags.forEach((t) => params.append('tags', t));
    if (filters.region) params.append('region', filters.region);
    if (filters.maxCalories) params.append('maxCalories', filters.maxCalories.toString());
    if (filters.minCalories) params.append('minCalories', filters.minCalories.toString());
    if (filters.maxTime) params.append('maxTime', filters.maxTime.toString());
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const { data } = await api.get<ApiResponse<{
      recipes: Recipe[];
      total: number;
      page: number;
      totalPages: number;
    }>>(`/recipes?${params.toString()}`);
    return data.data!;
  },

  getRecipes: async (
    filters: RecipeFilters = {}
  ): Promise<{
    recipes: Recipe[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    return recipeApi.getAll(filters);
  },

  getRecipeById: async (id: string): Promise<{ recipe: Recipe }> => {
    const { data } = await api.get<ApiResponse<{ recipe: Recipe }>>(`/recipes/${id}`);
    return data.data!;
  },

  createRecipe: async (recipe: RecipeInput): Promise<{ recipe: Recipe }> => {
    const { data } = await api.post<ApiResponse<{ recipe: Recipe }>>('/recipes', recipe);
    return data.data!;
  },

  updateRecipe: async (id: string, recipe: Partial<RecipeInput>): Promise<{ recipe: Recipe }> => {
    const { data } = await api.put<ApiResponse<{ recipe: Recipe }>>(`/recipes/${id}`, recipe);
    return data.data!;
  },

  deleteRecipe: async (id: string): Promise<void> => {
    await api.delete(`/recipes/${id}`);
  },

  getMyRecipes: async (
    page = 1,
    limit = 12
  ): Promise<{
    recipes: Recipe[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const { data } = await api.get<ApiResponse<{
      recipes: Recipe[];
      total: number;
      page: number;
      totalPages: number;
    }>>(`/recipes/my-recipes?page=${page}&limit=${limit}`);
    return data.data!;
  },

  getCookingTips: async (recipeId: string): Promise<{ tips: string[] }> => {
    const { data } = await api.post<ApiResponse<{ tips: string[] }>>(`/recipes/${recipeId}/tips`);
    return data.data!;
  },

  suggestRecipes: async (
    ingredients: string[],
    preferences?: { dietary?: string; maxTime?: number; cuisine?: string }
  ): Promise<{ suggestions: Array<{
    title: string;
    description: string;
    ingredients: string[];
    difficulty: string;
    estimatedTime: number;
  }> }> => {
    const { data } = await api.post<ApiResponse<{ suggestions: Array<{
      title: string;
      description: string;
      ingredients: string[];
      difficulty: string;
      estimatedTime: number;
    }> }>>('/recipes/suggest', { ingredients, ...preferences });
    return data.data!;
  },

  translateRecipe: async (
    title: string,
    steps: string[],
    ingredients: string[]
  ): Promise<{
    title: string;
    steps: string[];
    ingredients: string[];
  }> => {
    const { data } = await api.post<ApiResponse<{
      title: string;
      steps: string[];
      ingredients: string[];
    }>>('/recipes/translate', { title, steps, ingredients });
    return data.data!;
  },
};

// ==================== Favorites API ====================

export const favoriteApi = {
  getFavorites: async (
    page = 1,
    limit = 12
  ): Promise<{
    recipes: Recipe[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const { data } = await api.get<ApiResponse<{
      recipes: Recipe[];
      total: number;
      page: number;
      totalPages: number;
    }>>(`/favorites?page=${page}&limit=${limit}`);
    return data.data!;
  },

  toggleFavorite: async (recipeId: string): Promise<{ isFavorited: boolean }> => {
    const { data } = await api.post<ApiResponse<{ isFavorited: boolean }>>(
      `/favorites/toggle/${recipeId}`
    );
    return data.data!;
  },

  checkFavorite: async (recipeId: string): Promise<{ isFavorited: boolean }> => {
    const { data } = await api.get<ApiResponse<{ isFavorited: boolean }>>(
      `/favorites/check/${recipeId}`
    );
    return data.data!;
  },
};

// ==================== Meal Plan API ====================

export const mealPlanApi = {
  generateMealPlan: async (forceRegenerate = false): Promise<{ mealPlan: MealPlan }> => {
    const { data } = await api.post<ApiResponse<{ mealPlan: MealPlan }>>('/meal-plans/generate', {
      forceRegenerate,
    });
    return data.data!;
  },

  getCurrentMealPlan: async (): Promise<{ mealPlan: MealPlan | null }> => {
    const { data } = await api.get<ApiResponse<{ mealPlan: MealPlan | null }>>(
      '/meal-plans/current'
    );
    return data.data || { mealPlan: null };
  },

  getMealPlanHistory: async (
    page = 1,
    limit = 10
  ): Promise<{
    plans: MealPlan[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const { data } = await api.get<ApiResponse<{
      plans: MealPlan[];
      total: number;
      page: number;
      totalPages: number;
    }>>(`/meal-plans/history?page=${page}&limit=${limit}`);
    return data.data!;
  },

  replaceMeal: async (
    day: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    newRecipeId?: string
  ): Promise<{ mealPlan: MealPlan }> => {
    const { data } = await api.put<ApiResponse<{ mealPlan: MealPlan }>>('/meal-plans/replace-meal', {
      day,
      mealType,
      newRecipeId,
    });
    return data.data!;
  },

  getShoppingList: async (): Promise<{ weekKey: string; message: string }> => {
    const { data } = await api.get<ApiResponse<{ weekKey: string; message: string }>>(
      '/meal-plans/shopping-list'
    );
    return data.data!;
  },
};

// ==================== Upload API ====================

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const { data } = await api.post<ApiResponse<{ 
      url: string; 
      filename: string;
      size: number;
      mimetype: string;
    }>>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data!;
  },

  deleteImage: async (filename: string): Promise<void> => {
    await api.delete(`/upload/image/${filename}`);
  },
};

export default api;
