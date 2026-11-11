import type { MetricPoint } from '../types'

/** Strefy mocy wg Coggana (% FTP). */
export const COGGAN_ZONES = [
  { z: 'Z1', name: 'Regeneracja', lo: 0, hi: 55 },
  { z: 'Z2', name: 'Wytrzymałość', lo: 56, hi: 75 },
  { z: 'Z3', name: 'Tempo', lo: 76, hi: 90 },
  { z: 'Z4', name: 'Próg', lo: 91, hi: 105 },
  { z: 'Z5', name: 'VO2max', lo: 106, hi: 120 },
  { z: 'Z6', name: 'Beztlenowa', lo: 121, hi: 150 },
  { z: 'Z7', name: 'Neuromięśniowa', lo: 151, hi: Infinity },
]

export function latest(points: MetricPoint[]): MetricPoint | undefined {
  return [...points].sort((a, b) => a.date.localeCompare(b.date)).at(-1)
}

export function watts(ftp: number, pct: number): number {
  return Math.round((ftp * pct) / 100)
}

export function zonesInWatts(ftp: number) {
  return COGGAN_ZONES.map((z) => ({
    ...z,
    wLo: watts(ftp, z.lo),
    wHi: z.hi === Infinity ? null : watts(ftp, z.hi),
  }))
}

export function zoneForPct(pct: number): string {
  return COGGAN_ZONES.find((z) => pct <= z.hi)?.z ?? 'Z7'
}
