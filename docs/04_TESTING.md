# ЭТАП 4: TESTING — Стратегия тестирования

> **Статус**: В процессе
> **Дата**: 2026-05-06
> **Цель покрытия**: ≥80%

---

## 4.1 Testing Pyramid

```
                         ┌───────────────┐
                         │      E2E      │
                         │   (Playwright)│
                         │               │
                         │ • Auth flow  │
                         │ • QR exchange│
                         │ • Trust      │
                         │ • Ritual     │
                         └───────┬───────┘
                                 │
                     ┌───────────┴───────────┐
                     │     Integration        │
                     │   (Supertest)         │
                     │                       │
                     │ • API endpoints       │
                     │ • DB operations       │
                     │ • Telegram bot        │
                     └───────────┬───────────┘
                                 │
                     ┌───────────┴───────────┐
                     │       Unit Tests       │
                     │      (Jest)           │
                     │                       │
                     │ • Services            │
                     │ • Utils               │
                     │ • Guards/Pipes        │
                     └───────────────────────┘
```

---

## 4.2 Unit Tests

### Backend

```bash
cd backend
npm run test
```

#### Test Structure

```
backend/src/
├── auth/
│   ├── auth.service.spec.ts
│   └── jwt.strategy.spec.ts
├── business-card/
│   ├── business-card.service.spec.ts
│   └── business-card.controller.spec.ts
├── contact/
│   ├── contact.service.spec.ts
│   └── contact.controller.spec.ts
├── trust/
│   ├── trust.service.spec.ts
│   └── trust.interactions.spec.ts
├── meeting/
│   ├── meeting.service.spec.ts
│   └── meeting.anchors.spec.ts
└── encryption/
    └── encryption.service.spec.ts
```

#### Example Test

```typescript
// business-card.service.spec.ts
describe('BusinessCardService', () => {
  let service: BusinessCardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BusinessCardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BusinessCardService>(BusinessCardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a business card', async () => {
      const userId = 1;
      const dto = {
        businessName: 'Test Corp',
        resources: { email: 'test@test.com' },
      };

      const result = await service.create(userId, dto);

      expect(result.businessName).toBe('Test Corp');
      expect(result.contactId).toBeDefined();
      expect(prisma.businessCard.create).toHaveBeenCalled();
    });

    it('should throw if user has 7 cards', async () => {
      const userId = 1;
      mockPrismaService.businessCard.findMany.mockResolvedValue(
        Array(7).fill({})
      );

      await expect(
        service.create(userId, { businessName: 'Test' })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

### Frontend

```bash
cd frontend
npm run test  # Vitest
```

#### Test Structure

```
frontend/src/
├── components/
│   ├── qr/
│   │   └── QRScanner.spec.tsx
│   ├── business-card/
│   │   └── BusinessCardSwiper.spec.tsx
│   └── trust/
│       └── TrustBadge.spec.tsx
├── hooks/
│   ├── useAuth.spec.ts
│   └── useQRScanner.spec.ts
└── lib/
    └── api.spec.ts
```

#### Example Test

```typescript
// useAuth.spec.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should authenticate user', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

---

## 4.3 Integration Tests

### API Endpoints

```typescript
// business-card.integration.spec.ts
describe('Business Cards API', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await app.init();

    // Get JWT token
    const response = await request(app.getHttpServer())
      .post('/api/auth/telegram')
      .send({ initData: 'valid_test_init_data' });

    jwtToken = response.body.token;
  });

  describe('POST /api/business-cards', () => {
    it('should create a card', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/business-cards')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          businessName: 'Test Corp',
          resources: { email: 'test@test.com' },
        });

      expect(response.status).toBe(201);
      expect(response.body.businessName).toBe('Test Corp');
      expect(response.body.contactId).toBeDefined();
    });

    it('should reject without auth', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/business-cards')
        .send({ businessName: 'Test' });

      expect(response.status).toBe(401);
    });
  });
});
```

