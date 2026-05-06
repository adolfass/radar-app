import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { detectQrType, createContactFromScan } from '../utils/qr-scanner';
import { QRScanner } from '../components/QRScanner';

export function QRExchange() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [myLink, setMyLink] = useState<string>('');
  const [hasCards, setHasCards] = useState(false);

  useEffect(() => {
    loadMyQRCode();
  }, [user]);

  const loadMyQRCode = async () => {
    try {
      setLoading(true);
      const response = await api.get('/business-cards');
      const cards = response.data;
      
      if (cards && cards.length > 0) {
        setHasCards(true);
        const primaryCard = cards.find((c: any) => c.isPrimary) || cards[0];
        setQrDataUrl(primaryCard.qrCodeDataUrl || '');
        setMyLink(primaryCard.shareLink || '');
        
        if (primaryCard.businessName) {
          setCardName(primaryCard.businessName);
        } else if (primaryCard.personalData) {
          const pd = typeof primaryCard.personalData === 'string' 
            ? JSON.parse(primaryCard.personalData) 
            : primaryCard.personalData;
          setCardName(pd.fullName || `${user?.firstName} ${user?.lastName?.[0]}.`);
        }
      } else {
        setHasCards(false);
        setCardName(`${user?.firstName} ${user?.lastName?.[0]}.`);
      }
    } catch (err: any) {
      console.error('Failed to load QR code:', err);
      setCardName(`${user?.firstName} ${user?.lastName?.[0]}.`);
      setHasCards(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!hasCards || !myLink) {
      setError('Сначала создайте визитку');
      return;
    }
    try {
      await navigator.clipboard.writeText(myLink);
      setSuccess('Ссылка скопирована!');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Не удалось скопировать');
    }
  };

  const handleScanContact = () => {
    setError('');
    setShowScanner(true);
  };

  const handleScanResult = (result: string) => {
    setShowScanner(false);
    const qrType = detectQrType(result);
    if (qrType.type === 'radar') {
      createContactFromScan(qrType, navigate, user?.id);
    } else {
      createContactFromScan(qrType, navigate);
    }
  };

  const handleScanError = (err: string) => {
    if (err !== 'closed') {
      setError(err);
    }
    setShowScanner(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCenter}>
          <p style={styles.loadingText}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {showScanner && (
        <QRScanner
          onScan={handleScanResult}
          onError={handleScanError}
          onClose={() => setShowScanner(false)}
        />
      )}
      
      <div style={styles.content}>
        <header style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Назад</button>
          <h1 style={styles.title}>Обмен визиткой</h1>
        </header>

        {success && <div style={styles.successToast}>{success}</div>}
        {error && <div style={styles.errorToast} onClick={() => setError('')}>{error}</div>}

        {!hasCards ? (
          <div style={styles.noCardSection}>
            <div style={styles.noCardIcon}>📇</div>
            <h2 style={styles.noCardTitle}>У вас пока нет визитки</h2>
            <p style={styles.noCardText}>
              Создайте визитку, чтобы обмениваться контактами с помощью QR-кода
            </p>
            <button 
              onClick={() => navigate('/card/new')} 
              style={styles.createCardBtn}
            >
              + Создать визитку
            </button>
          </div>
        ) : (
          <div style={styles.qrSection}>
            <div style={styles.qrCard}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR код" style={styles.qrImage} />
              ) : (
                <div style={styles.qrPlaceholder}>
                  <span>QR код загружается...</span>
                </div>
              )}
              <p style={styles.qrLabel}>Моя визитка:</p>
              <p style={styles.qrName}>{cardName}</p>
              <button onClick={handleCopyLink} style={styles.copyBtn}>
                📋 Копировать ссылку
              </button>
            </div>
          </div>
        )}

        <div style={styles.divider}>
          <span>или</span>
        </div>

        <button onClick={handleScanContact} style={styles.scanBtn}>
          <span style={styles.scanIcon}>📷</span>
          <span>Отсканировать визитку</span>
        </button>

        <p style={styles.hint}>
          Наведите камеру на QR-код визитки собеседника
        </p>

        <div style={styles.instructions}>
          <h3 style={styles.instructionsTitle}>Как это работает:</h3>
          <ol style={styles.instructionsList}>
            <li>Покажите свой QR-код — собеседник сканирует и видит вашу визитку</li>
            <li>Отсканируйте QR-код собеседника — его визитка добавится в вашу сеть</li>
            <li>Также работает ссылка — можно отправить в чат</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    backgroundColor: 'var(--radar-bg, #000)' 
  },
  content: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: '16px',
    paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
  },
  loadingCenter: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: { 
    textAlign: 'center', 
    color: 'var(--radar-text-secondary, #9CA3AF)' 
  },
  header: { marginBottom: '24px' },
  backBtn: { 
    background: 'none', 
    border: 'none', 
    color: 'var(--radar-accent, #2563EB)', 
    fontSize: '16px', 
    cursor: 'pointer', 
    padding: 0 
  },
  title: { 
    fontSize: '20px', 
    fontWeight: 700, 
    margin: '8px 0 0 0',
    color: 'var(--radar-text-primary, #fff)'
  },
  successToast: { 
    backgroundColor: '#4CAF50', 
    color: '#fff', 
    padding: '12px', 
    borderRadius: '8px', 
    marginBottom: '16px', 
    fontSize: '14px' 
  },
  errorToast: { 
    backgroundColor: '#f44336', 
    color: '#fff', 
    padding: '12px', 
    borderRadius: '8px', 
    marginBottom: '16px', 
    fontSize: '14px',
    cursor: 'pointer'
  },
  noCardSection: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  noCardIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  noCardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 12px 0',
    color: 'var(--radar-text-primary, #fff)'
  },
  noCardText: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary, #9CA3AF)',
    margin: '0 0 24px 0',
    lineHeight: 1.5
  },
  createCardBtn: {
    backgroundColor: 'var(--radar-accent, #2563EB)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: '52px'
  },
  qrSection: { display: 'flex', justifyContent: 'center' },
  qrCard: { 
    backgroundColor: 'var(--radar-surface, #0A0A0A)', 
    borderRadius: '16px', 
    padding: '24px', 
    textAlign: 'center', 
    width: '100%' 
  },
  qrImage: { 
    width: '200px', 
    height: '200px', 
    margin: '0 auto 16px', 
    display: 'block' 
  },
  qrPlaceholder: { 
    width: '200px', 
    height: '200px', 
    margin: '0 auto 16px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#1F1F1F', 
    borderRadius: '12px', 
    color: 'var(--radar-text-secondary, #9CA3AF)', 
    fontSize: '14px' 
  },
  qrLabel: { 
    color: 'var(--radar-text-secondary, #9CA3AF)', 
    margin: '0 0 4px 0', 
    fontSize: '14px' 
  },
  qrName: { 
    fontWeight: 700, 
    fontSize: '18px', 
    margin: '0 0 16px 0',
    color: 'var(--radar-text-primary, #fff)'
  },
  copyBtn: { 
    backgroundColor: 'var(--radar-accent, #2563EB)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    padding: '12px 24px', 
    fontSize: '14px', 
    cursor: 'pointer', 
    width: '100%',
    minHeight: '44px'
  },
  divider: { 
    display: 'flex', 
    alignItems: 'center', 
    margin: '24px 0', 
    gap: '16px' 
  },
  scanBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '12px', 
    width: '100%', 
    padding: '18px', 
    backgroundColor: 'var(--radar-accent, #2563EB)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '16px', 
    fontWeight: 600, 
    cursor: 'pointer',
    minHeight: '52px'
  },
  scanIcon: { fontSize: '22px' },
  hint: { 
    textAlign: 'center', 
    color: 'var(--radar-text-secondary, #9CA3AF)', 
    marginTop: '12px', 
    fontSize: '14px' 
  },
  instructions: { 
    backgroundColor: 'var(--radar-surface, #0A0A0A)', 
    borderRadius: '12px', 
    padding: '16px', 
    marginTop: '24px' 
  },
  instructionsTitle: { 
    fontSize: '14px', 
    fontWeight: 600, 
    margin: '0 0 12px 0',
    color: 'var(--radar-text-primary, #fff)'
  },
  instructionsList: { 
    margin: 0, 
    paddingLeft: '20px', 
    fontSize: '13px', 
    color: 'var(--radar-text-secondary, #9CA3AF)', 
    lineHeight: 1.6 
  },
};
