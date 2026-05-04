import { useState } from 'react';
import { api } from '../../lib/api';

interface MatchResult {
  userId: number;
  name: string;
  username?: string;
  avatarUrl?: string;
}

interface FindFriendsProps {
  onFriendFound: (userId: number) => void;
  onCancel: () => void;
}

async function hashPhone(phone: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(phone);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function FindFriends({ onFriendFound, onCancel }: FindFriendsProps) {
  const [step, setStep] = useState<'request' | 'loading' | 'results' | 'empty'>('request');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleRequestContactSimple = async () => {
    const tg = (window as any).Telegram?.WebApp;

    setStep('loading');

    try {
      if (tg?.requestContact) {
        tg.requestContact((response: any) => {
          if (response?.status === 'sent') {
            const phone = response.phone;
            proceedWithPhone(phone);
          } else {
            setStep('request');
          }
        });
      } else {
        setError('Функция недоступна. Используйте поиск по нику.');
        setStep('request');
      }
    } catch (err) {
      setError('Ошибка при запросе контакта');
      setStep('request');
    }
  };

  const proceedWithPhone = async (phone: string) => {
    try {
      const phoneHash = await hashPhone(phone);
      const res = await api.post('/contacts/telegram/match-by-phone', { phoneHash });
      const found = res.data.matches || [];

      if (found.length === 0) {
        setStep('empty');
      } else {
        setMatches(found);
        setStep('results');
      }
    } catch (err) {
      setError('Ошибка при поиске друзей');
      setStep('request');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px',
      }}>
        {step === 'request' && (
          <>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '16px',
            }}>
              Найти друзей в RADAR
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--tg-theme-hint-color, #999999)',
              marginBottom: '20px',
              lineHeight: '1.5',
            }}>
              Мы найдём пользователей RADAR, чьи номера телефонов совпадают с вашими контактами. Это работает только если друзья разрешили поиск по телефону.
            </p>

            {error && (
              <p style={{
                color: '#ff3b30',
                fontSize: '14px',
                marginBottom: '16px',
              }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
                  color: 'var(--tg-theme-text-color, #000000)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleRequestContactSimple}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Найти
              </button>
            </div>
          </>
        )}

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e0e0e0',
              borderTopColor: 'var(--tg-theme-button-color, #2481cc)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: 'var(--tg-theme-text-color, #000000)' }}>
              Ищем ваших друзей...
            </p>
          </div>
        )}

        {step === 'empty' && (
          <>
            <div style={{
              textAlign: 'center',
              padding: '20px 0',
              marginBottom: '20px',
            }}>
              <span style={{ fontSize: '48px' }}>🔍</span>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--tg-theme-text-color, #000000)',
                marginTop: '12px',
              }}>
                Никого не найдено
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--tg-theme-hint-color, #999999)',
                marginTop: '8px',
              }}>
                Попробуйте поиск по никнейму или пригласите друзей в RADAR
              </p>
            </div>
            <button
              onClick={onCancel}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </>
        )}

        {step === 'results' && (
          <>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '16px',
            }}>
              Найдено друзей: {matches.length}
            </h2>
            <div style={{
              maxHeight: '300px',
              overflow: 'auto',
              marginBottom: '20px',
            }}>
              {matches.map((match) => (
                <div
                  key={match.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderBottom: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                  }}
                >
                  {match.avatarUrl ? (
                    <img
                      src={match.avatarUrl}
                      alt={match.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '18px',
                      fontWeight: 'bold',
                    }}>
                      {match.name?.[0] || '?'}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'var(--tg-theme-text-color, #000000)',
                    }}>
                      {match.name}
                    </p>
                    {match.username && (
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--tg-theme-hint-color, #999999)',
                      }}>
                        @{match.username}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onFriendFound(match.userId)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Добавить
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={onCancel}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Закрыть
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}