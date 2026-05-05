import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../hooks/useApi';
import { TelegramLookup } from '../components/Contacts/TelegramLookup';
import { FindFriends } from '../components/Contacts/FindFriends';
import { api } from '../lib/api';

interface TelegramProfile {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  bio?: string;
  photoUrl?: string;
  isPremium: boolean;
  languageCode?: string;
}

type SortOption = 'recent' | 'name' | 'trust';
type CircleFilter = 'all' | 'support' | 'productivity' | 'development';
type RoleFilter = 'all' | 'connector' | 'bridge' | 'gatekeeper' | 'condensator';

const circleColors: Record<string, string> = {
  support: '#8b5cf6',
  productivity: '#3b82f6',
  development: '#10b981',
};

const roleIcons: Record<string, string> = {
  connector: '🔗',
  bridge: '🌉',
  gatekeeper: '🚪',
  condensator: '⚡',
};

export function ContactsScreen() {
  const navigate = useNavigate();
  const { contacts, loading, exportVCard, refetch } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTelegramLookup, setShowTelegramLookup] = useState(false);
  const [showFindFriends, setShowFindFriends] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [circleFilter, setCircleFilter] = useState<CircleFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const handleExport = async (id: number) => {
    try {
      const response = await exportVCard(id);
      const { vcard, filename } = response.data;
      const blob = new Blob([vcard], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Ошибка при экспорте контакта');
    }
  };

  const handleFindFriends = async (userId: number) => {
    try {
      await api.post('/contacts/add-by-ref', { refUserId: userId.toString() });
      setShowFindFriends(false);
      refetch();
      alert('Друг добавлен в вашу сеть!');
    } catch (error: any) {
      if (error.response?.data?.message === 'Contact already exists') {
        alert('Этот контакт уже добавлен');
      } else {
        alert('Ошибка при добавлении контакта');
      }
    }
  };

  const handleShare = async (contact: any) => {
    const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
    const tg = (window as any).Telegram?.WebApp;

    if (tg?.openTelegramLink) {
      const text = `${personalData.fullName || ''} ${contact.businessName ? `• ${contact.businessName}` : ''}`;
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
      tg.openTelegramLink(shareUrl);
    } else {
      await navigator.clipboard.writeText(`${personalData.fullName || ''} ${personalData.phone || ''}`);
      alert('Информация скопирована');
    }
  };

  const handleTelegramProfileFound = async (profile: TelegramProfile) => {
    try {
      await api.post('/contacts/add-by-ref', {
        contactId: profile.telegramId.toString(),
        refUserId: profile.telegramId.toString(),
      });
      setShowTelegramLookup(false);
      refetch();
      alert('Контакт добавлен в вашу сеть!');
    } catch (error: any) {
      if (error.response?.data?.message === 'Contact already exists') {
        alert('Этот контакт уже добавлен');
      } else {
        alert('Ошибка при добавлении контакта');
      }
    }
  };

  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((contact) => {
        const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
        return (
          contact.businessName?.toLowerCase().includes(query) ||
          personalData.fullName?.toLowerCase().includes(query) ||
          personalData.phone?.includes(searchQuery) ||
          contact.roles?.some((r: string) => r.toLowerCase().includes(query))
        );
      });
    }

    if (circleFilter !== 'all') {
      result = result.filter((c) => c.circle === circleFilter);
    }

    if (roleFilter !== 'all') {
      result = result.filter((c) => c.roles?.includes(roleFilter));
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => (a.businessName || '').localeCompare(b.businessName || ''));
        break;
      case 'trust':
        result.sort((a, b) => (b.trustBalance || 0) - (a.trustBalance || 0));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        break;
    }

    return result;
  }, [contacts, searchQuery, sortBy, circleFilter, roleFilter]);

  const stats = useMemo(() => ({
    total: contacts.length,
    support: contacts.filter((c) => c.circle === 'support').length,
    productivity: contacts.filter((c) => c.circle === 'productivity').length,
    development: contacts.filter((c) => c.circle === 'development').length,
  }), [contacts]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--radar-bg)',
      }}>
        <p style={{ color: 'var(--radar-text-secondary)' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--radar-bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--radar-text)', margin: 0 }}>
              👥 Контакты
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--radar-text-secondary)', margin: '4px 0 0' }}>
              {stats.total} контактов • {stats.support} поддержка • {stats.productivity} продуктивность • {stats.development} развитие
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '10px 14px',
              backgroundColor: showFilters ? 'var(--radar-accent)' : 'var(--radar-surface)',
              color: showFilters ? '#fff' : 'var(--radar-text)',
              border: '1px solid var(--radar-border)',
              borderRadius: '10px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ⚙️ Фильтры
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Поиск по имени, компании, телефону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              fontSize: '16px',
              border: '1px solid var(--radar-border)',
              borderRadius: '12px',
              backgroundColor: 'var(--radar-surface)',
              color: 'var(--radar-text)',
              boxSizing: 'border-box',
            }}
          />
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
          }}>
            🔍
          </span>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{
            marginTop: '12px',
            padding: '16px',
            backgroundColor: 'var(--radar-surface)',
            border: '1px solid var(--radar-border)',
            borderRadius: '12px',
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--radar-text-secondary)', marginBottom: '6px', display: 'block' }}>
                Сортировка
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['recent', 'name', 'trust'] as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: sortBy === opt ? 'var(--radar-accent)' : 'var(--radar-surface-elevated)',
                      color: sortBy === opt ? '#fff' : 'var(--radar-text)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {opt === 'recent' ? '📅 По дате' : opt === 'name' ? '🔤 По имени' : '⭐ По доверию'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--radar-text-secondary)', marginBottom: '6px', display: 'block' }}>
                Круг
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['all', 'support', 'productivity', 'development'] as CircleFilter[]).map((cf) => (
                  <button
                    key={cf}
                    onClick={() => setCircleFilter(cf)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: circleFilter === cf ? (circleColors[cf] || 'var(--radar-accent)') : 'var(--radar-surface-elevated)',
                      color: circleFilter === cf ? '#fff' : 'var(--radar-text)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {cf === 'all' ? 'Все' : cf === 'support' ? '🔮' : cf === 'productivity' ? '⚡' : '🌱'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--radar-text-secondary)', marginBottom: '6px', display: 'block' }}>
                Роль
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['all', 'connector', 'bridge', 'gatekeeper', 'condensator'] as RoleFilter[]).map((rf) => (
                  <button
                    key={rf}
                    onClick={() => setRoleFilter(rf)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: roleFilter === rf ? 'var(--radar-accent-secondary)' : 'var(--radar-surface-elevated)',
                      color: roleFilter === rf ? '#fff' : 'var(--radar-text)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {rf === 'all' ? 'Все роли' : `${roleIcons[rf]} ${rf}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setShowFindFriends(true)}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: 'var(--radar-surface)',
            color: 'var(--radar-accent)',
            border: '1px solid var(--radar-accent)',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          👥 Найти друзей
        </button>
        <button
          onClick={() => setShowTelegramLookup(true)}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: 'var(--radar-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          ➕ Добавить
        </button>
      </div>

      {/* Contacts List */}
      {filteredAndSortedContacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <span style={{ fontSize: '48px' }}>🔍</span>
          <p style={{ fontSize: '16px', color: 'var(--radar-text-secondary)', marginTop: '12px' }}>
            {searchQuery ? 'Ничего не найдено' : 'У вас пока нет контактов'}
          </p>
        </div>
      ) : (
        <div>
          {filteredAndSortedContacts.map((contact) => {
            const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
            const trustBalance = contact.trustBalance || 0;
            const trustColor = trustBalance > 30 ? '#22c55e' : trustBalance < -30 ? '#ef4444' : '#eab308';

            return (
              <div
                key={contact.id}
                onClick={() => navigate(`/contacts/${contact.id}`)}
                style={{
                  backgroundColor: 'var(--radar-surface)',
                  border: '1px solid var(--radar-border)',
                  borderRadius: '14px',
                  padding: '16px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '26px',
                    backgroundColor: circleColors[contact.circle] || 'var(--radar-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: '#fff',
                    fontWeight: '600',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {personalData.fullName?.[0] || personalData.firstName?.[0] || '?'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: 'var(--radar-text)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {personalData.fullName || 'Без имени'}
                      </h3>
                      {trustBalance !== 0 && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          backgroundColor: `${trustColor}20`,
                          color: trustColor,
                        }}>
                          {trustBalance > 0 ? '+' : ''}{trustBalance}
                        </span>
                      )}
                    </div>
                    {contact.businessName && (
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--radar-text-secondary)',
                        margin: '0 0 4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {contact.businessName}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: `${circleColors[contact.circle] || '#666'}20`,
                        color: circleColors[contact.circle] || '#666',
                      }}>
                        {contact.circle || 'productivity'}
                      </span>
                      {contact.roles?.map((role: string) => (
                        <span key={role} style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--radar-surface-elevated)',
                          color: 'var(--radar-text-secondary)',
                        }}>
                          {roleIcons[role] || '•'} {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(contact); }}
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'var(--radar-surface-elevated)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      📤
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleExport(contact.id); }}
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'var(--radar-surface-elevated)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      📥
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTelegramLookup && (
        <TelegramLookup
          onContactFound={handleTelegramProfileFound}
          onCancel={() => setShowTelegramLookup(false)}
        />
      )}

      {showFindFriends && (
        <FindFriends
          onFriendFound={handleFindFriends}
          onCancel={() => setShowFindFriends(false)}
        />
      )}
    </div>
    </div>
  );
}