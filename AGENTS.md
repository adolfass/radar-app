# AGENTS.md

## Project Overview

RADAR — Strategic Networking. Telegram Mini App for transforming chaotic networking into a managed "human ecosystem". Based on А. Безруков's methodology («Нетворкинг для разведчиков»).

Two packages: `backend/` (NestJS) and `frontend/` (React + Vite). AI service (FastAPI + Celery) planned.

**Domain**: `radar.strateg.space`

## Essential Commands

### Setup (first time)
```bash
docker-compose up -d          # Start PostgreSQL (host:5433), Redis (host:6380), Neo4j
cd backend && npm install
cp .env.example .env          # Edit TELEGRAM_BOT_TOKEN, DATABASE_URL, ENCRYPTION_KEY
npx prisma generate           # Must run BEFORE migrate
npx prisma migrate dev
npm run start:dev             # Backend on :3000, Swagger at /api/docs
cd ../frontend && npm install
cp .env.example .env
npm run dev                   # Frontend on :5173
```

### Backend
| Command | Purpose |
|---|---|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | NestJS build to `dist/` |
| `npm run start:prod` | Run from `dist/main` |
| `npm run lint` | ESLint with auto-fix |
| `npm run test` | Jest (tests in `src/**/*.spec.ts`) |
| `npm run prisma:studio` | Open Prisma Studio |

### Frontend
| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + Vite build |
| `npm run lint` | ESLint (unused directives = failure) |

## Critical Gotchas

- **Port mapping**: Docker Compose exposes PostgreSQL on **5433** (not 5432) and Redis on **6380** (not 6379). Update `.env` accordingly.
- **Prisma order**: Always run `prisma generate` before `prisma migrate dev`.
- **Migrations are gitignored**: `prisma/migrations/` is in `.gitignore`. Each dev environment generates its own.
- **Frontend env vars**: Must use `VITE_` prefix to be exposed to the client.
- **CORS**: Backend `FRONTEND_URL` in `.env` must match the actual frontend URL.
- **Encryption**: Private contact metadata (`privateMeta`) must be AES-GCM encrypted before DB write. Key in `.env`, never stored in DB plaintext.
- **AI service**: Never blocks main API. All heavy tasks (classify, recommend, rotation) go through Celery/Redis queue.

## Architecture

- **Backend modules**: `auth/`, `business-card/`, `contact/`, `event/`, `referral/`, `telegram/`, `prisma/`, `user/`
- **Implemented new modules**: `bqg/`, `trust/`, `ritual/`, `subscription/`
- **Planned**: `payment/` (Telegram Stars), AI service integration
- **Frontend state**: Zustand stores in `src/store/`
- **Frontend API**: Centralized client in `src/lib/api.ts` with JWT interceptor
- **Auth flow**: Telegram `initData` validated server-side → JWT issued → stored in `localStorage` as `auth_token`
- **Key deps**: Telegraf (Telegram Bot API), ioredis (caching/rate limiting), qrcode (QR generation), Swiper.js (card carousel), socks (SOCKS5 proxy), @nestjs/throttler
- **Planned deps**: Zod (validation), pino (logging), Sentry (frontend error tracking), `react-force-graph` (network visualization)
- **Neo4j**: Graph DB for network visualization. Lazy-load, fallback to PG CTE if unavailable.

## 4 Pillars (Methodology)

1. **Preparation**: Meeting checklists, conversation "anchors", post-meeting fixation
2. **Systematicity**: Inventory ritual every 6 months (BQG, network, roles review)
3. **Reciprocity**: Trust balance tracker (-100..+100 visual scale)
4. **Renewal**: Network rotation (~30% contacts "evaporate" yearly), AI recommendations for archive/unfreeze

## Contact Typology

- **Circles**: Support (3-5), Productivity (up to 75), Development (~100)
- **Roles**: Connector, Condensator, Bridge, Gatekeeper
- **Private tags**: ОИС (Опасен? Интересен? Сложен?) — encrypted at app level
- **Cultural archetypes**: Peach (US/Canada), Pomegranate (RF/East), Apple (EU)

## Monetization

- **Free**: ≤100 contacts, basic map, manual classification
- **Premium**: Unlimited, AI classification, trust balance, rituals, export
- **Trial**: 14 days. Soft limit at 101 contacts → upgrade prompt
- **Never hardcode limits or prices** — always from config

## UI/UX Requirements

- Mobile-first (iPhone 14/15 Pro, Redmi Note 12/13)
- OLED-optimized (`#000` background)
- Safe-area handling, bottom sheets, touch targets ≥44px

## Testing

- Target: ≥80% coverage
- E2E scenarios for key flows (auth, contact add, trust interaction, ritual)

## Production

- Domain: `radar.strateg.space`
- VDS: `157.22.175.40` (user: `agent`)
- PM2 config: `backend/ecosystem.config.js`
- Frontend builds to `dist/`, deployable to any static host
- **Nginx**: Configured with SSL (Let's Encrypt) at `/etc/nginx/sites-available/radar.strateg.space`
- **Ports**: Backend on 3002 (nginx proxy), PostgreSQL on 5433, Redis on 6380

## Telegram API Access

- **BLOCKED from Russia**: Telegram API недоступен с VDS в Москве
- **Solution**: SOCKS5 proxy via SSH tunnel to Finland server (78.17.76.33:1080)
- **Config**: `SOCKS_PROXY_HOST=127.0.0.1`, `SOCKS_PROXY_PORT=1080` in backend `.env`
- **Service**: `telegram-proxy.service` (systemd) — auto-reconnects SSH tunnel
- **Firewall**: Finland UFW allows port 1080 only from 157.22.175.40
- **Implementation**: Custom `SocksAgent` in `telegram.service.ts` (extends https.Agent)
