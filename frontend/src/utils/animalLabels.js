// Виды животных
export const SPECIES_LABELS = {
  dog: 'Собака',
  cat: 'Кошка',
  bird: 'Птица',
  rabbit: 'Кролик',
  hamster: 'Хомяк',
  fish: 'Рыбка',
  reptile: 'Рептилия',
  other: 'Другое'
}

// Список видов для фильтров и форм
export const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Собака' },
  { value: 'cat', label: 'Кошка' },
  { value: 'bird', label: 'Птица' },
  { value: 'rabbit', label: 'Кролик' },
  { value: 'hamster', label: 'Хомяк' },
  { value: 'fish', label: 'Рыбка' },
  { value: 'reptile', label: 'Рептилия' },
  { value: 'other', label: 'Другое' }
]

// Статусы питомца
export const STATUS_LABELS = {
  active: 'Активен',
  treatment: 'На лечении',
  healthy: 'Здоров',
  observation: 'Наблюдение',
  critical: 'Критическое',
  inactive: 'Неактивен'
}

// Список статусов для форм и фильтров
export const STATUS_OPTIONS = [
  { value: 'active', label: 'Активен' },
  { value: 'treatment', label: 'На лечении' },
  { value: 'healthy', label: 'Здоров' },
  { value: 'observation', label: 'Наблюдение' },
  { value: 'critical', label: 'Критическое' },
  { value: 'inactive', label: 'Неактивен' }
]

export function getSpeciesName(species) {
  if (!species) return ''
  return SPECIES_LABELS[species.toLowerCase()] || species
}

export function getStatusText(status) {
  if (!status) return ''
  return STATUS_LABELS[status] || status
}

// Эмодзи по виду
export const SPECIES_EMOJI = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  rabbit: '🐇',
  hamster: '🐹',
  fish: '🐠',
  reptile: '🦎',
  other: '🐾'
}

export function getSpeciesEmoji(species) {
  return SPECIES_EMOJI[species?.toLowerCase()] || '🐾'
}