---

## 4.4 E2E Tests (Playwright)

### Setup

```bash
cd tests/e2e
npx playwright install
```

### Test Scenarios

```typescript
// auth.spec.ts
import { test, expect } from '@playwright/test';
import { Tda } from '@test诊治/driver';

test.describe('Authentication', () => {
  test('should login via Telegram', async ({ page }) => {
    // Open Telegram WebApp in test mode
    await page.goto('https://t.me/radar_strateg_bot/app');
    
    // Mock initData
    await page.evaluate(() => {
      window.Telegram.WebApp.initData = 'test_init_data';
    });

    // Should see main screen
    await expect(page.locator('text=Добро пожаловать')).toBeVisible();
  });
});

// qr-exchange.spec.ts
test.describe('QR Exchange', () => {
  test('should display QR code from business card', async ({ page }) => {
    // Login first
    await login(page);

    // Navigate to QR exchange
    await page.click('text=Обмен визитками');
    
    // Should show QR code
    const qrImage = page.locator('img[alt="QR код"]');
    await expect(qrImage).toBeVisible();
    
    // QR should have src
    const src = await qrImage.getAttribute('src');
    expect(src).toMatch(/^data:image\/png;base64,/);
  });

  test('should copy share link', async ({ page }) => {
    await login(page);
    await page.click('text=Обмен визитками');
    
    // Click copy button
    await page.click('text=Копировать ссылку');
    
    // Toast should appear
    await expect(page.locator('text=Ссылка скопирована')).toBeVisible();
  });
});

// trust-interaction.spec.ts
test.describe('Trust Interactions', () => {
  test('should add trust interaction', async ({ page }) => {
    await login(page);
    
    // Go to contact
    await page.click('text=Контакты');
    await page.click('text=John Doe');
    
    // Add interaction
    await page.click('text=Добавить взаимодействие');
    await page.click('text=Помог мне');
    await page.fill('input[placeholder="Описание"]', 'Совет по инвестициям');
    await page.click('text=Сохранить');
    
    // Should see updated balance
    await expect(page.locator('text=Баланс: +10')).toBeVisible();
  });
});
```

### Device Testing Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Device Testing Checklist                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Device: Xiaomi Redmi Note 12                                            │
│  Android: 13                                                             │
│  Telegram: 12.6.4                                                        │
│                                                                          │
│  ────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Authentication                                                          │
│  ├── [ ] Opens from bot deeplink                                         │
│  ├── [ ] QR code displays correctly                                      │
│  ├── [ ] Navigator works (swipe, tap)                                    │
│  └── [ ] Returns to correct page                                         │
│                                                                          │
│  QR Exchange                                                            │
│  ├── [ ] My QR code shows (from business card)                          │
│  ├── [ ] QR scanner opens camera                                         │
│  ├── [ ] Can scan QR code                                                │
│  ├── [ ] Copy link works                                                 │
│  └── [ ] Share via Telegram works                                        │
│                                                                          │
│  Contacts                                                                │
│  ├── [ ] Contact list loads                                             │
│  ├── [ ] Search works                                                    │
│  ├── [ ] Filter by circle works                                          │
│  ├── [ ] Contact details open                                           │
│  └── [ ] Trust balance shows                                             │
│                                                                          │
│  Trust Interactions                                                      │
│  ├── [ ] Can add interaction                                             │
│  ├── [ ] Balance updates                                                 │
│  └── [ ] History shows                                                   │
│                                                                          │
│  Navigation                                                              │
│  ├── [ ] Bottom nav is visible                                            │
│  ├── [ ] Bottom nav doesn't overlap content                              │
│  ├── [ ] All nav items work                                              │
│  └── [ ] Back navigation works                                           │
│                                                                          │
│  Scroll                                                                 │
│  ├── [ ] Page scroll works                                               │
│  ├── [ ] Pull to refresh works                                           │
│  ├── [ ] No rubber-banding issues                                        │
│  └── [ ] 100dvh works correctly                                          │
│                                                                          │
│  Offline                                                                │
│  ├── [ ] Shows cached data                                               │
│  └── [ ] Shows error message                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4.5 Test Data

