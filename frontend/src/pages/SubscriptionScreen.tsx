import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { CryptoPayButton, TelegramStarsButton } from '../components/Payment';
import { BottomNav } from '../components/BottomNav';

interface SubscriptionData {
  plan: string;
  isActive: boolean;
  expiresAt: string | null;
  trialEnd: string | null;
}

export function SubscriptionScreen() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const res = await api.get('/subscription');
      setSubscription(res.data);
    } catch (err) {
      console.error('Failed to load subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccess(true);
    loadSubscription();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  const isPremium = subscription?.plan === 'premium' && subscription?.isActive;
  const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <h1 style={styles.title}>Подписка</h1>
      </div>

      <div style={styles.content}>
        {success && (
          <div style={styles.successCard}>
            <span style={styles.successIcon}>✅</span>
            <span style={styles.successText}>Premium активирован!</span>
          </div>
        )}

        <div style={styles.statusCard}>
          <div style={styles.statusHeader}>
            <span style={styles.statusIcon}>{isPremium ? '⭐' : '👤'}</span>
            <span style={styles.statusLabel}>
              {isPremium ? 'Premium' : 'Free'}
            </span>
          </div>
          {isPremium && expiresAt && (
            <div style={styles.statusDetails}>
              <span style={styles.statusDetail}>
                Активна до: {expiresAt.toLocaleDateString('ru-RU')}
              </span>
              <span style={styles.statusDetail}>
                Осталось дней: {daysLeft}
              </span>
            </div>
          )}
          {!isPremium && (
            <div style={styles.statusDetails}>
              <span style={styles.statusDetail}>
                До 100 контактов
              </span>
              <span style={styles.statusDetail}>
                Базовые функции
              </span>
            </div>
          )}
        </div>

        {!isPremium && (
          <>
            <h2 style={styles.sectionTitle}>Выберите план</h2>

            <div style={styles.plansGrid}>
              <div style={styles.planCard}>
                <div style={styles.planHeader}>
                  <span style={styles.planName}>Месяц</span>
                  <span style={styles.planPrice}>99 ⭐</span>
                </div>
                <ul style={styles.planFeatures}>
                  <li>✓ Безлимитные контакты</li>
                  <li>✓ AI классификация</li>
                  <li>✓ Баланс доверия</li>
                  <li>✓ Ритуалы</li>
                  <li>✓ Экспорт</li>
                </ul>
                <TelegramStarsButton
                  plan="premium_monthly"
                  onSuccess={handleSuccess}
                  onError={(err) => alert(err)}
                />
                <div style={styles.altPayment}>
                  или <CryptoPayButton plan="premium_monthly" onSuccess={handleSuccess} onError={(err) => alert(err)} compact />
                </div>
              </div>

              <div style={styles.planCard}>
                <div style={styles.planBadge}>Экономия 30%</div>
                <div style={styles.planHeader}>
                  <span style={styles.planName}>Год</span>
                  <span style={styles.planPrice}>749 ⭐</span>
                </div>
                <ul style={styles.planFeatures}>
                  <li>✓ Все функции месяца</li>
                  <li>✓ Приоритетная поддержка</li>
                  <li>✓ Ранний доступ</li>
                </ul>
                <TelegramStarsButton
                  plan="premium_yearly"
                  onSuccess={handleSuccess}
                  onError={(err) => alert(err)}
                />
                <div style={styles.altPayment}>
                  или <CryptoPayButton plan="premium_yearly" onSuccess={handleSuccess} onError={(err) => alert(err)} compact />
                </div>
              </div>
            </div>

            <p style={styles.disclaimer}>
              Оплата через CryptoBot (USDT-TRC20). После оплаты подписка активируется автоматически.
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column'},
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
    borderBottom: '1px solid var(--radar-border)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '20px',
    padding: '8px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
    marginLeft: '12px',
  },
  content: {
    padding: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    color: 'var(--radar-text-secondary)',
    fontSize: '16px',
  },
  successCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    border: '1px solid rgba(48, 209, 88, 0.3)',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  successIcon: {
    fontSize: '24px',
  },
  successText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#30d158',
  },
  statusCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  statusIcon: {
    fontSize: '32px',
  },
  statusLabel: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
  },
  statusDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statusDetail: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
    marginBottom: '16px',
  },
  plansGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  planCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative',
  },
  planBadge: {
    position: 'absolute',
    top: '-10px',
    right: '16px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  planName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
  },
  planPrice: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--radar-accent)',
  },
  planFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  disclaimer: {
    fontSize: '12px',
    color: 'var(--radar-text-tertiary)',
    textAlign: 'center',
    marginTop: '16px',
  },
  altPayment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
};
