import type { Metrics, Season, Task, Week } from '../types'
import seasonJson from '../../data/season.json'
import metricsJson from '../../data/metrics.json'
import tasksJson from '../../data/tasks.json'

export const season = seasonJson as Season
export const metrics = metricsJson as Metrics
export const tasks = tasksJson as Task[]

// Wszystkie pliki z data/weeks/*.json wczytywane automatycznie (Vite import.meta.glob).
const weekModules = import.meta.glob<{ default: Week }>('../../data/weeks/*.json', { eager: true })

export const weeks: Record<string, Week> = {}
for (const [path, mod] of Object.entries(weekModules)) {
  const w = mod.default
  const fileDate = path.split('/').pop()!.replace('.json', '')
  weeks[w.week ?? fileDate] = { ...w, week: w.week ?? fileDate }
}
export const weekDates = Object.keys(weeks).sort()
