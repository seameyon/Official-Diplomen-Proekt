import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format relative time
export function formatRelativeTime(date: string | Date, locale: string = 'en'): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale === 'bg' ? 'bg' : 'en', { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

// Format number with locale
export function formatNumber(num: number, locale: string = 'en'): string {
  return num.toLocaleString(locale === 'bg' ? 'bg-BG' : 'en-US');
}

// Format time (minutes to human readable)
export function formatTime(minutes: number, locale: string = 'en'): string {
  if (minutes < 60) {
    return locale === 'bg' ? `${minutes} мин` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (locale === 'bg') {
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Format calories
export function formatCalories(calories: number): string {
  return `${Math.round(calories)} kcal`;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Generate avatar initials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Failed to save to localStorage');
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error('Failed to remove from localStorage');
    }
  },
};

// Validate email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Calculate BMI
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

// Get BMI category
export function getBMICategory(bmi: number, locale: string = 'en'): string {
  const categories = {
    en: {
      underweight: 'Underweight',
      normal: 'Normal weight',
      overweight: 'Overweight',
      obese: 'Obese',
    },
    bg: {
      underweight: 'Поднормено тегло',
      normal: 'Нормално тегло',
      overweight: 'Наднормено тегло',
      obese: 'Затлъстяване',
    },
  };

  const cat = locale === 'bg' ? categories.bg : categories.en;

  if (bmi < 18.5) return cat.underweight;
  if (bmi < 25) return cat.normal;
  if (bmi < 30) return cat.overweight;
  return cat.obese;
}

// Get week key (YYYY-WW format)
export function getCurrentWeekKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-${weekNumber.toString().padStart(2, '0')}`;
}

// Generate placeholder image URL
export function getPlaceholderImage(seed: string, width = 400, height = 300): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// Get recipe tag color
export function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    vegan: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    vegetarian: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'gluten-free': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'dairy-free': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'nut-free': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'high-protein': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'low-carb': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'low-fat': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
    keto: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    paleo: 'bg-stone-100 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300',
    quick: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    'meal-prep': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    'budget-friendly': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300',
    breakfast: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    lunch: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    dinner: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    snack: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    dessert: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  };
  return colors[tag] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}
