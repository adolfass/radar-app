import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface ReferralInfo {
  code: string;
  link: string;
  earned: number;
  redeemed: number;
  balance: number;
  referredCount: number;
  milestones: {
    monthAvailable: boolean;
    yearAvailable: boolean;
  };
}

interface ReferralHistoryItem {
  id: string;
  referredId: number;
  starsAwarded: number;
  status: string;
  createdAt: string;
  referred: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    photoUrl: string;
  };
}

const STARS_FOR_MONTH = 100;
const STARS_FOR_YEAR = 500;

export function ReferralScreen() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemType, setRedeemType] = useState<'MONTH' | 'YEAR' | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [infoRes, historyRes] = await Promise.all([
        api.get('/referral/info'),
        api.get('/referral/history?limit=10'),
      ]);
      setInfo(infoRes.data);
      setHistory(historyRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!info?.link) return;
    try {
      await navigator.clipboard.writeText(info.link);
      setSuccess('Ссылка скопирована!');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Не удалось скопировать');
    }
  };

  const handleShare = async () => {
    if (!info?.link) return;
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.shareURL) {
        await tg.shareURL(info.link, 'Присоединяйся к RADAR!');
      } else {
        await navigator.clipboard.writeText(info.link);
        setSuccess('Ссылка скопирована!');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(info.link);
      setSuccess('Ссылка скопирована!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleRedeem = async () => {
    if (!redeemType || !info) return;
    setRedeeming(true);
    setError('');
    try {
      const res = await api.post('/referral/redeem', { type: redeemType });
      setSuccess(res.data.message);
      setShowRedeemModal(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка активации');
    } finally {
      setRedeeming(false);
    }
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
      <header style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>Звёзды RADAR</h1>
      </header>

      {success && <div style={styles.successToast}>{success}</div>}
      {error && <div style={styles.errorToast}>{error}</div>}

      {info && (
        <>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🎁 Твоя реферальная ссылка</h2>
            
            <div style={styles.codeBox}>
              <span style={styles.codeLabel}>Код:</span>
              <span style={styles.codeValue}>{info.code}</span>
            </div>

            <div style={styles.linkBox}>
              <input 
                type="text" 
                value={info.link} 
                readOnly 
                style={styles.linkInput} 
              />
            </div>

            <div style={styles.actionRow}>
              <button onClick={handleCopyLink} style={styles.actionBtn}>
                📋 Копировать
              </button>
              <button onClick={handleShare} style={styles.actionBtn}>
                📤 Поделиться
              </button>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>⭐ Баланс звёзд</h2>
            
            <div style={styles.balanceCard}>
              <div style={styles.balanceMain}>
                <span style={styles.balanceValue}>{info.balance}</span>
                <span style={styles.balanceLabel}>звёзд</span>
              </div>
              <div style={styles.balanceDetails}>
                <span>Начислено: {info.earned}</span>
                <span>Потрачено: {info.redeemed}</span>
              </div>
            </div>

            <div style={styles.progressSection}>
              <div style={styles.progressItem}>
                <div style={styles.progressHeader}>
                  <span>Месяц Premium</span>
                  <span>{info.balance} / {STARS_FOR_MONTH}</span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min((info.balance / STARS_FOR_MONTH) * 100, 100)}%`,
                      backgroundColor: info.milestones.monthAvailable ? '#30d158' : '#0088cc',
                    }} 
                  />
                </div>
                {info.milestones.monthAvailable && (
                  <button 
                    onClick={() => { setRedeemType('MONTH'); setShowRedeemModal(true); }}
                    style={styles.redeemBtn}
                  >
                    Активировать
                  </button>
                )}
              </div>

              <div style={styles.progressItem}>
                <div style={styles.progressHeader}>
                  <span>Год Premium</span>
                  <span>{info.balance} / {STARS_FOR_YEAR}</span>
                </div>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill,
                      width: `${Math.min((info.balance / STARS_FOR_YEAR) * 100, 100)}%`,
                      backgroundColor: info.milestones.yearAvailable ? '#30d158' : '#0088cc',
                    }} 
                  />
                </div>
                {info.milestones.yearAvailable && (
                  <button 
                    onClick={() => { setRedeemType('YEAR'); setShowRedeemModal(true); }}
                    style={styles.redeemBtn}
                  >
                    Активировать
                  </button>
                )}
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>👥 Приглашённые ({info.referredCount})</h2>
            
            {history.length === 0 ? (
              <p style={styles.emptyText}>Пока нет приглашённых</p>
            ) : (
              <div style={styles.referralsList}>
                {history.map((item) => (
                  <div key={item.id} style={styles.referralItem}>
                    {item.referred.photoUrl ? (
                      <img src={item.referred.photoUrl} alt="" style={styles.referralAvatar} />
                    ) : (
                      <div style={styles.referralAvatarPlaceholder}>
                        {(item.referred.firstName || item.referred.username || '?').charAt(0)}
                      </div>
                    )}
                    <div style={styles.referralInfo}>
                      <span style={styles.referralName}>
                        {item.referred.firstName} {item.referred.lastName || ''}
                      </span>
                      <span style={styles.referralUsername}>
                        @{item.referred.username || 'нет username'}
                      </span>
                    </div>
                    <div style={styles.referralStatus}>
                      <span style={styles.starsBadge}>+{item.starsAwarded} ⭐</span>
                      <span style={{
                        ...styles.statusBadge,
                        color: item.status === 'ACTIVE' ? '#30d158' : '#999',
                      }}>
                        {item.status === 'ACTIVE' ? '✓' : '⏳'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {showRedeemModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Активировать Premium?</h3>
            <p style={styles.modalText}>
              Потратить {redeemType === 'MONTH' ? STARS_FOR_MONTH : STARS_FOR_YEAR} звёзд на{' '}
              {redeemType === 'MONTH' ? '1 месяц' : '1 год'} Premium?
            </p>
            <div style={styles.modalButtons}>
              <button 
                onClick={handleRedeem} 
                disabled={redeeming}
                style={styles.modalConfirmBtn}
              >
                {redeeming ? 'Активирую...' : 'Да, активировать'}
              </button>
              <button 
                onClick={() => setShowRedeemModal(false)} 
                style={styles.modalCancelBtn}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--radar-bg)',
    padding: '16px',
    paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
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
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  errorToast: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    border: '1px solid rgba(255, 59, 48, 0.3)',
    color: '#ff3b30',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    color: 'var(--radar-text)',
  },
  codeBox: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  codeLabel: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    display: 'block',
    marginBottom: '4px',
  },
  codeValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--radar-accent)',
    fontFamily: 'monospace',
  },
  linkBox: {
    marginBottom: '12px',
  },
  linkInput: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '8px',
    color: 'var(--radar-text)',
    fontSize: '13px',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
  },
  actionBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  balanceCard: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  balanceMain: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  balanceValue: {
    fontSize: '48px',
    fontWeight: '700',
    color: 'var(--radar-accent)',
  },
  balanceLabel: {
    fontSize: '20px',
    color: 'var(--radar-text-secondary)',
  },
  balanceDetails: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  progressItem: {
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    padding: '16px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
    color: 'var(--radar-text)',
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'var(--radar-border)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  redeemBtn: {
    marginTop: '12px',
    width: '100%',
    padding: '10px',
    backgroundColor: '#30d158',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyText: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    padding: '24px',
  },
  referralsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  referralItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
  },
  referralAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  referralAvatarPlaceholder: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  referralInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  referralName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--radar-text)',
  },
  referralUsername: {
    fontSize: '13px',
    color: 'var(--radar-text-secondary)',
  },
  referralStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  starsBadge: {
    fontSize: '13px',
    color: 'var(--radar-accent)',
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: '16px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '340px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    textAlign: 'center',
    color: 'var(--radar-text)',
  },
  modalText: {
    fontSize: '15px',
    color: 'var(--radar-text-secondary)',
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  modalButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalConfirmBtn: {
    padding: '14px',
    backgroundColor: 'var(--radar-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalCancelBtn: {
    padding: '14px',
    backgroundColor: 'transparent',
    color: 'var(--radar-text-secondary)',
    border: '1px solid var(--radar-border)',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};