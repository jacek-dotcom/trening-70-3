import type { Sport } from '../types'

export const SPORT: Record<Sport, { label: string; emoji: string; color: string; bg: string; text: string; ring: string }> = {
  bike: { label: 'Rower', emoji: '🚴', color: 'var(--c-bike)', bg: 'bg-[var(--c-bike)]', text: 'text-[var(--c-bike)]', ring: 'ring-[var(--c-bike)]' },
  swim: { label: 'Basen', emoji: '🏊', color: 'var(--c-swim)', bg: 'bg-[var(--c-swim)]', text: 'text-[var(--c-swim)]', ring: 'ring-[var(--c-swim)]' },
  strength: { label: 'Siła', emoji: '🏋️', color: 'var(--c-strength)', bg: 'bg-[var(--c-strength)]', text: 'text-[var(--c-strength)]', ring: 'ring-[var(--c-strength)]' },
  recovery: { label: 'Regeneracja', emoji: '🌿', color: 'var(--c-recovery)', bg: 'bg-[var(--c-recovery)]', text: 'text-[var(--c-recovery)]', ring: 'ring-[var(--c-recovery)]' },
  run: { label: 'Bieg', emoji: '🏃', color: 'var(--c-run)', bg: 'bg-[var(--c-run)]', text: 'text-[var(--c-run)]', ring: 'ring-[var(--c-run)]' },
  rest: { label: 'Wolne', emoji: '😴', color: 'var(--c-rest)', bg: 'bg-[var(--c-rest)]', text: 'text-[var(--c-rest)]', ring: 'ring-[var(--c-rest)]' },
}

export const PART_LABEL = { warmup: 'Rozgrzewka', main: 'Część główna', cooldown: 'Schłodzenie' } as const
