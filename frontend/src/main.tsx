import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react';
import App from './App.tsx'
import './index.css'

window.onerror = (msg, url, line, col, error) => {
  console.error('Global error:', msg, 'at', line, ':', col);
  return false;
};

window.onunhandledrejection = (e) => {
  console.error('Unhandled rejection:', e);
};

const loadTelegramWebApp = () => {
  if (typeof window !== 'undefined' && !(window as any).Telegram?.WebApp) {
    console.log('Loading Telegram WebApp script...');
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = () => {
      console.log('Telegram WebApp script loaded');
    };
    script.onerror = () => {
      console.warn('Telegram WebApp script failed to load');
      if (!(window as any).Telegram?.WebApp?.initData) {
        console.warn('Setting fallback Telegram WebApp');
        (window as any).Telegram = { 
          WebApp: { 
            ready: () => console.log('TG ready (fallback)'), 
            expand: () => console.log('TG expand (fallback)'), 
            initData: 'fallback_mode', 
            initDataUnsafe: {} 
          } 
        };
      }
    };
    document.head.appendChild(script);
  } else {
    console.log('Telegram WebApp already available');
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

console.log('RADAR app starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
