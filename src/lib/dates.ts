import type { DayKey } from '../types'

export const DAY_KEYS: DayKey[] = ['pn', 'wt', 'sr', 'cz', 'pt', 'sb', 'nd']
export const DAY_NAMES: Record<DayKey, string> = {
  pn: 'Poniedziałek', wt: 'Wtorek', sr: 'Środa', cz: 'Czwartek', pt: 'Piątek', sb: 'Sobota', nd: 'Niedziela',
}
export const DAY_SHORT: Record<DayKey, string> = { pn: 'Pn', wt: 'Wt', sr: 'Śr', cz: 'Cz', pt: 'Pt', sb: 'Sb', nd: 'Nd' }

/** 'RRRR-MM-DD' -> Date (lokalna północ) */
export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function toISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
export function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}
/** Poniedziałek tygodnia zawierającego datę */
export function mondayOf(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (r.getDay() + 6) % 7 // pn=0
  return addDays(r, -dow)
}
export function todayISO(): string {
  return toISO(new Date())
}
export function daysBetween(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000)
}
export function fmtDay(d: Date): string {
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}
export function fmtRange(monday: Date): string {
  const sun = addDays(monday, 6)
  return `${fmtDay(monday)} – ${fmtDay(sun)}.${sun.getFullYear()}`
}
export function fmtDate(iso: string): string {
  const d = parseISO(iso)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}
