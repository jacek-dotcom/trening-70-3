import type { Day, DayKey, LogEntry, Task, Week } from '../types'
import { DAY_KEYS, DAY_NAMES, addDays, fmtDay, fmtRange, parseISO, toISO } from './dates'
import { SPORT } from './sports'
import { getLog, getTasksDone } from './storage'

const STATUS = { done: '✅ zrobione', partial: '🟡 częściowo', skipped: '⛔ pominięte' } as const

function blocksShort(day: Day): string {
  return (day.blocks ?? [])
    .map((b) => {
      if (b.repeat && b.on && b.off) return `${b.repeat}×(${b.on.duration}' @${b.on.ftp}% / ${b.off.duration}' @${b.off.ftp}%)`
      if (b.ftp !== undefined) return `${b.duration}' @${b.ftp}${b.ftpTo !== undefined ? `→${b.ftpTo}` : ''}%`
      if (b.meters) return `${b.meters} m${b.name ? ` ${b.name.toLowerCase()}` : ''}`
      if (b.exercises) return `${b.exercises.length} ćw.`
      return b.name ?? ''
    })
    .filter(Boolean)
    .join(', ')
}

/** Zwięzły tekst odprawy tygodnia do wklejenia do Claude. */
export function buildWeekSummary(week: Week | undefined, monday: Date, tasks: Task[], ftp?: number): string {
  const lines: string[] = []
  lines.push(`ODPRAWA TYGODNIA ${fmtRange(monday)}${week?.phase ? ` · faza: ${week.phase}` : ''}`)
  if (week?.goal) lines.push(`Cel tygodnia: ${week.goal}`)
  if (ftp) lines.push(`FTP: ${ftp} W`)
  lines.push('')

  let planned = 0
  let done = 0
  const rpes: number[] = []
  DAY_KEYS.forEach((k: DayKey, i) => {
    const date = addDays(monday, i)
    const day = week?.days[k]
    const log: LogEntry | null = getLog(toISO(date))
    if (!day) return
    planned++
    const head = `${DAY_NAMES[k]} ${fmtDay(date)} · ${SPORT[day.sport].label} · ${day.title}${day.duration ? ` ${day.duration}'` : ''}`
    lines.push(head)
    const plan = blocksShort(day)
    if (plan) lines.push(`  plan: ${plan}`)
    if (log) {
      if (log.status !== 'skipped') done++
      const parts: string[] = [STATUS[log.status]]
      if (log.rpe) parts.push(`RPE ${log.rpe}`)
      if (log.power) parts.push(`${log.power} W`)
      if (log.hr) parts.push(`${log.hr} bpm`)
      lines.push(`  wykonanie: ${parts.join(' · ')}`)
      if (log.note) lines.push(`  notatka: ${log.note}`)
      if (log.rpe) rpes.push(log.rpe)
    } else {
      lines.push('  wykonanie: brak wpisu')
    }
  })
  lines.push('')
  const avgRpe = rpes.length ? (rpes.reduce((a, b) => a + b, 0) / rpes.length).toFixed(1) : '–'
  lines.push(`Bilans: ${done}/${planned} sesji zrobionych (w tym częściowo), średnie RPE ${avgRpe}`)

  const doneMap = getTasksDone()
  const sunday = toISO(addDays(monday, 6))
  const open = tasks.filter((t) => !doneMap[t.id] && t.due <= sunday)
  if (open.length) {
    lines.push('')
    lines.push('Otwarte zadania:')
    open.forEach((t) => lines.push(`- ${t.title} (do ${fmtDay(parseISO(t.due))})`))
  }
  lines.push('')
  lines.push('Proszę o plan na następny tydzień w formacie data/weeks/RRRR-MM-DD.json.')
  return lines.join('\n')
}
