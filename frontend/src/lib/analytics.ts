const ANALYTICS_KEY = 'radar-analytics';

interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean>;
  timestamp: number;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  abTests: Record<string, string>;
  navigatorChecklist: {
    bqgSet: boolean;
    contactsAdded: boolean;
    graphViewed: boolean;
    firstMeeting: boolean;
  };
  sectionOpenCount: Record<string, number>;
  totalSessions: number;
}

function getAnalytics(): AnalyticsState {
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return {
    events: [],
    abTests: {},
    navigatorChecklist: {
      bqgSet: false,
      contactsAdded: false,
      graphViewed: false,
      firstMeeting: false,
    },
    sectionOpenCount: {},
    totalSessions: 1,
  };
}

function saveAnalytics(state: AnalyticsState) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(state));
}

export const analytics = {
  track(eventName: string, params?: Record<string, string | number | boolean>) {
    const state = getAnalytics();
    state.events.push({ name: eventName, params, timestamp: Date.now() });
    if (state.events.length > 100) {
      state.events = state.events.slice(-50);
    }
    saveAnalytics(state);
  },

  trackSectionOpened(sectionId: string) {
    const state = getAnalytics();
    state.sectionOpenCount[sectionId] = (state.sectionOpenCount[sectionId] || 0) + 1;
    saveAnalytics(state);
    this.track('navigator_section_opened', { section_id: sectionId });
  },

  trackChecklistCompleted(step: string) {
    this.track('navigator_checklist_completed', { step });
  },

  trackPremiumCtaClicked() {
    this.track('navigator_premium_cta_clicked');
  },

  assignABTest(testName: string, variants: string[]): string {
    const state = getAnalytics();
    if (state.abTests[testName]) {
      return state.abTests[testName];
    }
    const variant = variants[Math.floor(Math.random() * variants.length)];
    state.abTests[testName] = variant;
    saveAnalytics(state);
    return variant;
  },

  getABVariant(testName: string): string | null {
    return getAnalytics().abTests[testName] || null;
  },

  getSectionStats(): Record<string, number> {
    return getAnalytics().sectionOpenCount;
  },

  getChecklistState() {
    return getAnalytics().navigatorChecklist;
  },

  getAllEvents(): AnalyticsEvent[] {
    return getAnalytics().events;
  },

  incrementSession() {
    const state = getAnalytics();
    state.totalSessions++;
    saveAnalytics(state);
  },

  getSessionCount(): number {
    return getAnalytics().totalSessions;
  },
};