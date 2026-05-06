import { useState, useCallback } from 'react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('');

  const startNativeScanner = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg?.scanQrPopup) {
      const errorMsg = 'QR сканер доступен только в мобильном Telegram';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    try {
      tg.scanQrPopup({
        text: 'Наведите камеру на QR-код визитки RADAR',
      }, (result: string | false) => {
        if (result && result.data) {
          onScan(result.data);
        } else if (result === false) {
          onClose();
        }
      });
    } catch (err: any) {
      const errorMsg = err?.message || 'Ошибка сканирования';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  }, [onScan, onError, onClose]);

  const handleClose = () => {
    const tg = (window as any).Telegram?.WebApp;
    try {
      tg?.closeScanQrPopup?.();
    } catch {}
    onClose();
  };

  const handleRetry = () => {
    setError('');
    startNativeScanner();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Сканировать QR</h3>
          <button onClick={handleClose} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.content}>
          {error ? (
            <div style={styles.errorState}>
              <div style={styles.errorIcon}>📷</div>
              <p style={styles.errorText}>{error}</p>
              <button onClick={handleRetry} style={styles.retryBtn}>
                Попробовать снова
              </button>
              <p style={styles.hint}>
                QR сканер работает только в мобильном приложении Telegram
              </p>
            </div>
          ) : (
            <div style={styles.loadingState}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Открываю сканер...</p>
              <button onClick={startNativeScanner} style={styles.openBtn}>
                Открыть сканер
              </button>
            </div>
          )}
        </div>
        
        <p style={styles.footerHint}>
          Наведите камеру на QR-код визитки
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 9999,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--radar-bg, #000)',
    borderRadius: '16px',
    overflow: 'hidden' as const,
    margin: '16px',
  },
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid var(--radar-border, #333)',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--radar-text-primary, #fff)',
  },
  closeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--radar-surface, #333)',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    padding: '32px 16px',
    minHeight: '200px',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center',
  },
  loadingState: {
    textAlign: 'center' as const,
    width: '100%',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.2)',
    borderTopColor: 'var(--radar-accent, #2563EB)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
  loadingText: {
    color: 'var(--radar-text-secondary, #9CA3AF)',
    marginBottom: '16px',
    fontSize: '14px',
  },
  openBtn: {
    padding: '12px 24px',
    backgroundColor: 'var(--radar-accent, #2563EB)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorState: {
    textAlign: 'center' as const,
    width: '100%',
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  errorText: {
    color: 'var(--radar-error, #EF4444)',
    marginBottom: '16px',
    fontSize: '14px',
  },
  retryBtn: {
    padding: '12px 24px',
    backgroundColor: 'var(--radar-accent, #2563EB)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '12px',
  },
  hint: {
    color: 'var(--radar-text-tertiary, #6B7280)',
    fontSize: '12px',
    margin: 0,
  },
  footerHint: {
    textAlign: 'center' as const,
    padding: '16px',
    margin: 0,
    color: 'var(--radar-text-secondary, #9CA3AF)',
    fontSize: '14px',
  },
};
