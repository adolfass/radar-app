import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusinessCards, useReferrals } from '../hooks/useApi';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cards, deleteCard } = useBusinessCards();
  const { stats, getReferralLink } = useReferrals();
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const handleCopyReferralLink = async () => {
    try {
      const response = await getReferralLink();
      await navigator.clipboard.writeText(response.data.link);
      alert('Реферальная ссылка скопирована!');
    } catch (error) {
      alert('Ошибка при копировании ссылки');
    }
  };

  const handleShare = async () => {
    try {
      const response = await getReferralLink();
      
      if (navigator.share) {
        await navigator.share({
          title: 'Vizitka - Цифровые визитки',
          text: 'Присоединяйтесь к Vizitka для создания цифровых визиток и делового нетворкинга!',
          url: response.data.link,
        });
      } else {
        await handleCopyReferralLink();
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

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
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--tg-theme-text-color, #000000)',
        }}>
          Профиль
        </h1>
      </header>

      {/* User Info */}
      <div style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          fontWeight: 'bold',
        }}>
          {user?.firstName?.[0] || 'U'}
        </div>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            {user?.firstName || 'Пользователь'}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--tg-theme-hint-color, #999999)',
          }}>
            @{user?.username || 'telegram_user'}
          </p>
        </div>
      </div>

      {/* Balance */}
      <div style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <span style={{
            fontSize: '16px',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            Баланс
          </span>
          <span style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--tg-theme-button-color, #2481cc)',
          }}>
            {user?.balance || 0} ⭐️
          </span>
        </div>
        <p style={{
          fontSize: '14px',
          color: 'var(--tg-theme-hint-color, #999999)',
        }}>
          Зарабатывайте баллы, приглашая друзей!
        </p>
      </div>

      {/* Referral Program */}
      <div style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--tg-theme-text-color, #000000)',
          marginBottom: '16px',
        }}>
          Реферальная программа
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'var(--tg-theme-button-color, #2481cc)',
            }}>
              {stats?.totalReferrals || 0}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--tg-theme-hint-color, #999999)',
            }}>
              Приглашено
            </p>
          </div>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'var(--tg-theme-button-color, #2481cc)',
            }}>
              {stats?.totalPoints || 0}
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--tg-theme-hint-color, #999999)',
            }}>
              Заработано ⭐️
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          <button
            onClick={handleCopyReferralLink}
            style={{
              padding: '12px',
              backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Копировать ссылку
          </button>
          <button
            onClick={handleShare}
            style={{
              padding: '12px',
              backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
              color: 'var(--tg-theme-button-color, #2481cc)',
              border: '1px solid var(--tg-theme-button-color, #2481cc)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Поделиться
          </button>
        </div>
      </div>

      {/* My Business Cards */}
      <div style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            Мои визитки
          </h3>
          <button
            onClick={() => navigate('/card/new')}
            disabled={cards.length >= 7}
            style={{
              padding: '8px 16px',
              backgroundColor: cards.length >= 7 ? 'var(--tg-theme-hint-color, #cccccc)' : 'var(--tg-theme-button-color, #2481cc)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              cursor: cards.length >= 7 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            + Новая
          </button>
        </div>

        {cards.length === 0 ? (
          <p style={{
            fontSize: '14px',
            color: 'var(--tg-theme-hint-color, #999999)',
            textAlign: 'center',
            padding: '20px',
          }}>
            У вас пока нет визиток
          </p>
        ) : (
          <div>
            {cards.map((card) => (
              <div
                key={card.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--tg-theme-text-color, #000000)',
                  }}>
                    {card.businessName || 'Без названия'}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--tg-theme-hint-color, #999999)',
                  }}>
                    {card.personalData ? JSON.parse(card.personalData)?.fullName : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedCard(card)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    📋 QR
                  </button>
                  <button
                    onClick={() => navigate(`/card/${card.id}/edit`)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: 'var(--tg-theme-button-color, #2481cc)',
                      border: '1px solid var(--tg-theme-button-color, #2481cc)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Удалить визитку?')) {
                        deleteCard(card.id);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#ff3b30',
                      border: '1px solid #ff3b30',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedCard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onClick={() => setSelectedCard(null)}
        >
          <div style={{
            backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '90%',
            width: '320px',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              {selectedCard.businessName || 'Визитка'}
            </h3>
            {selectedCard.qrCodeDataUrl ? (
              <img 
                src={selectedCard.qrCodeDataUrl} 
                alt="QR Code" 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  display: 'block', 
                  margin: '0 auto' 
                }} 
              />
            ) : (
              <div style={{
                width: '200px',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                borderRadius: '8px',
              }}>
                <p style={{ color: 'var(--tg-theme-hint-color, #999999)' }}>
                  QR-код недоступен
                </p>
              </div>
            )}
            <p style={{
              fontSize: '12px',
              color: 'var(--tg-theme-hint-color, #999999)',
              textAlign: 'center',
              marginTop: '12px',
              wordBreak: 'break-all',
            }}>
              {selectedCard.shareLink || `https://t.me/vizitka_test_bot?startapp=${selectedCard.contactId}`}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '16px',
            }}>
              <button
                onClick={() => {
                  const shareLink = selectedCard.shareLink || `https://t.me/vizitka_test_bot?startapp=${selectedCard.contactId}`;
                  const shareText = `Моя визитка: ${selectedCard.businessName}\n${shareLink}`;
                  const tg = (window as any).Telegram?.WebApp;
                  
                  // Открываем Telegram share dialog
                  if (tg && tg.openTelegramLink) {
                    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent('Моя визитка: ' + selectedCard.businessName)}`;
                    tg.openTelegramLink(shareUrl);
                  } else if (tg && tg.switchInlineQuery) {
                    // Альтернативный метод
                    tg.switchInlineQuery(shareText, ['users', 'groups', 'channels']);
                  } else if (navigator.share) {
                    // Fallback для браузеров
                    navigator.share({
                      title: 'Моя визитка',
                      text: shareText,
                      url: shareLink,
                    }).catch(() => {
                      navigator.clipboard.writeText(shareLink);
                      alert('Ссылка скопирована!');
                    });
                  } else {
                    navigator.clipboard.writeText(shareLink);
                    alert('Ссылка скопирована!');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                📤 Поделиться
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
                  color: 'var(--tg-theme-text-color, #000000)',
                  border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div style={{
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--tg-theme-text-color, #000000)',
          marginBottom: '16px',
        }}>
          Настройки
        </h3>
        
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#ff3b30',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Выйти
        </button>
      </div>

      {user?.isOrganizer && (
        <button
          onClick={() => navigate('/admin')}
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
          }}
        >
          ⚙️ Админ-панель
        </button>
      )}
    </div>
  );
}
