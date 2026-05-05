import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function ReviewRitual() {
  const navigate = useNavigate();
  const [activeRitual, setActiveRitual] = useState<any>(null);
  const [networkHealth, setNetworkHealth] = useState<any>(null);
  const [ritualHistory, setRitualHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    contactsReviewed: 0,
    archived: 0,
    unfrozen: 0,
    newConnections: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activeRes, healthRes, historyRes] = await Promise.allSettled([
        api.get('/ritual/active'),
        api.get('/ritual/health'),
        api.get('/ritual/history'),
      ]);

      if (activeRes.status === 'fulfilled') setActiveRitual(activeRes.value.data);
      if (healthRes.status === 'fulfilled') setNetworkHealth(healthRes.value.data);
      if (historyRes.status === 'fulfilled') setRitualHistory(historyRes.value.data);
    } catch (err) {
      console.error('Failed to load ritual data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRitual = async () => {
    try {
      await api.post('/ritual/start');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleCompleteRitual = async () => {
    if (!activeRitual) return;
    try {
      await api.post(`/ritual/${activeRitual.id}/complete`, { metrics });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  if (loading) {
    return <div style={styles.container}><p style={styles.loadingText}>Загрузка...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + var(--radar-safe-bottom))' }}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>Ритуал инвентаризации</h1>
      </header>

      <div style={styles.info}>
        <p style={styles.infoText}>
          Каждые 6 месяцев проводи полную инвентаризацию сети: пересмотри BQG, оцени роли,
          архивируй «испарившиеся» контакты, разморозь важные связи.
        </p>
      </div>

      {/* Active Ritual */}
      {activeRitual && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Активный ритуал</h2>
          <div style={styles.ritualCard}>
            <p style={styles.ritualStatus}>
              Начат: {new Date(activeRitual.startedAt).toLocaleDateString('ru-RU')}
            </p>
            <div style={styles.metricsForm}>
              <label style={styles.label}>
                Контактов пересмотрено:
                <input
                  type="number"
                  value={metrics.contactsReviewed}
                  onChange={(e) => setMetrics({ ...metrics, contactsReviewed: parseInt(e.target.value) || 0 })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Архивировано:
                <input
                  type="number"
                  value={metrics.archived}
                  onChange={(e) => setMetrics({ ...metrics, archived: parseInt(e.target.value) || 0 })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Разморожено:
                <input
                  type="number"
                  value={metrics.unfrozen}
                  onChange={(e) => setMetrics({ ...metrics, unfrozen: parseInt(e.target.value) || 0 })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                Новых связей:
                <input
                  type="number"
                  value={metrics.newConnections}
                  onChange={(e) => setMetrics({ ...metrics, newConnections: parseInt(e.target.value) || 0 })}
                  style={styles.input}
                />
              </label>
            </div>
            <button onClick={handleCompleteRitual} style={styles.completeBtn}>
              Завершить ритуал
            </button>
          </div>
        </div>
      )}

      {/* Network Health */}
      {networkHealth && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Здоровье сети</h2>
          <div style={styles.healthGrid}>
            <div style={styles.healthCard}>
              <span style={styles.healthValue}>{networkHealth.totalContacts}</span>
              <span style={styles.healthLabel}>Всего</span>
            </div>
            <div style={styles.healthCard}>
              <span style={styles.healthValue}>{networkHealth.activeContacts}</span>
              <span style={styles.healthLabel}>Активных</span>
            </div>
            <div style={styles.healthCard}>
              <span style={{ ...styles.healthValue, color: 'var(--radar-circle-support)' }}>{networkHealth.supportCircle}</span>
              <span style={styles.healthLabel}>Support</span>
            </div>
            <div style={styles.healthCard}>
              <span style={{ ...styles.healthValue, color: 'var(--radar-circle-productivity)' }}>{networkHealth.productivityCircle}</span>
              <span style={styles.healthLabel}>Productivity</span>
            </div>
            <div style={styles.healthCard}>
              <span style={{ ...styles.healthValue, color: 'var(--radar-circle-development)' }}>{networkHealth.developmentCircle}</span>
              <span style={styles.healthLabel}>Development</span>
            </div>
            <div style={styles.healthCard}>
              <span style={styles.healthValue}>{networkHealth.trustBalance}</span>
              <span style={styles.healthLabel}>Баланс доверия</span>
            </div>
          </div>
        </div>
      )}

      {/* Start New */}
      {!activeRitual && (
        <button onClick={handleStartRitual} style={styles.startBtn}>
          🔄 Начать ритуал инвентаризации
        </button>
      )}

      {/* History */}
      {ritualHistory.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>История ритуалов</h2>
          {ritualHistory.map((ritual) => (
            <div key={ritual.id} style={styles.historyItem}>
              <p style={styles.historyDate}>
                {new Date(ritual.startedAt).toLocaleDateString('ru-RU')}
              </p>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: ritual.status === 'completed' ? 'var(--radar-success)' : 'var(--radar-warning)',
              }}>
                {ritual.status === 'completed' ? 'Завершён' : 'В процессе'}
              </span>
              {ritual.metrics && (
                <p style={styles.historyMetrics}>
                  {(() => {
                    try {
                      const m = JSON.parse(ritual.metrics);
                      return `Пересмотрено: ${m.contactsReviewed || 0}, Архивировано: ${m.archived || 0}`;
                    } catch { return ''; }
                  })()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column'},
  loadingText: { textAlign: 'center', color: 'var(--radar-text-secondary)', paddingTop: '100px' },
  header: { marginBottom: '24px' },
  backBtn: {
    background: 'none', border: 'none', color: 'var(--radar-accent)',
    fontSize: '16px', fontWeight: '600', padding: '8px 0', marginBottom: '8px',
  },
  title: { fontSize: '24px', fontWeight: '700' },
  info: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px', marginBottom: '24px',
  },
  infoText: { fontSize: '14px', color: 'var(--radar-text-secondary)', lineHeight: '1.5' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '12px' },
  ritualCard: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px',
  },
  ritualStatus: { fontSize: '14px', color: 'var(--radar-text-secondary)', marginBottom: '16px' },
  metricsForm: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' },
  label: { fontSize: '14px', color: 'var(--radar-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' },
  input: {
    padding: '12px', backgroundColor: 'var(--radar-surface-elevated)',
    border: '1px solid var(--radar-border)', borderRadius: '8px', color: 'var(--radar-text)', fontSize: '14px',
  },
  completeBtn: {
    width: '100%', padding: '16px', backgroundColor: 'var(--radar-success)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
  },
  healthGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  healthCard: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '4px',
  },
  healthValue: { fontSize: '24px', fontWeight: '700', color: 'var(--radar-text)' },
  healthLabel: { fontSize: '11px', color: 'var(--radar-text-secondary)', textAlign: 'center' },
  startBtn: {
    width: '100%', padding: '18px', backgroundColor: 'var(--radar-accent-secondary)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: '700', marginBottom: '24px',
  },
  historyItem: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px', marginBottom: '12px',
  },
  historyDate: { fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
  statusBadge: {
    display: 'inline-block', padding: '4px 10px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '600', color: '#fff',
  },
  historyMetrics: { fontSize: '13px', color: 'var(--radar-text-secondary)', marginTop: '8px' },
};
