/**
 * Unit Tests for Validation Utilities
 * 
 * Тези тестове проверяват правилната работа на всички валидационни
 * и помощни функции в приложението.
 */

import {
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
  calculateAge,
} from '../utils/validation.js';

// ==================== Email Validation Tests ====================
describe('isValidEmail', () => {
  test('трябва да приеме валиден имейл адрес', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.bg')).toBe(true);
    expect(isValidEmail('user+tag@gmail.com')).toBe(true);
  });

  test('трябва да отхвърли невалиден имейл адрес', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('no@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });

  test('трябва да отхвърли null и undefined', () => {
    expect(isValidEmail(null as any)).toBe(false);
    expect(isValidEmail(undefined as any)).toBe(false);
  });
});

// ==================== Password Validation Tests ====================
describe('isValidPassword', () => {
  test('трябва да приеме парола с 8+ символа', () => {
    expect(isValidPassword('12345678')).toBe(true);
    expect(isValidPassword('securepassword123')).toBe(true);
    expect(isValidPassword('MyP@ssw0rd!')).toBe(true);
  });

  test('трябва да отхвърли парола с по-малко от 8 символа', () => {
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('short')).toBe(false);
  });

  test('трябва да отхвърли невалидни типове', () => {
    expect(isValidPassword(null as any)).toBe(false);
    expect(isValidPassword(12345678 as any)).toBe(false);
  });
});

// ==================== Username Validation Tests ====================
describe('isValidUsername', () => {
  test('трябва да приеме валидно потребителско име', () => {
    expect(isValidUsername('user123')).toBe(true);
    expect(isValidUsername('John_Doe')).toBe(true);
    expect(isValidUsername('abc')).toBe(true);
  });

  test('трябва да отхвърли твърде кратко потребителско име', () => {
    expect(isValidUsername('')).toBe(false);
    expect(isValidUsername('ab')).toBe(false);
  });

  test('трябва да отхвърли твърде дълго потребителско име', () => {
    const longUsername = 'a'.repeat(31);
    expect(isValidUsername(longUsername)).toBe(false);
  });

  test('трябва да отхвърли специални символи (освен _)', () => {
    expect(isValidUsername('user@name')).toBe(false);
    expect(isValidUsername('user name')).toBe(false);
    expect(isValidUsername('user-name')).toBe(false);
  });
});

// ==================== BMI Calculation Tests ====================
describe('calculateBMI', () => {
  test('трябва да изчисли правилно BMI', () => {
    // 70kg, 175cm -> BMI = 70 / 1.75^2 = 22.86
    expect(calculateBMI(70, 175)).toBeCloseTo(22.9, 1);
    
    // 80kg, 180cm -> BMI = 80 / 1.80^2 = 24.69
    expect(calculateBMI(80, 180)).toBeCloseTo(24.7, 1);
    
    // 50kg, 160cm -> BMI = 50 / 1.60^2 = 19.53
    expect(calculateBMI(50, 160)).toBeCloseTo(19.5, 1);
  });

  test('трябва да върне 0 при невалидни стойности', () => {
    expect(calculateBMI(0, 175)).toBe(0);
    expect(calculateBMI(70, 0)).toBe(0);
    expect(calculateBMI(-70, 175)).toBe(0);
    expect(calculateBMI(70, -175)).toBe(0);
  });
});

// ==================== BMI Category Tests ====================
describe('getBMICategory', () => {
  test('трябва да определи категория "underweight" за BMI < 18.5', () => {
    expect(getBMICategory(17)).toBe('underweight');
    expect(getBMICategory(18.4)).toBe('underweight');
  });

  test('трябва да определи категория "normal" за BMI 18.5-24.9', () => {
    expect(getBMICategory(18.5)).toBe('normal');
    expect(getBMICategory(22)).toBe('normal');
    expect(getBMICategory(24.9)).toBe('normal');
  });

  test('трябва да определи категория "overweight" за BMI 25-29.9', () => {
    expect(getBMICategory(25)).toBe('overweight');
    expect(getBMICategory(27)).toBe('overweight');
    expect(getBMICategory(29.9)).toBe('overweight');
  });

  test('трябва да определи категория "obese" за BMI >= 30', () => {
    expect(getBMICategory(30)).toBe('obese');
    expect(getBMICategory(35)).toBe('obese');
    expect(getBMICategory(40)).toBe('obese');
  });

  test('трябва да върне "unknown" за невалидни стойности', () => {
    expect(getBMICategory(0)).toBe('unknown');
    expect(getBMICategory(-5)).toBe('unknown');
  });
});

// ==================== BMR Calculation Tests ====================
describe('calculateBMR', () => {
  test('трябва да изчисли BMR за мъж', () => {
    // Formula: 10 × 70 + 6.25 × 175 - 5 × 30 + 5 = 1648
    const bmr = calculateBMR(70, 175, 30, 'male');
    expect(bmr).toBe(1649); // Rounded
  });

  test('трябва да изчисли BMR за жена', () => {
    // Formula: 10 × 60 + 6.25 × 165 - 5 × 25 - 161 = 1345
    const bmr = calculateBMR(60, 165, 25, 'female');
    expect(bmr).toBe(1345); // Rounded
  });

  test('трябва да върне 0 при невалидни стойности', () => {
    expect(calculateBMR(0, 175, 30, 'male')).toBe(0);
    expect(calculateBMR(70, 0, 30, 'male')).toBe(0);
    expect(calculateBMR(70, 175, 0, 'male')).toBe(0);
  });
});

