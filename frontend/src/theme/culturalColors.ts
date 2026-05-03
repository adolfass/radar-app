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
