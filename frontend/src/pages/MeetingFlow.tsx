import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function MeetingFlow() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'list' | 'prepare' | 'meet' | 'post'>('list');
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  // Form state
  const [selectedContact, setSelectedContact] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [anchors, setAnchors] = useState('');
  const [notes, setNotes] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, meetingsRes] = await Promise.allSettled([
        api.get('/contacts'),
        api.get('/meetings'),
      ]);

      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value.data);
      if (meetingsRes.status === 'fulfilled') setMeetings(meetingsRes.value.data);
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!selectedContact) return;

    try {
      const meeting = await api.post('/meetings', {
        contactId: selectedContact,
        location: location || undefined,
        scheduledAt: scheduledAt || undefined,
        anchors: anchors || undefined,
      });

      setSelectedMeeting(meeting.data);
      setStep('prepare');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleStartMeeting = async () => {
    if (!selectedMeeting) return;

    try {
      await api.put(`/meetings/${selectedMeeting.id}`, {
        status: 'in_progress',
        actualAt: new Date().toISOString(),
      });
      setStep('meet');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleCompleteMeeting = async () => {
    if (!selectedMeeting) return;

    try {
      await api.put(`/meetings/${selectedMeeting.id}`, {
        status: 'completed',
        notes: notes || undefined,
        outcomes: outcomes || undefined,
        followUpDate: followUpDate || undefined,
      });

      alert('Встреча завершена! Контакт обновлён.');
      setStep('list');
      setSelectedMeeting(null);
      resetForm();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const resetForm = () => {
    setSelectedContact(0);
    setLocation('');
    setScheduledAt('');
    setAnchors('');
    setNotes('');
    setOutcomes('');
    setFollowUpDate('');
  };

  const getContactName = (contactId: number) => {
    const contact = contacts.find((c) => c.id === contactId);
    return contact?.businessName || contact?.personalData ? JSON.parse(contact.personalData || '{}').fullName : 'Контакт';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      planned: 'var(--radar-accent)',
      in_progress: 'var(--radar-warning)',
      completed: 'var(--radar-success)',
      cancelled: 'var(--radar-text-tertiary)',
    };
    const labels: Record<string, string> = {
      planned: 'Запланирована',
      in_progress: 'В процессе',
      completed: 'Завершена',
      cancelled: 'Отменена',
    };
    return (
      <span style={{ ...styles.badge, backgroundColor: colors[status] || 'gray' }}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return <div style={styles.container}><p style={styles.loadingText}>Загрузка...</p></div>;
  }

  // Step: List meetings
  if (step === 'list') {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <button onClick={() => navigate('/')} style={styles.backBtn}>← Назад</button>
          <h1 style={styles.title}>Встречи</h1>
        </header>

        {/* Upcoming */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Предстоящие</h2>
          {meetings.filter((m) => m.status === 'planned' || m.status === 'in_progress').length === 0 ? (
            <p style={styles.emptyText}>Нет запланированных встреч</p>
          ) : (
            meetings
              .filter((m) => m.status === 'planned' || m.status === 'in_progress')
              .sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime())
              .map((meeting) => (
                <div
                  key={meeting.id}
                  style={styles.meetingCard}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    if (meeting.status === 'planned') setStep('prepare');
                    else if (meeting.status === 'in_progress') setStep('meet');
                  }}
                >
                  <div style={styles.meetingInfo}>
                    <p style={styles.meetingContact}>{getContactName(meeting.contactId)}</p>
                    {meeting.scheduledAt && (
                      <p style={styles.meetingDate}>
                        {new Date(meeting.scheduledAt).toLocaleDateString('ru-RU')} {new Date(meeting.scheduledAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {meeting.location && <p style={styles.meetingLocation}>📍 {meeting.location}</p>}
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>
              ))
          )}
        </div>

        {/* Recent */}
        {meetings.filter((m) => m.status === 'completed').length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Прошедшие</h2>
            {meetings
              .filter((m) => m.status === 'completed')
              .slice(0, 5)
              .map((meeting) => (
                <div key={meeting.id} style={styles.meetingCardPast}>
                  <div style={styles.meetingInfo}>
                    <p style={styles.meetingContact}>{getContactName(meeting.contactId)}</p>
                    <p style={styles.meetingDate}>
                      {meeting.actualAt ? new Date(meeting.actualAt).toLocaleDateString('ru-RU') : ''}
                    </p>
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>
              ))}
          </div>
        )}

        {/* New Meeting Button */}
        <button onClick={() => setStep('prepare')} style={styles.newBtn}>
          + Новая встреча
        </button>
      </div>
    );
  }

  // Step: Prepare
  if (step === 'prepare') {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <button onClick={() => { setStep('list'); resetForm(); }} style={styles.backBtn}>← Назад</button>
          <h1 style={styles.title}>Подготовка к встрече</h1>
        </header>

        <div style={styles.stepIndicator}>
          <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-accent)' }}>1</span>
          <span style={styles.stepLine} />
          <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-text-tertiary)' }}>2</span>
          <span style={styles.stepLine} />
          <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-text-tertiary)' }}>3</span>
        </div>

        <div style={styles.form}>
          {/* Contact Selection */}
          <label style={styles.label}>
            Контакт
            <select
              value={selectedContact}
              onChange={(e) => setSelectedContact(parseInt(e.target.value))}
              style={styles.select}
            >
              <option value={0}>Выбери контакт</option>
              {contacts
                .filter((c) => c.isActive)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName || JSON.parse(c.personalData || '{}').fullName || `#${c.id}`}
                  </option>
                ))}
            </select>
          </label>

          {/* Location */}
          <label style={styles.label}>
            Место встречи
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={styles.input}
              placeholder="Кафе, офис, онлайн..."
            />
          </label>

          {/* Scheduled */}
          <label style={styles.label}>
            Дата и время
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              style={styles.input}
            />
          </label>

          {/* Anchors */}
          <label style={styles.label}>
            Якоря для разговора
            <textarea
              value={anchors}
              onChange={(e) => setAnchors(e.target.value)}
              style={{ ...styles.input, ...styles.textarea }}
              placeholder="• Что обсудить&#10;• Какие вопросы задать&#10;• Что предложить"
              rows={4}
            />
          </label>

          <button
            onClick={handleCreateMeeting}
            disabled={!selectedContact}
            style={{
              ...styles.submitBtn,
              opacity: selectedContact ? 1 : 0.5,
            }}
          >
            Сохранить и начать подготовку
          </button>
        </div>
      </div>
    );
  }

  // Step: During meeting
  if (step === 'meet') {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <button onClick={() => setStep('prepare')} style={styles.backBtn}>← Назад</button>
          <h1 style={styles.title}>Во время встречи</h1>
        </header>

        <div style={styles.stepIndicator}>
          <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-success)' }}>✓</span>
          <span style={styles.stepLine} />
          <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-accent)' }}>2</span>
          <span style={styles.stepLine} />
          <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-text-tertiary)' }}>3</span>
        </div>

        {selectedMeeting && (
          <div style={styles.meetingHeader}>
            <p style={styles.meetingContactName}>{getContactName(selectedMeeting.contactId)}</p>
            {selectedMeeting.anchors && (
              <div style={styles.anchorsBox}>
                <h3 style={styles.anchorsTitle}>Якоря:</h3>
                <pre style={styles.anchorsText}>{selectedMeeting.anchors}</pre>
              </div>
            )}
          </div>
        )}

        <div style={styles.form}>
          <label style={styles.label}>
            Заметки
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ ...styles.input, ...styles.textarea }}
              placeholder="Что произошло, о чём говорили, важные детали..."
              rows={6}
            />
          </label>

          <button onClick={handleStartMeeting} style={styles.submitBtn}>
            Начать встречу
          </button>
        </div>
      </div>
    );
  }

  // Step: Post-meeting
  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(16px + var(--radar-safe-bottom))' }}>
      <header style={styles.header}>
        <button onClick={() => setStep('meet')} style={styles.backBtn}>← Назад</button>
        <h1 style={styles.title}>Пост-фиксация</h1>
      </header>

      <div style={styles.stepIndicator}>
        <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-success)' }}>✓</span>
        <span style={styles.stepLine} />
        <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-success)' }}>✓</span>
        <span style={styles.stepLine} />
        <span style={{ ...styles.stepDot, backgroundColor: 'var(--radar-accent)' }}>3</span>
      </div>

      <div style={styles.form}>
        <label style={styles.label}>
          Итоги встречи
          <textarea
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            style={{ ...styles.input, ...styles.textarea }}
            placeholder="• Что решили&#10;• Какие действия&#10;• Кто что делает"
            rows={4}
          />
        </label>

        <label style={styles.label}>
          Дата следующей встречи
          <input
            type="datetime-local"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            style={styles.input}
          />
        </label>

        <button onClick={handleCompleteMeeting} style={styles.completeBtn}>
          ✓ Завершить встречу
        </button>
      </div>
    </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column'},
  loadingText: { textAlign: 'center', color: 'var(--radar-text-secondary)', paddingTop: '100px' },
  header: { marginBottom: '24px' },
  backBtn: {
    background: 'none', border: 'none', color: 'var(--radar-accent)',
    fontSize: '16px', fontWeight: '600', padding: '8px 0', marginBottom: '8px',
  },
  title: { fontSize: '24px', fontWeight: '700' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '12px' },
  emptyText: { textAlign: 'center', color: 'var(--radar-text-secondary)', padding: '40px' },
  meetingCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px', backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)', borderRadius: '12px', marginBottom: '8px',
  },
  meetingCardPast: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px', backgroundColor: 'var(--radar-surface)',
    border: '1px solid var(--radar-border)', borderRadius: '12px', marginBottom: '8px',
    opacity: 0.7,
  },
  meetingInfo: { flex: 1 },
  meetingContact: { fontSize: '16px', fontWeight: '600', marginBottom: '2px' },
  meetingDate: { fontSize: '13px', color: 'var(--radar-text-secondary)' },
  meetingLocation: { fontSize: '13px', color: 'var(--radar-text-secondary)' },
  meetingContactName: { fontSize: '20px', fontWeight: '700', marginBottom: '16px' },
  badge: { padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', color: '#fff' },
  newBtn: {
    width: '100%', padding: '18px', backgroundColor: 'var(--radar-accent)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '17px', fontWeight: '700',
  },
  stepIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '8px' },
  stepDot: {
    width: '32px', height: '32px', borderRadius: '16px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff',
  },
  stepLine: { width: '40px', height: '2px', backgroundColor: 'var(--radar-border)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { fontSize: '14px', color: 'var(--radar-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' },
  select: {
    padding: '12px', backgroundColor: 'var(--radar-surface-elevated)',
    border: '1px solid var(--radar-border)', borderRadius: '8px', color: 'var(--radar-text)', fontSize: '14px',
  },
  input: {
    padding: '12px', backgroundColor: 'var(--radar-surface-elevated)',
    border: '1px solid var(--radar-border)', borderRadius: '8px', color: 'var(--radar-text)', fontSize: '14px',
  },
  textarea: { resize: 'vertical', minHeight: '100px' },
  submitBtn: {
    padding: '16px', backgroundColor: 'var(--radar-accent)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
  },
  completeBtn: {
    padding: '16px', backgroundColor: 'var(--radar-success)',
    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
  },
  meetingHeader: { marginBottom: '24px' },
  anchorsBox: {
    backgroundColor: 'var(--radar-surface)', border: '1px solid var(--radar-border)',
    borderRadius: '12px', padding: '16px',
  },
  anchorsTitle: { fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--radar-warning)' },
  anchorsText: {
    fontSize: '14px', color: 'var(--radar-text-secondary)', whiteSpace: 'pre-wrap',
    fontFamily: 'inherit', margin: 0,
  },
};
