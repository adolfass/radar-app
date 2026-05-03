import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: 'radar', label: 'Радар' },
  { path: '/qr-exchange', icon: 'qr', label: 'QR' },
  { path: '/meetings', icon: 'meeting', label: 'Встречи' },
  { path: '/contacts', icon: 'contacts', label: 'Контакты' },
  { path: '/profile', icon: 'profile', label: 'Профиль' },
];

const icons: Record<string, JSX.Element> = {
  radar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  ),
  qr: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="8" height="8" rx="1" />
      <rect x="14" y="2" width="8" height="8" rx="1" />
      <rect x="2" y="14" width="8" height="8" rx="1" />
      <rect x="14" y="14" width="4" height="4" />
      <rect x="20" y="14" width="2" height="4" />
      <rect x="14" y="20" width="4" height="2" />
      <rect x="20" y="20" width="2" height="2" />
    </svg>
  ),
  meeting: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="12" cy="15" r="2" />
    </svg>
  ),
  contacts: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  profile: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={styles.nav}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.item,
              color: isActive ? 'var(--radar-accent)' : 'var(--radar-text-secondary)',
            }}
          >
            {icons[item.icon]}
            <span style={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '64px',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTop: '1px solid var(--radar-border)',
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 12px',
    minHeight: '44px',
    minWidth: '60px',
  },
  label: {
    fontSize: '10px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
};