### Fixtures

```typescript
// tests/fixtures/test-users.ts
export const testUsers = {
  organizer: {
    telegramId: 987654321n,
    username: 'test_organizer',
    firstName: 'Test',
    lastName: 'Organizer',
    isOrganizer: true,
  },
  regular: {
    telegramId: 123456789n,
    username: 'test_user',
    firstName: 'Test',
    lastName: 'User',
    isOrganizer: false,
  },
  premium: {
    telegramId: 456789123n,
    username: 'premium_user',
    firstName: 'Premium',
    lastName: 'User',
    isPremium: true,
  },
};

// tests/fixtures/test-cards.ts
export const testCards = [
  {
    businessName: 'Test Corp',
    resources: {
      email: 'test@test.com',
      phone: '+1234567890',
      website: 'https://test.com',
    },
    personalData: {
      fullName: 'John Doe',
      position: 'CEO',
    },
  },
];
```

### Seed Script

```bash
# Run seed
npm run seed:test

# Reset database
npm run db:reset:test
```

---

## 4.6 CI/CD Testing

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm run test:coverage
      
      - uses: codecov/codecov-action@v4

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v4
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Run E2E
        run: |
          cd tests/e2e
          npm ci
          npx playwright install --with-deps
          npx playwright test
      
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: tests/e2e/playwright-report/
```

---

## 4.7 Coverage Target

### Current (estimated)

| Component | Coverage |
|-----------|----------|
| Backend | ~40% |
| Frontend | ~30% |
| Overall | ~35% |

### Target

| Component | Coverage |
|-----------|----------|
| Backend | 80% |
| Frontend | 70% |
| E2E | 5 critical flows |

---

## 4.8 Manual Testing Protocol

### Pre-release Checklist

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Pre-Release Checklist                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Environment                                                              │
│  ├── [ ] Test on clean device (factory reset)                            │
│  ├── [ ] Test on different Android versions (11, 12, 13)                │
│  ├── [ ] Test on iOS if available                                        │
│  ├── [ ] Test on different screen sizes                                  │
│                                                                          │
│  Authentication                                                          │
│  ├── [ ] Fresh install login                                            │
│  ├── [ ] Logout/login cycle                                             │
│  ├── [ ] Token expiration handling                                       │
│  └── [ ] Multiple accounts                                               │
│                                                                          │
│  Core Flows                                                              │
│  ├── [ ] QR exchange (my QR)                                            │
│  ├── [ ] QR exchange (scan)                                             │
│  ├── [ ] Add contact via QR                                             │
│  ├── [ ] Trust interaction cycle                                         │
│  ├── [ ] Create meeting                                                 │
│  └── [ ] Review ritual flow                                             │
│                                                                          │
│  Edge Cases                                                              │
│  ├── [ ] Offline mode                                                   │
│  ├── [ ] Slow network                                                   │
│  ├── [ ] Large contact list (100+)                                      │
│  ├── [ ] Duplicate QR scan                                              │
│  └── [ ] Invalid QR code                                                │
│                                                                          │
│  Performance                                                              │
│  ├── [ ] App startup time < 3s                                          │
│  ├── [ ] No jank during scroll                                          │
│  ├── [ ] Memory usage < 200MB                                           │
│  └── [ ] No memory leaks after 10 min usage                              │
│                                                                          │
│  Security                                                                │
│  ├── [ ] Sensitive data not in logs                                     │
│  ├── [ ] HTTPS only                                                     │
│  └── [ ] Rate limiting works                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

*Документ обновлён: 2026-05-06*
*Цель покрытия: ≥80%*
