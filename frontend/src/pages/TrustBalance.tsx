import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface TrustEntry {
  contactId: number;
  balance: number;
  lastInteraction: string;
  contact?: {
    businessName: string;
    personalData?: string;
  };
}

interface TrustHistory {
  id: number;
  type: 'increase' | 'decrease' | 'neutral';
  amount: number;
  reason: string;
  createdAt: string;
  contactId: number;
}

export function TrustBalance() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [topTrusted, setTopTrusted] = useState<TrustEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<TrustEntry | null>(null);
  const [history, setHistory] = useState<TrustHistory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, topRes] = await Promise.allSettled([
        api.get('/contacts'),
        api.get('/trust/top?limit=10'),
      ]);

      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value.data);
      if (topRes.status === 'fulfilled') setTopTrusted(topRes.value.data);
    } catch (err) {
      console.error('Failed to load trust data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (contactId: number) => {
    try {
      const res = await api.get(`/trust/history/${contactId}`);
      setHistory(res.data || []);
    } catch {
      setHistory([]);
    }
  };

  const handleContactSelect = (contact: TrustEntry) => {
    setSelectedContact(contact);
    loadHistory(contact.contactId);
  };

  const getTrustLevel = (balance: number): { label: string; color: string; bg: string } => {
    if (balance >= 50) return { label: 'Доверительный', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' };
    if (balance >= 20) return { label: 'Позитивный', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.15)' };
    if (balance >= -20) return { label: 'Нейтральный', color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' };
    if (balance >= -50) return { label: 'Напряжённый', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' };
    return { label: 'Критический', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  };

  const getScalePosition = (balance: number) => {
    const min = -100;
    const max = 100;
    return Math.max(0, Math.min(100, ((balance - min) / (max - min)) * 100));
  };

  if (loading) {
    return <div style={styles.container}><p style={styles.loadingText}>Загрузка...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + var(--radar-safe-bottom))' }}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>⚖️ Баланс доверия</h1>
      </header>

      {/* Trust Scale Visualization */}
      <div style={styles.scaleContainer}>
        <div style={styles.scaleLabels}>
          <span style={{ ...styles.scaleLabel, color: '#ef4444' }}>Критично</span>
          <span style={{ ...styles.scaleLabel, color: '#f97316' }}>Напряжённо</span>
          <span style={{ ...styles.scaleLabel, color: '#eab308' }}>Нейтрально</span>
          <span style={{ ...styles.scaleLabel, color: '#22c55e' }}>Доверительно</span>
        </div>
        <div style={styles.scaleBar}>
          <div style={styles.scaleTrack}>
            <div style={styles.scaleGradient} />
            <div style={{
              ...styles.scaleMarker,
              left: `${getScalePosition(selectedContact?.balance || 0)}%`,
            }} />
          </div>
          <div style={styles.scaleTicks}>
            <span>-100</span>
            <span>-50</span>
            <span>0</span>
            <span>+50</span>
            <span>+100</span>
          </div>
        </div>
      </div>

      {/* Top Trusted Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🏆 Лидеры доверия</h2>
        {topTrusted.length > 0 ? (
          <div style={styles.topGrid}>
            {topTrusted.slice(0, 5).map((item, idx) => (
              <div
                key={item.contactId}
                style={{
                  ...styles.topCard,
                  borderColor: idx === 0 ? '#fbbf24' : 'var(--radar-border)',
                }}
                onClick={() => handleContactSelect(item)}
              >
                <div style={styles.topRank}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>
                <div style={styles.topInfo}>
                  <p style={styles.topName}>{item.contact?.businessName || 'Контакт'}</p>
                  <span style={{
                    ...styles.topBadge,
                    backgroundColor: getTrustLevel(item.balance).bg,
                    color: getTrustLevel(item.balance).color,
                  }}>
                    {item.balance > 0 ? '+' : ''}{item.balance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>Нет данных о доверии</p>
        )}
      </div>

      {/* All Contacts */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👥 Все контакты</h2>
        {contacts.length === 0 ? (
          <p style={styles.emptyText}>Нет контактов</p>
        ) : (
          <div style={styles.contactsList}>
            {contacts.map((contact) => {
              const trust = contact.trustBalance || 0;
              const level = getTrustLevel(trust);
              return (
                <div
                  key={contact.id}
                  style={styles.contactRow}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                >
                  <div style={styles.contactAvatar}>
                    {(contact as any).photoUrl ? (
                      <img src={(contact as any).photoUrl} alt="" style={styles.avatarImg} />
                    ) : (
                      <span>{(contact.businessName || 'К')[0]}</span>
                    )}
                  </div>
                  <div style={styles.contactInfo}>
                    <p style={styles.contactName}>{contact.businessName || 'Без имени'}</p>
                    <p style={{ ...styles.contactMeta, color: level.color }}>{level.label}</p>
                  </div>
                  <div style={styles.trustSection}>
                    <span style={{
                      ...styles.trustBadge,
                      backgroundColor: level.bg,
                      color: level.color,
                    }}>
                      {trust > 0 ? '+' : ''}{trust}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Contact Detail Modal */}
      {selectedContact && (
        <div style={styles.modal} onClick={() => setSelectedContact(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {selectedContact.contact?.businessName || 'Контакт'}
              </h2>
              <button onClick={() => setSelectedContact(null)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.trustDisplay}>
              <span style={{
                ...styles.bigTrust,
                backgroundColor: getTrustLevel(selectedContact.balance).bg,
                color: getTrustLevel(selectedContact.balance).color,
              }}>
                {selectedContact.balance > 0 ? '+' : ''}{selectedContact.balance}
              </span>
              <span style={{
                ...styles.trustLevelLabel,
                color: getTrustLevel(selectedContact.balance).color,
              }}>
                {getTrustLevel(selectedContact.balance).label}
              </span>
            </div>

            {/* Trust Actions */}
            <div style={styles.trustActions}>
              <button
                style={{ ...styles.trustActionBtn, backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                onClick={async () => {
                  try {
                    await api.post(`/trust/adjust/${selectedContact.contactId}`, { amount: 10, reason: 'Помощь' });
                    loadHistory(selectedContact.contactId);
                    loadData();
                  } catch { alert('Ошибка'); }
                }}
              >
                +10 🤝
              </button>
              <button
                style={{ ...styles.trustActionBtn, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                onClick={async () => {
                  try {
                    await api.post(`/trust/adjust/${selectedContact.contactId}`, { amount: -10, reason: 'Конфликт' });
                    loadHistory(selectedContact.contactId);
                    loadData();
                  } catch { alert('Ошибка'); }
                }}
              >
                -10 ⚠️
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div style={styles.historySection}>
                <h3 style={styles.historyTitle}>📜 История изменений</h3>
                {history.map((entry) => (
                  <div key={entry.id} style={styles.historyRow}>
                    <div style={{
                      ...styles.historyDot,
                      backgroundColor: entry.type === 'increase' ? '#22c55e' : entry.type === 'decrease' ? '#ef4444' : '#eab308',
                    }} />
                    <div style={styles.historyContent}>
                      <span style={styles.historyAmount}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                      </span>
                      <span style={styles.historyReason}>{entry.reason}</span>
                    </div>
                    <span style={styles.historyDate}>
                      {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
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
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '12px' },
  emptyText: { textAlign: 'center', color: 'var(--radar-text-secondary)', padding: '40px' },

  scaleContainer: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '10px',
    fontWeight: '600',
  },
  scaleLabel: { textAlign: 'center', flex: 1 },
  scaleBar: { position: 'relative' },
  scaleTrack: {
    height: '24px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
  },
  scaleGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to right, #ef4444 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #22c55e 100%)',
    opacity: 0.3,
  },
  scaleMarker: {
    position: 'absolute',
    top: '-4px',
    width: '4px',
    height: '32px',
    backgroundColor: '#fff',
    borderRadius: '2px',
    transform: 'translateX(-50%)',
    transition: 'left 0.3s ease',
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
  },
  scaleTicks: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
    fontSize: '10px',
    color: 'var(--radar-text-tertiary)',
  },

  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  topCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    backgroundColor: 'var(--radar-surface)',
    border: '2px solid var(--radar-border)',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  topRank: { fontSize: '20px' },
  topInfo: { flex: 1 },
  topName: { fontSize: '14px', fontWeight: '600', marginBottom: '4px' },
  topBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
  },

  contactsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  contactAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    backgroundColor: 'var(--radar-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '18px',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: '15px', fontWeight: '600', marginBottom: '2px' },
  contactMeta: { fontSize: '12px' },
  trustSection: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  trustBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
  },

  modal: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '400px',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: { fontSize: '20px', fontWeight: '700' },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: 'var(--radar-text-secondary)',
    cursor: 'pointer',
  },
  trustDisplay: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  bigTrust: {
    display: 'inline-block',
    padding: '16px 32px',
    borderRadius: '16px',
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  trustLevelLabel: {
    fontSize: '16px',
    fontWeight: '600',
  },
  trustActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  trustActionBtn: {
    flex: 1,
    padding: '14px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  historySection: { marginTop: '16px' },
  historyTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '12px' },
  historyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid var(--radar-border)',
  },
  historyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  historyContent: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px' },
  historyAmount: { fontSize: '14px', fontWeight: '700', minWidth: '40px' },
  historyReason: { fontSize: '13px', color: 'var(--radar-text-secondary)' },
  historyDate: { fontSize: '12px', color: 'var(--radar-text-tertiary)' },
};