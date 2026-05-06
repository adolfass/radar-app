# ЭТАП 2: DESIGN — Архитектурный дизайн

> **Статус**: Завершён
> **Дата**: 2026-05-06
> **Зависимость**: 01_RESEARCH.md

---

## 2.1 C4 Диаграммы

### C4 Level 1: System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           RADAR System                                  │
│                                                                          │
│         Telegram Mini App для стратегического нетворкинга               │
│         "Управляемая человеческая экосистема"                           │
└─────────────────────────────────────────────────────────────────────────┘
            │                        │                        │
            ▼                        ▼                        ▼
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
   │  Telegram Bot   │      │  Telegram       │      │   Пользователи  │
   │                 │      │  WebView        │      │                 │
   │ @radar_strateg_ │      │ (Mini App)      │      │ • Организаторы  │
   │ bot             │      │                 │      │ • Нетворкеры    │
   │                 │      │ • React SPA     │      │ • Предпринимат. │
   │ • Deeplinks     │      │ • Zustand       │      │                 │
   │ • Notifications │      │ • Telegram SDK  │      │                 │
   └─────────────────┘      └─────────────────┘      └─────────────────┘
                                    │
                                    │ QR Codes
                                    ▼
                           ┌─────────────────┐
                           │   QR Exchange   │
                           │                 │
                           │ • Scan          │
                           │ • Share         │
                           └─────────────────┘
