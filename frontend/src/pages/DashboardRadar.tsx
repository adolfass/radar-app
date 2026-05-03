import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function DashboardRadar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<any[]>([]);
  const [bqg, setBqg] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, bqgRes, subRes] = await Promise.allSettled([
        api.get('/contacts'),
        api.get('/bqg/current'),
        api.get('/subscription'),
      ]);

      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value.data);
      if (bqgRes.status === 'fulfilled') setBqg(bqgRes.value.data);
      if (subRes.status === 'fulfilled') setSubscription(subRes.value.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const circles = {
    support: contacts.filter((c: any) => c.circle === 'support').length,
    productivity: contacts.filter((c: any) => c.circle === 'productivity').length,
    development: contacts.filter((c: any) => c.circle === 'development').length,
  };

  const totalContacts = contacts.length;
  const activeContacts = contacts.filter((c: any) => c.isActive).length;
  const contactLimit = subscription?.data?.plan === 'premium' ? Infinity : 100;
  const isOverLimit = totalContacts > contactLimit;

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>RADAR</h1>
            <p style={styles.subtitle}>Стратегический нетворкинг</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            style={styles.profileBtn}
          >
            <div style={styles.avatar}>
              {user?.firstName?.[0] || '?'}
            </div>
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <button
          onClick={() => navigate('/qr-exchange')}
          style={{ ...styles.actionBtn, ...styles.actionBtnPrimary }}
        >
          <span style={styles.actionIcon}>📱</span>
          <span style={styles.actionText}>Обмен визиткой</span>
        </button>
        <button
          onClick={() => navigate('/meetings')}
          style={styles.actionBtn}
        >
          <span style={styles.actionIcon}>🤝</span>
          <span style={styles.actionText}>Встречи</span>
        </button>
        <button
          onClick={() => navigate('/contacts')}
          style={styles.actionBtn}
        >
          <span style={styles.actionIcon}>👥</span>
          <span style={styles.actionText}>Контакты</span>
        </button>
        <button
          onClick={() => navigate('/bqg')}
          style={styles.actionBtn}
        >
          <span style={styles.actionIcon}>🎯</span>
          <span style={styles.actionText}>BQG</span>
        </button>
      </div>

      {/* Network Overview */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Моя сеть</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{totalContacts}</span>
            <span style={styles.statLabel}>Всего контактов</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statValue}>{activeContacts}</span>
            <span style={styles.statLabel}>Активных</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statValue, color: 'var(--radar-circle-support)' }}>{circles.support}</span>
            <span style={styles.statLabel}>Support</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ ...styles.statValue, color: 'var(--radar-circle-productivity)' }}>{circles.productivity}</span>
            <span style={styles.statLabel}>Productivity</span>
          </div>
        </div>

        {/* Circle Progress */}
        <div style={styles.circleProgress}>
          <div style={styles.circleRow}>
            <span style={styles.circleLabel}>Support (3-5)</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min((circles.support / 5) * 100, 100)}%`,
                  backgroundColor: 'var(--radar-circle-support)',
                }}
              />
            </div>
            <span style={styles.circleCount}>{circles.support}/5</span>
          </div>
          <div style={styles.circleRow}>
            <span style={styles.circleLabel}>Productivity (до 75)</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min((circles.productivity / 75) * 100, 100)}%`,
                  backgroundColor: 'var(--radar-circle-productivity)',
                }}
              />
            </div>
            <span style={styles.circleCount}>{circles.productivity}/75</span>
          </div>
          <div style={styles.circleRow}>
            <span style={styles.circleLabel}>Development (~100)</span>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min((circles.development / 100) * 100, 100)}%`,
                  backgroundColor: 'var(--radar-circle-development)',
                }}
              />
            </div>
            <span style={styles.circleCount}>{circles.development}/100</span>
          </div>
        </div>
      </div>

      {/* BQG Status */}
      {bqg && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>BQG — Боевая Группировка</h2>
            <button
              onClick={() => navigate('/bqg')}
              style={styles.sectionLink}
            >
              Подробнее →
            </button>
          </div>
          <div style={styles.bqgCard}>
            <p style={styles.bqgGoal}>{bqg.goal}</p>
            <p style={styles.bqgDates}>
              {new Date(bqg.quarterStart).toLocaleDateString('ru-RU')} — {new Date(bqg.quarterEnd).toLocaleDateString('ru-RU')}
            </p>
            {bqg.missingRoles && (
              <div style={styles.missingRoles}>
                <span style={styles.missingLabel}>Недостающие роли:</span>
                <span style={styles.missingValue}>{bqg.missingRoles}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription Status */}
      {subscription && (
        <div style={styles.section}>
          <div style={{
            ...styles.planBadge,
            backgroundColor: subscription.plan === 'premium' ? 'var(--radar-accent-secondary)' : 'var(--radar-surface-elevated)',
          }}>
            <span style={styles.planText}>
              {subscription.plan === 'premium' ? '⭐ Premium' : 'Free'}
            </span>
            {subscription.plan === 'free' && (
              <span style={styles.planLimit}>
                {totalContacts}/{contactLimit} контактов
              </span>
            )}
          </div>
          {isOverLimit && (
            <button
              onClick={() => navigate('/subscription')}
              style={styles.upgradeBtn}
            >
              Перейти на Premium
            </button>
          )}
        </div>
      )}

      {/* Ritual Reminder */}
      <div style={styles.section}>
        <button
          onClick={() => navigate('/ritual')}
          style={styles.ritualCard}
        >
          <span style={styles.ritualIcon}>🔄</span>
          <div style={styles.ritualContent}>
            <h3 style={styles.ritualTitle}>Ритуал инвентаризации</h3>
            <p style={styles.ritualDesc}>Пересмотр сети, BQG и ролей</p>
          </div>
          <span style={styles.ritualArrow}>→</span>
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--radar-bg)',
    padding: '16px',
    paddingBottom: 'calc(16px + var(--radar-safe-bottom))',
  },
  loadingText: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    paddingTop: '100px',
  },
  header: {
    marginBottom: '24px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    letterSpacing: '2px',
    color: 'var(--radar-accent)',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    marginTop: '4px',
  },
  profileBtn: {
    background: 'none',
    border: 'none',
    padding: '0',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    backgroundColor: 'var(--radar-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  actionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '16px',
    gap: '8px',
  },
  actionBtnPrimary: {
    backgroundColor: 'var(--radar-accent)',
    borderColor: 'var(--radar-accent)',
  },
  actionIcon: {
    fontSize: '28px',
  },
  actionText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--radar-text)',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  sectionLink: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
  },
  statCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--radar-text)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
  circleProgress: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  circleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  circleLabel: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
    width: '120px',
    flexShrink: 0,
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  circleCount: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
    width: '40px',
    textAlign: 'right',
    flexShrink: 0,
  },
  bqgCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
  },
  bqgGoal: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  bqgDates: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '12px',
  },
  missingRoles: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  missingLabel: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
  },
  missingValue: {
    fontSize: '13px',
    color: 'var(--radar-warning)',
    fontWeight: '600',
  },
  planBadge: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
  },
  planText: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--radar-text)',
  },
  planLimit: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
  },
  upgradeBtn: {
    width: '100%',
    marginTop: '12px',
    padding: '14px',
    backgroundColor: 'var(--radar-accent-secondary)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
  },
  ritualCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    textAlign: 'left',
  },
  ritualIcon: {
    fontSize: '32px',
  },
  ritualContent: {
    flex: 1,
  },
  ritualTitle: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  ritualDesc: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
  },
  ritualArrow: {
    fontSize: '20px',
    color: 'var(--radar-text-tertiary)',
  },
};
