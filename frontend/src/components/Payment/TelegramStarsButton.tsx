import { useState } from 'react';
import { api } from '../../lib/api';

interface TelegramStarsButtonProps {
  plan: 'premium_monthly' | 'premium_yearly';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function TelegramStarsButton({ plan, onSuccess, onError }: TelegramStarsButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/stars/create-invoice', { plan });
      const { invoiceLink } = res.data;

      if (invoiceLink && window.Telegram?.WebApp) {
        window.Telegram.WebApp.openInvoice(invoiceLink);
        onSuccess?.();
      } else {
        window.open(invoiceLink, '_blank');
        onSuccess?.();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Ошибка при создании платежа';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        width: '100%',
        padding: '14px',
        backgroundColor: loading ? '#666' : '#0088cc',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: loading ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      {loading ? 'Загрузка...' : '⭐ Купить за Stars'}
    </button>
  );
}