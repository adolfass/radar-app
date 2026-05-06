# ЭТАП 1: RESEARCH — Полное исследование проекта RADAR

> **Статус**: Завершён
> **Дата**: 2026-05-06
> **Основание**: Анализ исходного кода, C4_MODEL.md, ARCHITECTURE.md, AGENTS.md

---

## 1.1 Назначение проекта

**RADAR** — Telegram Mini App (TMA) для стратегического нетворкинга.

**Миссия**: Трансформировать хаотичный нетворкинг в управляемую "человеческую экосистему" на основе методологии А. Безрукова («Нетворкинг для разведчиков»).

**Ключевые проблемы пользователей**:
- Потеря контактов после встреч
- Отсутствие системы поддержания связей
- Невозможность отслеживать "баланс доверия"
- Ручная классификация контактов

---

## 1.2 Функции проекта

### 1.2.1 Четыре столпа методологии

| Столп | Функции |
|-------|---------|
| **Preparation (Подготовка)** | Чек-листы встреч, "якоря" разговора, фиксация после встречи |
| **Systematicity (Систематичность)** | Инвентаризация каждые 6 мес (BQG, обзор ролей) |
| **Reciprocity (Взаимность)** | Трекер баланса доверия (-100..+100) |
| **Renewal (Обновление)** | Ротация сети (~30% "испаряется" ежегодно), AI рекомендации |

### 1.2.2 Реализованные функции

#### A. Аутентификация
```
Telegram WebApp → initData hash → Backend /api/auth/telegram → JWT → Frontend
```
- Telegram SDK интеграция
- JWT в localStorage как `auth_token`
- Валидация initData на сервере

#### B. Business Cards (Визитки)
- Создание/редактирование (max 7 на пользователя)
- QR-код генерация (backend: `qrcode` package)
- Формат QR: `https://t.me/radar_strateg_bot?startapp={contactId}`
- Swiper.js карусель для просмотра

#### C. Contacts (Контакты)
- Классификация по кругам: Support (3-5), Productivity (до 75), Development (~100)
- Роли: Connector, Condensator, Bridge, Gatekeeper
- Приватные теги ОИС (зашифрованы AES-GCM)
- Культурные архетипы: Peach, Pomegranate, Apple

#### D. Trust Balance (Баланс доверия)
- Шкала -100 до +100
- Типы взаимодействий: you_helped, they_helped, mutual
- Визуализация баланса

#### E. Meetings (Встречи)
- Планирование, отслеживание
- "Якоря" разговора
- Заметки и результаты
- Follow-up даты

#### F. BQG Planner (Business Quote Generator)
- Цели бизнеса на квартал
- AI классификация недостающих ролей

#### G. Review Ritual (Ритуал обзора)
- Периодическая инвентаризация сети
- Статусы: in_progress, completed, abandoned

#### H. Referral System (Рефералы)
- Telegram Stars награды
- Логирование событий

#### I. Subscription (Подписки)
- Free: ≤100 контактов
- Premium: безлимит, AI, экспорт
- Trial: 14 дней

### 1.2.3 Запланированные функции
- [ ] Платежи через Telegram Stars / ЮKassa
- [ ] Push-уведомления через бота
- [ ] Аналитика (просмотры визиток)
- [ ] Интеграции с CRM/календарями
- [ ] AI-classifier service (FastAPI + Celery)
- [ ] Graph DB (Neo4j) для визуализации сети

---

## 1.3 Начало взаимодействия пользователя

### 1.3.1 User Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Telegram Client                           │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              @radar_strateg_bot (Bot)                        │
│                                                              │
│  /start ──────────────────────────► Main Menu                │
│       │                                                     │
│       │ startapp=qr ──────────────► /qr-exchange            │
│       │ startapp=navigator ───────► /navigator               │
│       │ startapp={contactId} ─────► /scan-confirm/{id}      │
│       │ startapp={contactId}_ref ──► Referral flow           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              Telegram WebView (Mini App)                     │
│                                                              │
│  1. tg.initData передаётся в backend                         │
│  2. JWT token создаётся                                      │
│  3. Frontend сохраняет в localStorage                        │
│  4. Роутинг на соответствующую страницу                      │
└──────────────────────────────────────────────────────────────┘
```

### 1.3.2 Deeplink Commands (SPECIAL_COMMANDS)

| startapp параметр | Маршрут | Описание |
|-------------------|---------|---------|
| `qr` | `/qr-exchange` | Обмен визитками |
| `navigator` | `/navigator` | Онбординг/туториал |
| `{contactId}` | `/scan-confirm/{contactId}` | Подтверждение контакта |
| `{contactId}_ref` | Реферальный flow | Пришёл от реферала |

---

## 1.4 Структурный дизайн (Архитектура)

### 1.4.1 Общая архитектура

```
┌────────────────────────────────────────────────────────────────────────┐
│                         Telegram (External)                            │
│     ┌──────────────┐                    ┌──────────────┐             │
│     │  Bot API     │                    │  WebApp SDK  │             │
│     └──────┬───────┘                    └──────┬───────┘             │
└────────────┼────────────────────────────────────┼─────────────────────┘
             │ Telegram Bot                      │ WebView
             │ (Telegraf)                       │
