Yumly – приложение за рецепти и хранителни планове

Yumly е уеб приложение за управление на рецепти и генериране на персонализирани хранителни планове чрез използване на изкуствен интелект. Системата позволява на потребителите да създават рецепти, да следят хранителни стойности и да получават седмични менюта, съобразени с техния здравен профил.

Основни функционалности
-Създаване, редактиране и изтриване на рецепти
-Автоматично изчисляване на хранителни стойности чрез AI
-Генериране на седмични хранителни планове
-Персонализация спрямо здравен профил (калории, цели)
-Проверка за диетична съвместимост
-Превод на рецепти на български език
-Използвани технологии
-Frontend: React, TypeScript, Tailwind CSS
-Backend: Node.js, Express
-База данни: MongoDB
-AI интеграция: Groq API (LLaMA модел)
-Тестване: Vitest, Testing Library
Структура на проекта
/backend – сървърна част (API, логика, база данни)
/frontend – клиентска част (React приложение)

Локално стартиране
Изисквания:
Node.js версия 18 или по-нова
MongoDB база данни

Инсталация:

Клониране на проекта:

git clone https://github.com/seameyon/Official-Diplomen-Proekt
cd Official-Diplomen-Proekt

Инсталиране на зависимости:

cd backend
npm install

cd ../frontend
npm install

Конфигурация:

Създайте .env файл в папка backend:

PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yumly
JWT_SECRET=your-very-long-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=another-very-long-secret-key-for-refresh
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173

//Чувствителните данни (API ключове и секрети) не са включени в проекта и трябва да бъдат конфигурирани чрез .env файл.

Създайте .env файл в папка frontend:
VITE_API_URL=http://localhost:5000/api

Стартиране:

# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

Достъп до приложението:

Локално:

http://localhost:5173

Production:
👉 https://official-diplomen-proekt-d95b-awz4t6bdb.vercel.app

AI функционалности:

Приложението използва Groq API за:

Генериране на хранителни планове
Изчисляване на хранителни стойности
Генериране на рецепти
Анализ на диетични ограничения

Автор:

Симеон Велков 12Б клас
Дипломен проект – 2026