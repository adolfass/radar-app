import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccordionSection } from './AccordionSection';
import { ExamplesSection } from './ExamplesSection';
import { analytics } from '../../lib/analytics';

interface ChecklistState {
  bqgSet: boolean;
  contactsAdded: boolean;
  graphViewed: boolean;
  firstMeeting: boolean;
}

const STORAGE_KEY = 'radar-navigator-checklist';

function getChecklist(): ChecklistState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return { bqgSet: false, contactsAdded: false, graphViewed: false, firstMeeting: false };
}

function saveChecklist(checklist: ChecklistState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
}

const SECTION_LABELS: Record<string, string> = {
  welcome: 'welcome',
  'first-steps': 'first_steps',
  features: 'features',
  'ai-features': 'ai_features',
  methodology: 'methodology',
  'goal-30': 'goal_30_days',
  premium: 'premium',
  faq: 'faq',
  support: 'support',
};

export function NavigatorScreen() {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<string[]>(['welcome']);
  const [checklist, setChecklist] = useState<ChecklistState>(getChecklist);
  const [abVariant] = useState(() =>
    analytics.assignABTest('navigator_button_name', ['navigator', 'helper', 'guide'])
  );

  useEffect(() => {
    analytics.track('navigator_opened', { ab_variant: abVariant });
    analytics.incrementSession();
  }, []);

  useEffect(() => {
    saveChecklist(checklist);
  }, [checklist]);

  const toggleSection = (id: string) => {
    analytics.trackSectionOpened(SECTION_LABELS[id] || id);
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const updateChecklist = (key: keyof ChecklistState, value: boolean) => {
    if (value) {
      analytics.trackChecklistCompleted(key);
    }
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const handlePremiumClick = () => {
    analytics.trackPremiumCtaClicked();
    navigate('/subscription');
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalSteps = Object.keys(checklist).length;

  const abVariantNames: Record<string, { icon: string; name: string }> = {
    navigator: { icon: '🎯', name: 'Навигатор' },
    helper: { icon: '🧭', name: 'Помощник' },
    guide: { icon: '📖', name: 'Гайд' },
  };

  const variantInfo = abVariantNames[abVariant] || abVariantNames.navigator;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      paddingBottom: '80px',
    }}>
      <header style={{
        padding: '16px',
        paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
        background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.2), transparent)',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
          {variantInfo.icon} {variantInfo.name}
        </h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
          Ваш путеводитель по RADAR
        </p>
        <div style={{
          marginTop: '12px',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Прогресс: Первые шаги</span>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
              {completedCount}/{totalSteps}
            </span>
          </div>
          <div style={{ height: '4px', backgroundColor: '#1f2937', borderRadius: '2px' }}>
            <div style={{
              height: '100%',
              width: `${(completedCount / totalSteps) * 100}%`,
              backgroundColor: '#3b82f6',
              borderRadius: '2px',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </header>

      <AccordionSection
        id="welcome"
        title="👋 Добро пожаловать в RADAR"
        isOpen={openSections.includes('welcome')}
        onToggle={() => toggleSection('welcome')}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#fff' }}>RADAR</strong> — это не просто адресная книга.
            Это стратегический инструмент для построения человеческой экосистемы.
          </p>
          <p style={{ marginBottom: '12px' }}>
            Основано на методе <strong style={{ color: '#fff' }}>А. Безрукова</strong> —
            «Нетворкинг для разведчиков».
          </p>
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px',
          }}>
            <p style={{ color: '#22c55e', fontWeight: '600', margin: 0 }}>
              🎯 Ваша цель: Найти 1 надёжного партнёра или клиента за 30 дней
            </p>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="first-steps"
        title="🚀 Первые 3 шага"
        isOpen={openSections.includes('first-steps')}
        onToggle={() => toggleSection('first-steps')}
        badge={completedCount < totalSteps ? '!' : '✓'}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <ChecklistItem
            checked={checklist.bqgSet}
            onChange={(v) => updateChecklist('bqgSet', v)}
            title="Шаг 1: Поставьте цель BQG"
            description="Откройте вкладку «BQG» → «+ Новая цель». Опишите задачу на 6 месяцев."
          />
          <ChecklistItem
            checked={checklist.contactsAdded}
            onChange={(v) => updateChecklist('contactsAdded', v)}
            title="Шаг 2: Добавьте контакты"
            description="Вкладка «Контакты» → «+ Добавить». Введите @username или отсканируйте QR."
          />
          <ChecklistItem
            checked={checklist.graphViewed}
            onChange={(v) => updateChecklist('graphViewed', v)}
            title="Шаг 3: Постройте граф"
            description="Вкладка «Карта» — увидите граф связей. Найдите «Звёзды» и «Изолятов»."
          />
          <ChecklistItem
            checked={checklist.firstMeeting}
            onChange={(v) => updateChecklist('firstMeeting', v)}
            title="Шаг 4: Проведите встречу"
            description="Назначьте встречу → Зафиксируйте «якорь» → Обновите баланс доверия."
          />

          {completedCount === totalSteps && (
            <div style={{
              marginTop: '16px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#22c55e', fontWeight: '600', margin: 0 }}>
                🎉 Отлично! Вы освоили основы RADAR
              </p>
            </div>
          )}
        </div>
      </AccordionSection>

      <AccordionSection
        id="features"
        title="📚 Возможности RADAR"
        isOpen={openSections.includes('features')}
        onToggle={() => toggleSection('features')}
      >
        <FeaturesAccordion openSections={openSections} toggleSection={toggleSection} />
      </AccordionSection>

      <AccordionSection
        id="ai-features"
        title="🤖 ИИ-функции RADAR"
        isOpen={openSections.includes('ai-features')}
        onToggle={() => toggleSection('ai-features')}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '16px' }}>
            RADAR использует локальный ИИ (Ollama Qwen) для анализа вашей сети контактов.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#a855f7', marginBottom: '8px' }}>🔍 Классификация контактов</h5>
            <p>ИИ определяет:</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              • Круг: Support (3-5), Productivity (до 75), Development (~100)<br/>
              • Роль: Connector, Bridge, Gatekeeper, Condensator<br/>
              • Оценку важности (score 0-100)
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#a855f7', marginBottom: '8px' }}>💡 Рекомендации</h5>
            <p>ИИ даёт персональные советы:</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              • Archive — кого пора архивировать<br/>
              • Unfreeze — кого «разморозить»<br/>
              • Strengthen — кого укрепить<br/>
              • Meet — с кем назначить встречу
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#a855f7', marginBottom: '8px' }}>📊 Анализ сети</h5>
            <p>ИИ оценивает здоровье сети:</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              • Общее число контактов<br/>
              • Распределение по кругам<br/>
              • Недостающие роли<br/>
              • Score здоровья (0-100)
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'rgba(168, 85, 247, 0.1)', 
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '8px',
            padding: '12px',
          }}>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>📍 Где найти:</p>
            <p style={{ fontSize: '13px' }}>
              Главная → «Инсайты» → вкладки «Обзор», «Контакты», «Рекомендации»
            </p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Главная → «Граф сети» → визуализация связей
            </p>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="methodology"
        title="🧠 Философия RADAR"
        isOpen={openSections.includes('methodology')}
        onToggle={() => toggleSection('methodology')}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px' }}>4 столпа метода (А. Безруков)</h4>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#3b82f6', marginBottom: '8px' }}>1. Подготовка</h5>
            <p>Никогда не идите на встречу без чек-листа и «якорей» — тем для продолжения диалога.</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#3b82f6', marginBottom: '8px' }}>2. Системность</h5>
            <p>Нетворкинг — это проект, а не спонтанность. BQG = Business Quarterly Goal.</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#3b82f6', marginBottom: '8px' }}>3. Взаимность</h5>
            <p>Win-Win или ничего. Доверие — валюта. Баланс доверия = основа отношений.</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#3b82f6', marginBottom: '8px' }}>4. Обновление</h5>
            <p>Сеть живая. Кто-то уходит, кто-то приходит. 30% контактов «испаряется» каждый год.</p>
          </div>

          <h4 style={{ color: '#fff', marginBottom: '12px', marginTop: '24px' }}>🍑 Культурные коды</h4>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '12px',
          }}>
            <p style={{ marginBottom: '8px' }}><span style={{ color: '#f472b6' }}>🍑 Персики</span> (США, Канада): Дружелюбны сразу, но трудно пробиться вглубь</p>
            <p style={{ marginBottom: '8px' }}><span style={{ color: '#a855f7' }}>🫐 Гранаты</span> (РФ, Восток): Сдержанны сначала, но надёжны после доверия</p>
            <p><span style={{ color: '#22c55e' }}>🍎 Яблоки</span> (Европа): Созревают постепенно, но всегда есть закрытая зона</p>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="goal-30"
        title="🏆 Ваша цель: 30 дней"
        isOpen={openSections.includes('goal-30')}
        onToggle={() => toggleSection('goal-30')}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#fbbf24', marginBottom: '8px' }}>Неделя 1</h5>
            <p>• Поставьте BQG<br/>• Добавьте 20 контактов<br/>• Постройте граф</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#fbbf24', marginBottom: '8px' }}>Неделя 2</h5>
            <p>• Найдите 1 «Звезду»<br/>• Назначьте встречу<br/>• Зафиксируйте «якорь»</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#fbbf24', marginBottom: '8px' }}>Неделя 3</h5>
            <p>• Проведите встречу<br/>• Добавьте ещё 10 контактов<br/>• Проверьте баланс доверия</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#fbbf24', marginBottom: '8px' }}>Неделя 4</h5>
            <p>• Получите первый инсайт от ИИ<br/>• Разморозьте 1 старый контакт<br/>• Подготовьтесь к ритуалу</p>
          </div>

          <div style={{
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#fbbf24', fontWeight: '600', margin: 0 }}>
              🎯 Результат: 1 ценная встреча + понимание системы
            </p>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        id="premium"
        title="💎 Premium-возможности"
        isOpen={openSections.includes('premium')}
        onToggle={() => toggleSection('premium')}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#9ca3af', marginBottom: '8px' }}>Free (бесплатно)</h5>
            <p>• До 100 контактов<br/>• Базовый граф<br/>• Ручная классификация</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h5 style={{ color: '#fbbf24', marginBottom: '8px' }}>Premium (⭐ 99 Stars/мес)</h5>
            <p>• ♾️ Безлимит контактов<br/>• 🤖 ИИ-классификация ролей<br/>• ⚖️ Баланс доверия<br/>• 📊 Метрики здоровья сети<br/>• 🔄 Рекомендации по ротации<br/>• 📥 Экспорт отчётов</p>
          </div>

          <div style={{ 
            backgroundColor: 'rgba(0, 136, 204, 0.1)', 
            border: '1px solid rgba(0, 136, 204, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <h5 style={{ color: '#0088cc', marginBottom: '8px' }}>Как оплатить:</h5>
            <p style={{ marginBottom: '8px' }}><span style={{ fontSize: '16px' }}>⭐</span> <b>Telegram Stars</b> — прямо в боте:</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Профиль → Подписка → Выбрать план → Оплатить Stars</p>
            <p style={{ marginTop: '12px', marginBottom: '8px' }}><span style={{ fontSize: '16px' }}>💎</span> <b>CryptoBot (USDT)</b> — альтернатива:</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Там же выбрать «Оплатить CryptoBot»</p>
          </div>

          <button
            onClick={handlePremiumClick}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Попробовать 14 дней бесплатно
          </button>
        </div>
      </AccordionSection>

      <AccordionSection
        id="faq"
        title="❓ Частые вопросы"
        isOpen={openSections.includes('faq')}
        onToggle={() => toggleSection('faq')}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <FAQItem question="Как удалить контакт?">
            Откройте карточку → ⋮ (меню) → «Архивировать». Контакт не удаляется, а перемещается в архив.
          </FAQItem>

          <FAQItem question="Что если я не знаю @username?">
            Попросите контакт поделиться «шпионской визиткой» (QR-код или ссылка).
          </FAQItem>

          <FAQItem question="Как поделиться своим профилем?">
            Вкладка «Профиль» → «Поделиться визиткой» → QR-код или ссылка.
          </FAQItem>

          <FAQItem question="Можно ли импортировать контакты из телефона?">
            Telegram не даёт прямого доступа. Но можно: искать по @username или синхронизировать по телефону (если оба в RADAR).
          </FAQItem>

          <FAQItem question="Что делать, если граф пустой?">
            Добавьте минимум 5 контактов. Граф строится автоматически при наличии связей.
          </FAQItem>

          <FAQItem question="Как отменить подписку?">
            Настройки → Подписка → «Отменить автопродление». Доступ останется до конца оплаченного периода.
          </FAQItem>
        </div>
      </AccordionSection>

      <AccordionSection
        id="support"
        title="📞 Связаться с нами"
        isOpen={openSections.includes('support')}
        onToggle={() => toggleSection('support')}
      >
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '16px' }}>Остались вопросы?</p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <a href="mailto:support@radar.app" style={contactLinkStyle}>📧 Email</a>
            <a href="https://t.me/radar_support" target="_blank" rel="noopener noreferrer" style={contactLinkStyle}>💬 Telegram</a>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '12px',
          }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              Мы отвечаем в течение 24 часов.<br/>
              Идеи для улучшения? Мы читаем все предложения!
            </p>
          </div>
        </div>
      </AccordionSection>

      <ExamplesSection />
    </div>
  );
}

const contactLinkStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  textAlign: 'center',
  color: '#3b82f6',
  textDecoration: 'none',
  fontSize: '14px',
};

function ChecklistItem({ checked, onChange, title, description }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label style={{
      display: 'flex',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '8px',
      marginBottom: '8px',
      cursor: 'pointer',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ color: checked ? '#22c55e' : '#fff', fontWeight: '500' }}>{title}</div>
        <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>{description}</div>
      </div>
    </label>
  );
}

function FAQItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ color: '#fff', fontWeight: '500', marginBottom: '4px' }}>Q: {question}</div>
      <div style={{ color: '#9ca3af', paddingLeft: '12px' }}>A: {children}</div>
    </div>
  );
}

function FeaturesAccordion({ openSections, toggleSection }: {
  openSections: string[];
  toggleSection: (id: string) => void;
}) {
  const features = [
    { id: 'bqg', icon: '🎯', title: 'BQG — Целеполагание' },
    { id: 'contacts', icon: '👥', title: 'Контакты — Ваша сеть' },
    { id: 'graph', icon: '🕸️', title: 'Граф — Визуализация' },
    { id: 'planner', icon: '📅', title: 'Планер — Управление' },
    { id: 'rituals', icon: '🔄', title: 'Ритуал — Инвентаризация' },
    { id: 'trust', icon: '⚖️', title: 'Баланс доверия' },
  ];

  const featureContent: Record<string, { title: string; content: React.ReactNode }> = {
    bqg: {
      title: 'BQG — Business Quarterly Goal',
      content: (
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>Без цели нетворкинг = хаос. BQG — ваша бизнес-цель на 6 месяцев.</p>
          <p style={{ marginBottom: '12px' }}>Как использовать:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Раз в 6 месяцев ставьте 1-2 цели</li>
            <li>ИИ подскажет, каких контактов не хватает</li>
            <li>Отслеживайте прогресс на дашборде</li>
          </ul>
          <div style={tipStyle}>
            💡 Цель должна быть конкретной:<br/>
            ✅ «Привлечь 3 клиента из ритейла»<br/>
            ❌ «Развивать связи»
          </div>
        </div>
      ),
    },
    contacts: {
      title: 'Контакты — Типы и роли',
      content: (
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}><strong style={{ color: '#ef4444' }}>🔴 Поддержка</strong> (3-5 чел): близкие, наставники</p>
          <p style={{ marginBottom: '8px' }}><strong style={{ color: '#eab308' }}>🟡 Продуктивность</strong> (до 75): ключевые партнёры</p>
          <p style={{ marginBottom: '12px' }}><strong style={{ color: '#22c55e' }}>🟢 Развитие</strong> (~100): полезные знакомые</p>

          <p style={{ marginBottom: '8px' }}>Роли (ИИ определяет автоматически):</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>🌟 <strong>Коннектор</strong>: знает всех, центр сети</li>
            <li>🌉 <strong>Мост</strong>: соединяет разные круги</li>
            <li>🔑 <strong>Привратник</strong>: открывает двери к ЛПР</li>
            <li>💎 <strong>Конденсатор</strong>: носитель экспертизы</li>
          </ul>
          <div style={tipStyle}>
            💡 Не добавляйте всех подряд. Качество {'>'} Количество.
          </div>
        </div>
      ),
    },
    graph: {
      title: 'Граф — Как читать социограмму',
      content: (
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>Размер узла = влияние в сети:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Крупные = «Звёзды» (важные контакты)</li>
            <li>Мелкие = «Изоляты» (слабые связи)</li>
          </ul>
          <p style={{ marginBottom: '8px' }}>Цвет связи:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>🟢 Зелёный = поддержка, доверие</li>
            <li>🔴 Красный = конфликт, напряжение</li>
            <li>⚪ Серый = нейтрально</li>
          </ul>
          <div style={tipStyle}>
            💡 Если вся сеть в одном кластере — вам не хватает «Мостов» в другие сферы.
          </div>
        </div>
      ),
    },
    planner: {
      title: 'Планер — Управление встречами',
      content: (
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>Типы задач:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>📞 <strong>Позвонить</strong>: с якорем (темой)</li>
            <li>📝 <strong>Подготовиться</strong>: вопросы к встрече</li>
            <li>🔄 <strong>Разморозить</strong>: не общались 3+ мес</li>
            <li>🎂 <strong>Поздравить</strong>: день рождения</li>
          </ul>
          <p style={{ marginBottom: '8px' }}>Якоря — темы для продолжения диалога:</p>
          <div style={tipStyle}>
            Пример: «яхты», «МГУ», «интеграция с 1С»
          </div>
        </div>
      ),
    },
    rituals: {
      title: 'Ритуал — Каждые 6 месяцев',
      content: (
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>Что делать:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>Пересмотрите BQG: достигли?</li>
            <li>Проверьте круги: кто перешёл из «Развития» в «Продуктивность»?</li>
            <li>Обновите роли: кто стал «Звездой»?</li>
            <li>Архивируйте неактивных (12+ мес)</li>
          </ul>
          <div style={tipStyle}>
            💡 RADAR напомнит о ритуале за 2 недели. Не игнорируйте!
          </div>
        </div>
      ),
    },
    trust: {
      title: 'Баланс доверия — Взаимность',
      content: (
        <div style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>Трекер:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>✅ Вы помогли: <strong style={{ color: '#22c55e' }}>+10 баллов</strong></li>
            <li>✅ Вам помогли: <strong style={{ color: '#ef4444' }}>-10 баллов</strong></li>
          </ul>
          <p style={{ marginBottom: '12px' }}>Если баланс <strong style={{ color: '#22c55e' }}>+50</strong> → можно попросить взамен.<br/>
          Если баланс <strong style={{ color: '#ef4444' }}>-50</strong> → предложите помощь.</p>
          <div style={tipStyle}>
            💡 Не стремитесь к положительному балансу. Нулевой = здоровые отношения.
          </div>
        </div>
      ),
    },
  };

  return (
    <div>
      {features.map((feature) => (
        <div key={feature.id} style={{ marginBottom: '8px' }}>
          <button
            onClick={() => toggleSection(feature.id)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: openSections.includes(feature.id) ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#e5e7eb',
              fontSize: '14px',
            }}
          >
            <span>{feature.icon}</span>
            <span style={{ flex: 1, textAlign: 'left' }}>{feature.title}</span>
            <span style={{ transform: openSections.includes(feature.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              ▼
            </span>
          </button>
          {openSections.includes(feature.id) && (
            <div style={{ padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '0 0 8px 8px' }}>
              {featureContent[feature.id].content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const tipStyle: React.CSSProperties = {
  backgroundColor: 'rgba(251, 191, 36, 0.15)',
  border: '1px solid rgba(251, 191, 36, 0.3)',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '13px',
};