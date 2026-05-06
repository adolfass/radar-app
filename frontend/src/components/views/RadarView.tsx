import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Contact {
  id: number;
  firstName: string;
  lastName?: string;
  circle: 'support' | 'productivity' | 'development';
  role?: string;
  archetype?: string;
  lastInteraction?: string;
}

interface RadarViewProps {
  contacts: Contact[];
  onContactSelect?: (contact: Contact) => void;
}

const CIRCLE_CONFIG = {
  support: { radius: 80, color: '#10B981', label: 'Поддержка' },
  productivity: { radius: 160, color: '#3B82F6', label: 'Продуктивность' },
  development: { radius: 240, color: '#8B5CF6', label: 'Развитие' },
};

export function RadarView({ contacts, onContactSelect }: RadarViewProps) {
  const navigate = useNavigate();

  const positions = useMemo(() => {
    const groups = {
      support: contacts.filter(c => c.circle === 'support'),
      productivity: contacts.filter(c => c.circle === 'productivity'),
      development: contacts.filter(c => c.circle === 'development'),
    };

    const result: Array<{ contact: Contact; x: number; y: number }> = [];
    const centerX = 180;
    const centerY = 180;

    Object.entries(groups).forEach(([circle, groupContacts]) => {
      const config = CIRCLE_CONFIG[circle as keyof typeof CIRCLE_CONFIG];
      const count = groupContacts.length;
      
      if (count === 0) return;

      groupContacts.forEach((contact, i) => {
        const angleOffset = Math.PI / 2;
        const angle = angleOffset + (2 * Math.PI * i) / count - Math.PI / count;
        const r = config.radius + (Math.random() * 30 - 15);
        const x = centerX + r * Math.cos(angle);
        const y = centerY - r * Math.sin(angle);
        result.push({ contact, x, y });
      });
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
      <svg width="360" height="360" viewBox="0 0 360 360" style={styles.svg}>
        {[CIRCLE_CONFIG.support, CIRCLE_CONFIG.productivity, CIRCLE_CONFIG.development].map((circle, i) => (
          <g key={circle.label}>
            <circle
              cx="180"
              cy="180"
              r={circle.radius}
              fill="none"
              stroke={circle.color}
              strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '4 4'}
              opacity="0.5"
            />
            <text
              x="180"
              y={180 - circle.radius - 8}
              textAnchor="middle"
              fill={circle.color}
              fontSize="10"
              opacity="0.7"
            >
              {circle.label}
            </text>
          </g>
        ))}

        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="180"
            y1="180"
            x2={180 + 260 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={180 + 260 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {positions.map(({ contact, x, y }) => (
          <g
            key={contact.id}
            onClick={() => handleContactClick(contact)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={x}
              cy={y}
              r="12"
              fill={CIRCLE_CONFIG[contact.circle].color}
              opacity="0.9"
            />
            <circle
              cx={x}
              cy={y}
              r="15"
              fill="none"
              stroke={CIRCLE_CONFIG[contact.circle].color}
              strokeWidth="2"
              opacity="0.3"
            />
          </g>
        ))}
      </svg>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: CIRCLE_CONFIG.support.color }} />
          <span>Поддержка ({contacts.filter(c => c.circle === 'support').length})</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: CIRCLE_CONFIG.productivity.color }} />
          <span>Продуктивность ({contacts.filter(c => c.circle === 'productivity').length})</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendDot, backgroundColor: CIRCLE_CONFIG.development.color }} />
          <span>Развитие ({contacts.filter(c => c.circle === 'development').length})</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
  },
  svg: {
    maxWidth: '100%',
    height: 'auto',
  },
  legend: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
