export interface ScanResult {
  data: string;
}

export const startNativeScanner = async (
  onSuccess: (result: ScanResult) => void,
  onError: (error: string) => void,
): Promise<void> => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg?.scanQrPopup) {
      onError('Сканер QR недоступен');
      return;
    }

    const result = await tg.scanQrPopup({
      text: 'Наведите камеру на QR-код визитки собеседника',
    });

    if (result && result.data) {
      onSuccess({ data: result.data });
    } else {
      onError('QR-код не распознан');
    }
  } catch (err: any) {
    if (err?.error?.includes('cancelled') || err?.error?.includes('closed')) {
      onError('Сканирование отменено');
      return;
    }
    onError(err?.message || 'Ошибка сканирования');
  }
};

export const closeScanner = () => {
  try {
    const tg = (window as any).Telegram?.WebApp;
    tg?.closeScanQrPopup?.();
  } catch {
    // Ignore
  }
};

export const parseQrData = (data: string): { userId: string } | null => {
  const match = data.match(/start=contact_(\d+)/);
  if (match) {
    return { userId: match[1] };
  }
  return null;
};