# ЭТАП 3: PLAN — План разработки

> **Статус**: В процессе
> **Дата**: 2026-05-06
> **Основание**: На основе 02_DESIGN.md

---

## 3.1 Стадия проекта

### Что реализовано (✅)

| Компонент | Статус | Заметки |
|-----------|--------|---------|
| Frontend (React + Vite) | ✅ | 18 страниц, Zustand stores |
| Backend (NestJS) | ✅ | 15+ модулей |
| Database (PostgreSQL) | ✅ | Prisma schema, миграции |
| Telegram Bot | ✅ | Уведомления, deeplinks |
| Auth (JWT) | ✅ | Telegram initData validation |
| Business Cards | ✅ | CRUD, QR generation |
| Contacts | ✅ | Круги, роли, архетипы |
| Trust Balance | ✅ | Взаимодействия |
| Meetings | ✅ | Планирование, якоря |
| Referrals | ✅ | Telegram Stars |
| Subscriptions | ✅ | Free/Premium |
| BQG Planner | ✅ | Квартальные цели |
| Review Ritual | ✅ | Инвентаризация |
| Encryption | ✅ | AES-GCM для ОИС |
| Redis Cache | ✅ | Rate limiting |
| SOCKS5 Proxy | ✅ | Telegram API绕过 |

### Что в процессе (🔄)

| Компонент | Статус | Заметки |
|-----------|--------|---------|
| AI Classifier | 🔄 | FastAPI + Celery |
| Network Graph | 🔄 | Neo4j integration |
| E2E Tests | 🔄 | Playwright |

### Исправленные баги (✅)

| ID | Описание | Status |
|----|----------|--------|
| BUG-001 | Bottom nav overlaps content | ✅ Fixed |
| BUG-002 | QR scanner not working on Android | ⚠️ Fallback |
| BUG-003 | Navigator scrolling broken | ✅ Fixed |
| BUG-004 | QR page shows blank when no cards | ✅ Fixed |

### Запланировано (📋)

| Компонент | Приоритет | estimation |
|-----------|-----------|------------|
| Refresh Token | Высокий | 2 дня |
| Error Monitoring (Sentry) | Высокий | 1 день |
| CI/CD Pipeline | Средний | 3 дня |
| Graph Visualization UI | Средний | 5 дней |
| Advanced Analytics | Низкий | 5 дней |

---

## 3.2 Текущие баги

| ID | Описание | Приоритет | Status |
|----|----------|-----------|--------|
| BUG-001 | Bottom nav overlaps content | Средний | 🔄 Fixed |
| BUG-002 | QR scanner not working on Android | Средний | ⚠️ Fallback |
| BUG-003 | Navigator scrolling broken | Средний | 🔄 Fixed |
| BUG-004 | Business card "not found" for user | Высокий | 🔄 Investigating |

---

## 3.3 План исправления багов

### BUG-001: Bottom Nav Overlap

**Корневая причина**: Fixed bottom nav не учитывает padding-bottom страниц

**Решение**: Добавлен `paddingBottom` к page containers

**Файлы**:
- `DashboardRadar.tsx`
- `ContactsScreen.tsx`
- `MeetingFlow.tsx`
- `EventsScreen.tsx`
- `BQGPlanner.tsx`

**Деплой**: ✅ Исправлено на сервере

### BUG-002: QR Scanner Android

**Корневая причина**: `tg.scanQrPopup()` не работает на Android TMA

**Решение**: Fallback на custom camera через @zxing/library

**Файлы**:
- `QRScanner.tsx` - custom scanner component
- `QRExchange.tsx` - scanner integration

**Деплой**: Требуется тестирование

### BUG-003: Navigator Scrolling

**Корневая причина**: CSS `100vh` на мобильных браузерах

**Решение**: 
- Использование `100dvh` с fallback
- `-webkit-overflow-scrolling: touch`

**Деплой**: ✅ Исправлено на сервере

### BUG-004: Business Card Not Found

**Корневая причина**: Неизвестно

**Investigation needed**:
1. Проверить database для user "Роман"
2. Проверить API response `/business-cards`
3. Проверить frontend API client

**Команды**:
```bash
# Check user in database
ssh root@157.22.175.40 "psql -U postgres -d radar -c \"SELECT * FROM users WHERE first_name LIKE '%Роман%'\""

# Check business cards
ssh root@157.22.175.40 "psql -U postgres -d radar -c \"SELECT * FROM business_cards WHERE user_id = <user_id>\""
```

---

## 3.4 Roadmap

### Q2 2026 (Current)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Q2 2026                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  May 2026                                                                │
│  ├── Week 1-2: Bug fixes (QR, Navigator, BottomNav)                     │
│  ├── Week 3-4: Business card integration fix                            │
│  │                                                                      │
│  June 2026                                                               │
│  ├── Week 1-2: Refresh token implementation                             │
│  ├── Week 3-4: Sentry integration                                       │
│  │                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Q3 2026

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Q3 2026                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  July 2026                                                               │
│  ├── AI Classifier (FastAPI + Celery)                                   │
│  ├── Network Graph visualization                                        │
│  │                                                                      │
│  August 2026                                                             │
│  ├── CI/CD Pipeline                                                     │
│  ├── Advanced analytics dashboard                                        │
│  │                                                                      │
│  September 2026                                                          │
│  ├── Graph DB (Neo4j) integration                                       │
│  └── React Native mobile app (future)                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3.5 Definition of Done

### Для каждого изменения:

- [ ] Код написан и проходит lint
- [ ] Типы TypeScript проверены
- [ ] Изменения задеплоены на сервер
- [ ] Протестировано на устройстве (Xiaomi)
- [ ] Функционал работает корректно
- [ ] Документация обновлена

### Для каждого бага:

- [ ] Воспроизведён на устройстве
- [ ] Найдена корневая причина
- [ ] Исправление применено
- [ ] Проверено на устройстве
- [ ] Задокументирован в CHANGELOG.md

---

## 3.6 Estimation

| Task | estimation | Dependencies |
|------|------------|--------------|
| BUG-004 investigation | 2h | None |
| Refresh token | 2d | None |
| Sentry integration | 1d | None |
| CI/CD setup | 3d | Refresh token |
| AI Classifier | 5d | None |
| Network Graph | 5d | AI Classifier |
| Graph DB | 3d | Network Graph |

**Total remaining**: ~19 days

---

## 3.7 Next Actions

### Immediate (эта неделя)

1. **BUG-004**: Investigate business card "not found"
   - Проверить базу данных
   - Проверить API responses
   - Воспроизвести на устройстве

2. **BUG-002**: Test QR scanner fallback
   - Деплоить изменения
   - Протестировать на Xiaomi
   - Если не работает — написать custom fallback

### Short-term (следующие 2 недели)

1. Реализовать refresh token
2. Интегрировать Sentry
3. CI/CD pipeline

### Medium-term (Q3)

1. AI Classifier
2. Network Graph
3. Advanced analytics

---

*Документ обновлён: 2026-05-06*
*Основание: Code analysis, AGENTS.md*
