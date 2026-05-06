import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useBusinessCards } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';

export function BusinessCardForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { cards, createCard, updateCard } = useBusinessCards();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    position: '',
    phone: '',
    email: '',
    website: '',
    telegram: '',
    whatsapp: '',
    linkedin: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [fromScan, setFromScan] = useState(false);

  useEffect(() => {
    // Pre-fill from query params (from QR scan)
    const fullName = searchParams.get('fullName');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const businessName = searchParams.get('businessName');
    const position = searchParams.get('position');
    const phone = searchParams.get('phone');
    const email = searchParams.get('email');
    const website = searchParams.get('website');
    const telegram = searchParams.get('telegram');
    const linkedin = searchParams.get('linkedin');
    const notes = searchParams.get('notes');

    if (fullName || firstName || lastName || businessName) {
      setFromScan(true);
      const name = fullName || [firstName, lastName].filter(Boolean).join(' ');
      setFormData(prev => ({
        ...prev,
        fullName: name || prev.fullName,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        businessName: businessName || prev.businessName,
        position: position || prev.position,
        phone: phone || prev.phone,
        email: email || prev.email,
        website: website || prev.website,
        telegram: telegram || prev.telegram,
        linkedin: linkedin || prev.linkedin,
        notes: notes || prev.notes,
      }));
    }

    if (id) {
      const card = cards.find(c => c.id === parseInt(id));
      if (card) {
        const personalData = card.personalData ? JSON.parse(card.personalData) : {};
        const resources = card.resources ? JSON.parse(card.resources) : {};

        setFormData(prev => ({
          ...prev,
          businessName: card.businessName || '',
          fullName: personalData.fullName || '',
          position: personalData.position || '',
          phone: personalData.phone || '',
          email: personalData.email || '',
          website: resources.website || '',
          telegram: resources.telegram || '',
          whatsapp: resources.whatsapp || '',
          linkedin: resources.linkedin || '',
        }));
      }
    } else if (user && !formData.fullName && !formData.telegram && !fromScan) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || fullName,
        telegram: prev.telegram || (user.username ? `@${user.username}` : ''),
      }));
    }
  }, [id, cards, user, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const personalData = {
        fullName: formData.fullName,
        position: formData.position,
        phone: formData.phone,
        email: formData.email,
      };

      const resources = {
        website: formData.website,
        telegram: formData.telegram,
        whatsapp: formData.whatsapp,
        linkedin: formData.linkedin,
        notes: formData.notes,
      };

      if (id) {
        await updateCard(parseInt(id), {
          businessName: formData.businessName,
          personalData,
          resources,
        });
      } else {
        await createCard({
          businessName: formData.businessName,
          personalData,
          resources,
        });
      }

      navigate('/profile');
    } catch (error) {
      console.error('Error saving business card:', error);
      alert('Ошибка при сохранении визитки');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
      <header style={{
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--tg-theme-text-color, #000000)',
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--tg-theme-text-color, #000000)',
          margin: 0,
        }}>
          {fromScan ? 'Добавить контакт' : (id ? 'Редактировать визитку' : 'Новая визитка')}
        </h1>
      </header>

      {fromScan && (
        <div style={{
          backgroundColor: 'rgba(48, 209, 88, 0.15)',
          border: '1px solid rgba(48, 209, 88, 0.3)',
          color: '#30d158',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          fontWeight: '500',
        }}>
          📱 Контакт из QR-кода — проверьте данные и сохраните
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '16px',
          }}>
            Основная информация
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              Название компании
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="ООО «Пример»"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              ФИО *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Иванов Иван Иванович"
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              Должность
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="Генеральный директор"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '16px',
          }}>
            Контакты
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              Телефон
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.ru"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '16px',
          }}>
            Соцсети и сайты
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              Сайт
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              Telegram
            </label>
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleChange}
              placeholder="@username"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              WhatsApp
            </label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+79991234567"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              LinkedIn
            </label>
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="linkedin.com/in/username"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
                color: 'var(--tg-theme-text-color, #000000)',
              }}
            />
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color, #000000)',
            marginBottom: '16px',
          }}>
            Заметки
          </h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Дополнительная информация о контакте..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
              borderRadius: '8px',
              backgroundColor: 'var(--tg-theme-bg-color, #f5f5f5)',
              color: 'var(--tg-theme-text-color, #000000)',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: loading ? 'var(--tg-theme-hint-color, #cccccc)' : 'var(--tg-theme-button-color, #2481cc)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
    </div>
  );
}
