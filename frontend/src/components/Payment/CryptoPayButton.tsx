import { useState } from 'react';
import { api } from '../../lib/api';

interface CryptoPayButtonProps {
  plan: 'premium_monthly' | 'premium_yearly';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function CryptoPayButton({ plan, onSuccess, onError }: CryptoPayButtonProps) {
  const [loading, setLoading] = useState(false);

  const planLabels: Record<string, { label: string; price: string; period: string }> = {
    premium_monthly: { label: 'Месяц', price: '0.65 USDT', period: '/мес' },
    premium_yearly: { label: 'Год', price: '5.4 USDT', period: '/год' },
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payments/crypto/create-invoice', { plan });
      const { invoice_id, pay_url } = res.data;

      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.openLink(pay_url);
      } else {
        window.open(pay_url, '_blank');
      }

      startPolling(invoice_id);
    } catch (e: any) {
      const message = e.response?.data?.message || 'Ошибка создания платежа';
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/payments/crypto/status/${id}`);
        const { status } = res.data;

        if (status === 'PAID') {
          clearInterval(interval);
          onSuccess?.();
        } else if (status === 'EXPIRED' || status === 'FAILED') {
          clearInterval(interval);
          onError?.(status === 'EXPIRED' ? 'Счёт истёк' : 'Ошибка оплаты');
        }
      } catch {
        clearInterval(interval);
      }
    }, 5000);

    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  const planInfo = planLabels[plan];

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      style={{
        ...styles.button,
        opacity: loading ? 0.7 : 1,
      }}
    >
      <span style={styles.icon}>💎</span>
      <span style={styles.content}>
        <span style={styles.label}>
          {loading ? 'Создаю счёт...' : `Оплатить ${planInfo.label}`}
        </span>
        <span style={styles.price}>
          {planInfo.price}{planInfo.period}
        </span>
      </span>
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  icon: {
    fontSize: '24px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  label: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  },
  price: {
    fontSize: '14px',
    color: '#a5b4fc',
    marginTop: '2px',
  },
};
