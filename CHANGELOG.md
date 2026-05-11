# CHANGELOG - RADAR Strategic Networking

## [1.0.1] - 2026-05-11

### Исправленные проблемы

#### Telegram бот через SOCKS прокси
- **Проблема**: Сервер в России не может достучаться до `api.telegram.org` (блокировка)
- **Решение**: Добавлена поддержка SOCKS5 прокси через пакет `socks-proxy-agent`
- **Изменения**:
  - `backend/src/telegram/telegram.service.ts` — использует `socks-proxy-agent@6.0.0` для маршрутизации запросов через SOCKS5 прокси
  - Конфигурация прокси в `.env`: `SOCKS_PROXY_HOST=127.0.0.1`, `SOCKS_PROXY_PORT=1080`

#### Glitchtip мониторинг ошибок
- **Проблема**: Glitchtip не мог подключиться к PostgreSQL внутри Docker сети
- **Решение**: Исправлен порт подключения с 5433 на 5432 (внутренний порт контейнера)
- **Изменения**:
  - `docker-compose.yml` — `DATABASE_URL=postgresql://radar:radar_password@radar_postgres:5432/radar_db`
  - `docker-compose.yml` — `GLITCHTIP_DOMAIN=https://radar.strateg.space/sentry`

### Требования к окружению

- SOCKS5 прокси на `127.0.0.1:1080` (туннель на芬兰сервер)
- PostgreSQL внутри Docker сети использует порт 5432, снаружи — 5433
- Glitchtip доступен по пути `/sentry/` (интеграция с Sentry/Glitchtip SDK)

---

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
