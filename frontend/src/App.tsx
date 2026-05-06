import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { DashboardRadar } from './pages/DashboardRadar';
import { QRExchange } from './pages/QRExchange';
import { ContactDossier } from './pages/ContactDossier';
import { BQGPlanner } from './pages/BQGPlanner';
import { TrustBalance } from './pages/TrustBalance';
import { ReviewRitual } from './pages/ReviewRitual';
import { MeetingFlow } from './pages/MeetingFlow';
import { ProfileScreen } from './pages/ProfileScreen';
import { BusinessCardForm } from './pages/BusinessCardForm';
import { CardDetail } from './pages/CardDetail';
import { EventsScreen } from './pages/EventsScreen';
import { ContactsScreen } from './pages/ContactsScreen';
import { AdminPanel } from './pages/AdminPanel';
import { SubscriptionScreen } from './pages/SubscriptionScreen';
import { ScanConfirm } from './pages/ScanConfirm';
import { ReferralScreen } from './pages/ReferralScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { BottomNav } from './components/BottomNav';
import { NavigatorScreen } from './components/Navigator/NavigatorScreen';

const NetworkInsights = lazy(() => import('./pages/NetworkInsights').then(m => ({ default: m.NetworkInsights })));
const NetworkGraph = lazy(() => import('./pages/NetworkGraph').then(m => ({ default: m.NetworkGraph })));

function TelegramRequired() {
  return (
    <div style={styles.center}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
      <h2 style={styles.centerTitle}>Откройте в Telegram</h2>
      <p style={styles.centerText}>
        Откройте бота @radar_strateg_bot и нажмите "Открыть приложение"
      </p>
    </div>
  );
}

const SPECIAL_COMMANDS = ['qr', 'contacts', 'meetings', 'profile', 'settings', 'navigator'];

function AppContent() {
  const { user, loading, initAuth, error, clearError, validateToken, token } = useAuth();
  const navigate = useNavigate();
  const [telegramInitData, setTelegramInitData] = useState<string | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [authAttempted, setAuthAttempted] = useState(false);

  useEffect(() => {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initData?: string; initDataUnsafe?: { start_param?: string } } } }).Telegram?.WebApp;
    const isTgApp = !!(tg && tg.initData && tg.initData !== '');
    setIsTelegram(isTgApp);

    if (isTgApp && tg.initData) {
      setTelegramInitData(tg.initData);
      tg.ready();
      tg.expand();
      
      const tgStartParam = tg.initDataUnsafe?.start_param;
      if (tgStartParam) {
        sessionStorage.setItem('startapp_param', tgStartParam);
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const startFromUrl = urlParams.get('start') || urlParams.get('startapp');
    if (startFromUrl && !sessionStorage.getItem('startapp_param')) {
      sessionStorage.setItem('startapp_param', startFromUrl);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const startParam = sessionStorage.getItem('startapp_param');
      if (startParam) {
        sessionStorage.removeItem('startapp_param');
        
        if (startParam.startsWith('contact_')) {
          const userId = startParam.replace('contact_', '');
          navigate(`/scan-confirm/${userId}`);
        } else if (SPECIAL_COMMANDS.includes(startParam)) {
          const routeMap: Record<string, string> = {
            qr: '/qr-exchange',
            contacts: '/contacts',
            meetings: '/meetings',
            profile: '/profile',
            settings: '/profile',
            navigator: '/navigator',
          };
          navigate(routeMap[startParam] || '/');
        } else {
          navigate(`/card/${startParam}`);
        }
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (telegramInitData && !user && !authAttempted) {
      setAuthAttempted(true);
      initAuth(telegramInitData);
    }
  }, [telegramInitData, user, authAttempted, initAuth]);

  useEffect(() => {
    if (token && !user && !authAttempted) {
      setAuthAttempted(true);
      validateToken();
    }
  }, [token, user, authAttempted, validateToken]);

  if (!loading && !isTelegram && !user) {
    return <TelegramRequired />;
  }

  if (error && !user && authAttempted) {
    return (
      <div style={styles.center}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ ...styles.centerTitle, color: '#ff3b30' }}>Ошибка авторизации</h2>
        <p style={styles.centerText}>{error}</p>
        <button
          onClick={() => { clearError(); setAuthAttempted(false); if (telegramInitData) setTimeout(() => initAuth(telegramInitData), 100); }}
          style={styles.retryBtn}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return <AppRoutes />;
}

const mainNavPaths = ['/', '/qr-exchange', '/meetings', '/contacts', '/navigator', '/profile'];

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const showBottomNav = mainNavPaths.includes(location.pathname) ;

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardRadar />} />
        <Route path="/qr-exchange" element={<QRExchange />} />
        <Route path="/contacts/:id" element={<ContactDossier />} />
        <Route path="/bqg" element={<BQGPlanner />} />
        <Route path="/trust" element={<TrustBalance />} />
        <Route path="/ritual" element={<ReviewRitual />} />
        <Route path="/meetings" element={<MeetingFlow />} />
        <Route path="/insights" element={<Suspense fallback={<LoadingScreen />}><NetworkInsights /></Suspense>} />
        <Route path="/graph" element={<Suspense fallback={<LoadingScreen />}><NetworkGraph /></Suspense>} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/navigator" element={<NavigatorScreen />} />
        <Route path="/card/new" element={<BusinessCardForm />} />
        <Route path="/card/:id/edit" element={<BusinessCardForm />} />
        <Route path="/card/:contactId" element={<CardDetail />} />
        <Route path="/events" element={<EventsScreen />} />
        <Route path="/contacts" element={<ContactsScreen />} />
        <Route path="/admin" element={user?.isOrganizer ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/subscription" element={<SubscriptionScreen />} />
        <Route path="/scan-confirm/:userId" element={<ScanConfirm />} />
        <Route path="/referral" element={<ReferralScreen />} />
      </Routes>
      {showBottomNav && <BottomNav />}
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

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: 'var(--radar-bg)', padding: '20px', textAlign: 'center',
  },
  centerTitle: { fontSize: '20px', fontWeight: 'bold', color: 'var(--radar-text)', marginBottom: '12px' },
  centerText: { fontSize: '16px', color: 'var(--radar-text-secondary)', lineHeight: '1.5' },
  retryBtn: {
    marginTop: '20px', padding: '12px 24px', backgroundColor: 'var(--radar-accent)',
    color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600',
  },
};