```

### C4 Level 2: Container Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 RADAR System                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────┐   ┌──────────────────────────────────┐│
│  │           Frontend (React)           │   │         Backend (NestJS)         ││
│  │                                      │   │                                   ││
│  │  ┌─────────┐  ┌─────────┐          │   │  ┌─────────┐  ┌─────────┐        ││
│  │  │ Pages   │  │Components│          │   │  │ REST    │  │ Business│        ││
│  │  │(Router) │◄─►│  (UI)   │          │◄──►│  │ API     │◄─►│ Logic   │        ││
│  │  └─────────┘  └─────────┘          │   │  └─────────┘  └─────────┘        ││
│  │       │              │            │   │        │            │            ││
│  │  ┌────▼────┐    ┌────▼────┐      │   │  ┌─────▼─────┐ ┌─────▼─────┐    ││
│  │  │ Zustand │    │ Telegram │      │   │  │ Prisma    │ │ Telegraf  │    ││
│  │  │ Store   │    │ WebApp   │      │   │  │ ORM       │ │ Bot       │    ││
│  │  └─────────┘    │ SDK      │      │   │  └─────┬─────┘ └───────────┘    ││
│  │       │         └─────────┘      │   │        │                         ││
│  │  ┌────▼────────────────────┐    │   │  ┌─────▼─────────────────────┐    ││
│  │  │     API Client (JWT)    │    │   │  │     Services              │    ││
│  │  │     /api/*              │    │   │  │  • Auth • BusinessCard   │    ││
│  │  └─────────────────────────┘    │   │  │  • Contact • Meeting     │    ││
│  └──────────────────────────────────┘   │  │  • Trust • Referral       │    ││
│                                         │  │  • BQG • Ritual          │    ││
│                                         │  └────────────┬──────────────┘    ││
│                                         └──────────────────────────────────┘│
│                                                    │                          │
│                                         ┌───────────┴───────────┐              │
│                                         ▼                       ▼              │
│                               ┌─────────────────┐     ┌─────────────────┐      │
│                               │   PostgreSQL    │     │     Redis       │      │
│                               │   (Primary)     │     │   (Cache)      │      │
│                               │                 │     │                 │      │
│                               │ • Users        │     │ • Sessions     │      │
│                               │ • Cards        │     │ • Rate Limit   │      │
│                               │ • Contacts     │     │ • Job Queue    │      │
│                               │ • Meetings     │     └─────────────────┘      │
│                               └─────────────────┘                              │
│                                                                                │
│                               ┌─────────────────────────────────────────┐      │
│                               │         External Services                │      │
│                               │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │      │
│                               │  │ Telegram│  │ OpenAI  │  │ Neo4j   │  │      │
│                               │  │ Bot API│  │  API   │  │ (Graph) │  │      │
│                               │  └─────────┘  └─────────┘  └─────────┘  │      │
│                               └─────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### C4 Level 3: Component Diagram (Backend)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Backend (NestJS)                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                          API Controllers                                     ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │   Auth   │ │ Business │ │ Contact  │ │ Meeting  │ │ Referral │           ││
│  │  │ Ctrl     │ │ Card Ctrl│ │ Ctrl     │ │ Ctrl     │ │ Ctrl     │           ││
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           ││
│  │       │            │            │            │            │                ││
│  │  ┌────┴────────────┴────────────┴────────────┴────────────┴────┐             ││
│  │  │                    DTO Validation                          │             ││
│  │  │            class-validator + class-transformer             │             ││
│  │  └────────────────────────────────────────────────────────────┘             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                            Service Layer                                      ││
│  │                                                                              ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │   Auth   │ │ Business │ │ Contact  │ │ Meeting  │ │ Referral │           ││
│  │  │ Service  │ │ Card Svc │ │ Service  │ │ Service  │ │ Service  │           ││
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           ││
│  │       │            │            │            │            │                ││
│  │       │     ┌─────┴─────┐      │            │     ┌───────┴───────┐         ││
│  │       │     │ QR Code   │      │            │     │  Telegram     │         ││
│  │       │     │ Generator │      │            │     │  Bot Service  │         ││
│  │       │     │ (qrcode)  │      │            │     │  (Telegraf)  │         ││
│  │       │     └───────────┘      │            │     └───────────────┘         ││
│  │                                                                              ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           ││
│  │  │  Trust   │ │   BQG    │ │ Ritual   │ │Subscription│ │Payment │           ││
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │ Service  │           ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘           ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                          Data Access Layer                                   ││
│  │                                                                              ││
│  │  ┌──────────────────────────────────────────────────────────────────────┐   ││
│  │  │                        Prisma Service                                 │   ││
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │   ││
│  │  │  │  User   │ │  Card   │ │Contact  │ │Meeting  │ │ Event  │         │   ││
│  │  │  │Repository│ │Repository│ │Repository│ │Repository│ │Repository│         │   ││
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │   ││
│  │  └──────────────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        Cross-Cutting Concerns                                ││
│  │                                                                              ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       ││
│  │  │    JWT    │ │  Thrott-  │ │  Winston  │ │  Config   │ │  Crypto   │       ││
│  │  │  Guard    │ │   ler     │ │  Logger   │ │  Module   │ │ Encryption│       ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘       ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

### C4 Level 3: Component Diagram (Frontend)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (React SPA)                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                              Routing Layer                                   ││
│  │                                                                              ││
│  │  ┌──────────────────────────────────────────────────────────────────────┐   ││
│  │  │                    React Router v6                                    │   ││
│  │  │                                                                      │   ││
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │   ││
│  │  │  │ /radar  │ │ /qr-    │ │/contacts│ │ /profile│ │ /admin │         │   ││
│  │  │  │         │ │exchange │ │         │ │         │ │        │         │   ││
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │   ││
│  │  │                                                                      │   ││
│  │  │  ┌─────────────────────────────────────────────────────────────┐     │   ││
│  │  │  │              Layout (BottomNav + Outlet)                     │     │   ││
│  │  │  │              Safe area, responsive padding                  │     │   ││
│  │  │  └─────────────────────────────────────────────────────────────┘     │   ││
│  │  └──────────────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                           State Management                                   ││
│  │                                                                              ││
│  │  ┌──────────────────────────────────────────────────────────────────────┐   ││
│  │  │                         Zustand Stores                                │   ││
│  │  │                                                                      │   ││
│  │  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   ││
│  │  │  │   authStore   │  │   cardStore   │  │ contactStore │            │   ││
│  │  │  │               │  │               │  │               │            │   ││
│  │  │  │ • user        │  │ • cards[]     │  │ • contacts[]  │            │   ││
│  │  │  │ • token       │  │ • selected    │  │ • circles     │            │   ││
│  │  │  │ • isAuth      │  │ • loading     │  │ • filters     │            │   ││
│  │  │  └───────────────┘  └───────────────┘  └───────────────┘            │   ││
│  │  │                                                                      │   ││
│  │  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │   ││
│  │  │  │    uiStore    │  │ meetingStore  │  │  trustStore   │            │   ││
│  │  │  │               │  │               │  │               │            │   ││
│  │  │  │ • loading     │  │ • meetings[]  │  │ • interactions│            │   ││
│  │  │  │ • modal        │  │ • current     │  │ • balance     │            │   ││
│  │  │  │ • toast        │  │ • anchors     │  │               │            │   ││
│  │  │  └───────────────┘  └───────────────┘  └───────────────┘            │   ││
│  │  └──────────────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                            Custom Hooks                                     ││
│  │                                                                              ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       ││
│  │  │  useAuth  │ │useCards   │ │useContacts│ │useMeeting │ │useReferral│       ││
│  │  │           │ │           │ │           │ │           │ │           │       ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘       ││
│  │                                                                      │       ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐                           │       ││
│  │  │ useTrust  │ │  useBQG   │ │ useTelegram│                          │       ││
│  │  │           │ │           │ │           │                          │       ││
│  │  └───────────┘ └───────────┘ └───────────┘                           │       ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                             UI Components                                     ││
│  │                                                                              ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             ││
│  │  │BusinessCard │ │  BottomNav   │ │   Button    │ │   Loading   │             ││
│  │  │  Swiper     │ │  (Fixed)    │ │             │ │   Screen    │             ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             ││
│  │                                                                      │             ││
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             ││
│  │  │  QRScanner  │ │  QRDisplay  │ │ TrustBadge │ │ CircleBadge │             ││
│  │  │  (@zxing)   │ │             │ │             │ │             │             ││
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘             ││
│  │                                                                      │             ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐   ││
│  │  │                    Telegram WebApp SDK Integration                  │   ││
│  │  │              tg.initData • tg.ready() • tg.expand()                 │   ││
│  │  └─────────────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.2 Модульное разделение кода

### 2.2.1 Принцип разделения

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Module Independence                                │
│                                                                              │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │         Main Application        │   │         Admin Panel             │  │
│  │                                 │   │                                 │  │
│  │  • User-facing pages           │   │  • /admin routes                │  │
│  │  • Contact management          │   │  • User management              │  │
│  │  • QR exchange                 │   │  • Analytics dashboard          │  │
│  │  • Trust balance                │   │  • System configuration         │  │
│  │  • Meetings                     │   │                                 │  │
│  │                                 │   │  ┌───────────────────────────┐  │  │
│  │  Shared:                        │   │  │     Shared Components     │  │  │
│  │  ┌───────────────────────────┐ │   │  │                           │  │  │
│  │  │ • Design tokens           │ │   │  │ • Table                   │  │  │
│  │  │ • BottomNav                │ │   │  │ • Charts                  │  │  │
│  │  │ • API client               │ │   │  │ • Modal                   │  │  │
│  │  │ • Auth store               │ │   │  │ • Button                  │  │  │
│  │  │ • Types                    │ │   │  │                           │  │  │
│  │  └───────────────────────────┘ │   │  └───────────────────────────┘  │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                          Shared Libraries                                 ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐               ││
│  │  │  Types    │ │  Utils    │ │   Lib    │ │   Hooks   │               ││
│  │  │           │ │           │ │           │ │           │               ││
│  │  │ • API.d.ts│ │ • QR utils│ │ • api.ts │ │ • useAuth │               ││
│  │  │ • Models  │ │ • Date    │ │ • tg.ts  │ │ • useApi  │               ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2.2 File Structure

```
radar-app/
├── frontend/
│   ├── src/
│   │   ├── main.tsx                    # Entry point
│   │   ├── App.tsx                     # Root component + routing
│   │   │
│   │   ├── pages/                      # Page components (routed)
│   │   │   ├── DashboardRadar.tsx
│   │   │   ├── QRExchange.tsx
│   │   │   ├── ContactsScreen.tsx
│   │   │   ├── ContactDossier.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── BusinessCardForm.tsx
│   │   │   ├── MeetingFlow.tsx
│   │   │   ├── EventsScreen.tsx
│   │   │   ├── BQGPlanner.tsx
│   │   │   ├── ReviewRitual.tsx
│   │   │   ├── TrustBalance.tsx
│   │   │   ├── NetworkGraph.tsx
│   │   │   ├── SubscriptionScreen.tsx
│   │   │   ├── ReferralScreen.tsx
│   │   │   ├── AdminPanel.tsx           # Admin-only
│   │   │   └── _shared/                 # Page layout helpers
│   │   │
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── ui/                     # Base UI
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Loading.tsx
│   │   │   ├── business-card/
│   │   │   │   ├── BusinessCardSwiper.tsx
│   │   │   │   ├── QRDisplay.tsx
│   │   │   │   └── CardForm.tsx
│   │   │   ├── contact/
│   │   │   │   ├── ContactList.tsx
│   │   │   │   ├── ContactCard.tsx
│   │   │   │   └── CircleBadge.tsx
│   │   │   ├── meeting/
│   │   │   │   ├── MeetingCard.tsx
│   │   │   │   └── AnchorEditor.tsx
│   │   │   ├── trust/
│   │   │   │   ├── TrustBadge.tsx
│   │   │   │   └── TrustSlider.tsx
│   │   │   ├── layout/
│   │   │   │   ├── BottomNav.tsx        # Global nav
│   │   │   │   └── PageContainer.tsx   # Padding wrapper
│   │   │   └── qr/
│   │   │       ├── QRScanner.tsx       # Camera-based
│   │   │       └── QRCameraFallback.tsx # Android fallback
│   │   │
│   │   ├── store/                      # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── cardStore.ts
│   │   │   ├── contactStore.ts
│   │   │   ├── meetingStore.ts
│   │   │   ├── trustStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── hooks/                      # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useBusinessCards.ts
│   │   │   ├── useContacts.ts
│   │   │   ├── useMeetings.ts
│   │   │   ├── useTrust.ts
│   │   │   ├── useTelegram.ts
│   │   │   └── useQRScanner.ts
│   │   │
│   │   ├── lib/                        # Utilities
│   │   │   ├── api.ts                  # Axios + JWT interceptor
│   │   │   ├── telegram.ts             # WebApp SDK wrapper
│   │   │   ├── qr.ts                   # QR code utilities
│   │   │   └── crypto.ts               # Encryption helpers
│   │   │
│   │   ├── types/                      # TypeScript types
│   │   │   ├── api.ts
│   │   │   ├── models.ts
│   │   │   └── telegram.d.ts
│   │   │
│   │   └── styles/                     # Global styles
│   │       ├── variables.css           # Design tokens
│   │       ├── base.css
│   │       └── scroll.css              # Mobile scroll fixes
│   │
│   └── dist/                           # Production build
│
├── backend/
│   ├── src/
│   │   ├── main.ts                     # Entry point
│   │   ├── app.module.ts               # Root module
│   │   │
│   │   ├── auth/                       # Auth module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── dto/
│   │   │
│   │   ├── user/                       # User module
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── business-card/              # Business card module
│   │   │   ├── business-card.controller.ts
│   │   │   ├── business-card.service.ts
│   │   │   ├── qr-generator.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── contact/                    # Contact module
│   │   │   ├── contact.controller.ts
│   │   │   ├── contact.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── meeting/                    # Meeting module
│   │   │   ├── meeting.controller.ts
│   │   │   ├── meeting.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── trust/                      # Trust module
│   │   │   ├── trust.controller.ts
│   │   │   ├── trust.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── referral/                   # Referral module
│   │   │   ├── referral.controller.ts
│   │   │   ├── referral.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── bqg/                        # BQG module
│   │   │   ├── bqg.controller.ts
│   │   │   ├── bqg.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── ritual/                     # Ritual module
│   │   │   ├── ritual.controller.ts
│   │   │   ├── ritual.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── subscription/              # Subscription module
│   │   │   ├── subscription.controller.ts
│   │   │   ├── subscription.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── payments/                   # Payments module
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── telegram-stars.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── telegram/                   # Telegram bot module
│   │   │   ├── telegram.controller.ts
│   │   │   ├── telegram.service.ts
│   │   │   └── socks-agent.ts
│   │   │
│   │   ├── encryption/                 # Encryption module
│   │   │   ├── encryption.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── ai-classifier/             # AI module (planned)
│   │   │   ├── classifier.controller.ts
│   │   │   ├── classifier.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── network-graph/             # Graph visualization
│   │   │   ├── network-graph.controller.ts
│   │   │   └── network-graph.service.ts
│   │   │
│   │   ├── neo4j/                     # Neo4j integration
│   │   │   ├── neo4j.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── prisma/                    # Prisma service
│   │   │   └── prisma.service.ts
│   │   │
│   │   ├── common/                    # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   │
│   │   └── health/                    # Health check
│   │       └── health.controller.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   └── dist/                          # Production build
│
├── docs/                               # Documentation
│   ├── 01_RESEARCH.md
│   ├── 02_DESIGN.md                   # This file
│   ├── 03_PLAN.md
│   ├── 04_TESTING.md
│   ├── VISUAL_DESIGN.md
│   └── API.md
│
└── docker-compose.yml
```

---

## 2.3 API Design

### 2.3.1 REST Endpoints

#### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/telegram` | Validate initData, get JWT | No |
| GET | `/api/auth/me` | Get current user | JWT |

#### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/:id` | Get user profile | JWT |
| PUT | `/api/users/:id` | Update user | JWT |

#### Business Cards
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/business-cards` | List user's cards | JWT |
| POST | `/api/business-cards` | Create card | JWT |
| GET | `/api/business-cards/:id` | Get card | JWT |
| PUT | `/api/business-cards/:id` | Update card | JWT |
| DELETE | `/api/business-cards/:id` | Delete card | JWT |
| GET | `/api/business-cards/public/:contactId` | Public card | No |
| GET | `/api/business-cards/qr/:contactId` | Get QR code | No |

#### Contacts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/contacts` | List contacts | JWT |
| POST | `/api/contacts` | Add contact | JWT |
| GET | `/api/contacts/:id` | Get contact | JWT |
| PUT | `/api/contacts/:id` | Update contact | JWT |
| DELETE | `/api/contacts/:id` | Delete contact | JWT |
| POST | `/api/contacts/add-by-ref` | Add via referral | No |

#### Trust
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/trust/interactions` | List interactions | JWT |
| POST | `/api/trust/interactions` | Add interaction | JWT |
| GET | `/api/trust/balance/:contactId` | Get balance | JWT |

#### Meetings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/meetings` | List meetings | JWT |
| POST | `/api/meetings` | Create meeting | JWT |
| GET | `/api/meetings/:id` | Get meeting | JWT |
| PUT | `/api/meetings/:id` | Update meeting | JWT |
| DELETE | `/api/meetings/:id` | Delete meeting | JWT |

