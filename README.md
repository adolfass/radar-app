# Vizitka Bot - Telegram Mini App для делового нетворкинга

Платформа для создания цифровых визиток, обмена контактами через QR-коды и участия в реферальной программе.

## Стек технологий

### Frontend
- React + TypeScript
- Vite
- Swiper.js (карусель визиток)
- Zustand (state management)
- React Router

### Backend
- Node.js + NestJS
- PostgreSQL
- Redis
- Prisma ORM

### Telegram Integration
- Telegram Bot API
- Telegram Mini App
- Web Share API

## Структура проекта

```
vizitka_bot/
├── backend/          # NestJS приложение
├── frontend/         # React приложение
└── docs/             # Документация
```

## Быстрый старт

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Основные возможности

- Создание цифровых визиток (до 7 шт.)
- Обмен контактами через QR-коды
- Реферальная программа с внутренними баллами
- Организация и посещение деловых событий
- Управление контактами (поиск, экспорт vCard)
- Админ-панель для суперпользователей
