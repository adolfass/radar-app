import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { startNativeScanner, parseQrData } from '../utils/qr-scanner';
import { QRCodeSVG as QRCode } from 'qrcode.react';

const BOT_USERNAME = 'radar_strateg_space_bot';

export function QRExchange() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    setLoading(false);
  }, []);

  const deeplinkUrl = user?.id 
    ? `https://t.me/${BOT_USERNAME}?start=contact_${user.id}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deeplinkUrl);
      setSuccess('Ссылка скопирована!');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Не удалось скопировать');
    }
  };

  const handleScanContact = async () => {
    setError('');
    try {
      await startNativeScanner(
        (result) => {
          const parsed = parseQrData(result.data);
          if (parsed) {
            navigate(`/scan-confirm/${parsed.userId}`);
          } else {
            setError('Неверный QR-код. Используйте визитку RADAR.');
          }
        },
        (err) => {
          if (err !== 'Сканирование отменено') {
            setError(err);
          }
        }
      );
    } catch (err: any) {
      setError(err.message || 'Ошибка сканирования');
    }
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Назад
        </button>
        <h1 style={styles.title}>Обмен визиткой</h1>
      </header>

      {/* Success message */}
      {success && (
        <div style={styles.successToast}>{success}</div>
      )}

      {/* Error message */}
      {error && (
        <div style={styles.errorToast}>{error}</div>
      )}

      {/* Give Card Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📤 Дать визитку отсканировать</h2>
        
        {deeplinkUrl && (
          <>
            <div style={styles.qrContainer}>
              <QRCode 
                value={deeplinkUrl} 
                size={220}
                level="M"
                includeMargin={false}
              />
            </div>

            <div style={styles.linkContainer}>
              <p style={styles.linkLabel}>Ссылка-визитка:</p>
              <div style={styles.linkRow}>
                <input 
                  type="text" 
                  value={deeplinkUrl} 
                  readOnly 
                  style={styles.linkInput}
                />
                <button onClick={handleCopyLink} style={styles.copyBtn}>
                  📋
                </button>
              </div>
            </div>

            <p style={styles.hint}>
              Покажи этот QR-код собеседнику для сканирования
            </p>
          </>
        )}
      </section>

      {/* Divider */}
      <div style={styles.divider}>
        <span style={styles.dividerText}>или</span>
      </div>

      {/* Scan Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📷 Отсканировать визитку собеседника</h2>
        
        <button onClick={handleScanContact} style={styles.scanBtn}>
          <span style={styles.scanIcon}>📷</span>
          <span>Запустить сканер</span>
        </button>
        
        <p style={styles.hint}>
          Наведите камеру на QR-код визитки собеседника
        </p>
      </section>

      {/* Instructions */}
      <div style={styles.instruction}>
        <p style={styles.instructionTitle}>Как это работает:</p>
        <ol style={styles.instructionList}>
          <li>Покажи свой QR-код — собеседник сканирует и видит твою визитку</li>
          <li>Отсканируй QR-код собеседника — его визитка добавится в твою сеть</li>
          <li>Также работает ссылка — можно отправить в чат</li>
        </ol>
      </div>
    </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column'},
  loadingText: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    paddingTop: '100px',
  },
  header: {
    marginBottom: '24px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '16px',
    fontWeight: '600',
    padding: '8px 0',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--radar-text)',
  },
  successToast: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    border: '1px solid rgba(48, 209, 88, 0.3)',
    color: '#30d158',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  errorToast: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    border: '1px solid rgba(255, 59, 48, 0.3)',
    color: '#ff3b30',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    color: 'var(--radar-text)',
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
  },
  linkContainer: {
    marginBottom: '12px',
  },
  linkLabel: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '8px',
  },
  linkRow: {
    display: 'flex',
    gap: '8px',
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    color: 'var(--radar-text)',
    fontSize: '13px',
  },
  copyBtn: {
    padding: '10px 14px',
    backgroundColor: 'var(--radar-accent)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    cursor: 'pointer',
  },
  hint: {
    fontSize: '13px',
    color: 'var(--radar-text-tertiary)',
    textAlign: 'center',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerText: {
    margin: '0 auto',
    padding: '0 16px',
    backgroundColor: 'var(--radar-bg)',
    color: 'var(--radar-text-tertiary)',
    fontSize: '14px',
  },
  scanBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '18px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '12px',
  },
  scanIcon: {
    fontSize: '22px',
  },
  instruction: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
  },
  instructionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--radar-text)',
    marginBottom: '12px',
  },
  instructionList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
    lineHeight: '1.6',
  },
};