// ==================== Daily Calories Tests ====================
describe('calculateDailyCalories', () => {
  test('трябва да изчисли калории според нивото на активност', () => {
    const bmr = 1500;
    
    expect(calculateDailyCalories(bmr, 'sedentary')).toBe(1800);  // 1.2
    expect(calculateDailyCalories(bmr, 'light')).toBe(2063);      // 1.375
    expect(calculateDailyCalories(bmr, 'moderate')).toBe(2325);   // 1.55
    expect(calculateDailyCalories(bmr, 'active')).toBe(2588);     // 1.725
    expect(calculateDailyCalories(bmr, 'very_active')).toBe(2850);// 1.9
  });

  test('трябва да върне 0 при невалиден BMR', () => {
    expect(calculateDailyCalories(0, 'moderate')).toBe(0);
    expect(calculateDailyCalories(-100, 'moderate')).toBe(0);
  });
});

// ==================== Recipe Title Validation Tests ====================
describe('isValidRecipeTitle', () => {
  test('трябва да приеме валидно заглавие (3-100 символа)', () => {
    expect(isValidRecipeTitle('Пица')).toBe(true);
    expect(isValidRecipeTitle('Домашна мусака с патладжан')).toBe(true);
  });

  test('трябва да отхвърли твърде кратко заглавие', () => {
    expect(isValidRecipeTitle('')).toBe(false);
    expect(isValidRecipeTitle('ab')).toBe(false);
  });

  test('трябва да отхвърли твърде дълго заглавие', () => {
    const longTitle = 'a'.repeat(101);
    expect(isValidRecipeTitle(longTitle)).toBe(false);
  });
});

// ==================== Recipe Description Validation Tests ====================
describe('isValidRecipeDescription', () => {
  test('трябва да приеме валидно описание (10-2000 символа)', () => {
    expect(isValidRecipeDescription('Това е вкусна рецепта за цялото семейство.')).toBe(true);
  });

  test('трябва да отхвърли твърде кратко описание', () => {
    expect(isValidRecipeDescription('Кратко')).toBe(false);
  });

  test('трябва да отхвърли твърде дълго описание', () => {
    const longDesc = 'a'.repeat(2001);
    expect(isValidRecipeDescription(longDesc)).toBe(false);
  });
});

// ==================== Cooking Time Validation Tests ====================
describe('isValidCookingTime', () => {
  test('трябва да приеме валидно време за готвене', () => {
    expect(isValidCookingTime(30)).toBe(true);
    expect(isValidCookingTime(1)).toBe(true);
    expect(isValidCookingTime(1440)).toBe(true); // 24 hours
  });

  test('трябва да отхвърли невалидно време', () => {
    expect(isValidCookingTime(0)).toBe(false);
    expect(isValidCookingTime(-10)).toBe(false);
    expect(isValidCookingTime(1441)).toBe(false); // > 24 hours
  });
});

// ==================== Servings Validation Tests ====================
describe('isValidServings', () => {
  test('трябва да приеме валиден брой порции', () => {
    expect(isValidServings(1)).toBe(true);
    expect(isValidServings(4)).toBe(true);
    expect(isValidServings(100)).toBe(true);
  });

  test('трябва да отхвърли невалиден брой порции', () => {
    expect(isValidServings(0)).toBe(false);
    expect(isValidServings(-1)).toBe(false);
    expect(isValidServings(101)).toBe(false);
    expect(isValidServings(2.5)).toBe(false); // Not integer
  });
});

// ==================== Ingredient Validation Tests ====================
describe('isValidIngredient', () => {
  test('трябва да приеме валидна съставка', () => {
    expect(isValidIngredient({ name: 'Брашно', amount: 500, unit: 'г' })).toBe(true);
    expect(isValidIngredient({ name: 'Яйца', amount: 3, unit: 'бр' })).toBe(true);
  });

  test('трябва да отхвърли съставка без име', () => {
    expect(isValidIngredient({ name: '', amount: 100, unit: 'г' })).toBe(false);
  });

  test('трябва да отхвърли съставка с невалидно количество', () => {
    expect(isValidIngredient({ name: 'Захар', amount: 0, unit: 'г' })).toBe(false);
    expect(isValidIngredient({ name: 'Захар', amount: -100, unit: 'г' })).toBe(false);
  });
});

// ==================== Slugify Tests ====================
describe('slugify', () => {
  test('трябва да създаде валиден slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Домашна Пица')).toBe('');  // Cyrillic removed
    expect(slugify('Recipe 123')).toBe('recipe-123');
  });

  test('трябва да премахне специални символи', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
    expect(slugify('Test@#$%String')).toBe('teststring');
  });

  test('трябва да обработи празен текст', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null as any)).toBe('');
  });
});

// ==================== Truncate Text Tests ====================
describe('truncateText', () => {
  test('трябва да съкрати дълъг текст', () => {
    expect(truncateText('This is a long text', 10)).toBe('This is...');
  });

  test('не трябва да съкращава кратък текст', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });

  test('трябва да обработи празен текст', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

// ==================== Title Case Tests ====================
describe('titleCase', () => {
  test('трябва да капитализира първата буква на всяка дума', () => {
    expect(titleCase('hello world')).toBe('Hello World');
    expect(titleCase('UPPERCASE TEXT')).toBe('Uppercase Text');
  });

  test('трябва да обработи празен текст', () => {
    expect(titleCase('')).toBe('');
  });
});

// ==================== Calculate Age Tests ====================
describe('calculateAge', () => {
  test('трябва да изчисли възрастта правилно', () => {
    const currentYear = new Date().getFullYear();
    expect(calculateAge(currentYear - 25)).toBe(25);
    expect(calculateAge(currentYear - 30)).toBe(30);
  });

  test('трябва да върне 0 при невалидна година', () => {
    expect(calculateAge(0)).toBe(0);
    expect(calculateAge(1800)).toBe(0);
    expect(calculateAge(3000)).toBe(0);
  });
});
