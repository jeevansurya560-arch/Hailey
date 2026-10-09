export const THREAD_COLORS = {
  culture: 'border-[var(--clay)] text-[var(--clay)] bg-[var(--paper)]',
  music: 'border-[var(--indigo)] text-[var(--indigo)] bg-[var(--paper)]',
  fashion: 'border-[var(--moss)] text-[var(--moss)] bg-[var(--paper)]',
  food: 'border-[var(--saffron)] text-[var(--saffron)] bg-[var(--paper)]',
  art: 'border-[var(--terracotta)] text-[var(--terracotta)] bg-[var(--paper)]',
  film: 'border-[var(--sand)] text-[var(--sand)] bg-[var(--paper)]',
  language: 'border-[var(--ink)] text-[var(--ink)] bg-[var(--paper)]',
  heritage: 'border-[var(--clay)] text-[var(--clay)] bg-[var(--paper)]',
  internet: 'border-[var(--onchain)] text-[var(--onchain)] bg-[var(--paper)]',
  place: 'border-[var(--moss)] text-[var(--moss)] bg-[var(--paper)]',
}

export function getThreadColor(kind) {
  return THREAD_COLORS[kind] || 'border-[var(--line)] text-[var(--ink)] bg-[var(--paper)]'
}
