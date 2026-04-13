/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Wooden Theme Colors (Dark mode)
        wood: {
          50: '#faf6f1',
          100: '#f0e6d8',
          200: '#e0ccb0',
          300: '#c9a87a',
          400: '#b8864f',
          500: '#a06b35',
          600: '#8b5a2b',
          700: '#6b4423',
          800: '#4a2f1a',
          900: '#2d1b0f',
        },
        // Forest Green accent (Dark mode)
        forest: {
          50: '#f0f7f0',
          100: '#dcebdc',
          200: '#b8d6b8',
          300: '#8cb88c',
          400: '#6b9b6b',
          500: '#4a7c4a',
          600: '#3d663d',
          700: '#2f4f2f',
          800: '#1e3a1e',
          900: '#0f1f0f',
        },
        // Warm cream for backgrounds
        cream: {
          50: '#fffef9',
          100: '#fefcf3',
          200: '#fdf8e7',
          300: '#faf0d0',
          400: '#f5e4b0',
          500: '#e8d090',
        },
        // Orange colors (Light mode primary)
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Amber colors (Light mode secondary)
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      backgroundImage: {
        'wood-pattern': "url('/wood-texture.jpg')",
        'wood-dark': "url('/wood-dark.jpg')",
        'hero-gradient': 'linear-gradient(135deg, #6b4423 0%, #4a7c4a 50%, #3d663d 100%)',
        'hero-gradient-light': 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #fbbf24 100%)',
      },
      boxShadow: {
        'wood': '0 4px 20px rgba(107, 68, 35, 0.2)',
        'wood-lg': '0 10px 40px rgba(107, 68, 35, 0.3)',
        'inner-wood': 'inset 0 2px 10px rgba(0, 0, 0, 0.2)',
        'orange': '0 4px 20px rgba(249, 115, 22, 0.3)',
      },
    },
  },
  plugins: [],
};
