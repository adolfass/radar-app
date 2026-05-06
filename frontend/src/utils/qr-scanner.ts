export interface ScanResult {
  data: string;
  type: 'radar' | 'vcard' | 'url' | 'text';
  parsed?: Record<string, string>;
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
      onSuccess({ data: result.data, type: 'radar' });
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

export interface QRScanType {
  type: 'radar' | 'vcard' | 'url' | 'text';
  data: string;
  parsed?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    company?: string;
    position?: string;
    website?: string;
    telegram?: string;
    linkedin?: string;
  };
}

export const detectQrType = (data: string): QRScanType => {
  // RADAR contact format
  if (data.includes('start=contact_')) {
    const match = data.match(/start=contact_(\d+)/);
    if (match) {
      return { type: 'radar', data, parsed: { fullName: match[1] } };
    }
  }

  // vCard format
  if (data.startsWith('BEGIN:VCARD')) {
    const parsed = parseVCard(data);
    return { type: 'vcard', data, parsed };
  }

  // meCard format
  if (data.startsWith('MECARD:')) {
    const parsed = parseMeCard(data);
    return { type: 'vcard', data, parsed };
  }

  // URL format
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return { type: 'url', data };
  }

  // Plain text
  return { type: 'text', data };
};

const parseVCard = (data: string): QRScanType['parsed'] => {
  const result: QRScanType['parsed'] = {};
  
  const fnMatch = data.match(/FN:(.+)/);
  if (fnMatch) result.fullName = fnMatch[1].trim();
  
  const firstMatch = data.match(/N:([^;]*);([^;]*)/);
  if (firstMatch) {
    result.lastName = firstMatch[1].trim();
    result.firstName = firstMatch[2].trim();
  }
  
  const orgMatch = data.match(/ORG:(.+)/);
  if (orgMatch) result.company = orgMatch[1].trim();
  
  const titleMatch = data.match(/TITLE:(.+)/);
  if (titleMatch) result.position = titleMatch[1].trim();
  
  const telMatch = data.match(/TEL[^:]*:(.+)/);
  if (telMatch) result.phone = telMatch[1].trim();
  
  const emailMatch = data.match(/EMAIL[^:]*:(.+)/);
  if (emailMatch) result.email = emailMatch[1].trim();
  
  const urlMatch = data.match(/URL:(.+)/);
  if (urlMatch) result.website = urlMatch[1].trim();
  
  const tgMatch = data.match(/(?:TG:|Telegram:)(.+)/);
  if (tgMatch) result.telegram = tgMatch[1].trim();
  
  const liMatch = data.match(/X-SOCIALPROFILE;type=linkedin:(.+)/i);
  if (liMatch) result.linkedin = liMatch[1].trim();

  return result;
};

const parseMeCard = (data: string): QRScanType['parsed'] => {
  const result: QRScanType['parsed'] = {};
  
  const nameMatch = data.match(/N:(.+?);/);
  if (nameMatch) result.fullName = nameMatch[1].trim();
  
  const orgMatch = data.match(/ORG:(.+?);/);
  if (orgMatch) result.company = orgMatch[1].trim();
  
  const telMatch = data.match(/TEL:(.+?);/);
  if (telMatch) result.phone = telMatch[1].trim();
  
  const emailMatch = data.match(/EMAIL:(.+?);/);
  if (emailMatch) result.email = emailMatch[1].trim();
  
  const urlMatch = data.match(/URL:(.+?);/);
  if (urlMatch) result.website = urlMatch[1].trim();

  return result;
};

export const createContactFromScan = (
  type: QRScanType,
  navigate: (path: string) => void,
  userId?: number
) => {
  if (type.type === 'radar') {
    const match = type.data.match(/start=contact_(\d+)/);
    if (match) {
      navigate(`/scan-confirm/${match[1]}`);
      return true;
    }
  }
  
  // For non-RADAR, navigate to BusinessCardForm with pre-filled data
  const params = new URLSearchParams();
  
  if (type.parsed?.fullName) params.set('fullName', type.parsed.fullName);
  if (type.parsed?.firstName) params.set('firstName', type.parsed.firstName);
  if (type.parsed?.lastName) params.set('lastName', type.parsed.lastName);
  if (type.parsed?.company) params.set('businessName', type.parsed.company);
  if (type.parsed?.position) params.set('position', type.parsed.position);
  if (type.parsed?.phone) params.set('phone', type.parsed.phone);
  if (type.parsed?.email) params.set('email', type.parsed.email);
  if (type.parsed?.website) params.set('website', type.parsed.website);
  if (type.parsed?.telegram) params.set('telegram', type.parsed.telegram);
  if (type.parsed?.linkedin) params.set('linkedin', type.parsed.linkedin);
  if (type.type === 'url') params.set('website', type.data);
  if (type.type === 'text') params.set('notes', type.data);
  
  navigate(`/business-card/new?${params.toString()}`);
  return true;
};
