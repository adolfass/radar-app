# RADAR - Strategic Networking

Telegram Mini App платформа для управления профессиональными контактами и стратегического нетворкинга.

**Методология**: А. Безруков ("Нетворкинг для разведчиков")

**Домен**: [radar.strateg.space](https://radar.strateg.space)
**Бот**: [@radar_strateg_bot](https://t.me/radar_strateg_bot)

---

## Стек технологий

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite + Zustand + Telegram SDK |
| Backend | NestJS + TypeScript + Prisma + PostgreSQL + Redis |
| Bot | Telegraf + SOCKS5 Proxy |
| Infra | Docker Compose, Nginx, Let's Encrypt |

---

## Быстрый старт

### Backend

```bash
cd backend
npm install
cp .env.example .env          # Edit DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN
npx prisma generate           # Must run BEFORE migrate
npx prisma migrate dev
npm run start:dev             # Backend on :3000, Swagger at /api/docs
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                   # Frontend on :5173
```

### Docker (Full Stack)

```bash
docker-compose up -d         # PostgreSQL :5433, Redis :6380
```

---

## Документация

### Для разработчиков

| Документ | Описание |
|----------|----------|
| [AGENTS.md](./AGENTS.md) | Инструкции для AI-агентов |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Архитектурные решения (ADR) |
| [C4_MODEL.md](./C4_MODEL.md) | C4 диаграммы |
| [SETUP.md](./SETUP.md) | Детальная установка |

### Подробная документация

| Документ | Описание |
|----------|----------|
| [docs/01_RESEARCH.md](./docs/01_RESEARCH.md) | Исследование проекта |
| [docs/02_DESIGN.md](./docs/02_DESIGN.md) | Архитектурный дизайн |
| [docs/03_PLAN.md](./docs/03_PLAN.md) | План разработки |
| [docs/04_TESTING.md](./docs/04_TESTING.md) | Стратегия тестирования |
| [docs/VISUAL_DESIGN.md](./docs/VISUAL_DESIGN.md) | Визуальный дизайн |

---

## Проекты

- **Frontend** (`/frontend`): React SPA
- **Backend** (`/backend`): NestJS API
- **Telegram Bot**: Уведомления, deeplinks

---

## API Endpoints

Swagger документация: `/api/docs`

### Auth
- `POST /api/auth/telegram` - Telegram auth

### Business Cards
- `GET/POST /api/business-cards` - CRUD
- `GET /api/business-cards/public/:contactId` - Public card

### Contacts
- `GET/POST /api/contacts` - CRUD
- `POST /api/contacts/add-by-ref` - Add via referral

### Trust
- `GET/POST /api/trust/interactions` - Trust interactions

### Meetings
- `GET/POST /api/meetings` - CRUD

### Subscriptions
- `GET /api/subscription/current` - Current subscription
- `POST /api/subscription/telegram-webhook` - Telegram Stars

---

## Развёртывание (Production)

**VDS**: `157.22.175.40` (user: `agent`)

```bash
# Build frontend
cd frontend && npm run build

# Deploy backend (PM2)
pm2 restart backend

# Nginx serves from /var/www/radar-app/frontend/dist
```

**Ports**:
- Backend: 3002 (nginx proxy)
- PostgreSQL: 5433
- Redis: 6380

---

## Four Pillars (Методология)

1. **Preparation** - Чек-листы, якоря разговора
2. **Systematicity** - Инвентаризация каждые 6 мес
3. **Reciprocity** - Баланс доверия (-100..+100)
4. **Renewal** - Ротация сети, AI рекомендации

---

## Testing

```bash
# Backend
cd backend && npm run test

# Frontend
cd frontend && npm run test

# E2E (future)
npm run test:e2e
```

---

## Known Issues

- [BUG-001] Bottom nav overlaps content - Fixed
- [BUG-002] QR scanner on Android - Custom fallback implemented
- [BUG-003] Navigator scrolling - Fixed
- [BUG-004] Business card "not found" - Investigating
