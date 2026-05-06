import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react';
import App from './App.tsx'
import './index.css'

console.log('[RADAR] Stage 1: Script loaded, checking Telegram.WebApp...')

if (!(window as any).Telegram?.WebApp) {
  console.log('[RADAR] Telegram.WebApp not found, setting fallback')
  (window as any).Telegram = {
    WebApp: {
      ready: () => { console.log('[RADAR] TG ready() called'); },
      expand: () => { console.log('[RADAR] TG expand() called'); },
      initData: '',
      initDataUnsafe: {},
      MainButton: { show: () => {}, hide: () => {}, setText: () => {}, onClick: () => {} },
      BackButton: { show: () => {}, hide: () => {}, onClick: () => {} },
      SettingsButton: { show: () => {}, hide: () => {} },
    }
  };
} else {
  console.log('[RADAR] Telegram.WebApp found:', Object.keys((window as any).Telegram.WebApp))
}

console.log('[RADAR] Stage 2: Initializing Sentry...')

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/radar\.strateg\.space\/api/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE,
});

console.log('[RADAR] Stage 3: Sentry initialized, rendering React...')

window.addEventListener('error', (e) => {
  console.error('[RADAR] Global error:', e.message, 'at', e.filename, ':', e.lineno)
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[RADAR] Unhandled rejection:', e.reason)
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

console.log('[RADAR] Stage 4: React rendered')
