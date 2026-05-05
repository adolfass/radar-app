export interface ExampleStep {
  id: string;
  title: string;
  icon: string;
  caption: string;
  ctaText: string;
  ctaRoute: string;
  screenType: 'dashboard' | 'contacts' | 'graph' | 'dossier' | 'planner' | 'navigator' | 'result';
  highlight: string;
}

export const EXAMPLE_STEPS: ExampleStep[] = [
  {
    id: 'step-1',
    title: 'Шаг 1: Поставьте цель',
    icon: '\u{1F3AF}',
    caption: 'Откройте вкладку «Радар» и задайте бизнес-цель на 6 месяцев. Например: «Найти партнёра для запуска продукта».',
    ctaText: 'Поставить цель',
    ctaRoute: '/bqg',
    screenType: 'dashboard',
    highlight: 'bqg',
  },
  {
    id: 'step-2',
    title: 'Шаг 2: Добавьте контакты',
    icon: '\u{1F465}',
    caption: 'Введите @username из Telegram или отсканируйте визитку. Добавьте минимум 10 контактов для начала.',
    ctaText: 'Добавить контакт',
    ctaRoute: '/contacts',
    screenType: 'contacts',
    highlight: 'search',
  },
  {
    id: 'step-3',
    title: 'Шаг 3: Постройте карту',
    icon: '\u{1F5FA}',
    caption: 'Перейдите на вкладку «Инсайты» → «Граф сети». Крупные узлы — «Звёзды» вашей сети. Найдите их и усильте связь.',
    ctaText: 'Открыть граф',
    ctaRoute: '/graph',
    screenType: 'graph',
    highlight: 'star',
  },
  {
    id: 'step-4',
    title: 'Шаг 4: Изучите досье',
    icon: '\u{1F4CB}',
    caption: 'Нажмите на контакт в списке — откроется его досье с приватными метками, балансом доверия и якорями для общения.',
    ctaText: 'Открыть досье',
    ctaRoute: '/contacts',
    screenType: 'dossier',
    highlight: 'trust',
  },
  {
    id: 'step-5',
    title: 'Шаг 5: Планируйте встречи',
    icon: '\u{1F4C5}',
    caption: 'В разделе «Встречи» система подскажет, к кому пора вернуться. Подготовка к встрече — за 2 минуты.',
    ctaText: 'Планировать',
    ctaRoute: '/meetings',
    screenType: 'planner',
    highlight: 'reminder',
  },
  {
    id: 'result',
    title: 'Результат: партнёр найден',
    icon: '\u{1F389}',
    caption: 'Через 30 дней системной работы вы находите 1 надёжного партнёра. Это окупает все усилия.',
    ctaText: 'Начать сейчас',
    ctaRoute: '/bqg',
    screenType: 'result',
    highlight: 'success',
  },
];
