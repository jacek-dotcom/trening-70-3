// Typy danych – odpowiadają schematom JSON opisanym w README.

export type Sport = 'bike' | 'swim' | 'strength' | 'recovery' | 'run' | 'rest'
export type Part = 'warmup' | 'main' | 'cooldown'
export type DayKey = 'pn' | 'wt' | 'sr' | 'cz' | 'pt' | 'sb' | 'nd'

export interface Exercise {
  name: string
  sets?: number
  reps?: string
  note?: string
}

export interface Block {
  part: Part
  name?: string
  duration?: number // minuty
  ftp?: number // % FTP (rower)
  ftpTo?: number // % FTP na końcu bloku (rampa)
  repeat?: number // liczba powtórzeń interwału
  on?: { duration: number; ftp: number }
  off?: { duration: number; ftp: number }
  meters?: number // basen
  exercises?: Exercise[] // siła
  text?: string
}

export interface Day {
  sport: Sport
  title: string
  duration?: number
  goal?: string
  blocks?: Block[]
}

export interface Week {
  week: string // data poniedziałku RRRR-MM-DD
  phase?: string
  goal?: string
  days: Partial<Record<DayKey, Day>>
}

export interface Phase {
  name: string
  from: string
  to: string
  color?: 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'purple'
}
export interface Race {
  date: string
  name: string
  priority: 'A' | 'B' | 'C'
}
export interface SeasonTest {
  date: string
  name: string
}
export interface Season {
  name: string
  phases: Phase[]
  races: Race[]
  tests: SeasonTest[]
}

export interface MetricPoint {
  date: string
  value: number
  note?: string
}
export interface Metrics {
  ftp: MetricPoint[]
  vo2max: MetricPoint[]
  restingHr: MetricPoint[]
}

export interface Task {
  id: string
  title: string
  due: string
  sunday?: boolean
}

export type LogStatus = 'done' | 'partial' | 'skipped'
export interface LogEntry {
  status: LogStatus
  rpe?: number
  power?: number
  hr?: number
  note?: string
  savedAt: string
}
