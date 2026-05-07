export const OIS_COLORS = {
  DANGEROUS: {
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.6)',
    label: 'Опасен',
    priority: 3,
  },
  INTERESTING: {
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.6)',
    label: 'Интересен',
    priority: 2,
  },
  COMPLEX: {
    color: '#64748b',
    glow: 'rgba(100, 116, 139, 0.6)',
    label: 'Сложен',
    priority: 1,
  },
};

const OIS_KEY_MAP: Record<string, keyof typeof OIS_COLORS> = {
  ОПАСЕН: 'DANGEROUS',
  ОПАСНА: 'DANGEROUS',
  DANGEROUS: 'DANGEROUS',
  ОПАСНЫЙ: 'DANGEROUS',
  ИНТЕРЕСЕН: 'INTERESTING',
  ИНТЕРЕСНА: 'INTERESTING',
  INTERESTING: 'INTERESTING',
  ИНТЕРЕСНЫЙ: 'INTERESTING',
  СЛОЖЕН: 'COMPLEX',
  СЛОЖНА: 'COMPLEX',
  COMPLEX: 'COMPLEX',
  СЛОЖНЫЙ: 'COMPLEX',
};

export function getOisTag(privateMeta: Record<string, unknown> | null | undefined): string | null {
  if (!privateMeta) return null;
  const oisValue = privateMeta['оис'] ?? privateMeta['ois'] ?? privateMeta['ОИС'];
  if (!oisValue) return null;
  const normalized = String(oisValue).toUpperCase().trim();
  const mapped = OIS_KEY_MAP[normalized];
  return mapped || null;
}

export function getOisColor(oisTag: string | null): string {
  if (!oisTag) return '#8e8e93';
  return OIS_COLORS[oisTag as keyof typeof OIS_COLORS]?.color || '#8e8e93';
}

export function getOisGlow(oisTag: string | null): string {
  if (!oisTag) return 'rgba(142, 142, 147, 0.4)';
  return OIS_COLORS[oisTag as keyof typeof OIS_COLORS]?.glow || 'rgba(142, 142, 147, 0.4)';
}

export function getOisLabel(oisTag: string | null): string {
  if (!oisTag) return '';
  return OIS_COLORS[oisTag as keyof typeof OIS_COLORS]?.label || oisTag;
}

export const CULTURAL_ARCHETYPES = {
  POMEGRANATE: { 
    color: '#C41E3A',
    glow: 'rgba(196, 30, 58, 0.6)',
    label: 'Гранат',
    hint: 'Начните с уважительного тона'
  },
  PEACH: { 
    color: '#0066FF',
    glow: 'rgba(0, 102, 255, 0.6)',
    label: 'Персик',
    hint: 'Будьте дружелюбны, но не ждите мгновенного доверия'
  },
  APPLE: { 
    color: '#00AA44',
    glow: 'rgba(0, 170, 68, 0.6)',
    label: 'Яблоко',
    hint: 'Уважайте приватность'
  },
  BRIDGE: { 
    color: '#FF9500',
    glow: 'rgba(255, 149, 0, 0.6)',
    label: 'Мост',
    hint: 'Ключ к новым кругам влияния'
  }
};

export const CIRCLE_COLORS = {
  support: '#ff9f0a',
  productivity: '#0a84ff',
  development: '#bf5af2',
};

export const ROLE_COLORS = {
  connector: '#0a84ff',
  bridge: '#FF9500',
  gatekeeper: '#C41E3A',
  condensator: '#30d158',
};

export function getArchetypeColor(archetype: string | null | undefined): string {
  if (!archetype) return '#8e8e93';
  const key = archetype.toUpperCase().replace(/\s+/g, '_');
  const mapped: Record<string, keyof typeof CULTURAL_ARCHETYPES> = {
    'POMEGRANATE': 'POMEGRANATE',
    'GRANAT': 'POMEGRANATE',
    'ГРАНАТ': 'POMEGRANATE',
    'PEACH': 'PEACH',
    'ПЕРСИК': 'PEACH',
    'APPLE': 'APPLE',
    'ЯБЛОКО': 'APPLE',
    'BRIDGE': 'BRIDGE',
    'МОСТ': 'BRIDGE',
  };
  return CULTURAL_ARCHETYPES[mapped[key] as keyof typeof CULTURAL_ARCHETYPES]?.color || '#8e8e93';
}

export function getArchetypeGlow(archetype: string | null | undefined): string {
  if (!archetype) return 'rgba(142, 142, 147, 0.4)';
  const key = archetype.toUpperCase().replace(/\s+/g, '_');
  const mapped: Record<string, keyof typeof CULTURAL_ARCHETYPES> = {
    'POMEGRANATE': 'POMEGRANATE',
    'GRANAT': 'POMEGRANATE',
    'ГРАНАТ': 'POMEGRANATE',
    'PEACH': 'PEACH',
    'ПЕРСИК': 'PEACH',
    'APPLE': 'APPLE',
    'ЯБЛОКО': 'APPLE',
    'BRIDGE': 'BRIDGE',
    'МОСТ': 'BRIDGE',
  };
  return CULTURAL_ARCHETYPES[mapped[key] as keyof typeof CULTURAL_ARCHETYPES]?.glow || 'rgba(142, 142, 147, 0.4)';
}

export function getArchetypeLabel(archetype: string | null | undefined): string {
  if (!archetype) return '';
  const key = archetype.toUpperCase().replace(/\s+/g, '_');
  const mapped: Record<string, keyof typeof CULTURAL_ARCHETYPES> = {
    'POMEGRANATE': 'POMEGRANATE',
    'GRANAT': 'POMEGRANATE',
    'ГРАНАТ': 'POMEGRANATE',
    'PEACH': 'PEACH',
    'ПЕРСИК': 'PEACH',
    'APPLE': 'APPLE',
    'ЯБЛОКО': 'APPLE',
    'BRIDGE': 'BRIDGE',
    'МОСТ': 'BRIDGE',
  };
  return CULTURAL_ARCHETYPES[mapped[key] as keyof typeof CULTURAL_ARCHETYPES]?.label || archetype;
}

export function getArchetypeHint(archetype: string | null | undefined): string {
  if (!archetype) return '';
  const key = archetype.toUpperCase().replace(/\s+/g, '_');
  const mapped: Record<string, keyof typeof CULTURAL_ARCHETYPES> = {
    'POMEGRANATE': 'POMEGRANATE',
    'GRANAT': 'POMEGRANATE',
    'ГРАНАТ': 'POMEGRANATE',
    'PEACH': 'PEACH',
    'ПЕРСИК': 'PEACH',
    'APPLE': 'APPLE',
    'ЯБЛОКО': 'APPLE',
    'BRIDGE': 'BRIDGE',
    'МОСТ': 'BRIDGE',
  };
  return CULTURAL_ARCHETYPES[mapped[key] as keyof typeof CULTURAL_ARCHETYPES]?.hint || '';
}
