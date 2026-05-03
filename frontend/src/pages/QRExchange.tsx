import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function QRExchange() {
  const navigate = useNavigate();
  const [myCards, setMyCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const res = await api.get('/business-cards');
      setMyCards(res.data);
      if (res.data.length > 0) {
        setSelectedCard(res.data[0]);
        loadQR(res.data[0].contactId);
      }
    } catch (err) {
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQR = async (contactId: string) => {
    try {
      const res = await api.get(`/business-cards/qr/${contactId}`, {
        responseType: 'blob',
      });
      setQrCodeUrl(URL.createObjectURL(res.data));
    } catch (err) {
      console.error('Failed to load QR:', err);
    }
  };

  const handleSelectCard = (card: any) => {
    setSelectedCard(card);
    loadQR(card.contactId);
  };

  const handleCreateCard = () => {
    navigate('/card/new');
  };

  const handleScanContact = () => {
    // Navigate to contacts to manually add or scan
    navigate('/contacts');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Назад
        </button>
        <h1 style={styles.title}>Обмен визиткой</h1>
      </header>

      {/* Instruction */}
      <div style={styles.instruction}>
        <p style={styles.instructionText}>
          1. Представься собеседнику
        </p>
        <p style={styles.instructionText}>
          2. Дай отсканировать свою визитку
        </p>
        <p style={styles.instructionText}>
          3. Отсканируй визитку собеседника
        </p>
      </div>

      {/* My Card QR */}
      <div style={styles.qrSection}>
        <h2 style={styles.sectionTitle}>Моя визитка</h2>

        {myCards.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>У тебя ещё нет визитки</p>
            <button onClick={handleCreateCard} style={styles.createBtn}>
              Создать визитку
            </button>
          </div>
        ) : (
          <>
            {/* Card Selector */}
            {myCards.length > 1 && (
              <div style={styles.cardSelector}>
                {myCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    style={{
                      ...styles.cardOption,
                      ...(selectedCard?.id === card.id ? styles.cardOptionActive : {}),
                    }}
                  >
                    {card.businessName || 'Без названия'}
                  </button>
                ))}
              </div>
            )}

            {/* QR Code */}
            <div style={styles.qrContainer}>
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR Code" style={styles.qrImage} />
              ) : (
                <div style={styles.qrPlaceholder}>
                  <span style={{ fontSize: '48px' }}>📱</span>
                  <p>QR-код загружается...</p>
                </div>
              )}
            </div>

            {/* Card Info */}
            {selectedCard && (
              <div style={styles.cardInfo}>
                <h3 style={styles.cardName}>{selectedCard.businessName}</h3>
                {selectedCard.personalData && (
                  <p style={styles.cardPersonal}>
                    {(() => {
                      try {
                        const data = JSON.parse(selectedCard.personalData);
                        return [data.fullName, data.position].filter(Boolean).join(' • ');
                      } catch {
                        return '';
                      }
                    })()}
                  </p>
                )}
                <p style={styles.cardId}>ID: {selectedCard.contactId}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={handleScanContact} style={styles.actionBtn}>
          <span style={styles.actionIcon}>📷</span>
          <span>Добавить контакт</span>
        </button>
        {selectedCard && (
          <button
            onClick={() => navigate(`/card/${selectedCard.id}/edit`)}
            style={styles.actionBtnSecondary}
          >
            <span style={styles.actionIcon}>✏️</span>
            <span>Редактировать</span>
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--radar-bg)',
    padding: '16px',
    paddingBottom: 'calc(16px + var(--radar-safe-bottom))',
  },
  loadingText: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    paddingTop: '100px',
  },
  header: {
    marginBottom: '24px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '16px',
    fontWeight: '600',
    padding: '8px 0',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
  },
  instruction: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
  },
  instructionText: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  qrSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  emptyCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '32px 16px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '16px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '16px',
  },
  createBtn: {
    padding: '14px 24px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
  },
  cardSelector: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  cardOption: {
    padding: '10px 16px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '20px',
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    whiteSpace: 'nowrap',
  },
  cardOptionActive: {
    backgroundColor: 'var(--radar-accent)',
    borderColor: 'var(--radar-accent)',
    color: '#fff',
  },
  qrContainer: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
  },
  qrImage: {
    width: '100%',
    maxWidth: '280px',
    height: 'auto',
  },
  qrPlaceholder: {
    textAlign: 'center',
    color: '#333',
  },
  cardInfo: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
  },
  cardName: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  cardPersonal: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '8px',
  },
  cardId: {
    fontSize: '12px',
    color: 'var(--radar-text-tertiary)',
    fontFamily: 'monospace',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
  },
  actionBtnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'var(--radar-surface)',
    color: 'var(--radar-text)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
  },
  actionIcon: {
    fontSize: '20px',
  },
};
