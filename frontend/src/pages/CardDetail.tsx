import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function CardDetail() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        // Get ref_user_id from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const refUserId = urlParams.get('ref_user_id');

        const response = await axios.get(`${API_URL}/business-cards/public/${contactId}`);
        setCard(response.data);

        // If ref_user_id exists, add contact
        if (refUserId) {
          try {
            await axios.post(`${API_URL}/contacts/add-by-ref`, {
              contactId,
              refUserId,
            });
          } catch (err) {
            console.error('Failed to add contact:', err);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Визитка не найдена');
      } finally {
        setLoading(false);
      }
    };

    if (contactId) {
      fetchCard();
    }
  }, [contactId]);

  const handleAddContact = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refUserId = urlParams.get('ref_user_id');

      await axios.post(`${API_URL}/contacts/add-by-ref`, {
        contactId,
        refUserId: refUserId || undefined,
      });

      alert('Контакт добавлен!');
      navigate('/contacts');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка при добавлении контакта');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: card?.businessName || 'Визитка',
      text: `Посмотрите визитку: ${card?.businessName}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Ссылка скопирована в буфер обмена');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleExportVCard = () => {
    if (!card) return;

    const personalData = card.personalData ? JSON.parse(card.personalData) : {};
    const resources = card.resources ? JSON.parse(card.resources) : {};

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${personalData.fullName || card.businessName || 'Contact'}`,
      personalData.phone ? `TEL:${personalData.phone}` : '',
      personalData.email ? `EMAIL:${personalData.email}` : '',
      personalData.position ? `TITLE:${personalData.position}` : '',
      card.businessName ? `ORG:${card.businessName}` : '',
      resources.website ? `URL:${resources.website}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.businessName || 'contact'}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
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

  if (error || !card) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div>
          <p style={{
            fontSize: '18px',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '16px',
          }}>
            {error || 'Визитка не найдена'}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
              color: 'var(--tg-theme-button-text-color, #ffffff)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const personalData = card.personalData ? JSON.parse(card.personalData) : {};
  const resources = card.resources ? JSON.parse(card.resources) : {};

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
      padding: '16px',
    }}>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
      }}>
        {/* Card */}
        <div style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '8px',
          }}>
            {card.businessName}
          </h1>
          
          {personalData.fullName && (
            <p style={{
              fontSize: '16px',
              color: 'var(--tg-theme-hint-color, #999999)',
              marginBottom: '24px',
            }}>
              {personalData.fullName}
              {personalData.position && ` • ${personalData.position}`}
            </p>
          )}

          {/* Contact Info */}
          <div style={{ marginBottom: '24px' }}>
            {personalData.phone && (
              <a
                href={`tel:${personalData.phone}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  color: 'var(--tg-theme-text-color, #000000)',
                }}
              >
                <span>📞</span>
                <span>{personalData.phone}</span>
              </a>
            )}

            {personalData.email && (
              <a
                href={`mailto:${personalData.email}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  color: 'var(--tg-theme-text-color, #000000)',
                }}
              >
                <span>✉️</span>
                <span>{personalData.email}</span>
              </a>
            )}

            {resources.website && (
              <a
                href={resources.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  color: 'var(--tg-theme-text-color, #000000)',
                }}
              >
                <span>🌐</span>
                <span>Сайт</span>
              </a>
            )}

            {resources.telegram && (
              <a
                href={`https://t.me/${resources.telegram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  color: 'var(--tg-theme-text-color, #000000)',
                }}
              >
                <span>✈️</span>
                <span>Telegram</span>
              </a>
            )}

            {resources.whatsapp && (
              <a
                href={`https://wa.me/${resources.whatsapp.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  color: 'var(--tg-theme-text-color, #000000)',
                }}
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
            )}

            {resources.linkedin && (
              <a
                href={resources.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  color: 'var(--tg-theme-text-color, #000000)',
                }}
              >
                <span>💼</span>
                <span>LinkedIn</span>
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <button
            onClick={handleAddContact}
            style={{
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
            Сохранить контакт
          </button>
          <button
            onClick={handleShare}
            style={{
              padding: '16px',
              backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
              color: 'var(--tg-theme-button-color, #2481cc)',
              border: '1px solid var(--tg-theme-button-color, #2481cc)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            Поделиться
          </button>
        </div>

        <button
          onClick={handleExportVCard}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
            color: 'var(--tg-theme-text-color, #000000)',
            border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          📥 Экспорт vCard
        </button>
      </div>
    </div>
  );
}
