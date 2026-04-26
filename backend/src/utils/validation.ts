
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
};


export const isValidPassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 8;
};


export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 30) return false;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};


export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return 0;
  }
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10; // Round to 1 decimal
};


export const getBMICategory = (bmi: number): string => {
  if (bmi <= 0) return 'unknown';
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
};

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 * For men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
 * For women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
 */
export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: 'male' | 'female'
): number => {
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
    return 0;
  }
  
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const adjustment = sex === 'male' ? 5 : -161;
  
  return Math.round(base + adjustment);
};


export const calculateDailyCalories = (
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  if (bmr <= 0) return 0;
  
  const multipliers: Record<string, number> = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    very_active: 1.9,    // Very hard exercise, physical job
  };
  
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};


export const isValidRecipeTitle = (title: string): boolean => {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  return trimmed.length >= 3 && trimmed.length <= 100;
};


export const isValidRecipeDescription = (description: string): boolean => {
  if (!description || typeof description !== 'string') return false;
  const trimmed = description.trim();
  return trimmed.length >= 10 && trimmed.length <= 2000;
};


export const isValidCookingTime = (minutes: number): boolean => {
  if (typeof minutes !== 'number' || isNaN(minutes)) return false;
  return minutes > 0 && minutes <= 1440; // Max 24 hours
};


export const isValidServings = (servings: number): boolean => {
  if (typeof servings !== 'number' || isNaN(servings)) return false;
  return servings >= 1 && servings <= 100 && Number.isInteger(servings);
};


export const isValidIngredient = (ingredient: {
  name?: string;
  amount?: number;
  unit?: string;
}): boolean => {
  if (!ingredient || typeof ingredient !== 'object') return false;
  
  const { name, amount, unit } = ingredient;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) return false;
  if (typeof amount !== 'number' || amount <= 0) return false;
  if (!unit || typeof unit !== 'string') return false;
  
  return true;
};


export const slugify = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove non-word chars
    .replace(/[\s_-]+/g, '-')   // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};


export const titleCase = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


export const formatDateBG = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('bg-BG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


export const calculateAge = (birthYear: number): number => {
  if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) {
    return 0;
  }
  return new Date().getFullYear() - birthYear;
};

export default {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateDailyCalories,
  isValidRecipeTitle,
  isValidRecipeDescription,
  isValidCookingTime,
  isValidServings,
  isValidIngredient,
  slugify,
  truncateText,
  titleCase,
  formatDateBG,
  calculateAge,
};
