import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const ROLE_ICONS: Record<string, string> = {
  connector: '🔗',
  bridge: '🌉',
  gatekeeper: '🚪',
  condensator: '⚡',
};

const ROLE_LABELS: Record<string, string> = {
  connector: 'Коннектор',
  bridge: 'Мост',
  gatekeeper: 'Привратник',
  condensator: 'Конденсатор',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  connector: 'Связывает людей внутри сети',
  bridge: 'Связывает вашу сеть с внешними',
  gatekeeper: 'Контролирует доступ к ресурсам',
  condensator: 'Собирает и концентрирует информацию',
};

export function BQGPlanner() {
  const navigate = useNavigate();
  const [currentBQG, setCurrentBQG] = useState<any>(null);
  const [bqgHistory, setBqgHistory] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newQuarterStart, setNewQuarterStart] = useState('');
  const [newQuarterEnd, setNewQuarterEnd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentRes, allRes, contactsRes] = await Promise.allSettled([
        api.get('/bqg/current'),
        api.get('/bqg'),
        api.get('/contacts'),
      ]);

      if (currentRes.status === 'fulfilled') setCurrentBQG(currentRes.value.data);
      if (allRes.status === 'fulfilled') setBqgHistory(allRes.value.data);
      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value.data);
    } catch (err) {
      console.error('Failed to load BQG:', err);
    } finally {
      setLoading(false);
    }
  };

  const networkAnalysis = useMemo(() => {
    const roles = { connector: 0, bridge: 0, gatekeeper: 0, condensator: 0 };
    const circles = { support: 0, productivity: 0, development: 0 };

    contacts.forEach((c: any) => {
      if (c.roles && Array.isArray(c.roles)) {
        c.roles.forEach((r: string) => {
          if (roles[r as keyof typeof roles] !== undefined) {
            roles[r as keyof typeof roles]++;
          }
        });
      }
      if (c.circle && circles[c.circle as keyof typeof circles] !== undefined) {
        circles[c.circle as keyof typeof circles]++;
      }
    });

    const missingRoles: string[] = [];
    if (roles.connector === 0) missingRoles.push('connector');
    if (roles.bridge === 0) missingRoles.push('bridge');
    if (roles.gatekeeper === 0) missingRoles.push('gatekeeper');
    if (roles.condensator === 0) missingRoles.push('condensator');

    const idealRoles = { connector: 2, bridge: 2, gatekeeper: 1, condensator: 1 };
    const gaps = Object.entries(idealRoles).map(([role, ideal]) => ({
      role,
      current: roles[role as keyof typeof roles],
      ideal,
      gap: Math.max(0, ideal - roles[role as keyof typeof roles]),
    }));

    return { roles, circles, missingRoles, gaps };
  }, [contacts]);

  const quarterProgress = useMemo(() => {
    if (!currentBQG?.quarterStart || !currentBQG?.quarterEnd) return null;

    const start = new Date(currentBQG.quarterStart).getTime();
    const end = new Date(currentBQG.quarterEnd).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    return { percent, daysLeft, isExpired: now > end };
  }, [currentBQG]);

  const handleCreate = async () => {
    if (!newGoal || !newQuarterStart || !newQuarterEnd) return;

    try {
      await api.post('/bqg', {
        goal: newGoal,
        quarterStart: newQuarterStart,
        quarterEnd: newQuarterEnd,
        missingRoles: networkAnalysis.missingRoles.join(', '),
      });
      setShowForm(false);
      setNewGoal('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleAddMissingRole = (role: string) => {
    navigate('/contacts?role=' + role);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>🎯 BQG — Боевая Группировка</h1>
      </header>

      <div style={styles.info}>
        <p style={styles.infoText}>
          BQG определяет недостающие роли в твоей сети для достижения квартальной цели.
          Каждая роль выполняет уникальную функцию в сетевой структуре.
        </p>
      </div>

      {/* Network Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{contacts.length}</span>
          <span style={styles.statLabel}>Контактов</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{networkAnalysis.missingRoles.length}</span>
          <span style={styles.statLabel}>Не хватает ролей</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: networkAnalysis.circles.support < 3 ? 'var(--radar-warning)' : 'var(--radar-success)' }}>
            {networkAnalysis.circles.support}
          </span>
          <span style={styles.statLabel}>Support</span>
        </div>
        <div style={styles.statCard}>
          <span style={{ ...styles.statValue, color: networkAnalysis.circles.development < 10 ? 'var(--radar-warning)' : 'var(--radar-success)' }}>
            {networkAnalysis.circles.development}
          </span>
          <span style={styles.statLabel}>Развитие</span>
        </div>
      </div>

      {/* Role Gaps Analysis */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🔍 Анализ ролей</h2>
        <div style={styles.rolesGrid}>
          {['connector', 'bridge', 'gatekeeper', 'condensator'].map((role) => {
            const analysis = networkAnalysis.gaps.find((g) => g.role === role);
            const count = analysis?.current || 0;
            const ideal = analysis?.ideal || 0;
            const isMissing = count === 0;
            const isLow = count < ideal;

            return (
              <div
                key={role}
                style={{
                  ...styles.roleCard,
                  borderColor: isMissing ? 'var(--radar-warning)' : isLow ? 'var(--radar-accent)' : 'var(--radar-success)',
                  backgroundColor: isMissing ? 'rgba(245, 158, 11, 0.1)' : 'var(--radar-surface)',
                }}
              >
                <div style={styles.roleHeader}>
                  <span style={styles.roleIcon}>{ROLE_ICONS[role]}</span>
                  <span style={styles.roleName}>{ROLE_LABELS[role]}</span>
                </div>
                <p style={styles.roleDesc}>{ROLE_DESCRIPTIONS[role]}</p>
                <div style={styles.roleProgress}>
                  <div style={styles.roleProgressBar}>
                    <div
                      style={{
                        ...styles.roleProgressFill,
                        width: `${(count / ideal) * 100}%`,
                        backgroundColor: isMissing ? 'var(--radar-warning)' : 'var(--radar-success)',
                      }}
                    />
                  </div>
                  <span style={styles.roleCount}>{count}/{ideal}</span>
                </div>
                {isMissing && (
                  <button
                    onClick={() => handleAddMissingRole(role)}
                    style={styles.roleActionBtn}
                  >
                    Найти {ROLE_LABELS[role].toLowerCase()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current BQG */}
      {currentBQG && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📅 Текущий квартал</h2>
          <div style={styles.bqgCard}>
            <div style={styles.bqgHeader}>
              <h3 style={styles.bqgGoal}>{currentBQG.goal}</h3>
              {currentBQG.isActive && (
                <span style={styles.activeBadge}>Активен</span>
              )}
            </div>
            <p style={styles.bqgDates}>
              {new Date(currentBQG.quarterStart).toLocaleDateString('ru-RU')} — {new Date(currentBQG.quarterEnd).toLocaleDateString('ru-RU')}
            </p>

            {/* Progress bar */}
            {quarterProgress && (
              <div style={styles.progressSection}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>
                    {quarterProgress.isExpired ? 'Квартал завершён' : `Осталось ${quarterProgress.daysLeft} дней`}
                  </span>
                  <span style={styles.progressPercent}>{Math.round(quarterProgress.percent)}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${quarterProgress.percent}%`,
                      backgroundColor: quarterProgress.isExpired ? 'var(--radar-text-tertiary)' : 'var(--radar-accent)',
                    }}
                  />
                </div>
              </div>
            )}

            {currentBQG.missingRoles && (
              <div style={styles.missingRolesBox}>
                <span style={styles.missingLabel}>Целевые роли:</span>
                <div style={styles.missingRolesList}>
                  {currentBQG.missingRoles.split(',').map((r: string, i: number) => (
                    <span key={i} style={styles.missingRoleTag}>
                      {ROLE_ICONS[r.trim()] || '•'} {ROLE_LABELS[r.trim()] || r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create New */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={styles.createBtn}>
          + Новый квартал
        </button>
      ) : (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>Новый BQG</h3>
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            style={styles.input}
            placeholder="Цель квартала (например: выйти на 50 контактов)"
          />
          <div style={styles.dateInputs}>
            <div style={styles.dateField}>
              <label style={styles.dateLabel}>Начало</label>
              <input
                type="datetime-local"
                value={newQuarterStart}
                onChange={(e) => setNewQuarterStart(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.dateField}>
              <label style={styles.dateLabel}>Конец</label>
              <input
                type="datetime-local"
                value={newQuarterEnd}
                onChange={(e) => setNewQuarterEnd(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
          {networkAnalysis.missingRoles.length > 0 && (
            <div style={styles.autoRoles}>
              <span style={styles.autoRolesLabel}>Автоматически добавлены роли:</span>
              <div style={styles.autoRolesList}>
                {networkAnalysis.missingRoles.map((r) => (
                  <span key={r} style={styles.autoRoleTag}>
                    {ROLE_ICONS[r]} {ROLE_LABELS[r]}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={styles.formActions}>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Отмена</button>
            <button onClick={handleCreate} style={styles.submitBtn}>Создать</button>
          </div>
        </div>
      )}

      {/* History */}
      {bqgHistory.filter((b) => !b.isActive).length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📜 Архив</h2>
          {bqgHistory.filter((b) => !b.isActive).map((bqg) => (
            <div key={bqg.id} style={styles.historyItem}>
              <p style={styles.historyGoal}>{bqg.goal}</p>
              <p style={styles.historyDates}>
                {new Date(bqg.quarterStart).toLocaleDateString('ru-RU')} — {new Date(bqg.quarterEnd).toLocaleDateString('ru-RU')}
              </p>
              {bqg.missingRoles && (
                <div style={styles.historyRoles}>
                  {bqg.missingRoles.split(',').map((r: string, i: number) => (
                    <span key={i} style={styles.historyRoleTag}>{r.trim()}</span>
                  ))}
                </div>
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
  loadingText: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    paddingTop: '100px',
  },
  header: { marginBottom: '20px' },
  backBtn: {
    background: 'none', border: 'none', color: 'var(--radar-accent)',
    fontSize: '16px', fontWeight: '600', padding: '8px 0', marginBottom: '8px',
  },
  title: { fontSize: '24px', fontWeight: '700' },
  info: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px', marginBottom: '20px',
  },
  infoText: { fontSize: '14px', color: 'var(--radar-text-secondary)', lineHeight: '1.5' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '12px' },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
  },
  statValue: { fontSize: '22px', fontWeight: '700', color: 'var(--radar-text)' },
  statLabel: { fontSize: '10px', color: 'var(--radar-text-secondary)', marginTop: '4px' },

  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  roleCard: {
    border: '2px solid var(--radar-border)',
    borderRadius: '14px',
    padding: '14px',
  },
  roleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  roleIcon: { fontSize: '20px' },
  roleName: { fontSize: '15px', fontWeight: '700', color: 'var(--radar-text)' },
  roleDesc: { fontSize: '11px', color: 'var(--radar-text-secondary)', marginBottom: '10px', lineHeight: '1.4' },
  roleProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  roleProgressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  roleProgressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  roleCount: { fontSize: '12px', fontWeight: '600', color: 'var(--radar-text-secondary)' },
  roleActionBtn: {
    width: '100%',
    marginTop: '10px',
    padding: '8px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  bqgCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
  },
  bqgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  bqgGoal: { fontSize: '18px', fontWeight: '600', flex: 1 },
  activeBadge: {
    backgroundColor: 'var(--radar-success)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '600',
  },
  bqgDates: { fontSize: '14px', color: 'var(--radar-text-secondary)', marginBottom: '16px' },

  progressSection: { marginBottom: '16px' },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  progressLabel: { fontSize: '12px', color: 'var(--radar-text-secondary)' },
  progressPercent: { fontSize: '12px', fontWeight: '600', color: 'var(--radar-accent)' },
  progressBar: {
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

  missingRolesBox: { marginTop: '12px' },
  missingLabel: { fontSize: '12px', color: 'var(--radar-text-secondary)', marginBottom: '8px' },
  missingRolesList: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  missingRoleTag: {
    backgroundColor: 'var(--radar-surface-elevated)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--radar-text)',
  },

  createBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  form: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '24px',
  },
  formTitle: { fontSize: '18px', fontWeight: '700' },
  input: {
    padding: '12px',
    backgroundColor: 'var(--radar-surface-elevated)',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    color: 'var(--radar-text)',
    fontSize: '14px',
  },
  dateInputs: { display: 'flex', gap: '12px' },
  dateField: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  dateLabel: { fontSize: '12px', color: 'var(--radar-text-secondary)' },
  autoRoles: { marginTop: '4px' },
  autoRolesLabel: { fontSize: '12px', color: 'var(--radar-text-secondary)', marginBottom: '8px' },
  autoRolesList: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  autoRoleTag: {
    backgroundColor: 'var(--radar-accent-secondary)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#fff',
  },
  formActions: { display: 'flex', gap: '12px', marginTop: '8px' },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'var(--radar-surface-elevated)',
    color: 'var(--radar-text)',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  historyItem: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
  },
  historyGoal: { fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
  historyDates: { fontSize: '13px', color: 'var(--radar-text-secondary)', marginBottom: '8px' },
  historyRoles: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  historyRoleTag: {
    backgroundColor: 'var(--radar-surface-elevated)',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'var(--radar-text-secondary)',
  },
};