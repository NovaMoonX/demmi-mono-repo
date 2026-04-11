import { MemoryCategory } from './memory.types';

export const MEMORY_CATEGORIES: MemoryCategory[] = [
  'preference',
  'context',
  'goal',
  'household',
  'other',
];

export const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  preference: 'Preference',
  context: 'Context',
  goal: 'Goal',
  household: 'Household',
  other: 'Other',
};

export const MEMORY_CATEGORY_COLORS: Record<MemoryCategory, string> = {
  preference: 'bg-violet-500/20 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  context: 'bg-sky-500/20 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  goal: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  household: 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  other: 'bg-gray-500/20 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
};

export const MEMORY_CATEGORY_EMOJIS: Record<MemoryCategory, string> = {
  preference: '💜',
  context: '📌',
  goal: '🎯',
  household: '🏠',
  other: '📝',
};
