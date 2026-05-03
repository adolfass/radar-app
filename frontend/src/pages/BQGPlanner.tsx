import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function BQGPlanner() {
  const navigate = useNavigate();
  const [currentBQG, setCurrentBQG] = useState<any>(null);
  const [bqgHistory, setBqgHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [newQuarterStart, setNewQuarterStart] = useState('');
  const [newQuarterEnd, setNewQuarterEnd] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentRes, allRes] = await Promise.allSettled([
        api.get('/bqg/current'),
        api.get('/bqg'),
      ]);

      if (currentRes.status === 'fulfilled') setCurrentBQG(currentRes.value.data);
      if (allRes.status === 'fulfilled') setBqgHistory(allRes.value.data);
    } catch (err) {
      console.error('Failed to load BQG:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newGoal || !newQuarterStart || !newQuarterEnd) return;

    try {
      await api.post('/bqg', {
        goal: newGoal,
        quarterStart: newQuarterStart,
        quarterEnd: newQuarterEnd,
        missingRoles: '',
      });
      setShowForm(false);
      setNewGoal('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
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
        <button onClick={() => navigate('/')} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>BQG — Боевая Группировка</h1>
      </header>

      <div style={styles.info}>
        <p style={styles.infoText}>
          BQG определяет, каких ролей не хватает в твоей сети для достижения квартальной цели.
        </p>
      </div>

      {/* Current BQG */}
      {currentBQG && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Текущий квартал</h2>
          <div style={styles.bqgCard}>
            <h3 style={styles.bqgGoal}>{currentBQG.goal}</h3>
            <p style={styles.bqgDates}>
              {new Date(currentBQG.quarterStart).toLocaleDateString('ru-RU')} — {new Date(currentBQG.quarterEnd).toLocaleDateString('ru-RU')}
            </p>
            {currentBQG.missingRoles && (
              <div style={styles.missingRoles}>
                <span style={styles.missingLabel}>Недостающие роли:</span>
                <p style={styles.missingValue}>{currentBQG.missingRoles}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create New */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={styles.createBtn}>
          + Новый BQG
        </button>
      ) : (
        <div style={styles.form}>
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            style={styles.input}
            placeholder="Цель квартала"
          />
          <input
            type="datetime-local"
            value={newQuarterStart}
            onChange={(e) => setNewQuarterStart(e.target.value)}
            style={styles.input}
            placeholder="Начало квартала"
          />
          <input
            type="datetime-local"
            value={newQuarterEnd}
            onChange={(e) => setNewQuarterEnd(e.target.value)}
            style={styles.input}
            placeholder="Конец квартала"
          />
          <div style={styles.formActions}>
            <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Отмена</button>
            <button onClick={handleCreate} style={styles.submitBtn}>Создать</button>
          </div>
        </div>
      )}

      {/* History */}
      {bqgHistory.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>История</h2>
          {bqgHistory.map((bqg) => (
            <div key={bqg.id} style={styles.historyItem}>
              <p style={styles.historyGoal}>{bqg.goal}</p>
              <p style={styles.historyDates}>
                {new Date(bqg.quarterStart).toLocaleDateString('ru-RU')} — {new Date(bqg.quarterEnd).toLocaleDateString('ru-RU')}
              </p>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: bqg.isActive ? 'var(--radar-success)' : 'var(--radar-text-tertiary)',
              }}>
                {bqg.isActive ? 'Активен' : 'Завершён'}
              </span>
            </div>
          ))}
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
    paddingBottom: 'calc(16px + var(--radar-safe-bottom))',
  },
  loadingText: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    paddingTop: '100px',
  },
  header: { marginBottom: '24px' },
  backBtn: {
    background: 'none', border: 'none', color: 'var(--radar-accent)',
    fontSize: '16px', fontWeight: '600', padding: '8px 0', marginBottom: '8px',
  },
  title: { fontSize: '24px', fontWeight: '700' },
  info: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px', marginBottom: '24px',
  },
  infoText: { fontSize: '14px', color: 'var(--radar-text-secondary)', lineHeight: '1.5' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '12px' },
  bqgCard: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px',
  },
  bqgGoal: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' },
  bqgDates: { fontSize: '14px', color: 'var(--radar-text-secondary)', marginBottom: '12px' },
  missingRoles: { marginTop: '12px' },
  missingLabel: { fontSize: '13px', color: 'var(--radar-text-secondary)' },
  missingValue: { fontSize: '14px', color: 'var(--radar-warning)', marginTop: '4px' },
  createBtn: {
    width: '100%', padding: '16px', backgroundColor: 'var(--radar-accent)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
  },
  form: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  input: {
    padding: '12px', backgroundColor: 'var(--radar-surface-elevated)',
    border: '1px solid var(--radar-border)', borderRadius: '8px', color: 'var(--radar-text)', fontSize: '14px',
  },
  formActions: { display: 'flex', gap: '12px' },
  cancelBtn: {
    flex: 1, padding: '14px', backgroundColor: 'var(--radar-surface-elevated)',
    color: 'var(--radar-text)', border: '1px solid var(--radar-border)', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
  },
  submitBtn: {
    flex: 1, padding: '14px', backgroundColor: 'var(--radar-accent)',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600',
  },
  historyItem: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px', marginBottom: '12px',
  },
  historyGoal: { fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
  historyDates: { fontSize: '13px', color: 'var(--radar-text-secondary)', marginBottom: '8px' },
  statusBadge: {
    display: 'inline-block', padding: '4px 10px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '600', color: '#fff',
  },
};
