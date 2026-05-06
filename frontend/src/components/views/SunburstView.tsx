import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Contact {
  id: number;
  firstName: string;
  lastName?: string;
  circle: 'support' | 'productivity' | 'development';
  role?: string;
  archetype?: string;
}

interface SunburstViewProps {
  contacts: Contact[];
  onContactSelect?: (contact: Contact) => void;
}

const CIRCLE_COLORS = {
  support: '#10B981',
  productivity: '#3B82F6',
  development: '#8B5CF6',
};

const ROLES = ['connector', 'bridge', 'gatekeeper', 'condensator', 'energizer', 'challenger', 'guardian', 'mentor'];

const ROLE_LABELS: Record<string, string> = {
  connector: 'Connector',
  bridge: 'Bridge',
  gatekeeper: 'Gatekeeper',
  condensator: 'Condensator',
  energizer: 'Energizer',
  challenger: 'Challenger',
  guardian: 'Guardian',
  mentor: 'Mentor',
};

const ARCHETYPES = ['explorer', 'sage', 'hero', 'caregiver', 'ruler', 'jester', 'lover', 'innocent'];

const ARCHETYPE_LABELS: Record<string, string> = {
  explorer: 'Explorer',
  sage: 'Sage',
  hero: 'Hero',
  caregiver: 'Caregiver',
  ruler: 'Ruler',
  jester: 'Jester',
  lover: 'Lover',
  innocent: 'Innocent',
};

export function SunburstView({ contacts, onContactSelect }: SunburstViewProps) {
  const navigate = useNavigate();

  const data = useMemo(() => {
    const circles: Record<string, number> = { support: 0, productivity: 0, development: 0 };
    const roles: Record<string, Record<string, number>> = {};
    const archetypes: Record<string, Record<string, Record<string, number>>> = {};

    contacts.forEach(contact => {
      const circle = contact.circle || 'support';
      const role = contact.role || 'connector';
      const archetype = contact.archetype || 'innocent';

      circles[circle] = (circles[circle] || 0) + 1;

      if (!roles[circle]) roles[circle] = {};
      roles[circle][role] = (roles[circle][role] || 0) + 1;

      if (!archetypes[circle]) archetypes[circle] = {};
      if (!archetypes[circle][role]) archetypes[circle][role] = {};
      archetypes[circle][role][archetype] = (archetypes[circle][role][archetype] || 0) + 1;
    });

    return { circles, roles, archetypes };
  }, [contacts]);

  const gaps = useMemo(() => {
    const gapList: string[] = [];
    const expectedRoles = ['connector', 'gatekeeper', 'condensator'];

    ['support', 'productivity', 'development'].forEach(circle => {
      expectedRoles.forEach(role => {
        if (!data.roles[circle]?.[role] || data.roles[circle][role] === 0) {
          gapList.push(`${ROLE_LABELS[role]} в ${circle === 'support' ? 'Поддержке' : circle === 'productivity' ? 'Продуктивности' : 'Развитии'}`);
        }
      });
    });

    return gapList;
  }, [data]);

  const handleContactClick = (contact: Contact) => {
    if (onContactSelect) {
      onContactSelect(contact);
    } else {
      navigate(`/contacts/${contact.id}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chart}>
        <svg width="320" height="320" viewBox="0 0 320 320">
          {Object.entries(data.circles).map(([circle, count], circleIndex) => {
            const radius = 80 + circleIndex * 50;
            const color = CIRCLE_COLORS[circle as keyof typeof CIRCLE_COLORS];
            const circumference = 2 * Math.PI * radius;
            const totalRoles = data.roles[circle] 
              ? Object.values(data.roles[circle]).reduce((a, b) => a + b, 0)
              : 1;
            
            let currentOffset = 0;

            return (
              <g key={circle}>
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth="40"
                  strokeDasharray={`${(count / totalRoles) * circumference} ${circumference}`}
                  strokeDashoffset={-circumference / 4}
                  opacity="0.8"
                />
                {count === 0 && (
                  <circle
                    cx="160"
                    cy="160"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="40"
                    strokeDasharray={`4 20`}
                    opacity="0.3"
                  />
                )}
              </g>
            );
          })}
          
          <circle cx="160" cy="160" r="30" fill="var(--radar-bg)" />
          <text x="160" y="155" textAnchor="middle" fill="var(--radar-text-primary)" fontSize="12" fontWeight="600">
            {contacts.length}
          </text>
          <text x="160" y="170" textAnchor="middle" fill="var(--radar-text-secondary)" fontSize="10">
            контактов
          </text>
        </svg>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendSection}>
          <div style={styles.legendTitle}>Круги</div>
          {Object.entries(data.circles).map(([circle, count]) => (
            <div key={circle} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: CIRCLE_COLORS[circle as keyof typeof CIRCLE_COLORS] }} />
              <span>{circle === 'support' ? 'Поддержка' : circle === 'productivity' ? 'Продуктивность' : 'Развитие'}</span>
              <span style={styles.legendCount}>{count}</span>
            </div>
          ))}
        </div>

        <div style={styles.legendSection}>
          <div style={styles.legendTitle}>Роли</div>
          {ROLES.map(role => {
            const totalCount = Object.values(data.roles).reduce((sum, circleRoles) => 
              sum + (circleRoles[role] || 0), 0);
            return (
              <div key={role} style={styles.legendItem}>
                <span>{ROLE_LABELS[role]}</span>
                <span style={styles.legendCount}>{totalCount}</span>
              </div>
            );
          })}
        </div>
      </div>

      {gaps.length > 0 && (
        <div style={styles.gaps}>
          <div style={styles.gapsTitle}>⚠️ Дефицит ролей</div>
          {gaps.map((gap, i) => (
            <div key={i} style={styles.gapItem}>
              {gap}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  chart: {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '16px',
    padding: '16px',
  },
  legend: {
    display: 'flex',
    gap: '16px',
  },
  legendSection: {
    flex: 1,
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '12px',
  },
  legendTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--radar-text-primary)',
    marginBottom: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '4px',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
  },
  legendCount: {
    marginLeft: 'auto',
    fontWeight: 600,
    color: 'var(--radar-text-primary)',
  },
  gaps: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '12px',
  },
  gapsTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#EF4444',
    marginBottom: '8px',
  },
  gapItem: {
    fontSize: '11px',
    color: 'var(--radar-text-secondary)',
    padding: '4px 0',
    borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
  },
};
