import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useViewStore, ViewMode, VIEW_LABELS, VIEW_ICONS } from '../store/viewStore';
import { RadarView } from '../components/views/RadarView';
import { MatrixView } from '../components/views/MatrixView';
import { TimelineView } from '../components/views/TimelineView';
import { SunburstView } from '../components/views/SunburstView';
import { CULTURAL_ARCHETYPES } from '../theme/culturalColors';

export function DashboardRadar() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { viewMode, setViewMode } = useViewStore();
  const [contacts, setContacts] = useState<any[]>([]);
  const [bqg, setBqg] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNetworkViz, setShowNetworkViz] = useState(false);

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
  const contactLimit = subscription?.plan === 'premium' ? Infinity : 100;
  const isOverLimit = totalContacts > contactLimit;
  const isPremium = subscription?.plan === 'premium' && subscription?.isActive;
  const hasTrial = !!subscription?.trialEnd;

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Загрузка...</p>
      </div>
    );
  }

  const viewModes: ViewMode[] = ['radar', 'matrix', 'timeline', 'sunburst'];

  const renderView = () => {
    switch (viewMode) {
      case 'radar':
        return <RadarView contacts={contacts} />;
      case 'matrix':
        return <MatrixView contacts={contacts} />;
      case 'timeline':
        return <TimelineView contacts={contacts} />;
      case 'sunburst':
        return <SunburstView contacts={contacts} />;
      case 'graph':
        return (
          <div style={styles.graphPlaceholder}>
            <button 
              onClick={() => navigate('/graph')}
              style={styles.graphLink}
            >
              🕸️ Открыть интерактивный граф сети
            </button>
          </div>
        );
      default:
        return <RadarView contacts={contacts} />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + var(--radar-safe-bottom))' }}>
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

      {/* Network Visualization Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Анализ сети</h2>
          <button
            onClick={() => setShowNetworkViz(!showNetworkViz)}
            style={styles.sectionToggle}
          >
            {showNetworkViz ? 'Скрыть' : 'Показать'}
          </button>
        </div>

        {showNetworkViz && (
          <>
            {/* View Switcher */}
            <div style={styles.viewSwitcher}>
              {viewModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    ...styles.viewBtn,
                    ...(viewMode === mode ? styles.viewBtnActive : {}),
                  }}
                >
                  <span style={styles.viewIcon}>{VIEW_ICONS[mode]}</span>
                  <span style={styles.viewLabel}>{VIEW_LABELS[mode]}</span>
                </button>
              ))}
            </div>

            {/* View Content */}
            <div style={styles.viewContent}>
              {renderView()}
            </div>
          </>
        )}

        {!showNetworkViz && (
          <div style={styles.vizPreview} onClick={() => setShowNetworkViz(true)}>
            <span style={styles.vizIcon}>🎯</span>
            <span>Нажмите для анализа сети</span>
            <span style={styles.vizArrow}>→</span>
          </div>
        )}
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

      {/* Cultural Archetypes Legend */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Культурные архетипы</h2>
        <div style={styles.archetypeGrid}>
          {Object.entries(CULTURAL_ARCHETYPES).map(([key, val]) => (
            <div key={key} style={styles.archetypeCard}>
              <div
                style={{
                  ...styles.archetypeDot,
                  backgroundColor: val.color,
                  boxShadow: `0 0 8px ${val.glow}`,
                }}
              />
              <span style={styles.archetypeLabel}>{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Quick Links */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Аналитика</h2>
        <div style={styles.analyticsGrid}>
          <button onClick={() => navigate('/insights')} style={styles.analyticsCard}>
            <span style={styles.analyticsIcon}>📊</span>
            <span style={styles.analyticsLabel}>Инсайты</span>
          </button>
          <button onClick={() => navigate('/graph')} style={styles.analyticsCard}>
            <span style={styles.analyticsIcon}>🕸️</span>
            <span style={styles.analyticsLabel}>Граф сети</span>
          </button>
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
      <div style={styles.section}>
        <div style={{
          ...styles.planBadge,
          backgroundColor: isPremium ? 'rgba(251, 191, 36, 0.15)' : 'var(--radar-surface-elevated)',
          border: isPremium ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid var(--radar-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{isPremium ? '⭐' : hasTrial ? '⏳' : '👤'}</span>
            <div>
              <span style={styles.planText}>
                {isPremium ? 'Premium' : hasTrial ? 'Пробный период' : 'Free'}
              </span>
              {isPremium && subscription?.expiresAt && (
                <span style={styles.planExpiry}>
                  · {Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} дн.
                </span>
              )}
            </div>
          </div>
          {!isPremium && (
            <span style={styles.planLimit}>
              {totalContacts}/{contactLimit} контактов
            </span>
          )}
        </div>

        {/* Premium CTA for free users */}
        {!isPremium && !hasTrial && (
          <button
            onClick={() => navigate('/subscription')}
            style={styles.upgradeBtn}
          >
            Попробовать Premium бесплатно
          </button>
        )}

        {isOverLimit && (
          <button
            onClick={() => navigate('/subscription')}
            style={styles.upgradeBtn}
          >
            ⭐ Перейти на Premium — безлимит
          </button>
        )}
      </div>

      {/* Premium-locked features for free users */}
      {!isPremium && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Доступно в Premium</h2>
          <div style={styles.premiumFeaturesGrid}>
            <button onClick={() => navigate('/subscription')} style={styles.premiumFeatureCard}>
              <span style={styles.premiumFeatureIcon}>🤖</span>
              <span style={styles.premiumFeatureLabel}>AI-классификация ролей</span>
              <span style={styles.premiumFeatureLock}>🔒</span>
            </button>
            <button onClick={() => navigate('/subscription')} style={styles.premiumFeatureCard}>
              <span style={styles.premiumFeatureIcon}>⚖️</span>
              <span style={styles.premiumFeatureLabel}>Баланс доверия</span>
              <span style={styles.premiumFeatureLock}>🔒</span>
            </button>
            <button onClick={() => navigate('/subscription')} style={styles.premiumFeatureCard}>
              <span style={styles.premiumFeatureIcon}>🔄</span>
              <span style={styles.premiumFeatureLabel}>Авто-ротация сети</span>
              <span style={styles.premiumFeatureLock}>🔒</span>
            </button>
            <button onClick={() => navigate('/subscription')} style={styles.premiumFeatureCard}>
              <span style={styles.premiumFeatureIcon}>📥</span>
              <span style={styles.premiumFeatureLabel}>Экспорт отчётов</span>
              <span style={styles.premiumFeatureLock}>🔒</span>
            </button>
          </div>
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
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'},
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
  sectionToggle: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px',
    cursor: 'pointer',
  },
  sectionLink: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px',
  },
  viewSwitcher: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  viewBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 16px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    cursor: 'pointer',
    minWidth: '70px',
  },
  viewBtnActive: {
    backgroundColor: 'var(--radar-accent)',
    borderColor: 'var(--radar-accent)',
  },
  viewIcon: {
    fontSize: '20px',
  },
  viewLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'var(--radar-text-secondary)',
  },
  viewContent: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  graphPlaceholder: {
    padding: '24px',
    textAlign: 'center',
  },
  graphLink: {
    padding: '16px 24px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  vizPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    cursor: 'pointer',
    color: 'var(--radar-text-secondary)',
    fontSize: '14px',
  },
  vizIcon: {
    fontSize: '24px',
  },
  vizArrow: {
    fontSize: '18px',
    color: 'var(--radar-accent)',
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
  archetypeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  archetypeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '10px',
  },
  archetypeDot: {
    width: '14px',
    height: '14px',
    borderRadius: '7px',
    flexShrink: 0,
  },
  archetypeLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--radar-text)',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  analyticsCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  analyticsIcon: {
    fontSize: '28px',
  },
  analyticsLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--radar-text)',
  },
  planExpiry: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
  premiumFeaturesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  premiumFeatureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
  },
  premiumFeatureIcon: {
    fontSize: '28px',
  },
  premiumFeatureLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--radar-text)',
    textAlign: 'center',
  },
  premiumFeatureLock: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '14px',
  },
};
