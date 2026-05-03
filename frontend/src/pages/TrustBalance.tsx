import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function TrustBalance() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [topTrusted, setTopTrusted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getTrustColor = (balance: number) => {
    if (balance > 30) return 'var(--radar-trust-positive)';
    if (balance < -30) return 'var(--radar-trust-negative)';
    return 'var(--radar-warning)';
  };

  if (loading) {
    return <div style={styles.container}><p style={styles.loadingText}>Загрузка...</p></div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>Баланс доверия</h1>
      </header>

      {/* Top Trusted */}
      {topTrusted.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Топ доверенных контактов</h2>
          {topTrusted.map((item) => (
            <div
              key={item.contactId}
              style={styles.contactRow}
              onClick={() => navigate(`/contacts/${item.contactId}`)}
            >
              <div style={styles.contactInfo}>
                <p style={styles.contactName}>{item.contact?.businessName || 'Контакт'}</p>
              </div>
              <span style={{
                ...styles.trustBadge,
                backgroundColor: getTrustColor(item.balance),
              }}>
                {item.balance > 0 ? '+' : ''}{item.balance}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* All Contacts with Trust */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Все контакты</h2>
        {contacts.length === 0 ? (
          <p style={styles.emptyText}>Нет контактов</p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              style={styles.contactRow}
              onClick={() => navigate(`/contacts/${contact.id}`)}
            >
              <div style={styles.contactInfo}>
                <p style={styles.contactName}>{contact.businessName || 'Без имени'}</p>
                <p style={styles.contactMeta}>
                  {contact.circle || 'productivity'} • {contact.isActive ? 'активен' : 'архив'}
                </p>
              </div>
              <span style={styles.arrow}>→</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh', backgroundColor: 'var(--radar-bg)',
    padding: '16px', paddingBottom: 'calc(16px + var(--radar-safe-bottom))',
  },
  loadingText: { textAlign: 'center', color: 'var(--radar-text-secondary)', paddingTop: '100px' },
  header: { marginBottom: '24px' },
  backBtn: {
    background: 'none', border: 'none', color: 'var(--radar-accent)',
    fontSize: '16px', fontWeight: '600', padding: '8px 0', marginBottom: '8px',
  },
  title: { fontSize: '24px', fontWeight: '700' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '12px' },
  contactRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px', backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)', borderRadius: '12px', marginBottom: '8px',
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: '16px', fontWeight: '600', marginBottom: '2px' },
  contactMeta: { fontSize: '13px', color: 'var(--radar-text-secondary)', textTransform: 'capitalize' },
  trustBadge: {
    padding: '6px 12px', borderRadius: '16px', fontSize: '14px',
    fontWeight: '700', color: '#fff',
  },
  arrow: { fontSize: '20px', color: 'var(--radar-text-tertiary)' },
  emptyText: { textAlign: 'center', color: 'var(--radar-text-secondary)', padding: '40px' },
};
