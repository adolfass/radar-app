# ВИЗУАЛЬНЫЙ ДИЗАЙН — RADAR

> **Статус**: Документирование
> **Дата**: 2026-05-06

---

## 1.1 Цветовая система

### Primary Colors

```css
:root {
  /* Primary Blue */
  --radar-primary: #2563EB;        /* Основной акцент */
  --radar-primary-hover: #1D4ED8;  /* Hover state */
  --radar-primary-light: #3B82F6;  /* Light variant */
  --radar-primary-dark: #1E40AF;   /* Dark variant */
  
  /* Accent Colors */
  --radar-accent: #2563EB;         /* Кнопки, ссылки */
  --radar-success: #10B981;        /* Успех, доверие + */
  --radar-warning: #F59E0B;        /* Предупреждение */
  --radar-error: #EF4444;          /* Ошибка, доверие - */
  --radar-info: #06B6D4;           /* Информация */
}
```

### Semantic Colors

```css
:root {
  /* Trust Balance Scale */
  --trust-negative: #EF4444;       /* -100 to -50 */
  --trust-neutral: #6B7280;        /* -50 to +50 */
  --trust-positive: #10B981;       /* +50 to +100 */
  
  /* Circles */
  --circle-support: #8B5CF6;       /* Support circle */
  --circle-productivity: #2563EB; /* Productivity circle */
  --circle-development: #06B6D4;   /* Development circle */
  
  /* Archetypes */
  --archetype-peach: #F472B6;      /* Peach (US/Canada) */
  --archetype-pomegranate: #DC2626;/* Pomegranate (RF/East) */
  --archetype-apple: #059669;      /* Apple (EU) */
}
```

### Surface Colors (OLED-optimized)

```css
:root {
  /* Background */
  --radar-bg: #000000;             /* Pure black for OLED */
  --radar-surface: #0A0A0A;        /* Cards, modals */
  --radar-surface-elevated: #141414; /* Elevated elements */
  
  /* Text */
  --radar-text-primary: #FFFFFF;   /* Main text */
  --radar-text-secondary: #9CA3AF; /* Secondary text */
  --radar-text-tertiary: #6B7280;  /* Disabled, hints */
  
  /* Borders */
  --radar-border: #1F1F1F;         /* Subtle borders */
  --radar-border-focus: #2563EB;   /* Focus rings */
}
```

### Light Mode Support (Future)

```css
@media (prefers-color-scheme: light) {
  :root {
    --radar-bg: #FFFFFF;
    --radar-surface: #F9FAFB;
    --radar-surface-elevated: #FFFFFF;
    --radar-text-primary: #111827;
    --radar-text-secondary: #6B7280;
    --radar-border: #E5E7EB;
  }
}
```

---

## 1.2 Типографика

### Font Stack

```css
:root {
  /* Primary: Inter for UI */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Secondary: JetBrains Mono for code/data */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Russian: Stroy UI fallback */
  --font-cyrillic: 'Stroy UI', 'Inter Cyr', sans-serif;
}
```

### Type Scale

```css
:root {
  /* Display */
  --text-5xl: 3rem;      /* 48px - Hero titles */
  --text-4xl: 2.25rem;   /* 36px - Page titles */
  --text-3xl: 1.875rem;  /* 30px - Section headers */
  
  /* Headings */
  --text-2xl: 1.5rem;    /* 24px - Card titles */
  --text-xl: 1.25rem;    /* 20px - Subsections */
  --text-lg: 1.125rem;   /* 18px - Important text */
  
  /* Body */
  --text-base: 1rem;     /* 16px - Main text */
  --text-sm: 0.875rem;   /* 14px - Secondary text */
  --text-xs: 0.75rem;    /* 12px - Captions */
  
  /* Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Usage

```tsx
// Headings
<h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)' }}>
  Заголовок страницы
</h1>

// Subheadings
<h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)' }}>
  Подзаголовок
</h2>

// Body text
<p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-normal)' }}>
  Основной текст
