import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusinessCards } from '../hooks/useApi';
import { BusinessCardSwiper } from '../components/BusinessCardSwiper';

export function MainScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cards } = useBusinessCards();

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            Radar
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--tg-theme-hint-color, #999999)',
          }}>
            {user?.firstName || 'Пользователь'}
          </p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Профиль
        </button>
      </header>

      {/* Business Cards Carousel */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            Мои визитки
          </h2>
          {cards.length < 7 && (
            <button
              onClick={() => navigate('/card/new')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                color: 'var(--tg-theme-button-text-color, #ffffff)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              + Создать
            </button>
          )}
        </div>

        <BusinessCardSwiper cards={cards} />
      </section>

      {/* Quick Actions */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
      }}>
        <button
          onClick={() => navigate('/events')}
          style={{
            padding: '20px',
            backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: '24px' }}>📅</span>
          <h3 style={{
            marginTop: '8px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            События
          </h3>
          <p style={{
            fontSize: '12px',
            color: 'var(--tg-theme-hint-color, #999999)',
          }}>
            Деловые встречи
          </p>
        </button>

        <button
          onClick={() => navigate('/contacts')}
          style={{
            padding: '20px',
            backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: '24px' }}>👥</span>
          <h3 style={{
            marginTop: '8px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            Контакты
          </h3>
          <p style={{
            fontSize: '12px',
            color: 'var(--tg-theme-hint-color, #999999)',
          }}>
            Обмен контактами
          </p>
        </button>
      </section>

      {/* Balance Info */}
      {user && (
        <section style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{
                fontSize: '14px',
                color: 'var(--tg-theme-hint-color, #999999)',
              }}>
                Баланс
              </p>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'var(--tg-theme-text-color, #000000)',
              }}>
                {user.balance} ⭐️
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'var(--tg-theme-button-color, #2481cc)',
                border: '1px solid var(--tg-theme-button-color, #2481cc)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Подробнее
            </button>
          </div>
        </section>
      )}
    </div>
    </div>
  );
}
