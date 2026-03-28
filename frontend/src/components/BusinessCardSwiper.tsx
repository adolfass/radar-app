import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface BusinessCard {
  id: number;
  contactId: string;
  businessName?: string;
  resources?: string;
  personalData?: string;
  qrCodeUrl?: string;
}

interface BusinessCardSwiperProps {
  cards: BusinessCard[];
}

export function BusinessCardSwiper({ cards }: BusinessCardSwiperProps) {
  const navigate = useNavigate();

  if (cards.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
        borderRadius: '12px',
      }}>
        <p style={{
          fontSize: '16px',
          color: 'var(--tg-theme-hint-color, #999999)',
          marginBottom: '16px',
        }}>
          У вас пока нет визиток
        </p>
        <button
          onClick={() => navigate('/card/new')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Создать первую визитку
        </button>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={16}
      slidesPerView={1.2}
      centeredSlides={true}
      pagination={{ clickable: true }}
      style={{
        paddingBottom: '40px',
      }}
    >
      {cards.map((card) => (
        <SwiperSlide key={card.id}>
          <div
            onClick={() => navigate(`/card/${card.id}/edit`)}
            style={{
              padding: '24px',
              backgroundColor: 'var(--tg-theme-secondary-bg-color, #ffffff)',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'var(--tg-theme-text-color, #000000)',
              marginBottom: '8px',
            }}>
              {card.businessName || 'Без названия'}
            </h3>
            {card.personalData && (
              <p style={{
                fontSize: '14px',
                color: 'var(--tg-theme-hint-color, #999999)',
              }}>
                {JSON.parse(card.personalData)?.fullName || ''}
              </p>
            )}
            <div style={{
              marginTop: 'auto',
              paddingTop: '16px',
              fontSize: '12px',
              color: 'var(--tg-theme-button-color, #2481cc)',
            }}>
              Нажмите для редактирования
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
