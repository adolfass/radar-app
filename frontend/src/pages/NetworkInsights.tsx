import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { BottomNav } from '../components/BottomNav';

interface ContactAnalysis {
  contactId: number;
  businessName: string | null;
  circle: string;
  circleScore: number;
  roles: string[];
  recommendation?: {
    type: string;
    priority: number;
    reason: string;
    action: string;
  };
}

interface NetworkSummary {
  totalContacts: number;
  circleDistribution: Record<string, number>;
  roleDistribution: Record<string, number>;
  missingRoles: string[];
  recommendations: Array<{
    type: string;
    priority: number;
    reason: string;
    action: string;
  }>;
  healthScore: number;
}

const circleLabels: Record<string, string> = {
  support: 'Поддержка',
  productivity: 'Продуктивность',
  development: 'Развитие',
};

const circleColors: Record<string, string> = {
  support: 'var(--radar-circle-support)',
  productivity: 'var(--radar-circle-productivity)',
  development: 'var(--radar-circle-development)',
};

const roleLabels: Record<string, string> = {
  connector: 'Коннектор',
  bridge: 'Мост',
  gatekeeper: 'Привратник',
  condensator: 'Конденсатор',
};

const roleIcons: Record<string, string> = {
  connector: '🔗',
  bridge: '🌉',
  gatekeeper: '🚪',
  condensator: '⚡',
};

const recommendationLabels: Record<string, string> = {
  archive: '📦 В архив',
  unfreeze: '🔄 Разморозить',
  strengthen: '💪 Усилить',
  meet: '🤝 Встретиться',
  introduce: '👋 Познакомить',
};

