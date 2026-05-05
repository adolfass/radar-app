import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useApi';

export function EventsScreen() {
  const navigate = useNavigate();
  const { events, loading, registerForEvent, unregisterFromEvent } = useEvents();

  const handleRegister = async (eventId: number) => {
    try {
      await registerForEvent(eventId);
      alert('Вы успешно зарегистрированы!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка при регистрации');
    }
  };

  const handleUnregister = async (eventId: number) => {
    if (!confirm('Отменить регистрацию?')) return;
    
    try {
      await unregisterFromEvent(eventId);
      alert('Регистрация отменена');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ошибка при отмене регистрации');
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
    <div style={{ height: '100vh', backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
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
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--tg-theme-text-color, #000000)',
        }}>
          События
        </h1>
      </header>

      {events.length === 0 ? (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '16px',
            color: 'var(--tg-theme-hint-color, #999999)',
          }}>
            Пока нет событий
          </p>
        </div>
      ) : (
        <div>
          {events.map((event) => {
            const isRegistered = event.registrations?.length > 0;
            
            return (
              <div
                key={event.id}
                style={{
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: 'var(--tg-theme-text-color, #000000)',
                  marginBottom: '8px',
                }}>
                  {event.title}
                </h3>
                
                {event.description && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--tg-theme-hint-color, #999999)',
                    marginBottom: '12px',
                  }}>
                    {event.description}
                  </p>
                )}

                <div style={{
                  fontSize: '14px',
                  color: 'var(--tg-theme-text-color, #000000)',
                  marginBottom: '16px',
                }}>
                  {event.location && (
                    <p style={{ marginBottom: '4px' }}>
                      📍 {event.location}
                    </p>
                  )}
                  <p>
                    📅 {new Date(event.startDate).toLocaleDateString('ru-RU')}
                  </p>
                  <p>
                    ⏰ {new Date(event.startDate).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                }}>
                  {isRegistered ? (
                    <button
                      onClick={() => handleUnregister(event.id)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#ff3b30',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      Отменить регистрацию
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={!event.isActive}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: event.isActive 
                          ? 'var(--tg-theme-button-color, #2481cc)' 
                          : 'var(--tg-theme-hint-color, #cccccc)',
                        color: 'var(--tg-theme-button-text-color, #ffffff)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: event.isActive ? 'pointer' : 'not-allowed',
                        fontWeight: '600',
                      }}
                    >
                      {event.isActive ? 'Зарегистрироваться' : 'Событие завершено'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
}