┌────────────▼────────────────────────────────────▼─────────────────────┐
│                          Frontend (React SPA)                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ Pages   │  │Components│ │ Store  │  │  Hooks  │  │   Lib   │     │
│  │(Router) │  │  (UI)   │  │(Zustand)│ │(Custom) │  │  (API)  │     │
│  └────┬────┘  └─────────┘  └────┬────┘  └─────────┘  └────┬────┘     │
└───────┼──────────────────────────┼──────────────────────────┼──────────┘
        │                          │                          │
        │ HTTP/REST                │                          │
        │ JWT Bearer               │                          │
        ▼                          ▼                          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Backend (NestJS)                               │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      API Gateway Layer                          │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │   │
│  │  │ Auth   │ │Business│ │Contact │ │Meeting │ │Referral│       │   │
│  │  │        │ │ Card   │ │        │ │        │ │        │       │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Service Layer                              │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │   │
│  │  │ Telegram│ │ Trust │ │ BQG    │ │ Ritual │ │Payment │       │   │
│  │  │        │ │        │ │        │ │        │ │        │       │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Data Layer                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│  │  │  Prisma ORM │  │ PostgreSQL  │  │    Redis    │            │   │
│  │  │             │  │  (Primary)   │  │   (Cache)   │            │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.4.2 Backend Modules

| Модуль | Путь | Описание | Статус |
|--------|------|----------|--------|
| auth | `src/auth/` | Telegram auth, JWT | ✅ |
| business-card | `src/business-card/` | Визитки, QR генерация | ✅ |
| contact | `src/contact/` | Контакты, круги | ✅ |
| meeting | `src/meeting/` | Встречи, якоря | ✅ |
| referral | `src/referral/` | Реферальная система | ✅ |
| telegram | `src/telegram/` | Бот уведомления | ✅ |
| trust | `src/trust/` | Баланс доверия | ✅ |
| bqg | `src/bqg/` | BQG Planner | ✅ |
| ritual | `src/ritual/` | Review Ritual | ✅ |
| subscription | `src/subscription/` | Подписки | ✅ |
| payments | `src/payments/` | Telegram Stars, Crypto | ✅ |
| ai-classifier | `src/ai-classifier/` | AI классификация | 🔄 |
| network-graph | `src/network-graph/` | Graph visualization | 🔄 |
| neo4j | `src/neo4j/` | Neo4j integration | 🔄 |
| encryption | `src/encryption/` | AES-GCM encryption | ✅ |

### 1.4.3 Frontend Pages

| Страница | Путь | Описание |
|----------|------|----------|
| MainScreen | `/` | Главный экран |
| DashboardRadar | `/radar` | Радар сети |
| QRExchange | `/qr-exchange` | Обмен визитками |
| ContactsScreen | `/contacts` | Список контактов |
| ContactDossier | `/contacts/:id` | Детали контакта |
| ProfileScreen | `/profile` | Профиль пользователя |
| BusinessCardForm | `/card/new` | Создание визитки |
| CardDetail | `/card/:id` | Просмотр визитки |
| MeetingFlow | `/meeting/*` | Встречи flow |
| EventsScreen | `/events` | Мероприятия |
| BQGPlanner | `/bqg` | BQG планирование |
| ReviewRitual | `/ritual` | Ритуал обзора |
| TrustBalance | `/trust` | Баланс доверия |
| NetworkGraph | `/network` | Граф сети |
| SubscriptionScreen | `/subscription` | Подписка |
| ReferralScreen | `/referral` | Рефералы |
| AdminPanel | `/admin` | Админ-панель |

### 1.4.4 Frontend Stores (Zustand)

| Store | Описание |
|-------|----------|
| authStore | Пользователь, токен |
| cardStore | Визитки |
| contactStore | Контакты |
| uiStore | UI state (loading, modals) |

### 1.4.5 Frontend Hooks

| Hook | Описание |
|------|----------|
| useAuth | Аутентификация |
| useBusinessCards | CRUD визиток |
| useContacts | Управление контактами |
| useMeetings | Встречи |
| useReferral | Реферальная система |

---

