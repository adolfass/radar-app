interface AccordionSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

export function AccordionSection({ title, isOpen, onToggle, children, badge }: AccordionSectionProps) {
  return (
    <div style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: isOpen ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '600',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1 }}>{title}</span>
        {badge && (
          <span style={{
            marginRight: '8px',
            padding: '2px 8px',
            backgroundColor: badge === '✓' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: badge === '✓' ? '#22c55e' : '#ef4444',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
          }}>
            {badge}
          </span>
        )}
        <span style={{
          marginLeft: '8px',
          color: '#9ca3af',
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>
          ▲
        </span>
      </button>

      {isOpen && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          animation: 'fadeIn 0.2s ease-in-out',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}