</p>

// Secondary text
<span style={{ fontSize: 'var(--text-sm)', color: 'var(--radar-text-secondary)' }}>
  Вторичный текст
</span>

// Captions
<span style={{ fontSize: 'var(--text-xs)', color: 'var(--radar-text-tertiary)' }}>
  Подписи, даты
</span>
```

---

## 1.3 Spacing System

```css
:root {
  /* Base unit: 4px */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Safe Area

```css
:root {
  /* iOS safe areas */
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
}
```

---

## 1.4 Компоненты

### Button

```tsx
// Primary Button
<button style={{
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-3) var(--space-6)',
  fontSize: 'var(--text-base)',
  fontWeight: 'var(--font-medium)',
  backgroundColor: 'var(--radar-primary)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  minHeight: '44px', // Touch target
}}>
  Primary Action
</button>

// Variants
const buttonVariants = {
  primary: {
    bg: 'var(--radar-primary)',
    color: '#FFFFFF',
  },
  secondary: {
    bg: 'transparent',
    color: 'var(--radar-primary)',
    border: '1px solid var(--radar-primary)',
  },
  ghost: {
    bg: 'transparent',
    color: 'var(--radar-text-secondary)',
  },
  danger: {
    bg: 'var(--radar-error)',
    color: '#FFFFFF',
  },
};
```

### Card

```tsx
// Business Card
<div style={{
  backgroundColor: 'var(--radar-surface)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-6)',
  border: '1px solid var(--radar-border)',
}}>
  {/* Content */}
</div>

// Contact Card
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-4)',
  padding: 'var(--space-4)',
  backgroundColor: 'var(--radar-surface)',
  borderRadius: 'var(--radius-lg)',
  minHeight: '72px', // Touch target
}}>
  <Avatar />
  <Info />
  <Actions />
</div>
```

### Input

```tsx
// Text Input
<input 
  style={{
    width: '100%',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--text-base)',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--radar-text-primary)',
    minHeight: '44px',
  }}
  placeholder="Введите текст..."
/>
```

### Badge

```tsx
// Circle Badge
<span style={{
  display: 'inline-flex',
  alignItems: 'center',
  padding: 'var(--space-1) var(--space-2)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  backgroundColor: 'var(--circle-support)',
  color: '#FFFFFF',
  borderRadius: 'var(--radius-full)',
}}>
  Support
</span>

// Trust Badge
<span style={{
  color: 'var(--trust-positive)',
  fontWeight: 'var(--font-bold)',
}}>
  +75
</span>
```

---

## 1.5 Layout

### Page Structure

```
┌─────────────────────────────────────────┐
│           Status Bar (Safe Area)        │  var(--safe-area-inset-top)
├─────────────────────────────────────────┤
│                                          │
│              Page Header                 │  padding: var(--space-4)
│                                          │
├─────────────────────────────────────────┤
│                                          │
│                                          │
│            Scrollable Content            │  flex: 1, overflow-y: auto
│            (with padding)                │  padding: var(--space-4)
│                                          │  padding-bottom: 80px
│                                          │  (account for bottom nav)
│                                          │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│            Bottom Navigation             │  position: fixed, bottom: 0
│            (Fixed, 64px)                  │  height: 64px
│                                          │  padding-bottom: var(--safe-area-inset-bottom)
└─────────────────────────────────────────┘
```

### Breakpoints

```css
/* Mobile first (default) */
:root {
  --breakpoint-sm: 640px;   /* Large phones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
}

/* Usage */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

---

## 1.6 Icons

### Icon Set

Используем **Lucide React** (MIT license, consistent design)

```tsx
import { 
  Home, 
  Users, 
  QrCode, 
  User, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Plus,
  Search,
  Bell,
  Shield,
  TrendingUp,
  Calendar,
  MessageCircle,
} from 'lucide-react';
```

### Icon Usage

```tsx
// Navigation icons (24px)
<BottomNav.Item icon={Home} label="Главная" to="/" />
<BottomNav.Item icon={Users} label="Контакты" to="/contacts" />
<BottomNav.Item icon={QrCode} label="Визитка" to="/qr-exchange" />
<BottomNav.Item icon={User} label="Профиль" to="/profile" />

// Action icons (20px)
<button style={{ padding: 8 }}>
  <Plus size={20} />
</button>

// Status icons (16px)
<span style={{ color: 'var(--radar-success)' }}>
  <Shield size={16} />
</span>
```

---

## 1.7 Animation

### Transitions

```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Usage

```tsx
// Button hover
<button style={{
  transition: 'background-color var(--transition-fast)',
}}>
  Hover me
</button>

// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
```

---

## 1.8 Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(37, 99, 235, 0.3);
}
```

---

## 1.9 Border Radius

```css
:root {
  --radius-sm: 0.25rem;    /* 4px - Small elements */
  --radius-md: 0.5rem;      /* 8px - Buttons, inputs */
  --radius-lg: 0.75rem;     /* 12px - Cards */
  --radius-xl: 1rem;        /* 16px - Modals */
  --radius-2xl: 1.5rem;     /* 24px - Large cards */
  --radius-full: 9999px;     /* Pills, avatars */
}
```

---

## 1.10 Touch Targets

### Minimum Size

```css
:root {
  /* Minimum touch target */
  --touch-target-min: 44px;
  
  /* Recommended spacing */
  --touch-spacing: 8px;
}
```

### Interactive Elements

```tsx
// Button
<button style={{
  minWidth: 'var(--touch-target-min)',
  minHeight: 'var(--touch-target-min)',
}}>