## 1.5 Схема базы данных (ERD)

### 1.5.1 Core Entities

```
┌─────────────┐         ┌──────────────────┐
│    users    │ 1:N     │  business_cards  │
├─────────────┤◄────────│ ├─────────────────│
│ id          │         │ id               │
│ telegramId  │         │ user_id          │
│ username    │         │ contactId (UUID) │
│ firstName   │         │ businessName     │
│ lastName    │         │ resources (JSON) │
│ isPremium   │         │ personalData      │
│ balance     │         │ qrCodeUrl         │
│ referralCode│         │ isActive          │
└──────┬──────┘         └──────────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│  contacts   │
├─────────────┤
│ id          │
│ userId      │
│ contactId   │ ──────────────────────┐
│ businessName│                       │
│ circle      │ (support/production/  │
│ archetype   │  development)         │
│ privateMeta │ (encrypted ОИС tags)   │
└─────────────┘                       │
       │                               │
       │ 1:N                           │
       ▼                               │
┌───────────────────┐                  │
│trust_interactions │                  │
├───────────────────┤                  │
│ id                │                  │
│ userId            │                  │
│ contactId         │                  │
│ type              │                  │
│ balanceDelta      │                  │
└───────────────────┘                  │
                                        │
┌─────────────┐         ┌──────────────────────────┐
│   events    │ 1:N     │  event_registrations    │
├─────────────┤◄────────│ ├──────────────────────────┤
│ id          │         │ id                       │
│ organizerId │         │ eventId                  │
│ title       │         │ userId                   │
│ location    │         │ status                   │
│ startDate   │         └──────────────────────────┘
│ endDate     │
└─────────────┘

┌─────────────┐         ┌────────────────┐
│   meetings  │         │   referrals    │
├─────────────┤         ├────────────────┤
│ id          │         │ id             │
│ userId      │         │ userId         │
│ contactId   │         │ referrerId     │
│ location    │         └────────────────┘
│ scheduledAt │         ┌────────────────┐
│ anchors     │         │ referral_logs  │
│ notes       │         ├────────────────┤
│ outcomes    │         │ id             │
└─────────────┘         │ userId         │
                        │ referrerId     │
┌─────────────┐         │ action         │
│    bqgs     │         │ points         │
├─────────────┤         └────────────────┘
│ id          │
│ userId      │
│ goal        │
│ quarterStart│
│ quarterEnd  │
└─────────────┘

┌─────────────────┐
│review_rituals   │
├─────────────────┤
│ id              │
│ userId          │
│ startedAt       │
│ completedAt     │
│ metrics (JSON)  │
│ status          │
└─────────────────┘
```

### 1.5.2 Subscription Entities

```
┌───────────────┐         ┌──────────────────┐
│ subscriptions │ 1:1     │ crypto_payments  │
├───────────────┤◄────────│ ├─────────────────│
│ id            │         │ id               │
│ userId        │         │ userId           │
│ plan          │         │ invoiceId        │
│ expiresAt     │         │ amountUsd        │
│ isActive      │         │ amountUsdt       │
│ trialStart    │         │ status           │
│ trialEnd      │         └──────────────────┘
└───────────────┘         ┌──────────────────────┐
                          │telegram_stars_payments│
                          ├──────────────────────┤
                          │ id                   │
                          │ userId               │
                          │ invoiceId            │
                          │ starsAmount          │
                          │ status               │
                          └──────────────────────┘
```

---

## 1.6 Критические технические решения (ADR)

### ADR-001: React + TypeScript + Vite (Frontend)
**Решение**: Современный SPA стек
**Обоснование**: Telegram WebApp SDK, компонентный подход, быстрая разработка

### ADR-002: NestJS (Backend)
**Решение**: Модульная архитектура с DI
**Обоснование**: TypeScript, декораторы, масштабируемость

### ADR-003: Zustand (State Management)
**Решение**: Минималистичный стор
**Обоснование**: Малый bundle, отсутствие boilerplate

### ADR-004: Prisma ORM
**Решение**: Типобезопасный доступ к БД
**Обоснование**: Автогенерация типов, миграции

### ADR-005: PostgreSQL
**Решение**: Реляционная БД
**Обоснование**: ACID, JSON поля для гибких данных

### ADR-006: Redis
**Решение**: Кеширование и rate limiting
**Обоснование**: Высокая производительность

### ADR-007: SOCKS5 Proxy для Telegram
**Решение**: Telegram API заблокирован в России
**Обоснование**: SSH туннель на Finland сервер (78.17.76.33:1080)

---

## 1.7 Безопасность

### 1.7.1 Аутентификация
- ✅ Валидация Telegram initData hash на сервере
- ✅ JWT токены для API
- ✅ Валидация через `telegraf` middleware

