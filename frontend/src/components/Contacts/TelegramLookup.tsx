import { useState } from 'react';
import { api } from '../../lib/api';

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

interface TelegramLookupProps {
  onContactFound: (profile: TelegramProfile) => void;
  onCancel: () => void;
}

export function TelegramLookup({ onContactFound, onCancel }: TelegramLookupProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    found: boolean;
    alreadyAdded?: boolean;
    profile?: TelegramProfile;
    suggestion?: string;
  } | null>(null);

  const handleSearch = async () => {
    const username = query.replace('@', '').trim();
    if (!username) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/contacts/telegram/lookup', { username });
      setResult(response.data);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Слишком много запросов. Попробуйте позже.');
      } else {
        setError('Ошибка при поиске. Проверьте никнейм.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRetry = () => {
    setResult(null);
    setQuery('');
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
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'var(--tg-theme-text-color, #000000)',
          marginBottom: '20px',
        }}>
          Поиск в Telegram
        </h2>

        {!result && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="@username"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                  color: 'var(--tg-theme-text-color, #000000)',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{
                fontSize: '12px',
                color: 'var(--tg-theme-hint-color, #999999)',
                marginTop: '8px',
              }}>
                Введите никнейм контакта в Telegram
              </p>
            </div>

            {error && (
              <p style={{
                color: '#ff3b30',
                fontSize: '14px',
                marginBottom: '16px',
              }}>
                {error}
              </p>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
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
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: loading ? '#cccccc' : 'var(--tg-theme-button-color, #2481cc)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Поиск...' : 'Найти'}
              </button>
            </div>
          </div>
        )}

        {result && result.found && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}>
              {result.profile?.photoUrl ? (
                <img
                  src={result.profile.photoUrl}
                  alt={result.profile.firstName}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  ?
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: 'var(--tg-theme-text-color, #000000)',
                  }}>
                    {result.profile?.firstName} {result.profile?.lastName}
                  </h3>
                  {result.profile?.isPremium && (
                    <span style={{
                      backgroundColor: '#ffd700',
                      color: '#000',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}>
                      Premium
                    </span>
                  )}
                </div>
                {result.profile?.username && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--tg-theme-hint-color, #999999)',
                  }}>
                    @{result.profile.username}
                  </p>
                )}
              </div>
            </div>

            {result.profile?.bio && (
              <div style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color, #f5f5f5)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--tg-theme-text-color, #000000)',
                  fontStyle: 'italic',
                }}>
                  "{result.profile.bio}"
                </p>
              </div>
            )}

            {result.profile?.languageCode && (
              <p style={{
                fontSize: '12px',
                color: 'var(--tg-theme-hint-color, #999999)',
                marginBottom: '16px',
              }}>
                Язык: {result.profile.languageCode.toUpperCase()}
              </p>
            )}

            {result.alreadyAdded ? (
              <div style={{
                backgroundColor: '#fff3cd',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <p style={{ color: '#856404', fontSize: '14px' }}>
                  Этот контакт уже добавлен в вашу сеть
                </p>
              </div>
            ) : (
              <div style={{
                backgroundColor: '#d4edda',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <p style={{ color: '#155724', fontSize: '14px' }}>
                  Контакт найден! Можно добавить в сеть
                </p>
              </div>
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
                Закрыть
              </button>
              {!result.alreadyAdded && (
                <button
                  onClick={() => onContactFound(result.profile!)}
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
                  Добавить
                </button>
              )}
            </div>
          </div>
        )}

        {result && !result.found && (
          <div>
            <div style={{
              backgroundColor: '#f8d7da',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#721c24', fontSize: '14px' }}>
                Пользователь не найден
              </p>
              {result.suggestion && (
                <p style={{ color: '#721c24', fontSize: '12px', marginTop: '8px' }}>
                  {result.suggestion}
                </p>
              )}
            </div>

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
                Закрыть
              </button>
              <button
                onClick={handleRetry}
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
                Попробовать снова
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}