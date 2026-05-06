import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuthStore } from '../store/authStore';
import { detectQrType, createContactFromScan, QRScanType } from '../utils/qr-scanner';
import { QRScanner } from '../components/QRScanner';

const BOT_USERNAME = 'radar_strateg_bot';

export function QRExchange() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const deeplinkUrl = user?.id 
    ? `https://t.me/${BOT_USERNAME}?start=contact_${user.id}`
    : '';

  useEffect(() => {
    if (deeplinkUrl && canvasRef.current) {
      QRCode.toDataURL(deeplinkUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error('QR generation error:', err);
      });
    }
  }, [deeplinkUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deeplinkUrl);
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
        <p style={styles.loadingText}>Загрузка...</p>
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
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        <header style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Назад</button>
          <h1 style={styles.title}>Обмен визиткой</h1>
        </header>

        {success && <div style={styles.successToast}>{success}</div>}
        {error && <div style={styles.errorToast}>{error}</div>}

        <div style={styles.qrSection}>
          <div style={styles.qrCard}>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR код" style={styles.qrImage} />
            ) : (
              <div style={styles.qrPlaceholder}>
                <div style={styles.qrLoading}>Генерация QR...</div>
              </div>
            )}
            <p style={styles.qrLabel}>Моя визитка:</p>
            <p style={styles.qrName}>{user?.firstName} {user?.lastName?.[0]}.</p>
            <button onClick={handleCopyLink} style={styles.copyBtn}>📋 Копировать ссылку</button>
          </div>
        </div>

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
  container: { height: '100vh', display: 'flex', flexDirection: 'column' },
  loadingText: { textAlign: 'center', color: 'var(--radar-text-secondary)', paddingTop: '100px' },
  header: { marginBottom: '24px' },
  backBtn: { background: 'none', border: 'none', color: 'var(--radar-accent)', fontSize: '16px', cursor: 'pointer', padding: 0 },
  title: { fontSize: '20px', fontWeight: 700, margin: '8px 0 0 0' },
  successToast: { backgroundColor: '#4CAF50', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  errorToast: { backgroundColor: '#f44336', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  qrSection: { display: 'flex', justifyContent: 'center' },
  qrCard: { backgroundColor: 'var(--radar-surface)', borderRadius: '16px', padding: '24px', textAlign: 'center', width: '100%' },
  qrImage: { width: '200px', height: '200px', margin: '0 auto 16px', display: 'block' },
  qrPlaceholder: { width: '200px', height: '200px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '12px' },
  qrLoading: { color: 'var(--radar-text-secondary)', fontSize: '14px' },
  qrLabel: { color: 'var(--radar-text-secondary)', margin: '0 0 4px 0', fontSize: '14px' },
  qrName: { fontWeight: 700, fontSize: '18px', margin: '0 0 16px 0' },
  copyBtn: { backgroundColor: 'var(--radar-accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', cursor: 'pointer', width: '100%' },
  divider: { display: 'flex', alignItems: 'center', margin: '24px 0', gap: '16px' },
  scanBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%', padding: '18px', backgroundColor: 'var(--radar-accent)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' },
  scanIcon: { fontSize: '22px' },
  hint: { textAlign: 'center', color: 'var(--radar-text-secondary)', marginTop: '12px', fontSize: '14px' },
  instructions: { backgroundColor: 'var(--radar-surface)', borderRadius: '12px', padding: '16px', marginTop: '24px' },
  instructionsTitle: { fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' },
  instructionsList: { margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--radar-text-secondary)', lineHeight: 1.6 },
};
