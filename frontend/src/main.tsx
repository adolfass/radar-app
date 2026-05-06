import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react';
import App from './App.tsx'
import './index.css'

const loadTelegramWebApp = () => {
  if (typeof window !== 'undefined' && !(window as any).Telegram?.WebApp) {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onerror = () => {
      console.warn('Telegram WebApp script failed to load, using fallback');
      (window as any).Telegram = { WebApp: { ready: () => {}, expand: () => {}, initData: '', initDataUnsafe: {} } };
    };
    document.head.appendChild(script);
  }
};

loadTelegramWebApp();

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
