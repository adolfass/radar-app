import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { MainScreen } from './pages/MainScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { BusinessCardForm } from './pages/BusinessCardForm';
import { CardDetail } from './pages/CardDetail';
import { EventsScreen } from './pages/EventsScreen';
import { ContactsScreen } from './pages/ContactsScreen';
import { AdminPanel } from './pages/AdminPanel';
import { LoadingScreen } from './components/LoadingScreen';

function TelegramRequired() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'var(--tg-theme-text-color, #000000)',
        marginBottom: '12px',
      }}>
        Откройте в Telegram
      </h2>
      <p style={{
        fontSize: '16px',
        color: 'var(--tg-theme-hint-color, #999999)',
        lineHeight: '1.5',
      }}>
        Откройте бота @radar_test_bot и нажмите "Открыть приложение"
      </p>
    </div>
  );
}

function AuthError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#ff3b30',
        marginBottom: '12px',
      }}>
        Ошибка авторизации
      </h2>
      <p style={{
        fontSize: '13px',
        color: 'var(--tg-theme-text-color, #000000)',
        lineHeight: '1.5',
        marginBottom: '20px',
        wordBreak: 'break-word',
        maxWidth: '300px',
      }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
          color: 'var(--tg-theme-button-text-color, #ffffff)',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        Попробовать снова
      </button>
    </div>
  );
}

function DebugInfo({ initData }: { initData: string | null }) {
  if (!initData) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      fontSize: '10px',
      color: 'var(--tg-theme-hint-color, #999)',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '8px',
      borderRadius: '4px',
      maxWidth: '200px',
      zIndex: 9999,
    }}>
      initData: {initData ? 'OK (' + initData.length + ' chars)' : 'empty'}
    </div>
  );
}

function AppContent() {
  const { user, loading, initAuth, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [telegramInitData, setTelegramInitData] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [wasLoggedIn, setWasLoggedIn] = useState(false);

  useEffect(() => {
    // Проверяем запущено ли приложение в Telegram
    const tg = (window as any).Telegram?.WebApp;
    console.log('[App] Telegram WebApp:', !!tg);
    console.log('[App] Telegram initData:', tg?.initData ? 'present (' + tg.initData.length + ')' : 'empty');
    
    const isTgApp = !!(tg && tg.initData && tg.initData !== '');
    setIsTelegram(isTgApp);
    
    if (isTgApp && tg.initData) {
      setTelegramInitData(tg.initData);
      tg.ready();
      tg.expand();
      
      // Обрабатываем startapp параметр для глубоких ссылок
      const startParam = tg.initDataUnsafe?.start_param || new URLSearchParams(window.location.search).get('startapp');
      if (startParam) {
        console.log('[App] startapp parameter:', startParam);
        // Навигация будет выполнена после авторизации
        sessionStorage.setItem('startapp_param', startParam);
      }
    }
  }, []);

  useEffect(() => {
    // Навигация после авторизации, если есть startapp параметр
    if (user) {
      const startParam = sessionStorage.getItem('startapp_param');
      if (startParam) {
        sessionStorage.removeItem('startapp_param');
        console.log('[App] Navigating to card:', startParam);
        navigate(`/card/${startParam}`);
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    // Отслеживаем состояние входа/выхода
    if (user) {
      setWasLoggedIn(true);
    }
    if (wasLoggedIn && !user && !loading) {
      // Пользователь вышел - перезагружаем страницу
      window.location.reload();
    }
  }, [user, loading, wasLoggedIn]);

  useEffect(() => {
    if (telegramInitData && !user && !authAttempted) {
      setAuthAttempted(true);
      initAuth(telegramInitData);
    }
  }, [telegramInitData, user, authAttempted, initAuth]);

  // Если не Telegram - показываем сообщение
  if (!loading && !isTelegram && !user) {
    return <TelegramRequired />;
  }

  // Если ошибка авторизации - показываем ошибку
  if (error && !user && authAttempted) {
    return (
      <>
        <AuthError 
          message={error} 
          onRetry={() => {
            clearError();
            setAuthAttempted(false);
            if (telegramInitData) {
              setTimeout(() => initAuth(telegramInitData), 100);
            }
          }} 
        />
        <DebugInfo initData={telegramInitData} />
      </>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  // Если нет пользователя но и нет ошибки - показываем загрузку
  if (!user) {
    return (
      <>
        <LoadingScreen />
        <DebugInfo initData={telegramInitData} />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/card/new" element={<BusinessCardForm />} />
        <Route path="/card/:id/edit" element={<BusinessCardForm />} />
        <Route path="/card/:contactId" element={<CardDetail />} />
        <Route path="/events" element={<EventsScreen />} />
        <Route path="/contacts" element={<ContactsScreen />} />
        <Route path="/admin" element={user?.isOrganizer ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>
      <DebugInfo initData={telegramInitData} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
