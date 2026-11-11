import { useMemo, useState } from 'react'
import type { DayKey } from '../types'
import { tasks, weekDates, weeks } from '../lib/data'
import { DAY_KEYS, addDays, fmtRange, mondayOf, parseISO, toISO, todayISO } from '../lib/dates'
import { getLog, useStoreVersion, useStored } from '../lib/storage'
import { buildWeekSummary } from '../lib/summary'
import DayCard from './DayCard'
import DayDetail from './DayDetail'
import { Button, Card, SectionTitle, useCopy } from './ui'

function initialWeek(): string {
  const cur = toISO(mondayOf(new Date()))
  if (weeks[cur]) return cur
  const next = weekDates.find((d) => d > cur)
  return next ?? weekDates.at(-1) ?? cur
}

export default function WeekView({ ftp }: { ftp: number }) {
  const [weekISO, setWeekISO] = useState(initialWeek)
  const monday = parseISO(weekISO)
  const week = weeks[weekISO]
  const today = todayISO()
  const [open, setOpen] = useState<DayKey | null>(null)
  const isSundayToday = new Date().getDay() === 0 && today >= weekISO && today <= toISO(addDays(monday, 6))
  const [tasksDone] = useStored<Record<string, boolean>>('tasks', {})
  const sundayTasks = tasks.filter((t) => t.sunday && !tasksDone[t.id])

  // Po każdym zapisie w localStorage karty odświeżają ikonę statusu.
  const storeVersion = useStoreVersion()
  const logs = useMemo(() => DAY_KEYS.map((_, i) => getLog(toISO(addDays(monday, i)))), [weekISO, storeVersion]) // eslint-disable-line react-hooks/exhaustive-deps

  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const copySummary = async () => {
    setCopied(await copy(buildWeekSummary(week, monday, tasks, ftp)))
    setTimeout(() => setCopied(false), 1800)
  }

  const idx = weekDates.indexOf(weekISO)
  const hasPrev = idx > 0 || weekDates.some((d) => d < weekISO)
  const hasNext = weekDates.some((d) => d > weekISO)

  return (
    <div>
      <SectionTitle
        right={
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Poprzedni tydzień" onClick={() => setWeekISO(toISO(addDays(monday, -7)))} className="press grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-[18px]">‹</button>
            <button type="button" onClick={() => setWeekISO(initialWeek())} className="press rounded-full bg-surface-2 px-3 py-1.5 text-[13px] font-semibold">Dziś</button>
            <button type="button" aria-label="Następny tydzień" onClick={() => setWeekISO(toISO(addDays(monday, 7)))} className="press grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-[18px]">›</button>
          </div>
        }
      >
        Tydzień {fmtRange(monday)}
      </SectionTitle>

      {week ? (
        <div className="mb-3 px-1 text-[14px] text-ink-2">
          {week.phase && <span className="font-semibold text-ink">{week.phase} · </span>}
          {week.goal}
        </div>
      ) : (
        <Card className="mb-3 p-4 text-[14px] text-ink-2">
          Brak pliku <code className="rounded bg-surface-2 px-1">data/weeks/{weekISO}.json</code>.
          {(hasPrev || hasNext) && (
            <span> Najbliższe plany: {weekDates.map((d) => (
              <button key={d} type="button" onClick={() => setWeekISO(d)} className="mr-2 font-semibold text-tint">{fmtRange(parseISO(d))}</button>
            ))}</span>
          )}
        </Card>
      )}

      {isSundayToday && sundayTasks.length > 0 && (
        <Card className="mb-3 border-l-4 border-l-recovery p-4">
          <div className="mb-1 text-[13px] font-bold uppercase tracking-wide text-recovery">Do odprawy</div>
          <ul className="list-disc pl-5 text-[14.5px]">
            {sundayTasks.map((t) => <li key={t.id}>{t.title}</li>)}
          </ul>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:gap-2">
        {DAY_KEYS.map((k, i) => {
          const date = addDays(monday, i)
          return (
            <DayCard key={k} k={k} date={date} day={week?.days[k]} ftp={ftp} log={logs[i]} isToday={toISO(date) === today} onOpen={() => setOpen(k)} />
          )
        })}
      </div>

      <Card className="mt-4 flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
        <div>
          <div className="text-[16px] font-bold">Odprawa niedzielna</div>
          <div className="text-[13.5px] text-ink-2">Plan vs wykonanie, RPE, moc, tętno, notatki i otwarte zadania – gotowe do wklejenia do Claude.</div>
        </div>
        <Button onClick={copySummary} className="shrink-0">{copied ? 'Skopiowano ✓' : '📋 Kopiuj podsumowanie tygodnia'}</Button>
      </Card>

      {open && week?.days[open] && (
        <DayDetail k={open} date={addDays(monday, DAY_KEYS.indexOf(open))} day={week.days[open]!} ftp={ftp} onClose={() => setOpen(null)} />
      )}
    </div>
  )
}
