import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('events');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizedEvents();
  }, []);

  const fetchOrganizedEvents = async () => {
    try {
      const response = await axios.get(`${API_URL}/events/organized`);
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
      await axios.post(`${API_URL}/events`, {
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
      await axios.delete(`${API_URL}/events/${eventId}`);
      alert('Событие удалено');
      fetchOrganizedEvents();
    } catch (error) {
      alert('Ошибка при удалении');
    }
  };

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
          onClick={() => navigate('/profile')}
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
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--tg-theme-text-color, #000000)',
        }}>
          Админ-панель
        </h1>
      </header>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => setActiveTab('events')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: activeTab === 'events' 
              ? 'var(--tg-theme-button-color, #2481cc)' 
              : 'var(--tg-theme-secondary-bg-color, #ffffff)',
            color: activeTab === 'events'
              ? 'var(--tg-theme-button-text-color, #ffffff)'
              : 'var(--tg-theme-text-color, #000000)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          События
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: activeTab === 'users' 
              ? 'var(--tg-theme-button-color, #2481cc)' 
              : 'var(--tg-theme-secondary-bg-color, #ffffff)',
            color: activeTab === 'users'
              ? 'var(--tg-theme-button-text-color, #ffffff)'
              : 'var(--tg-theme-text-color, #000000)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Пользователи
        </button>
      </div>

      {activeTab === 'events' && (
        <div>
          <button
            onClick={handleCreateEvent}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px',
            }}
          >
            + Создать событие
          </button>

          {events.length === 0 ? (
            <p style={{
              textAlign: 'center',
              color: 'var(--tg-theme-hint-color, #999999)',
              padding: '40px',
            }}>
              Пока нет событий
            </p>
          ) : (
            <div>
              {events.map((event) => (
                <div
                  key={event.id}
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
                        {event.title}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--tg-theme-hint-color, #999999)',
                      }}>
                        {event.registrations?.length || 0} участников
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        color: '#ff3b30',
                        border: '1px solid #ff3b30',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: 'var(--tg-theme-text-color, #000000)',
                  }}>
                    📅 {new Date(event.startDate).toLocaleDateString('ru-RU')}
                  </p>
                  {event.location && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--tg-theme-text-color, #000000)',
                    }}>
                      📍 {event.location}
                    </p>
                  )}

                  {event.registrations?.length > 0 && (
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                    }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--tg-theme-text-color, #000000)',
                        marginBottom: '8px',
                      }}>
                        Участники:
                      </p>
                      {event.registrations.map((reg: any) => (
                        <div
                          key={reg.id}
                          style={{
                            fontSize: '14px',
                            color: 'var(--tg-theme-text-color, #000000)',
                            padding: '4px 0',
                          }}
                        >
                          • {reg.user.firstName || ''} {reg.user.lastName || ''} @{reg.user.username || ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--tg-theme-hint-color, #999999)',
        }}>
          <p>Управление пользователями</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            Функционал в разработке
          </p>
        </div>
      )}
    </div>
  );
}
