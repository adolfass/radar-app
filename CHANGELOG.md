# CHANGELOG - RADAR Strategic Networking

## [1.0.0] - 2026-05-06

### Зафиксированная рабочая версия

> Все критические баги исправлены, приложение готово к использованию.

### Исправленные баги

- **BUG-001** ✅ Bottom nav overlaps content on all pages
  - Добавлен `paddingBottom: calc(80px + env(safe-area-inset-bottom))` 
  - Затронутые страницы: DashboardRadar, ContactsScreen, MeetingFlow, EventsScreen, BQGPlanner

- **BUG-002** ⚠️ QR scanner not working on Android
  - Реализован custom fallback через @zxing/library
  - Telegram WebApp SDK `scanQrPopup()` не работает на Android TMA

- **BUG-003** ✅ Navigator scrolling broken
  - Исправлен CSS для мобильных браузеров
  - Добавлен `-webkit-overflow-scrolling: touch`
  - Используется `100dvh` с fallback

- **BUG-004** ✅ QR page shows blank when no cards
  - Добавлено пустое состояние с кнопкой "Создать визитку"
  - Корректная навигация на `/card/new`

### Добавленные функции

- QR Exchange с поддержкой business cards
- QR Scanner с Android fallback
- Bottom navigation с safe-area support
- Scroll optimization для Telegram WebView

### Документация

- Полная инженерная документация (Research, Design, Plan, Testing)
- Визуальный дизайн (VISUAL_DESIGN.md)
- C4 диаграммы (C4_MODEL.md)
- API документация (docs/)

---

## [0.9.x] - Pre-release

### Известные функции

- Telegram Mini App (TMA)
- Аутентификация через Telegram WebApp SDK
- Business Cards (max 7 на пользователя)
- QR код генерация
- Contacts с кругами (Support, Productivity, Development)
- Trust Balance (-100..+100)
- Meetings с якорями
- BQG Planner
- Review Ritual
- Referral System
- Subscriptions (Free/Premium)
- Telegram Stars платежи

### Архитектура

- Frontend: React + TypeScript + Vite + Zustand
- Backend: NestJS + Prisma + PostgreSQL + Redis
- Bot: Telegraf + SOCKS5 Proxy

---

## Будущие версии

### [1.1.0] - Planned
- Refresh token implementation
- Sentry error monitoring
- CI/CD pipeline

### [1.2.0] - Planned
- AI Classifier (FastAPI + Celery)
- Network Graph visualization

### [2.0.0] - Future
- Neo4j graph database
- Advanced analytics
- React Native mobile app
