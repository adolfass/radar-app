# Инструкция по запуску Radar Bot

## Требования

- Node.js >= 18
- npm или yarn
- Docker и Docker Compose (для запуска баз данных)

## Быстрый старт

### 1. Запуск баз данных

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379

### 2. Настройка Backend

```bash
cd backend

# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env

# Редактирование .env (укажите ваш Telegram Bot Token)
# TELEGRAM_BOT_TOKEN=your_bot_token_here

# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev --name init

# Запуск в режиме разработки
npm run start:dev
```

Backend будет доступен на `http://localhost:3000`
Swagger документация: `http://localhost:3000/api/docs`

### 3. Настройка Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Копирование переменных окружения
cp .env.example .env

# Запуск в режиме разработки
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

## Получение Telegram Bot Token

1. Откройте Telegram и найдите [@BotFather](https://t.me/botfather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям (укажите имя и username бота)
4. BotFather выдаст вам токен
5. Скопируйте токен в файл `backend/.env`

## Настройка Telegram Mini App

1. Откройте [@BotFather](https://t.me/botfather)
2. Отправьте команду `/mybots`
3. Выберите вашего бота
4. Перейдите в `Bot Settings` → `Menu Button` → `Configure Menu Button`
5. Отправьте URL вашего фронтенда (для локальной разработки используйте https-туннель, например, ngrok)
6. Укажите название кнопки, например "Открыть визитку"

## Использование ngrok для локальной разработки

```bash
# Установка ngrok (если не установлен)
# https://ngrok.com/download

# Запуск туннеля для frontend
ngrok http 5173

# Запуск туннеля для backend (в другом терминале)
ngrok http 3000
```

Используйте https-URL от ngrok в настройках Telegram бота.

## Проверка работы

1. Откройте вашего Telegram бота
2. Нажмите кнопку меню "Открыть визитку"
3. Должно открыться Telegram Mini App

## API Endpoints

### Auth
- `POST /api/auth/validate` - Валидация Telegram initData

### Business Cards
- `GET /api/business-cards` - Получить все визитки пользователя
- `POST /api/business-cards` - Создать визитку
- `GET /api/business-cards/:id` - Получить визитку
- `PUT /api/business-cards/:id` - Обновить визитку
- `DELETE /api/business-cards/:id` - Удалить визитку
- `GET /api/business-cards/public/:contactId` - Получить публичную визитку

### Contacts
- `GET /api/contacts` - Получить все контакты
- `POST /api/contacts/add-by-ref` - Добавить контакт по реферальной ссылке
- `DELETE /api/contacts/:id` - Удалить контакт
- `GET /api/contacts/export/:id` - Экспорт контакта в vCard

### Events
- `GET /api/events` - Получить все события
- `GET /api/events/organized` - Получить организованные события
- `POST /api/events` - Создать событие (только для организаторов)
- `POST /api/events/:id/register` - Зарегистрироваться на событие
- `POST /api/events/:id/unregister` - Отменить регистрацию

### Referrals
- `GET /api/referrals/stats` - Получить статистику рефералов
- `GET /api/referrals/link` - Получить реферальную ссылку

## Production развертывание

### Backend

```bash
# Сборка
npm run build

# Запуск
npm run start:prod
```

### Frontend

```bash
# Сборка
npm run build

# Предпросмотр
npm run preview
```

Собранные файлы будут в папке `dist/`. Разместите их на любом статическом хостинге (Vercel, Netlify, Cloudflare Pages).

## Переменные окружения

### Backend (.env)

```env
DATABASE_URL="postgresql://radar:radar_password@localhost:5432/radar_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)

```env
VITE_TELEGRAM_WEB_APP_URL=https://your-domain.com
VITE_API_URL=https://your-backend-domain.com/api
```

## Устранение неполадок

### Ошибка подключения к базе данных

Убедитесь, что Docker контейнеры запущены:
```bash
docker-compose ps
```

Перезапустите при необходимости:
```bash
docker-compose restart
```

### Ошибка валидации Telegram

Проверьте, что:
- `TELEGRAM_BOT_TOKEN` правильно указан в `.env`
- Используете актуальный `initData` от Telegram WebApp

### Проблемы с CORS

Убедитесь, что `FRONTEND_URL` в backend `.env` совпадает с URL вашего фронтенда.

## Дополнительная документация

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
