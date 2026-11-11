import { useMemo } from 'react'
import { season } from '../lib/data'
import { daysBetween, fmtDate, todayISO } from '../lib/dates'
import { Card } from './ui'

const PHASE_COLOR: Record<string, string> = {
  gray: 'var(--c-rest)', green: 'var(--c-recovery)', blue: 'var(--c-swim)', orange: 'var(--c-bike)', red: 'var(--c-run)', purple: 'var(--c-strength)',
}
const PRIO_COLOR = { A: 'var(--c-run)', B: 'var(--c-bike)', C: 'var(--c-rest)' } as const

export default function SeasonBar() {
  const today = todayISO()
  const { start, end, total } = useMemo(() => {
    const dates = [...season.phases.map((p) => p.from), ...season.phases.map((p) => p.to), ...season.races.map((r) => r.date)].sort()
    const start = dates[0]
    const end = dates[dates.length - 1]
    return { start, end, total: Math.max(1, daysBetween(start, end)) }
  }, [])
  const pct = (d: string) => Math.min(100, Math.max(0, (daysBetween(start, d) / total) * 100))
  const current = season.phases.find((p) => p.from <= today && today <= p.to)
  const raceA = season.races.find((r) => r.priority === 'A')
  const toA = raceA ? daysBetween(today, raceA.date) : null

  return (
    <Card className="fade-up px-4 pt-3 pb-3">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="min-w-0 truncate text-[13px] font-semibold text-ink-2">{season.name}</div>
        <div className="shrink-0 text-[13px] text-ink-2">
          {current ? <span className="font-semibold text-ink">{current.name}</span> : 'poza sezonem'}
          {toA !== null && toA >= 0 && <span> · {toA} dni do startu A</span>}
        </div>
      </div>

      {/* Pasek faz */}
      <div className="relative h-7">
        <div className="absolute inset-x-0 top-1.5 flex h-4 gap-[2px] overflow-hidden rounded-full bg-surface-2">
          {season.phases.map((p) => (
            <div
              key={p.name + p.from}
              title={`${p.name}: ${fmtDate(p.from)} – ${fmtDate(p.to)}`}
              className="relative h-full overflow-hidden"
              style={{ width: `${((daysBetween(p.from, p.to) + 1) / total) * 100}%`, background: PHASE_COLOR[p.color ?? 'gray'], opacity: current?.name === p.name ? 1 : 0.55 }}
            >
              <span className="absolute inset-0 hidden items-center justify-center truncate px-1 text-[10px] font-semibold text-white sm:flex">{p.name}</span>
            </div>
          ))}
        </div>
        {/* testy */}
        {season.tests.map((t) => (
          <div key={t.date} title={`${t.name} · ${fmtDate(t.date)}`} className="absolute top-0 h-7 w-[2px] -translate-x-1/2 bg-ink/40" style={{ left: `${pct(t.date)}%` }}>
            <div className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ink/60" />
          </div>
        ))}
        {/* starty */}
        {season.races.map((r) => (
          <div key={r.date} title={`${r.name} (${r.priority}) · ${fmtDate(r.date)}`} className="absolute top-0 -translate-x-1/2" style={{ left: `${pct(r.date)}%` }}>
            <div className="grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--surface-solid)] text-[11px] font-black text-white shadow" style={{ background: PRIO_COLOR[r.priority] }}>
              {r.priority}
            </div>
          </div>
        ))}
        {/* dziś */}
        {today >= start && today <= end && (
          <div className="absolute -top-1 bottom-[-6px] w-[2px] -translate-x-1/2 rounded bg-ink" style={{ left: `${pct(today)}%` }}>
            <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-ink" />
            <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-ink">dziś</div>
          </div>
        )}
      </div>

      <div className="no-scrollbar mt-4 flex gap-x-4 gap-y-1 overflow-x-auto text-[12px] text-ink-2">
        {season.races.map((r) => (
          <span key={r.date} className="shrink-0">
            <span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: PRIO_COLOR[r.priority] }} />
            <b className="text-ink">{r.priority}</b> {r.name} · {fmtDate(r.date)}
          </span>
        ))}
        <span className="shrink-0">
          <span className="mr-1 inline-block h-2 w-[2px] bg-ink/60 align-middle" /> testy FTP
        </span>
      </div>
    </Card>
  )
}
