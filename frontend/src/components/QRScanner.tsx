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
  const [error, setError] = useState<string>('');
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;
      
      // Get available cameras
      const devices = await codeReader.listVideoInputDevices();
      if (devices.length === 0) {
        setError('Камера не найдена');
        setIsScanning(false);
        return;
      }
      
      // Prefer back camera
      const backCamera = devices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('0')
      );
      const deviceId = backCamera?.deviceId || devices[0].deviceId;
      
      await codeReader.decodeFromVideoDevice(deviceId, videoRef.current!, (result, err) => {
        if (result) {
          onScan(result.getText());
          stopScanning();
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error('QR scan error:', err);
        }
      });
    } catch (err: any) {
      console.error('Scanner error:', err);
      setError(err.message || 'Ошибка запуска камеры');
      setIsScanning(false);
    }
  }, [onScan]);

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Сканировать QR</h3>
          <button onClick={() => { stopScanning(); onClose(); }} style={styles.closeBtn}>✕</button>
        </div>
        
        <div style={styles.videoContainer}>
          <video ref={videoRef} style={styles.video} playsInline muted />
          {error && <div style={styles.error}>{error}</div>}
        </div>
        
        <p style={styles.hint}>Наведите камеру на QR-код</p>
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
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 9999,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--radar-bg, #fff)',
    borderRadius: '16px',
    overflow: 'hidden' as const,
  },
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid var(--radar-border, #eee)',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    background: 'var(--radar-surface, #f5f5f5)',
    fontSize: '18px',
    cursor: 'pointer',
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
  error: {
    position: 'absolute' as const,
    bottom: '10px',
    left: '10px',
    right: '10px',
    padding: '10px',
    backgroundColor: 'rgba(255,0,0,0.8)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  hint: {
    textAlign: 'center' as const,
    padding: '16px',
    margin: 0,
    color: 'var(--radar-text-secondary, #666)',
    fontSize: '14px',
  },
};
