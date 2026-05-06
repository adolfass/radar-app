import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const mountedRef = useRef(true);

  const stopScanning = useCallback(() => {
    try {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    } catch (e) {
      console.warn('Error stopping scanner:', e);
    }
    setIsScanning(false);
    setIsLoading(false);
  }, []);

  const startScanning = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      setError('');
      setIsLoading(true);
      setIsScanning(false);
      
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      
      const devices = await codeReader.listVideoInputDevices();
      
      if (!mountedRef.current) return;
      
      if (devices.length === 0) {
        setError('Камера не найдена. Разрешите доступ к камере в настройках.');
        setIsLoading(false);
        return;
      }
      
      const backCamera = devices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('0')
      );
      const deviceId = backCamera?.deviceId || devices[0].deviceId;
      
      setIsLoading(false);
      setIsScanning(true);
      
      await codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err) => {
        if (!mountedRef.current) return;
        
        if (result) {
          try {
            onScan(result.getText());
          } catch (e) {
            console.error('Scan callback error:', e);
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.warn('QR scan error:', err.message);
        }
      });
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('Scanner error:', err);
      
      let errorMessage = 'Ошибка запуска камеры';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Доступ к камере запрещён. Разрешите в настройках браузера.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Камера не найдена на устройстве.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Камера занята другим приложением.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
      setIsScanning(false);
      setIsLoading(false);
    }
  }, [onScan, onError]);

  useEffect(() => {
    mountedRef.current = true;
    
    const timer = setTimeout(() => {
      if (isLoading && mountedRef.current) {
        setError('Камера не отвечает. Попробуйте ещё раз.');
        setIsLoading(false);
      }
    }, 10000);
    
    startScanning();
    
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      stopScanning();
    };
  }, []);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Сканировать QR</h3>
          <button onClick={handleClose} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.videoContainer}>
          <video 
            ref={videoRef} 
            style={styles.video} 
            playsInline 
            muted
            autoPlay
          />
          
          {isLoading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Инициализация камеры...</p>
            </div>
          )}
          
          {error && (
            <div style={styles.errorOverlay}>
              <p style={styles.errorText}>{error}</p>
              <button 
                onClick={startScanning} 
                style={styles.retryBtn}
              >
                Повторить
              </button>
            </div>
          )}
          
          {isScanning && !error && (
            <div style={styles.scanFrame}>
              <div style={styles.cornerTL} />
              <div style={styles.cornerTR} />
              <div style={styles.cornerBL} />
              <div style={styles.cornerBR} />
            </div>
          )}
        </div>
        
        <p style={styles.hint}>
          {isScanning ? 'Наведите камеру на QR-код' : 'Нажмите "Повторить" для сканирования'}
        </p>
      </div>
    </div>
  );
}

const styles = {
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
  videoContainer: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#fff',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '14px',
  },
  errorOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    color: '#fff',
    padding: '24px',
  },
  errorText: {
    textAlign: 'center' as const,
    fontSize: '14px',
    marginBottom: '16px',
    lineHeight: 1.5,
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
  },
  scanFrame: {
    position: 'absolute' as const,
    top: '20%',
    left: '20%',
    right: '20%',
    bottom: '20%',
    border: '2px solid rgba(37, 99, 235, 0.8)',
    borderRadius: '8px',
  },
  cornerTL: {
    position: 'absolute' as const,
    top: -2,
    left: -2,
    width: '20px',
    height: '20px',
    borderTop: '4px solid #2563EB',
    borderLeft: '4px solid #2563EB',
  },
  cornerTR: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    width: '20px',
    height: '20px',
    borderTop: '4px solid #2563EB',
    borderRight: '4px solid #2563EB',
  },
  cornerBL: {
    position: 'absolute' as const,
    bottom: -2,
    left: -2,
    width: '20px',
    height: '20px',
    borderBottom: '4px solid #2563EB',
    borderLeft: '4px solid #2563EB',
  },
  cornerBR: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    width: '20px',
    height: '20px',
    borderBottom: '4px solid #2563EB',
    borderRight: '4px solid #2563EB',
  },
  hint: {
    textAlign: 'center' as const,
    padding: '16px',
    margin: 0,
    color: 'var(--radar-text-secondary, #9CA3AF)',
    fontSize: '14px',
  },
};
