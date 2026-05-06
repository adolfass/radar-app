import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusinessCards, useReferrals } from '../hooks/useApi';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { cards, deleteCard } = useBusinessCards();
  const { stats, getReferralLink } = useReferrals();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [photoError, setPhotoError] = useState(false);

  const isPremium = subscription?.plan === 'premium' && subscription?.isActive;
  const trialEnd = subscription?.trialEnd ? new Date(subscription.trialEnd) : null;
  const expiresAt = subscription?.expiresAt ? new Date(subscription.expiresAt) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

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
    let link = '';
    try {
      const response = await getReferralLink();
      link = response.data.link;
    } catch {
      alert('Ошибка при получении ссылки');
      return;
    }

    const shareText = 'Присоединяйтесь к Radar для создания цифровых визиток и делового нетворкинга!';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Radar - Цифровые визитки',
          text: shareText,
          url: link,
        });
      } else if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, '_blank');
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        await navigator.clipboard.writeText(link);
        alert('Ссылка скопирована!');
      }
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + 64px + var(--radar-safe-bottom))' }}>
      <header style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'var(--tg-theme-button-color, #2481cc)',
            padding: '8px',
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
        {user?.photoUrl && !photoError ? (
          <img
            src={user.photoUrl}
            alt={user.firstName || 'Avatar'}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '30px',
              objectFit: 'cover',
            }}
            onError={() => setPhotoError(true)}
          />
        ) : (
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
        )}
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
          }}>
            {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Пользователь'}
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--tg-theme-hint-color, #999999)',
          }}>
            @{user?.username || 'telegram_user'}
          </p>
        </div>
        {isPremium && (
          <div style={{
            marginLeft: 'auto',
            padding: '4px 12px',
            backgroundColor: '#fbbf24',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#000',
          }}>
            ⭐ PREMIUM
          </div>
        )}
      </div>

      {/* Subscription Status */}
      <div
        onClick={() => navigate('/subscription')}
        style={{
          backgroundColor: isPremium ? 'rgba(251, 191, 36, 0.1)' : 'var(--tg-theme-secondary-bg-color, #ffffff)',
          border: isPremium ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid var(--tg-theme-border-color, #e0e0e0)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>{isPremium ? '⭐' : trialEnd ? '⏳' : '👤'}</span>
            <div>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--tg-theme-text-color, #000000)',
              }}>
                {isPremium ? 'Premium' : trialEnd ? 'Пробный период' : 'Free план'}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--tg-theme-hint-color, #999999)',
              }}>
                {isPremium && expiresAt ? `Активен · ${daysLeft} дн.` : 'Нажмите для управления'}
              </p>
            </div>
          </div>
          <span style={{ color: 'var(--tg-theme-hint-color, #999999)' }}>→</span>
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
              {Number(stats?.totalPoints || 0)}
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

      {/* My Business Card - ONE card per user */}
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
            Моя визитка
          </h3>
          <button
            onClick={() => cards.length > 0 ? setSelectedCard(cards[0]) : navigate('/card/new')}
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
            {cards.length > 0 ? '📋 QR' : '+ Создать'}
          </button>
        </div>

        {cards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--tg-theme-hint-color, #999999)',
              marginBottom: '12px',
            }}>
              У вас пока нет визитки
            </p>
            <button
              onClick={() => navigate('/card/new')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Создать визитку
            </button>
          </div>
        ) : (
          <div
            onClick={() => setSelectedCard(cards[0])}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--tg-theme-text-color, #000000)',
                marginBottom: '4px',
              }}>
                {String(cards[0].businessName || 'Моя визитка')}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--tg-theme-hint-color, #999999)',
              }}>
                {cards[0].personalData ? JSON.parse(String(cards[0].personalData))?.fullName : ''}
              </p>
            </div>
            <span style={{
              fontSize: '20px',
              color: 'var(--tg-theme-button-color, #2481cc)',
            }}>
              →
            </span>
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
              {selectedCard.shareLink || `https://t.me/radar_strateg_bot?startapp=${selectedCard.contactId}`}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '16px',
            }}>
              <button
                onClick={() => {
                  const shareLink = selectedCard.shareLink || `https://t.me/radar_strateg_bot?startapp=${selectedCard.contactId}`;
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
    </div>
  );
}
