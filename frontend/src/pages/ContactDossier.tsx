import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  getArchetypeColor,
  getArchetypeLabel,
  getArchetypeHint,
  getArchetypeGlow,
} from '../theme/culturalColors';

export function ContactDossier() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<any>(null);
  const [trustBalance, setTrustBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showTrustLog, setShowTrustLog] = useState(false);
  const [newTrustType, setNewTrustType] = useState('you_helped');
  const [newTrustDesc, setNewTrustDesc] = useState('');
  const [newTrustDelta, setNewTrustDelta] = useState(10);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [contactRes, trustRes] = await Promise.allSettled([
        api.get(`/contacts/${id}`),
        api.get(`/trust/balance/${id}`),
      ]);

      if (contactRes.status === 'fulfilled') setContact(contactRes.value.data);
      if (trustRes.status === 'fulfilled') setTrustBalance(trustRes.value.data.balance || 0);
    } catch (err) {
      console.error('Failed to load contact:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogTrust = async () => {
    try {
      await api.post('/trust/log', {
        contactId: parseInt(id!),
        type: newTrustType,
        description: newTrustDesc,
        balanceDelta: newTrustDelta,
      });
      loadData();
      setNewTrustDesc('');
      setNewTrustDelta(10);
      setShowTrustLog(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const getTrustColor = (balance: number) => {
    if (balance > 30) return 'var(--radar-trust-positive)';
    if (balance < -30) return 'var(--radar-trust-negative)';
    return 'var(--radar-warning)';
  };

  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'support': return 'var(--radar-circle-support)';
      case 'development': return 'var(--radar-circle-development)';
      default: return 'var(--radar-circle-productivity)';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Загрузка...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Контакт не найден</p>
        <button onClick={() => navigate('/contacts')} style={styles.backBtn}>
          ← К контактам
        </button>
      </div>
    );
  }

  const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
  const resources = contact.resources ? JSON.parse(contact.resources) : {};

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate('/contacts')} style={styles.backBtn}>
          ← Назад
        </button>
        <h1 style={styles.title}>Досье контакта</h1>
      </header>

      {/* Contact Info */}
      <div style={styles.section}>
        <h2 style={styles.contactName}>{contact.businessName || 'Без имени'}</h2>
        {personalData.fullName && (
          <p style={styles.contactFullName}>{personalData.fullName}</p>
        )}
        {personalData.position && (
          <p style={styles.contactPosition}>{personalData.position}</p>
        )}

        {/* Circle & Role */}
        <div style={styles.tags}>
          {contact.circle && (
            <span
              style={{
                ...styles.tag,
                backgroundColor: getCircleColor(contact.circle),
              }}
            >
              {contact.circle}
            </span>
          )}
          {contact.aiSuggestedRole && (
            <span style={{ ...styles.tag, backgroundColor: 'var(--radar-accent-secondary)' }}>
              {contact.aiSuggestedRole}
            </span>
          )}
          {contact.archetype && (
            <span
              style={{
                ...styles.tag,
                backgroundColor: getArchetypeColor(contact.archetype),
                boxShadow: `0 0 12px ${getArchetypeGlow(contact.archetype)}`,
              }}
            >
              {getArchetypeLabel(contact.archetype)}
            </span>
          )}
        </div>
      </div>

      {/* Trust Balance */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Баланс доверия</h2>
          <button
            onClick={() => setShowTrustLog(!showTrustLog)}
            style={styles.logBtn}
          >
            {showTrustLog ? 'Закрыть' : '+ Записать'}
          </button>
        </div>

        {/* Visual Scale */}
        <div style={styles.trustScale}>
          <div style={styles.trustBar}>
            <div style={styles.trustTrack}>
              <div
                style={{
                  ...styles.trustIndicator,
                  left: `${((trustBalance + 100) / 200) * 100}%`,
                  backgroundColor: getTrustColor(trustBalance),
                }}
              />
            </div>
            <div style={styles.trustLabels}>
              <span style={styles.trustLabel}>-100</span>
              <span style={styles.trustLabel}>0</span>
              <span style={styles.trustLabel}>+100</span>
        </div>

        {/* Archetype Hint */}
        {contact.archetype && (
          <p style={styles.archetypeHint}>
            💡 {getArchetypeHint(contact.archetype)}
          </p>
        )}
      </div>
          <p style={{
            ...styles.trustValue,
            color: getTrustColor(trustBalance),
          }}>
            {trustBalance > 0 ? '+' : ''}{trustBalance}
          </p>
        </div>

        {/* Trust Log Form */}
        {showTrustLog && (
          <div style={styles.trustForm}>
            <select
              value={newTrustType}
              onChange={(e) => setNewTrustType(e.target.value)}
              style={styles.select}
            >
              <option value="you_helped">Я помог</option>
              <option value="they_helped">Помогли мне</option>
              <option value="mutual">Взаимно</option>
            </select>
            <input
              type="number"
              value={newTrustDelta}
              onChange={(e) => setNewTrustDelta(parseInt(e.target.value) || 0)}
              min={-100}
              max={100}
              style={styles.input}
              placeholder="Дельта (-100..+100)"
            />
            <input
              type="text"
              value={newTrustDesc}
              onChange={(e) => setNewTrustDesc(e.target.value)}
              style={styles.input}
              placeholder="Описание"
            />
            <button onClick={handleLogTrust} style={styles.submitBtn}>
              Записать
            </button>
          </div>
        )}
      </div>

      {/* Contact Details */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Контактные данные</h2>
        <div style={styles.detailsList}>
          {personalData.phone && (
            <a href={`tel:${personalData.phone}`} style={styles.detailItem}>
              <span style={styles.detailIcon}>📞</span>
              <span>{personalData.phone}</span>
            </a>
          )}
          {personalData.email && (
            <a href={`mailto:${personalData.email}`} style={styles.detailItem}>
              <span style={styles.detailIcon}>✉️</span>
              <span>{personalData.email}</span>
            </a>
          )}
          {resources.website && (
            <a href={resources.website} target="_blank" rel="noopener noreferrer" style={styles.detailItem}>
              <span style={styles.detailIcon}>🌐</span>
              <span>Сайт</span>
            </a>
          )}
          {resources.telegram && (
            <a href={`https://t.me/${resources.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={styles.detailItem}>
              <span style={styles.detailIcon}>✈️</span>
              <span>Telegram</span>
            </a>
          )}
        </div>
      </div>

      {/* Last Interaction */}
      {contact.lastInteraction && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Последний контакт</h2>
          <p style={styles.lastInteraction}>
            {new Date(contact.lastInteraction).toLocaleDateString('ru-RU')}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        <button
          onClick={() => navigate(`/card/${contact.contactId}`)}
          style={styles.actionBtn}
        >
          Открыть визитку
        </button>
        <button
          onClick={() => {
            // Delete contact
            if (confirm('Удалить контакт?')) {
              api.delete(`/contacts/${id}`).then(() => navigate('/contacts'));
            }
          }}
          style={styles.deleteBtn}
        >
          Удалить контакт
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
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '16px',
    fontWeight: '600',
    padding: '8px 0',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
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
  contactName: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  contactFullName: {
    fontSize: '16px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '4px',
  },
  contactPosition: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '12px',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tag: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  archetypeHint: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
    fontStyle: 'italic',
    marginTop: '12px',
    padding: '10px 14px',
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '10px',
    borderLeft: '3px solid var(--radar-accent)',
  },
  trustScale: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '20px 16px',
    textAlign: 'center',
  },
  trustBar: {
    marginBottom: '12px',
  },
  trustTrack: {
    position: 'relative',
    height: '8px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  trustIndicator: {
    position: 'absolute',
    top: '-4px',
    width: '16px',
    height: '16px',
    borderRadius: '8px',
    transform: 'translateX(-50%)',
    border: '2px solid var(--radar-bg)',
  },
  trustLabels: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  trustLabel: {
    fontSize: '12px',
    color: 'var(--radar-text-tertiary)',
  },
  trustValue: {
    fontSize: '32px',
    fontWeight: '700',
  },
  logBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px',
  },
  trustForm: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  select: {
    padding: '12px',
    backgroundColor: 'var(--radar-surface-elevated)',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    color: 'var(--radar-text)',
    fontSize: '14px',
  },
  input: {
    padding: '12px',
    backgroundColor: 'var(--radar-surface-elevated)',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    color: 'var(--radar-text)',
    fontSize: '14px',
  },
  submitBtn: {
    padding: '14px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    color: 'var(--radar-text)',
    textDecoration: 'none',
  },
  detailIcon: {
    fontSize: '20px',
  },
  lastInteraction: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px',
  },
  actionBtn: {
    padding: '16px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: '16px',
    backgroundColor: 'transparent',
    color: 'var(--radar-danger)',
    border: '1px solid var(--radar-danger)',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
  },
};
