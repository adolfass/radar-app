import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from '../utils/dateUtils';

interface Contact {
  id: number;
  firstName: string;
  lastName?: string;
  circle: 'support' | 'productivity' | 'development';
  role?: string;
  archetype?: string;
  lastInteraction?: string | null;
  trustBalance?: number;
}

interface TimelineViewProps {
  contacts: Contact[];
  onContactSelect?: (contact: Contact) => void;
}

function getFreshnessColor(lastInteraction: string | null | undefined): string {
  if (!lastInteraction) return '#EF4444';
  const days = differenceInDays(new Date(), new Date(lastInteraction));
  if (days <= 30) return '#10B981';
  if (days <= 90) return '#F59E0B';
  if (days <= 180) return '#F97316';
  return '#EF4444';
}

function getFreshnessLabel(days: number): string {
  if (days <= 30) return 'Активен';
  if (days <= 90) return 'Нужна связь';
  if (days <= 180) return 'Риск';
  return 'Заморожен';
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export function TimelineView({ contacts, onContactSelect }: TimelineViewProps) {
  const navigate = useNavigate();

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const dateA = a.lastInteraction ? new Date(a.lastInteraction).getTime() : 0;
      const dateB = b.lastInteraction ? new Date(b.lastInteraction).getTime() : 0;
      return dateB - dateA;
    });
  }, [contacts]);

  const byMonth = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    
    sortedContacts.forEach(contact => {
      if (!contact.lastInteraction) {
        const key = 'Без даты';
        if (!groups[key]) groups[key] = [];
        groups[key].push(contact);
      } else {
        const date = new Date(contact.lastInteraction);
        const key = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(contact);
      }
    });

    return groups;
  }, [sortedContacts]);

  const handleContactClick = (contact: Contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
    } else {
      navigate(`/contacts/${contact.id}`);
    }
  };

  const handleAction = (contact: Contact, action: string) => {
    console.log(`Action ${action} for contact ${contact.id}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.timeline}>
        {Object.entries(byMonth).map(([month, monthContacts]) => (
          <div key={month} style={styles.monthGroup}>
            <div style={styles.monthHeader}>{month}</div>
            <div style={styles.contactsList}>
              {monthContacts.map(contact => {
                const days = contact.lastInteraction 
                  ? differenceInDays(new Date(), new Date(contact.lastInteraction))
                  : 999;
                const color = getFreshnessColor(contact.lastInteraction);
                
                return (
                  <div 
                    key={contact.id} 
                    style={styles.contactCard}
                    onClick={() => handleContactClick(contact)}
                  >
                    <div style={{ ...styles.freshnessIndicator, backgroundColor: color }} />
                    <div style={styles.contactInfo}>
                      <div style={styles.contactName}>
                        {contact.firstName} {contact.lastName || ''}
                      </div>
                      <div style={styles.contactMeta}>
                        <span style={{ color }}>{getFreshnessLabel(days)}</span>
                        <span style={styles.dot}>·</span>
                        <span>{contact.circle === 'support' ? 'Поддержка' : 
                               contact.circle === 'productivity' ? 'Продуктивность' : 'Развитие'}</span>
                      </div>
                    </div>
                    <div style={styles.actions}>
                      <button 
                        style={styles.actionBtn}
                        onClick={(e) => { e.stopPropagation(); handleAction(contact, 'message'); }}
                      >
                        ✉️
                      </button>
                      <button 
                        style={styles.actionBtn}
                        onClick={(e) => { e.stopPropagation(); handleAction(contact, 'archive'); }}
                      >
                        📦
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#10B981' }} />
          <span>Активен (&lt;30д)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#F59E0B' }} />
          <span>Нужна связь (30-90д)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: '#EF4444' }} />
          <span>Заморожен (&gt;180д)</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    paddingBottom: '80px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  monthGroup: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  monthHeader: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--radar-text-primary)',
    borderBottom: '1px solid var(--radar-border)',
    backgroundColor: 'var(--radar-surface-elevated)',
  },
  contactsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid var(--radar-border)',
    cursor: 'pointer',
    gap: '12px',
  },
  freshnessIndicator: {
    width: '4px',
    height: '40px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--radar-text-primary)',
    marginBottom: '4px',
  },
  contactMeta: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dot: {
    opacity: 0.5,
  },
  actions: {
    display: 'flex',
    gap: '4px',
  },
  actionBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'var(--radar-surface-elevated)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
  },
};
