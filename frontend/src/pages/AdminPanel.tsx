import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { BottomNav } from '../components/BottomNav';

interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  organizers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  freeUsers: number;
}

interface UserItem {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  isOrganizer: boolean;
  isPremium: boolean | null;
  balance: number;
  createdAt: string;
  _count: {
    contacts: number;
    businessCards: number;
    referrals: number;
    meetings: number;
  };
  subscription: {
    plan: string;
    isActive: boolean;
    expiresAt: string | null;
  } | null;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users');
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
      loadStats();
    } else {
      fetchOrganizedEvents();
    }
  }, [activeTab, page, searchQuery]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users/admin/list', {
        params: { page, limit: 20, search: searchQuery || undefined },
      });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/users/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const fetchOrganizedEvents = async () => {
    try {
      const response = await api.get('/events/organized');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    const title = prompt('Название события:');
    if (!title) return;

    const description = prompt('Описание:') || '';
    const location = prompt('Место проведения:') || '';
    const startDate = prompt('Дата начала (YYYY-MM-DDTHH:MM):');
    const endDate = prompt('Дата окончания (YYYY-MM-DDTHH:MM):');

    if (!startDate || !endDate) {
      alert('Укажите даты начала и окончания');
      return;
    }

    try {
      await api.post('/events', {
        title,
        description,
        location,
        startDate,
        endDate,
      });

      alert('Событие создано!');
      fetchOrganizedEvents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка при создании события');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Удалить событие?')) return;

    try {
      await api.delete(`/events/${eventId}`);
      alert('Событие удалено');
      fetchOrganizedEvents();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <h1 style={styles.title}>Админ-панель</h1>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tab,
            ...(activeTab === 'users' ? styles.tabActive : {}),
          }}
        >
          Пользователи
        </button>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            ...styles.tab,
            ...(activeTab === 'events' ? styles.tabActive : {}),
          }}
        >
          События
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        {activeTab === 'events' && (
          <EventsTab
            events={events}
            onCreateEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>

      <BottomNav />
    </div>
    </div>
  );
}

function UsersTab({
  users,
  stats,
  searchQuery,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
}: {
  users: UserItem[];
  stats: UserStats | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div style={styles.tabContent}>
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Всего</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.newUsersToday}</div>
            <div style={styles.statLabel}>Сегодня</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.newUsersThisWeek}</div>
            <div style={styles.statLabel}>Неделя</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: 'var(--radar-success)' }}>{stats.premiumUsers}</div>
            <div style={styles.statLabel}>Premium</div>
          </div>
        </div>
      )}

      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Поиск по имени, username или ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {users.length === 0 ? (
        <div style={styles.empty}>Пользователи не найдены</div>
      ) : (
        users.map(user => (
          <div key={user.id} style={styles.userCard}>
            <div style={styles.userHeader}>
              <div style={styles.userAvatar}>
                {user.firstName?.[0] || user.username?.[0] || '?'}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userName}>
                  {user.firstName || 'Без имени'} {user.lastName || ''}
                </div>
                <div style={styles.userHandle}>
                  {user.username ? `@${user.username}` : `ID: ${user.id}`}
                </div>
              </div>
              <div style={styles.userBadges}>
                {user.isOrganizer && <span style={styles.badgeOrganizer}>Org</span>}
                {user.subscription?.plan === 'premium' && user.subscription.isActive && (
                  <span style={styles.badgePremium}>Pro</span>
                )}
              </div>
            </div>
            <div style={styles.userStats}>
              <span style={styles.userStat}>
                👥 {user._count.contacts}
              </span>
              <span style={styles.userStat}>
                🃏 {user._count.businessCards}
              </span>
              <span style={styles.userStat}>
                🔗 {user._count.referrals}
              </span>
              <span style={styles.userStat}>
                📅 {user._count.meetings}
              </span>
              <span style={styles.userStat}>
                💰 {user.balance}
              </span>
            </div>
            <div style={styles.userFooter}>
              <span style={styles.userDate}>
                {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={{
              ...styles.pageBtn,
              opacity: page <= 1 ? 0.3 : 1,
            }}
          >
            ←
          </button>
          <span style={styles.pageInfo}>{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={{
              ...styles.pageBtn,
              opacity: page >= totalPages ? 0.3 : 1,
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

function EventsTab({
  events,
  onCreateEvent,
  onDeleteEvent,
}: {
  events: any[];
  onCreateEvent: () => void;
  onDeleteEvent: (id: number) => void;
}) {
  return (
    <div style={styles.tabContent}>
      <button onClick={onCreateEvent} style={styles.createBtn}>
        + Создать событие
      </button>

      {events.length === 0 ? (
        <div style={styles.empty}>Пока нет событий</div>
      ) : (
        events.map(event => (
          <div key={event.id} style={styles.eventCard}>
            <div style={styles.eventHeader}>
              <div style={{ flex: 1 }}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                <p style={styles.eventCount}>
                  {event.registrations?.length || 0} участников
                </p>
              </div>
              <button onClick={() => onDeleteEvent(event.id)} style={styles.deleteBtn}>
                🗑️
              </button>
            </div>
            <p style={styles.eventDate}>
              📅 {new Date(event.startDate).toLocaleDateString('ru-RU')}
            </p>
            {event.location && (
              <p style={styles.eventLocation}>📍 {event.location}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column'},
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
    borderBottom: '1px solid var(--radar-border)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '20px',
    padding: '8px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
    marginLeft: '12px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--radar-border)',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--radar-text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tabActive: {
    color: 'var(--radar-accent)',
    borderBottomColor: 'var(--radar-accent)',
  },
  content: {
    padding: '16px',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--radar-bg)',
  },
  loadingText: {
    color: 'var(--radar-text-secondary)',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    padding: '40px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statCard: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
    marginTop: '4px',
  },
  searchBar: {
    padding: '8px 0',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    color: 'var(--radar-text)',
    fontSize: '14px',
    outline: 'none',
  },
  userCard: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '16px',
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: 'var(--radar-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--radar-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userHandle: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
  userBadges: {
    display: 'flex',
    gap: '6px',
  },
  badgeOrganizer: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'var(--radar-warning)',
    color: '#000',
  },
  badgePremium: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
  },
  userStats: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
  },
  userStat: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
  userFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userDate: {
    fontSize: '12px',
    color: 'var(--radar-text-tertiary)',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
  },
  pageBtn: {
    background: 'none',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    padding: '8px 16px',
    color: 'var(--radar-text)',
    cursor: 'pointer',
    fontSize: '14px',
  },
  pageInfo: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
  },
  createBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '16px',
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  eventTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--radar-text)',
    marginBottom: '4px',
  },
  eventCount: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
  },
  deleteBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    color: '#ff3b30',
    border: '1px solid #ff3b30',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  eventDate: {
    fontSize: '14px',
    color: 'var(--radar-text)',
  },
  eventLocation: {
    fontSize: '14px',
    color: 'var(--radar-text)',
  },
};