### 1.7.2 Шифрование
- ✅ AES-GCM для приватных тегов (privateMeta)
- ✅ ENCRYPTION_KEY в .env

### 1.7.3 Rate Limiting
- ✅ @nestjs/throttler
- ✅ Redis для распределённого limiting

### 1.7.4 Валидация
- ✅ class-validator для DTOs
- ⚠️ TODO: Zod для runtime validation

---

## 1.8 Инфраструктура

### 1.8.1 Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                    VDS: 157.22.175.40                   │
│                         (user: agent)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐     ┌─────────────────┐            │
│  │  Nginx          │     │  PM2            │            │
│  │  (Reverse Proxy) │     │  (Process Mgr)  │            │
│  │                 │     │                 │            │
│  │ radar.strateg.  │     │ backend:3002    │            │
│  │ space           │     │                 │            │
│  │ (SSL Let's      │     │                 │            │
│  │  Encrypt)      │     │                 │            │
│  └────────┬────────┘     └─────────────────┘            │
│           │                                               │
│           │ /                    :3002                   │
│           ▼                      │                       │
│  ┌─────────────────┐            │                       │
│  │  Frontend       │◄───────────┘                       │
│  │  (Static Files) │                                    │
│  │  /var/www/      │                                    │
│  │  radar-app/     │                                    │
│  │  frontend/dist/ │                                    │
│  └─────────────────┘                                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  External Services:                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ PostgreSQL   │  │   Redis      │  │   Finland     │  │
│  │   :5433      │  │   :6380      │  │   Proxy      │  │
│  │ (Docker)     │  │  (Docker)    │  │  :1080 SOCKS5 │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.8.2 Ports Mapping

| Service | Container Port | Host Port | Note |
|---------|---------------|-----------|------|
| PostgreSQL | 5432 | **5433** | Not 5432! |
| Redis | 6379 | **6380** | Not 6379! |
| Backend | 3000 | 3002 | Nginx proxy |
| Frontend | 5173 | N/A | Built to dist/ |

---

## 1.9 UI/UX Требования

### 1.9.1 Target Devices
- iPhone 14/15 Pro
- Xiaomi Redmi Note 12/13
- OLED-optimized (`#000` background)

### 1.9.2 Touch Targets
- Minimum 44px
- Safe-area handling (`env(safe-area-inset-*)`)
- Bottom sheets

### 1.9.3 Known Issues
| Issue | Status | Mitigation |
|-------|--------|------------|
| Bottom nav overlaps content | 🔄 Fixed | padding-bottom на страницах |
| 100vh on mobile browsers | 🔄 Fixed | 100dvh с fallback |
| QR scanner on Android | ⚠️ Fallback | Custom camera via @zxing |

---

## 1.10 Testing Requirements

### 1.10.1 Coverage Target
- **≥80%** code coverage

### 1.10.2 E2E Scenarios
1. ✅ Auth flow (Telegram → JWT)
2. ✅ Contact add via QR
3. ✅ Trust interaction
4. ✅ Review ritual
5. ✅ Subscription flow

---

## 1.11 Метрики проекта

### 1.11.1 Метрики роста
- Количество пользователей
- Активные визитки
- Реферальная активность
- Регистрации на события

### 1.11.2 Метрики удержания
- DAU/MAU
- Retention day 1, 7, 30
- Average session duration

---

## 1.12 Риски и mitigation

| Риск | Вероятность | Критичность | Mitigation |
|------|-------------|-------------|------------|
| Telegram API blocked | Высокая | Высокая | SOCKS5 proxy ✅ |
| QR scanner Android | Высокая | Средняя | Custom camera fallback ✅ |
| Data loss (contacts) | Низкая | Критическая | PostgreSQL backups |
| JWT expiration | Средняя | Средняя | Нужен refresh token |
| Neo4j unavailable | Средняя | Низкая | Fallback to PG CTE |
| AI service blocking | Средняя | Средняя | Celery queue ✅ |

---

## 1.13 Пробелы и TODO

### Критические
- [ ] Refresh token implementation
- [ ] E2E tests (Playwright)
- [ ] Error monitoring (Sentry)

### Важные
- [ ] API documentation (Swagger already at /api/docs)
- [ ] CI/CD pipeline
- [ ] Redis connection in production

### Опциональные
- [ ] React Native mobile app
- [ ] Graph DB (Neo4j) visualization
- [ ] Advanced analytics dashboard

---

*Документ обновлён: 2026-05-06*
*Основание: Анализ исходного кода, C4_MODEL.md, ARCHITECTURE.md, AGENTS.md*
