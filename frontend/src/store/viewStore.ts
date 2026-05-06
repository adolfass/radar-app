import { create } from 'zustand';

export type ViewMode = 'graph' | 'radar' | 'matrix' | 'timeline' | 'sunburst';

interface ViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  viewMode: 'radar',
  setViewMode: (mode) => set({ viewMode: mode }),
}));

export const VIEW_LABELS: Record<ViewMode, string> = {
  graph: 'Граф',
  radar: 'Радар',
  matrix: 'Матрица',
  timeline: 'Таймлайн',
  sunburst: 'Роли',
};

export const VIEW_ICONS: Record<ViewMode, string> = {
  graph: '🕸️',
  radar: '🎯',
  matrix: '📊',
  timeline: '📅',
  sunburst: '🌐',
};
