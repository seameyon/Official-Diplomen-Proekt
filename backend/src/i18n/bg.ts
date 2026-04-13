export const bg = {
  auth: {
    registerSuccess: 'Регистрацията е успешна. Моля, проверете имейла си за потвърждение.',
    loginSuccess: 'Успешен вход',
    emailVerified: 'Имейлът е потвърден успешно',
    verificationSent: 'Имейл за потвърждение е изпратен',
    passwordResetSent: 'Ако съществува акаунт с този имейл, ще получите линк за възстановяване на паролата',
    passwordResetSuccess: 'Паролата е възстановена успешно. Вече можете да влезете с новата си парола.',
    invalidCredentials: 'Невалиден имейл или парола',
    notAuthorized: 'Нямате разрешение',
    tokenExpired: 'Токенът е изтекъл',
    emailNotVerified: 'Моля, потвърдете имейла си първо',
  },
  user: {
    notFound: 'Потребителят не е намерен',
    profileUpdated: 'Профилът е обновен успешно',
    settingsUpdated: 'Настройките са обновени успешно',
    avatarUpdated: 'Аватарът е обновен успешно',
    accountDeleted: 'Акаунтът е изтрит успешно',
    usernameTaken: 'Потребителското име е заето',
    onboardingRequired: 'Моля, попълнете здравния си профил първо',
  },
  recipe: {
    created: 'Рецептата е създадена успешно',
    updated: 'Рецептата е обновена успешно',
    deleted: 'Рецептата е изтрита успешно',
    notFound: 'Рецептата не е намерена',
    notAuthorized: 'Нямате разрешение да променяте тази рецепта',
  },
  favorite: {
    added: 'Рецептата е добавена в любими',
    removed: 'Рецептата е премахната от любими',
    alreadyFavorited: 'Рецептата вече е в любими',
    notFound: 'Любимото не е намерено',
  },
  mealPlan: {
    generated: 'Хранителният план е генериран успешно',
    regenerated: 'Хранителният план е регенериран успешно',
    notFound: 'Няма хранителен план за текущата седмица',
    mealReplaced: 'Ястието е заменено успешно',
    noAlternatives: 'Не са намерени алтернативни рецепти',
  },
  validation: {
    required: '{field} е задължително',
    invalid: 'Невалидно {field}',
    minLength: '{field} трябва да бъде поне {min} символа',
    maxLength: '{field} трябва да бъде най-много {max} символа',
  },
  errors: {
    serverError: 'Вътрешна сървърна грешка',
    notFound: 'Ресурсът не е намерен',
    tooManyRequests: 'Твърде много заявки, моля опитайте отново по-късно',
  },
};

export default bg;