// List item
<div style={{
  minHeight: 'var(--touch-target-min)',
  padding: 'var(--space-3) var(--space-4)',
}}>

// Icon button
<button style={{
  width: 'var(--touch-target-min)',
  height: 'var(--touch-target-min)',
}}>
```

---

## 1.11 Dark Theme (Default)

```css
/* Telegram WebApp handles theming */
:root {
  color-scheme: dark;
}

/* Or explicit dark mode */
[data-theme="dark"] {
  /* Already defined above with dark values */
}

/* Light mode (future) */
[data-theme="light"] {
  /* Light values */
}
```

---

## 1.12 Accessibility

### Color Contrast

```css
/* WCAG AA compliant */
:root {
  /* Text on background */
  --contrast-text-primary: #FFFFFF on #000000;  /* ✓ 21:1 */
  --contrast-text-secondary: #9CA3AF on #000000; /* ✓ 7.5:1 */
  
  /* Interactive elements */
  --contrast-interactive: #FFFFFF on #2563EB;   /* ✓ 5.9:1 */
}
```

### Focus States

```css
/* Visible focus ring */
button:focus-visible {
  outline: 2px solid var(--radar-primary);
  outline-offset: 2px;
}
```

---

## 1.13 Status Bar

```tsx
// Safe area handling
<div style={{
  paddingTop: 'var(--safe-area-inset-top)',
  paddingBottom: 'var(--safe-area-inset-bottom)',
}}>
  {/* Content */}
</div>

// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
```

---

## 1.14 Loading States

```tsx
// Skeleton
<div style={{
  background: 'linear-gradient(90deg, var(--radar-surface) 25%, var(--radar-surface-elevated) 50%, var(--radar-surface) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 'var(--radius-md)',
  height: '100px',
}} />

// Spinner
<ActivityIndicator size="large" color="var(--radar-primary)" />
```

---

## 1.15 Toast Notifications

```tsx
// Success
<div style={{
  position: 'fixed',
  bottom: 'calc(80px + var(--safe-area-inset-bottom) + var(--space-4))',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: 'var(--space-3) var(--space-6)',
  backgroundColor: 'var(--radar-success)',
  color: '#FFFFFF',
  borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-medium)',
}}>
  Успешно!
</div>
```

---

*Документ обновлён: 2026-05-06*
*Дизайн-система для RADAR Telegram Mini App*
