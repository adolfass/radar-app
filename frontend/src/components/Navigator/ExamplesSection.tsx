import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXAMPLE_STEPS } from './examples-content';

function MockScreen({ type, highlight }: { type: string; highlight: string }) {
  const accent = '#3b82f6';
  const highlightColor = '#10b981';

  if (type === 'dashboard') {
    return (
      <div style={styles.mockContainer}>
        <div style={styles.mockHeader}>
          <div style={styles.mockAvatar}>Р</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>RADAR</div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>Стратегический нетворкинг</div>
          </div>
        </div>
        <div style={{ ...styles.highlightBox, borderColor: highlight === 'bqg' ? highlightColor : 'transparent' }}>
          <div style={{ fontSize: '10px', color: '#6b7280' }}>BQG — Боевая Группировка</div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>Найти 3 инвестора</div>
          <div style={{ height: '6px', backgroundColor: '#1f2937', borderRadius: '3px', marginTop: '6px' }}>
            <div style={{ width: '33%', height: '100%', backgroundColor: highlightColor, borderRadius: '3px' }} />
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>1/3 выполнено</div>
        </div>
        <div style={styles.grid2}>
          <div style={styles.gridItem}><div style={{ fontSize: '18px', fontWeight: 'bold', color: accent }}>12</div><div style={styles.mockSubText}>Контактов</div></div>
          <div style={styles.gridItem}><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b' }}>5</div><div style={styles.mockSubText}>Встреч</div></div>
        </div>
        <div style={{ ...styles.badge, backgroundColor: highlight === 'bqg' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.1)', color: highlight === 'bqg' ? '#10b981' : accent }}>
          {highlight === 'bqg' ? '✅ Цель задана' : '💡 Задайте цель'}
        </div>
      </div>
    );
  }

  if (type === 'contacts') {
    const contacts = [
      { name: 'Иванов Алексей', role: 'CEO @Tech' },
      { name: 'Петрова Мария', role: 'Дизайнер' },
      { name: 'Сидоров Дмитрий', role: 'Инвестор' },
    ];
    return (
      <div style={styles.mockContainer}>
        <div style={styles.mockHeader}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Контакты</div>
        </div>
        <div style={{ ...styles.highlightBox, borderColor: highlight === 'search' ? highlightColor : 'transparent' }}>
          <div style={styles.mockSearch}>
            <span style={{ marginRight: '8px' }}>🔍</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>@username, имя, компания...</span>
          </div>
        </div>
        {contacts.map((c, i) => (
          <div key={i} style={styles.contactRow}>
            <div style={styles.contactAvatar}>{c.name[0]}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{c.name}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>{c.role}</div>
            </div>
          </div>
        ))}
        <div style={{ ...styles.badge, backgroundColor: 'rgba(59,130,246,0.1)', color: accent }}>12 контактов • 3 фокусных</div>
      </div>
    );
  }

  if (type === 'graph') {
    return (
      <div style={styles.mockContainer}>
        <div style={styles.mockHeader}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Граф сети</div>
        </div>
        <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
          <line x1="150" y1="100" x2="80" y2="50" stroke="#374151" strokeWidth="1" />
          <line x1="150" y1="100" x2="220" y2="60" stroke="#374151" strokeWidth="2" />
          <line x1="150" y1="100" x2="100" y2="160" stroke="#374151" strokeWidth="1" />
          <line x1="220" y1="60" x2="260" y2="100" stroke="#374151" strokeWidth="1" />
          <line x1="220" y1="60" x2="250" y2="30" stroke="#374151" strokeWidth="1" />
          <circle cx="150" cy="100" r="8" fill={highlight === 'star' ? highlightColor : accent} />
          <circle cx="80" cy="50" r="5" fill="#6b7280" />
          <circle cx="220" cy="60" r={highlight === 'star' ? 18 : 12} fill={highlight === 'star' ? '#f59e0b' : '#3b82f6'} opacity="0.8" />
          <circle cx="100" cy="160" r="5" fill="#6b7280" />
          <circle cx="260" cy="100" r="4" fill="#6b7280" />
          <circle cx="250" cy="30" r="4" fill="#6b7280" />
          {highlight === 'star' && <text x="220" y="42" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold">⭐ Звезда</text>}
        </svg>
        <div style={{ ...styles.badge, backgroundColor: highlight === 'star' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.1)', color: highlight === 'star' ? '#f59e0b' : accent }}>
          {highlight === 'star' ? '💡 Найдите «Звезду» и усильте связь' : '6 узлов • 5 связей'}
        </div>
      </div>
    );
  }

  if (type === 'dossier') {
    return (
      <div style={styles.mockContainer}>
        <div style={styles.mockHeader}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Досье контакта</div>
        </div>
        <div style={styles.profileRow}>
          <div style={{ ...styles.contactAvatar, width: '40px', height: '40px', fontSize: '16px', backgroundColor: accent }}>А</div>
          <div style={{ marginLeft: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Алексей Иванов</div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>CEO @ TechCorp • @alexivanov</div>
          </div>
        </div>
        <div style={{ ...styles.highlightBox, borderColor: highlight === 'trust' ? highlightColor : 'transparent', padding: '8px' }}>
          <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>Баланс доверия</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ width: '20%', height: '8px', borderRadius: '4px', backgroundColor: i <= 3 ? highlightColor : '#1f2937' }} />
            ))}
          </div>
          <div style={{ fontSize: '10px', color: highlightColor, marginTop: '4px' }}>
            {highlight === 'trust' ? '✅ Высокое доверие' : 'Доверие: 3/5'}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', padding: '8px 0' }}>
          <div style={{ marginBottom: '4px' }}>🏷 Якоря: любит кофе, стартапы</div>
          <div>🧠 Архетип: Персик — открытый</div>
        </div>
      </div>
    );
  }

  if (type === 'planner') {
    return (
      <div style={styles.mockContainer}>
        <div style={styles.mockHeader}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Встречи</div>
        </div>
        <div style={{ ...styles.highlightBox, borderColor: highlight === 'reminder' ? highlightColor : 'transparent', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Мария Петрова</div>
              <div style={{ fontSize: '10px', color: '#f59e0b' }}>⏰ 5 дней без контакта</div>
            </div>
            <div style={{ ...styles.ctaBtn, backgroundColor: highlight === 'reminder' ? highlightColor : accent, padding: '6px 12px', fontSize: '10px' }}>Написать</div>
          </div>
          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '6px' }}>Якорь: обсудить новый дизайн-проект</div>
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', padding: '8px 0' }}>
          <div style={{ marginBottom: '4px' }}>Следующие:</div>
          {['Дмитрий Сидоров — 12 мая', 'Анна Козлова — 15 мая'].map((item, i) => (
            <div key={i} style={{ ...styles.contactRow, padding: '6px 0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6b7280', marginRight: '8px' }} />
              <span style={{ fontSize: '11px', color: '#d1d5db' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'result') {
    return (
      <div style={{ ...styles.mockContainer, backgroundColor: '#0a1628', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          <svg viewBox="0 0 64 64" width="64" height="64">
            <circle cx="32" cy="32" r="30" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="188" strokeDashoffset="188">
              <animate attributeName="stroke-dashoffset" from="188" to="0" dur="1.5s" fill="freeze" />
            </circle>
            <path d="M20 32 L28 40 L44 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40">
              <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1s" begin="1s" fill="freeze" />
            </path>
          </svg>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>Партнёр найден!</div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>30 дней → 1 надёжная сделка</div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <div style={styles.gridItem}><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>12</div><div style={styles.mockSubText}>Контактов</div></div>
          <div style={styles.gridItem}><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>8</div><div style={styles.mockSubText}>Встреч</div></div>
          <div style={styles.gridItem}><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>1</div><div style={styles.mockSubText}>Сделка</div></div>
        </div>
      </div>
    );
  }

  return <div style={styles.mockContainer}>No preview</div>;
}

export function ExamplesSection() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const step = EXAMPLE_STEPS[currentStep];

  return (
    <div style={{
      backgroundColor: 'rgba(17, 17, 17, 0.8)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      marginTop: '16px',
    }}>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '16px' }}>{step.icon}</span>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
            {step.title}
          </h4>
        </div>

        <MockScreen type={step.screenType} highlight={step.highlight} />

        <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '12px 0 0' }}>
          {step.caption}
        </p>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <button
          onClick={() => navigate(step.ctaRoute)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: step.id === 'result' ? '#10b981' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {step.ctaText}
        </button>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            style={{
              background: 'none',
              border: 'none',
              color: currentStep === 0 ? '#4b5563' : '#3b82f6',
              cursor: currentStep === 0 ? 'default' : 'pointer',
              fontSize: '12px',
              padding: '8px',
            }}
          >
            ← Назад
          </button>

          <div style={{ display: 'flex', gap: '4px' }}>
            {EXAMPLE_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                style={{
                  width: i === currentStep ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === currentStep ? '#3b82f6' : '#374151',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStep((s) => Math.min(EXAMPLE_STEPS.length - 1, s + 1))}
            disabled={currentStep === EXAMPLE_STEPS.length - 1}
            style={{
              background: 'none',
              border: 'none',
              color: currentStep === EXAMPLE_STEPS.length - 1 ? '#4b5563' : '#3b82f6',
              cursor: currentStep === EXAMPLE_STEPS.length - 1 ? 'default' : 'pointer',
              fontSize: '12px',
              padding: '8px',
            }}
          >
            Вперёд →
          </button>
        </div>

        <div style={{ height: '4px', backgroundColor: '#1f2937', borderRadius: '2px', marginTop: '8px' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStep + 1) / EXAMPLE_STEPS.length) * 100}%`,
              backgroundColor: '#3b82f6',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center', marginTop: '4px' }}>
          Шаг {currentStep + 1} из {EXAMPLE_STEPS.length}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mockContainer: {
    backgroundColor: '#111',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '12px',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
  },
  mockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
  },
  mockAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  },
  mockSubText: {
    fontSize: '9px',
    color: '#6b7280',
  },
  mockSearch: {
    backgroundColor: '#1f2937',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
  },
  highlightBox: {
    border: '2px solid transparent',
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: '#0f172a',
    transition: 'border-color 0.3s',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '12px',
  },
  gridItem: {
    backgroundColor: '#1f2937',
    borderRadius: '6px',
    padding: '10px',
    textAlign: 'center',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid #1f2937',
  },
  contactAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#d1d5db',
  },
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '8px',
  },
  ctaBtn: {
    borderRadius: '6px',
    color: '#fff',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
};