export function NetworkInsights() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<NetworkSummary | null>(null);
  const [analyses, setAnalyses] = useState<ContactAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'recommendations'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, analysesRes] = await Promise.all([
        api.get('/ai/network-summary'),
        api.get('/ai/classify-all'),
      ]);
      setSummary(summaryRes.data);
      setAnalyses(analysesRes.data);
    } catch (err) {
      console.error('Failed to load AI classification:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Анализирую сеть...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Не удалось загрузить данные</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>←</button>
        <h1 style={styles.title}>Аналитика сети</h1>
      </div>

      <div style={styles.tabs}>
        {(['overview', 'contacts', 'recommendations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab === 'overview' ? 'Обзор' : tab === 'contacts' ? 'Контакты' : 'Рекомендации'}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'overview' && <OverviewTab summary={summary} />}
        {activeTab === 'contacts' && <ContactsTab analyses={analyses} />}
        {activeTab === 'recommendations' && <RecommendationsTab recommendations={summary.recommendations} />}
      </div>

      <BottomNav />
    </div>
    </div>
  );
}

function OverviewTab({ summary }: { summary: NetworkSummary }) {
  return (
    <div style={styles.tabContent}>
      <div style={styles.healthCard}>
        <div style={styles.healthScore}>{summary.healthScore}</div>
        <div style={styles.healthLabel}>Здоровье сети</div>
        <div style={styles.healthBar}>
          <div
            style={{
              ...styles.healthBarFill,
              width: `${summary.healthScore}%`,
              backgroundColor: summary.healthScore >= 70 ? 'var(--radar-success)' :
                summary.healthScore >= 40 ? 'var(--radar-warning)' : 'var(--radar-danger)',
            }}
          />
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{summary.totalContacts}</div>
          <div style={styles.statLabel}>Контактов</div>
        </div>
        {summary.missingRoles.length > 0 && (
          <div style={styles.statCard}>
            <div style={styles.statValue}>{summary.missingRoles.length}</div>
            <div style={styles.statLabel}>Нет ролей</div>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Круги</h2>
        {Object.entries(summary.circleDistribution).map(([circle, count]) => (
          <div key={circle} style={styles.distributionRow}>
            <div style={styles.distributionLabel}>
              <span style={{ color: circleColors[circle] }}>●</span> {circleLabels[circle] || circle}
            </div>
            <div style={styles.distributionBar}>
              <div
                style={{
                  ...styles.distributionFill,
                  width: `${summary.totalContacts > 0 ? (count / summary.totalContacts) * 100 : 0}%`,
                  backgroundColor: circleColors[circle],
                }}
              />
            </div>
            <div style={styles.distributionCount}>{count}</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Роли</h2>
        {Object.entries(summary.roleDistribution).map(([role, count]) => (
          <div key={role} style={styles.roleRow}>
            <span style={styles.roleIcon}>{roleIcons[role]}</span>
            <span style={styles.roleName}>{roleLabels[role] || role}</span>
            <span style={styles.roleCount}>{count}</span>
          </div>
        ))}
        {summary.missingRoles.length > 0 && (
          <div style={styles.missingRoles}>
            <div style={styles.missingLabel}>Отсутствуют:</div>
            {summary.missingRoles.map(role => (
              <span key={role} style={styles.missingRole}>
                {roleIcons[role]} {roleLabels[role] || role}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactsTab({ analyses }: { analyses: ContactAnalysis[] }) {
  return (
    <div style={styles.tabContent}>
      {analyses.length === 0 ? (
        <div style={styles.empty}>Нет контактов для анализа</div>
      ) : (
        analyses.map(analysis => (
          <div key={analysis.contactId} style={styles.contactCard}>
            <div style={styles.contactHeader}>
              <div style={styles.contactName}>{analysis.businessName || 'Без имени'}</div>
              <div
                style={{
                  ...styles.circleBadge,
                  backgroundColor: circleColors[analysis.circle] + '33',
                  color: circleColors[analysis.circle],
                }}
              >
                {circleLabels[analysis.circle] || analysis.circle}
              </div>
            </div>
            <div style={styles.contactMeta}>
              <div style={styles.scoreRow}>
                <span style={styles.scoreLabel}>Скор круга:</span>
                <span style={styles.scoreValue}>{analysis.circleScore}%</span>
              </div>
              {analysis.roles.length > 0 && (
                <div style={styles.rolesRow}>
                  {analysis.roles.map(role => (
                    <span key={role} style={styles.roleBadge}>
                      {roleIcons[role]} {roleLabels[role] || role}
                    </span>
                  ))}
                </div>
              )}
              {analysis.recommendation && (
                <div style={styles.recommendationRow}>
                  <span style={styles.recommendationType}>
                    {recommendationLabels[analysis.recommendation.type] || analysis.recommendation.type}
                  </span>
                  <span style={styles.recommendationAction}>{analysis.recommendation.action}</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RecommendationsTab({ recommendations }: { recommendations: Array<{ type: string; priority: number; reason: string; action: string }> }) {
  return (
    <div style={styles.tabContent}>
      {recommendations.length === 0 ? (
        <div style={styles.empty}>Нет рекомендаций</div>
      ) : (
        recommendations.map((rec, i) => (
          <div key={i} style={styles.recommendationCard}>
            <div style={styles.recHeader}>
              <span style={styles.recType}>{recommendationLabels[rec.type] || rec.type}</span>
              <span style={styles.recPriority}>Приоритет: {rec.priority}/10</span>
            </div>
            <div style={styles.recReason}>{rec.reason}</div>
            <div style={styles.recAction}>{rec.action}</div>
          </div>
        ))
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {height: '100vh', display: 'flex', flexDirection: 'column'},
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
    borderBottom: '1px solid var(--radar-border)',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--radar-accent)',
    fontSize: '20px',
    padding: '8px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
    marginLeft: '12px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--radar-border)',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--radar-text-secondary)',
    fontSize: '14px',
    cursor: 'pointer',
  },
  tabActive: {
    color: 'var(--radar-accent)',
    borderBottomColor: 'var(--radar-accent)',
  },
  content: {
    padding: '16px',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    color: 'var(--radar-text-secondary)',
    fontSize: '16px',
  },
  error: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    color: 'var(--radar-danger)',
    fontSize: '16px',
  },
  empty: {
    textAlign: 'center',
    color: 'var(--radar-text-secondary)',
    padding: '40px 0',
  },
  healthCard: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  healthScore: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
  },
  healthLabel: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '12px',
  },
  healthBar: {
    height: '8px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statCard: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
    marginTop: '4px',
  },
  section: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
    marginBottom: '12px',
  },
  distributionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  distributionLabel: {
    fontSize: '14px',
    color: 'var(--radar-text)',
    minWidth: '120px',
  },
  distributionBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  distributionCount: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
    minWidth: '30px',
    textAlign: 'right',
  },
  roleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
    borderBottom: '1px solid var(--radar-border)',
  },
  roleIcon: {
    fontSize: '18px',
  },
  roleName: {
    flex: 1,
    fontSize: '14px',
    color: 'var(--radar-text)',
  },
  roleCount: {
    fontSize: '14px',
    color: 'var(--radar-text-secondary)',
  },
  missingRoles: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '8px',
  },
  missingLabel: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
    marginBottom: '8px',
  },
  missingRole: {
    display: 'inline-block',
    fontSize: '12px',
    color: 'var(--radar-warning)',
    marginRight: '8px',
  },
  contactCard: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '16px',
  },
  contactHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  contactName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'var(--radar-text)',
  },
  circleBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
  },
  contactMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  scoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  scoreLabel: {
    color: 'var(--radar-text-secondary)',
  },
  scoreValue: {
    color: 'var(--radar-text)',
    fontWeight: '600',
  },
  rolesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  roleBadge: {
    fontSize: '12px',
    backgroundColor: 'var(--radar-surface-elevated)',
    padding: '4px 8px',
    borderRadius: '8px',
    color: 'var(--radar-text)',
  },
  recommendationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: 'var(--radar-surface-elevated)',
    borderRadius: '8px',
  },
  recommendationType: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--radar-accent)',
  },
  recommendationAction: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
  recommendationCard: {
    backgroundColor: 'var(--radar-surface)',
    borderRadius: '12px',
    padding: '16px',
  },
  recHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  recType: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--radar-accent)',
  },
  recPriority: {
    fontSize: '12px',
    color: 'var(--radar-text-secondary)',
  },
  recReason: {
    fontSize: '14px',
    color: 'var(--radar-text)',
    marginBottom: '8px',
  },
  recAction: {
    fontSize: '14px',
    color: 'var(--radar-success)',
    fontWeight: '500',
  },
};