#### Referrals
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/referral/stats` | Referral stats | JWT |
| GET | `/api/referral/logs` | Referral logs | JWT |
| POST | `/api/referral/generate-link` | Generate link | JWT |

#### Subscriptions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/subscription/current` | Current subscription | JWT |
| POST | `/api/subscription/create-invoice` | Create invoice | JWT |
| POST | `/api/subscription/telegram-webhook` | Telegram Stars webhook | No |

### 2.3.2 Request/Response Examples

#### POST /api/auth/telegram
```typescript
// Request
{
  initData: "query_id=...&user=...&auth_date=..."
}

// Response
{
  user: {
    id: 123,
    telegramId: 987654321,
    username: "john_doe",
    firstName: "John",
    lastName: "Doe",
    isPremium: false,
    balance: 0
  },
  token: "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/business-cards
```typescript
// Request
{
  businessName: "Acme Corp",
  resources: {
    phone: "+1234567890",
    email: "john@acme.com",
    website: "https://acme.com"
  },
  personalData: {
    fullName: "John Doe",
    position: "CEO"
  }
}

// Response
{
  id: 1,
  contactId: "550e8400-e29b-41d4-a716-446655440000",
  businessName: "Acme Corp",
  resources: {...},
  personalData: {...},
  qrCodeDataUrl: "data:image/png;base64,...",
  shareLink: "https://t.me/radar_strateg_bot?startapp=550e8400..."
}
```

---

## 2.4 Безопасность

### 2.4.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Authentication Flow                                  │
│                                                                              │
│  1. Telegram User opens WebApp                                                │
│     │                                                                         │
│     ▼                                                                         │
│  2. Frontend → POST /api/auth/telegram                                        │
│     │  { initData: "query_id=...&user=...&hash=..." }                        │
│     ▼                                                                         │
│  3. Backend validates hash                                                    │
│     │  • Parse initData string                                               │
│     │  • Extract fields (query_id, user, auth_date)                          │
│     │  • Compute HMAC-SHA256 of data check string                            │
│     │  • Compare with hash from Telegram                                     │
│     ▼                                                                         │
│  4. Create/find user in database                                             │
│     │  • Check telegramId exists                                             │
│     │  • Update user data if needed                                          │
│     ▼                                                                         │
│  5. Generate JWT                                                              │
│     │  • payload: { userId, iat, exp }                                       │
│     │  • secret: JWT_SECRET from env                                         │
│     │  • expiresIn: 7 days                                                   │
│     ▼                                                                         │
│  6. Return to frontend                                                       │
│     │  { user, token }                                                       │
│     ▼                                                                         │
│  7. Frontend stores token in localStorage                                    │
│     │                                                                         │
│     ▼                                                                         │
│  8. Subsequent requests: Authorization: Bearer {token}                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.4.2 Data Encryption

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Encryption Flow                                        │
│                                                                              │
│  Sensitive Data: privateMeta (ОИС tags)                                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                           Encryption (Write)                             ││
│  │                                                                          ││
│  │  plaintext: "Опасен=нет, Интересен=да, Сложен=средне"                   ││
│  │          │                                                               ││
│  │          ▼                                                               ││
│  │  ┌─────────────────┐                                                    ││
│  │  │ ENCRYPTION_KEY  │  (AES-256-GCM from env)                           ││
│  │  └─────────────────┘                                                    ││
│  │          │                                                               ││
│  │          ▼                                                               ││
│  │  ┌─────────────────┐                                                    ││
│  │  │  AES-GCM Encrypt │                                                   ││
│  │  │  IV = random(12) │                                                   ││
│  │  └─────────────────┘                                                    ││
│  │          │                                                               ││
│  │          ▼                                                               ││
│  │  ciphertext: "GfYm..." + IV + AuthTag                                    ││
│  │          │                                                               ││
│  │          ▼                                                               ││
│  │  ┌─────────────────┐                                                    ││
│  │  │   PostgreSQL    │  (stored in privateMeta field)                     ││
│  │  └─────────────────┘                                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                          Decryption (Read)                               ││
│  │                                                                          ││
│  │  ciphertext: "GfYm..." + IV + AuthTag                                   ││
│  │          │                                                               ││
│  │          ▼                                                               ││
│  │  ┌─────────────────┐                                                    ││
│  │  │ ENCRYPTION_KEY  │                                                    ││
│  │  └─────────────────┘                                                    ││
│  │          │                                                               ││
│  │          ▼                                                               ││
│  │  ┌─────────────────┐                                                    ││
│  │  │  AES-GCM Decrypt │                                                  ││
│  │  │  Verify AuthTag  │                                                  ││
│  │  └─────────────────┘                                                    ││
│  │          │                                                               ││
│  │          ▼                                                               ││
│  │  plaintext: "Опасен=нет, Интересен=да, Сложен=средне"                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.4.3 Rate Limiting

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Rate Limiting Strategy                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                          Global Limits                                    ││
│  │                                                                          ││
│  │  • 100 requests / minute (authenticated)                                ││
│  │  • 20 requests / minute (unauthenticated)                               ││
│  │  • 10 login attempts / 15 minutes per IP                                ││
│  │                                                                          ││
│  │  Implementation: @nestjs/throttler + Redis store                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Endpoint-Specific Limits                          ││
│  │                                                                          ││
│  │  Endpoint              │  Limit       │  Window                         ││
│  │  ──────────────────────┼──────────────┼─────────────────────────────     ││
│  │  POST /auth/telegram   │  10          │  1 minute                       ││
│  │  POST /contacts        │  30          │  1 minute                       ││
│  │  GET /business-cards   │  60          │  1 minute                       ││
│  │  * (other)             │  100         │  1 minute                       ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.5 Дизайн базы данных

### 2.5.1 Индексы

```sql
-- High-frequency queries
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_circle ON contacts(circle);
CREATE INDEX idx_contacts_created ON contacts(created_at DESC);

