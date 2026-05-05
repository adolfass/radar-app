import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface PublicProfile {
  id: number;
  name: string;
  username?: string;
  photoUrl?: string;
}

export function ScanConfirm() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/contacts/public/${userId}`);
      setProfile(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!userId) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/contacts/qr-exchange', { 
        targetUserId: parseInt(userId, 10) 
      });
      if (res.data.success) {
        setSuccess(res.data.message || 'Контакт добавлен!');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка добавления контакта');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!profile && !error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Профиль не найден</div>
        <button onClick={handleCancel} style={styles.cancelBtn}>На главную</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={handleCancel} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>Добавить контакт</h1>
      </header>

      {/* Success message */}
      {success && (
        <div style={styles.successToast}>{success}</div>
      )}

      {/* Error message */}
      {error && (
        <div style={styles.errorToast}>{error}</div>
      )}

      {/* Profile Card */}
      <div style={styles.card}>
        {profile?.photoUrl ? (
          <img src={profile.photoUrl} alt={profile.name} style={styles.avatar} />
        ) : (
          <div style={styles.avatarPlaceholder}>
            {(profile?.name || '?').charAt(0).toUpperCase()}
          </div>
        )}
        
        <h2 style={styles.name}>{profile?.name}</h2>
        {profile?.username && (
          <p style={styles.username}>@{profile.username}</p>
        )}
      </div>

      {/* Info */}
      <p style={styles.info}>
        Этот контакт хочет поделиться с тобой своей визиткой. 
        Добавить в свою сеть?
      </p>

      {/* Actions */}
      <div style={styles.actions}>
        <button 
          onClick={handleAddContact} 
          disabled={submitting || success}
          style={{
            ...styles.addBtn,
            opacity: submitting || success ? 0.6 : 1,
          }}
        >
          {submitting ? 'Добавляю...' : success ? '✓ Добавлено' : '✅ Добавить в сеть'}
        </button>
        
        <button onClick={handleCancel} style={styles.cancelBtn}>
          Отмена
        </button>
      </div>
    </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column'},
  loading: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    paddingTop: '100px',
  },
  error: {
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
    color: 'var(--radar-text)',
  },
  successToast: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    border: '1px solid rgba(48, 209, 88, 0.3)',
    color: '#30d158',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '15px',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorToast: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    border: '1px solid rgba(255, 59, 48, 0.3)',
    color: '#ff3b30',
    padding: '14px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '16px',
  },
  avatarPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    fontSize: '40px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  name: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'var(--radar-text)',
    marginBottom: '4px',
  },
  username: {
    fontSize: '16px',
    color: 'var(--radar-text-secondary)',
  },
  info: {
    fontSize: '15px',
    color: 'var(--radar-text-secondary)',
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  addBtn: {
    padding: '16px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '16px',
    backgroundColor: 'transparent',
    color: 'var(--radar-text-secondary)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};