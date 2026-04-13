/**
 * Unit Tests for Frontend Utilities
 * 
 * Тези тестове проверяват правилната работа на помощните функции
 * във frontend приложението.
 */

import { describe, test, expect } from 'vitest';
import {
  formatTime,
  formatCalories,
  truncateText,
  getInitials,
  isValidEmail,
  calculateBMI,
  getBMICategory,
  getTagColor,
} from '../utils';

// ==================== Format Time Tests ====================
describe('formatTime', () => {
  test('трябва да форматира минути под 60 правилно (EN)', () => {
    expect(formatTime(30, 'en')).toBe('30 min');
    expect(formatTime(45, 'en')).toBe('45 min');
    expect(formatTime(1, 'en')).toBe('1 min');
  });

  test('трябва да форматира минути под 60 правилно (BG)', () => {
    expect(formatTime(30, 'bg')).toBe('30 мин');
    expect(formatTime(45, 'bg')).toBe('45 мин');
  });

  test('трябва да форматира часове правилно (EN)', () => {
    expect(formatTime(60, 'en')).toBe('1h');
    expect(formatTime(90, 'en')).toBe('1h 30m');
    expect(formatTime(120, 'en')).toBe('2h');
    expect(formatTime(150, 'en')).toBe('2h 30m');
  });

  test('трябва да форматира часове правилно (BG)', () => {
    expect(formatTime(60, 'bg')).toBe('1 ч');
    expect(formatTime(90, 'bg')).toBe('1 ч 30 мин');
    expect(formatTime(120, 'bg')).toBe('2 ч');
  });
});

// ==================== Format Calories Tests ====================
describe('formatCalories', () => {
  test('трябва да форматира калории правилно', () => {
    expect(formatCalories(250)).toBe('250 kcal');
    expect(formatCalories(1500)).toBe('1500 kcal');
  });

  test('трябва да закръгля калории', () => {
    expect(formatCalories(250.7)).toBe('251 kcal');
    expect(formatCalories(250.2)).toBe('250 kcal');
  });
});

// ==================== Truncate Text Tests ====================
describe('truncateText', () => {
  test('трябва да съкрати дълъг текст', () => {
    const longText = 'This is a very long text that needs to be truncated';
    expect(truncateText(longText, 20)).toBe('This is a very long...');
  });

  test('не трябва да съкращава кратък текст', () => {
    const shortText = 'Short';
    expect(truncateText(shortText, 20)).toBe('Short');
  });

  test('трябва да обработи текст с точна дължина', () => {
    const exactText = 'Exact length';
    expect(truncateText(exactText, 12)).toBe('Exact length');
  });
});

// ==================== Get Initials Tests ====================
describe('getInitials', () => {
  test('трябва да извлече инициали от пълно име', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Иван Петров')).toBe('ИП');
  });

  test('трябва да извлече инициал от едно име', () => {
    expect(getInitials('John')).toBe('J');
    expect(getInitials('Иван')).toBe('И');
  });

  test('трябва да върне максимум 2 инициала', () => {
    expect(getInitials('John William Doe')).toBe('JW');
  });

  test('трябва да върне главни букви', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

// ==================== Email Validation Tests ====================
describe('isValidEmail', () => {
  test('трябва да приеме валидни имейли', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.bg')).toBe(true);
    expect(isValidEmail('user+tag@gmail.com')).toBe(true);
  });

  test('трябва да отхвърли невалидни имейли', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('no@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });
});

// ==================== BMI Calculation Tests ====================
describe('calculateBMI', () => {
  test('трябва да изчисли BMI правилно', () => {
    // 70kg, 175cm -> BMI = 70 / 1.75^2 = 22.86
    expect(calculateBMI(70, 175)).toBeCloseTo(22.9, 1);
    
    // 80kg, 180cm -> BMI = 80 / 1.80^2 = 24.69
    expect(calculateBMI(80, 180)).toBeCloseTo(24.7, 1);
  });

  test('трябва да закръгли до 1 десетичен знак', () => {
    const bmi = calculateBMI(70, 175);
    const decimalPlaces = (bmi.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});

// ==================== BMI Category Tests ====================
describe('getBMICategory', () => {
  test('трябва да върне правилна категория на английски', () => {
    expect(getBMICategory(17, 'en')).toBe('Underweight');
    expect(getBMICategory(22, 'en')).toBe('Normal weight');
    expect(getBMICategory(27, 'en')).toBe('Overweight');
    expect(getBMICategory(32, 'en')).toBe('Obese');
  });

  test('трябва да върне правилна категория на български', () => {
    expect(getBMICategory(17, 'bg')).toBe('Поднормено тегло');
    expect(getBMICategory(22, 'bg')).toBe('Нормално тегло');
    expect(getBMICategory(27, 'bg')).toBe('Наднормено тегло');
    expect(getBMICategory(32, 'bg')).toBe('Затлъстяване');
  });

  test('трябва да определи границите правилно', () => {
    // Точно на границата 18.5
    expect(getBMICategory(18.5, 'en')).toBe('Normal weight');
    // Точно на границата 25
    expect(getBMICategory(25, 'en')).toBe('Overweight');
    // Точно на границата 30
    expect(getBMICategory(30, 'en')).toBe('Obese');
  });
});

// ==================== Tag Color Tests ====================
describe('getTagColor', () => {
  test('трябва да върне правилен цвят за познати тагове', () => {
    expect(getTagColor('vegan')).toContain('green');
    expect(getTagColor('vegetarian')).toContain('emerald');
    expect(getTagColor('breakfast')).toContain('yellow');
    expect(getTagColor('dessert')).toContain('fuchsia');
  });

  test('трябва да върне цвят по подразбиране за непознати тагове', () => {
    expect(getTagColor('unknown-tag')).toContain('gray');
    expect(getTagColor('random')).toContain('gray');
  });
});