CREATE INDEX idx_business_cards_user_id ON business_cards(user_id);
CREATE INDEX idx_business_cards_contact_id ON business_cards(contact_id);

CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);

CREATE INDEX idx_referral_logs_referrer ON referral_logs(referrer_id);
CREATE INDEX idx_referral_logs_created ON referral_logs(created_at DESC);

-- Unique constraints
CREATE UNIQUE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE UNIQUE INDEX idx_contacts_user_contact ON contacts(user_id, contact_id);
```

### 2.5.2 JSON Fields Usage

```typescript
// businessCards.resources (JSON)
{
  phone: "+1234567890",
  email: "john@example.com",
  website: "https://example.com",
  telegram: "@johndoe",
  linkedin: "https://linkedin.com/in/johndoe"
}

// businessCards.personalData (JSON)
{
  fullName: "John Doe",
  position: "CEO",
  bio: "Entrepreneur and investor"
}

// contacts.privateMeta (encrypted JSON)
{
  опасен: "нет",
  интересен: "да",
  сложен: "средне"
}
```

---

## 2.6 Error Handling

### 2.6.1 Error Response Format

```typescript
{
  statusCode: 400,
  error: "Bad Request",
  message: "Validation failed",
  details: [
    {
      field: "businessName",
      message: "businessName must be a string"
    }
  ],
  timestamp: "2026-05-06T12:00:00.000Z",
  path: "/api/business-cards"
}
```

### 2.6.2 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_001 | 401 | Invalid initData |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 403 | Access denied |
| CARD_001 | 404 | Card not found |
| CARD_002 | 400 | Card limit reached |
| CARD_003 | 400 | Duplicate card |
| CONTACT_001 | 404 | Contact not found |
| CONTACT_002 | 400 | Contact already exists |
| VALIDATION_001 | 400 | Invalid DTO |

---

*Документ обновлён: 2026-05-06*
*Зависимость: 01_RESEARCH.md*
