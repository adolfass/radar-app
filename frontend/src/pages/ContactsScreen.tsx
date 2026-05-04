import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../hooks/useApi';
import { TelegramLookup } from '../components/Contacts/TelegramLookup';
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

export function ContactsScreen() {
  const navigate = useNavigate();
  const { contacts, loading, deleteContact, exportVCard, refetch } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTelegramLookup, setShowTelegramLookup] = useState(false);

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

  const handleShare = async (contact: any) => {
    const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};

    const shareData = {
      title: contact.businessName || 'Контакт',
      text: `${personalData.fullName || ''} ${contact.businessName ? 'из ' + contact.businessName : ''}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${personalData.fullName || ''} ${personalData.phone || ''}`);
        alert('Информация скопирована');
      }
    } catch (error) {
      console.error('Share error:', error);
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

  const filteredContacts = contacts.filter((contact) => {
    if (!searchQuery) return true;

    const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};
    const searchLower = searchQuery.toLowerCase();

    return (
      contact.businessName?.toLowerCase().includes(searchLower) ||
      personalData.fullName?.toLowerCase().includes(searchLower) ||
      personalData.phone?.includes(searchQuery)
    );
  });

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
      }}>
        <p style={{ color: 'var(--tg-theme-text-color, #000000)' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
      padding: '16px',
    }}>
      <header style={{
        marginBottom: '24px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '16px',
          }}
        >
          ← Назад
        </button>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            Контакты
          </h1>
          <button
            onClick={() => setShowTelegramLookup(true)}
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ➕ Добавить
          </button>
        </div>
      </header>

      {/* Search */}
      <div style={{
        marginBottom: '16px',
      }}>
        <input
          type="text"
          placeholder="Поиск контактов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
            borderRadius: '12px',
            backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
            color: 'var(--tg-theme-text-color, #000000)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {filteredContacts.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '16px',
            color: 'var(--tg-theme-hint-color, #999999)',
            marginBottom: '16px',
          }}>
            {searchQuery ? 'Контакты не найдены' : 'У вас пока нет контактов'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowTelegramLookup(true)}
              style={{
                padding: '14px 24px',
                backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              🔍 Найти в Telegram
            </button>
          )}
        </div>
      ) : (
        <div>
          {filteredContacts.map((contact) => {
            const personalData = contact.personalData ? JSON.parse(contact.personalData) : {};

            return (
              <div
                key={contact.id}
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--tg-theme-text-color, #000000)',
                      marginBottom: '4px',
                    }}>
                      {personalData.fullName || 'Без имени'}
                    </h3>
                    {contact.businessName && (
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--tg-theme-hint-color, #999999)',
                      }}>
                        {contact.businessName}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{
                  marginBottom: '12px',
                }}>
                  {personalData.position && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--tg-theme-text-color, #000000)',
                      marginBottom: '4px',
                    }}>
                      💼 {personalData.position}
                    </p>
                  )}
                  {personalData.phone && (
                    <a
                      href={`tel:${personalData.phone}`}
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        color: 'var(--tg-theme-button-color, #2481cc)',
                        marginBottom: '4px',
                        textDecoration: 'none',
                      }}
                    >
                      📞 {personalData.phone}
                    </a>
                  )}
                  {personalData.email && (
                    <a
                      href={`mailto:${personalData.email}`}
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        color: 'var(--tg-theme-button-color, #2481cc)',
                        textDecoration: 'none',
                      }}
                    >
                      ✉️ {personalData.email}
                    </a>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                }}>
                  <button
                    onClick={() => handleExport(contact.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                      color: 'var(--tg-theme-text-color, #000000)',
                      border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    📥
                  </button>
                  <button
                    onClick={() => handleShare(contact)}
                    style={{
                      padding: '10px',
                      backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                      color: 'var(--tg-theme-text-color, #000000)',
                      border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    📤
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить контакт?')) {
                        deleteContact(contact.id);
                      }
                    }}
                    style={{
                      padding: '10px',
                      backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                      color: '#ff3b30',
                      border: '1px solid #ff3b30',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    🗑️
                  </button>
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
    </div>
  );
}