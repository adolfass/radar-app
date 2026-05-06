import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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

interface MatrixViewProps {
  contacts: Contact[];
  onContactSelect?: (contact: Contact) => void;
}

type Quadrant = 'stars' | 'bridges' | 'vampires' | 'isolates';

interface QuadrantInfo {
  key: Quadrant;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const QUADRANTS: QuadrantInfo[] = [
  { key: 'stars', label: 'Звёзды', icon: '⭐', color: '#10B981', description: 'Инвестировать' },
  { key: 'bridges', label: 'Мосты', icon: '🌉', color: '#3B82F6', description: 'Активировать' },
  { key: 'vampires', label: 'Вампиры', icon: '🧛', color: '#EF4444', description: 'Лимитировать' },
  { key: 'isolates', label: 'Изоляты', icon: '🧊', color: '#6B7280', description: 'Архивировать' },
];

function classifyContact(contact: Contact): Quadrant {
  const roleScore = contact.role === 'connector' || contact.role === 'gatekeeper' ? 1 : 
                     contact.role === 'bridge' || contact.role === 'condensator' ? 0.5 : 0;
  const trustBalance = contact.trustBalance ?? 50;
  const trustScore = trustBalance >= 60 ? 1 : trustBalance >= 40 ? 0.5 : 0;

  const highValue = roleScore > 0.5;
  const highTrust = trustScore > 0.5;

  if (highValue && highTrust) return 'stars';
  if (highValue && !highTrust) return 'vampires';
  if (!highValue && highTrust) return 'bridges';
  return 'isolates';
}

export function MatrixView({ contacts, onContactSelect }: MatrixViewProps) {
  const navigate = useNavigate();

  const quadrants = useMemo(() => {
    const result: Record<Quadrant, Contact[]> = {
      stars: [],
      bridges: [],
      vampires: [],
      isolates: [],
    };

    contacts.forEach(contact => {
      const quadrant = classifyContact(contact);
      result[quadrant].push(contact);
    });

    return result;
  }, [contacts]);

  const handleContactClick = (contact: Contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
    } else {
      navigate(`/contacts/${contact.id}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.matrixGrid}>
        <div style={styles.axisLabelY}>Доверие →</div>
        <div style={styles.axisLabelX}>Ценность для BQG →</div>
        
        <div style={styles.quadrantContainer}>
          <div style={styles.quadrantRow}>
            <div style={{ ...styles.quadrant, borderColor: QUADRANTS[2].color }}>
              <div style={styles.quadrantHeader}>
                <span style={styles.quadrantIcon}>{QUADRANTS[2].icon}</span>
                <span style={{ ...styles.quadrantLabel, color: QUADRANTS[2].color }}>
                  {QUADRANTS[2].label}
                </span>
                <span style={styles.quadrantDesc}>{QUADRANTS[2].description}</span>
              </div>
              <div style={styles.quadrantContacts}>
                {quadrants.vampires.slice(0, 5).map(contact => (
                  <div 
                    key={contact.id}
                    style={styles.contactChip}
                    onClick={() => handleContactClick(contact)}
                  >
                    {contact.firstName[0]}{contact.lastName?.[0] || ''}
                  </div>
                ))}
                {quadrants.vampires.length > 5 && (
                  <span style={styles.moreChip}>+{quadrants.vampires.length - 5}</span>
                )}
              </div>
            </div>

            <div style={{ ...styles.quadrant, borderColor: QUADRANTS[0].color }}>
              <div style={styles.quadrantHeader}>
                <span style={styles.quadrantIcon}>{QUADRANTS[0].icon}</span>
                <span style={{ ...styles.quadrantLabel, color: QUADRANTS[0].color }}>
                  {QUADRANTS[0].label}
                </span>
                <span style={styles.quadrantDesc}>{QUADRANTS[0].description}</span>
              </div>
              <div style={styles.quadrantContacts}>
                {quadrants.stars.slice(0, 5).map(contact => (
                  <div 
                    key={contact.id}
                    style={{ ...styles.contactChip, borderColor: QUADRANTS[0].color }}
                    onClick={() => handleContactClick(contact)}
                  >
                    {contact.firstName[0]}{contact.lastName?.[0] || ''}
                  </div>
                ))}
                {quadrants.stars.length > 5 && (
                  <span style={styles.moreChip}>+{quadrants.stars.length - 5}</span>
                )}
              </div>
            </div>
          </div>

          <div style={styles.quadrantRow}>
            <div style={{ ...styles.quadrant, borderColor: QUADRANTS[3].color }}>
              <div style={styles.quadrantHeader}>
                <span style={styles.quadrantIcon}>{QUADRANTS[3].icon}</span>
                <span style={{ ...styles.quadrantLabel, color: QUADRANTS[3].color }}>
                  {QUADRANTS[3].label}
                </span>
                <span style={styles.quadrantDesc}>{QUADRANTS[3].description}</span>
              </div>
              <div style={styles.quadrantContacts}>
                {quadrants.isolates.slice(0, 5).map(contact => (
                  <div 
                    key={contact.id}
                    style={{ ...styles.contactChip, borderColor: QUADRANTS[3].color }}
                    onClick={() => handleContactClick(contact)}
                  >
                    {contact.firstName[0]}{contact.lastName?.[0] || ''}
                  </div>
                ))}
                {quadrants.isolates.length > 5 && (
                  <span style={styles.moreChip}>+{quadrants.isolates.length - 5}</span>
                )}
              </div>
            </div>

            <div style={{ ...styles.quadrant, borderColor: QUADRANTS[1].color }}>
              <div style={styles.quadrantHeader}>
                <span style={styles.quadrantIcon}>{QUADRANTS[1].icon}</span>
                <span style={{ ...styles.quadrantLabel, color: QUADRANTS[1].color }}>
                  {QUADRANTS[1].label}
                </span>
                <span style={styles.quadrantDesc}>{QUADRANTS[1].description}</span>
              </div>
              <div style={styles.quadrantContacts}>
                {quadrants.bridges.slice(0, 5).map(contact => (
                  <div 
                    key={contact.id}
                    style={{ ...styles.contactChip, borderColor: QUADRANTS[1].color }}
                    onClick={() => handleContactClick(contact)}
                  >
                    {contact.firstName[0]}{contact.lastName?.[0] || ''}
                  </div>
                ))}
                {quadrants.bridges.length > 5 && (
                  <span style={styles.moreChip}>+{quadrants.bridges.length - 5}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.stats}>
        {QUADRANTS.map(q => (
          <div key={q.key} style={styles.statItem}>
            <span style={{ color: q.color }}>{q.icon}</span>
            <span>{q.label}: {quadrants[q.key].length}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
  },
  matrixGrid: {
    position: 'relative',
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '16px',
    padding: '24px 16px 16px',
  },
  axisLabelY: {
    position: 'absolute',
    left: '-8px',
    top: '50%',
    transform: 'rotate(-90deg) translateX(-50%)',
    transformOrigin: 'center',
    fontSize: '11px',
    color: 'var(--radar-text-tertiary)',
    whiteSpace: 'nowrap',
  },
  axisLabelX: {
    position: 'absolute',
    bottom: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '11px',
    color: 'var(--radar-text-tertiary)',
  },
  quadrantContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  quadrantRow: {
    display: 'flex',
    gap: '8px',
  },
  quadrant: {
    flex: 1,
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '12px',
    border: '2px solid',
    padding: '12px',
    minHeight: '120px',
  },
  quadrantHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  quadrantIcon: {
    fontSize: '14px',
  },
  quadrantLabel: {
    fontSize: '12px',
    fontWeight: 600,
  },
  quadrantDesc: {
    fontSize: '10px',
    color: 'var(--radar-text-tertiary)',
    marginLeft: 'auto',
  },
  quadrantContacts: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  contactChip: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: 'var(--radar-bg)',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 600,
    color: 'var(--radar-text-primary)',
    cursor: 'pointer',
  },
  moreChip: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: 'var(--radar-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: 'var(--radar-text-secondary)',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
};
