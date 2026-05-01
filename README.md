# RADAR - Strategic Networking

Telegram Mini App платформа для управления профессиональными контактами и стратегического нетворкинга.

## Стек технологий

- **Frontend**: React + TypeScript + Vite + Zustand + Telegram SDK
- **Backend**: NestJS + TypeScript + Prisma + PostgreSQL + Redis
- **Infra**: Docker Compose, Nginx, Let's Encrypt

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

## Развёртывание

```bash
docker-compose up -d
```
