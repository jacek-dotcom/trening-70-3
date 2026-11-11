import { tasks } from '../lib/data'
import { fmtDate, todayISO } from '../lib/dates'
import { useStored } from '../lib/storage'
import { Card, Pill, SectionTitle } from './ui'

export default function TasksView() {
  const [done, setDone] = useStored<Record<string, boolean>>('tasks', {})
  const today = todayISO()
  const sorted = [...tasks].sort((a, b) => Number(!!done[a.id]) - Number(!!done[b.id]) || a.due.localeCompare(b.due))
  const openCount = tasks.filter((t) => !done[t.id]).length
  return (
    <div>
      <SectionTitle right={<span className="text-[13px] text-ink-2">{openCount} otwartych</span>}>Zadania</SectionTitle>
      <Card className="fade-up divide-y divide-line px-4">
        {sorted.map((t) => {
          const isDone = !!done[t.id]
          const overdue = !isDone && t.due < today
          return (
            <label key={t.id} className="flex cursor-pointer items-center gap-3 py-3">
              <input
                type="checkbox"
                checked={isDone}
                onChange={(e) => setDone({ ...done, [t.id]: e.target.checked })}
                className="h-5 w-5 shrink-0 accent-[var(--tint)]"
              />
              <div className="min-w-0 flex-1">
                <div className={`text-[15px] ${isDone ? 'text-ink-3 line-through' : 'font-medium'}`}>{t.title}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-2">
                  <span className={overdue ? 'font-semibold text-run' : ''}>do {fmtDate(t.due)}{overdue ? ' · po terminie' : ''}</span>
                  {t.sunday && <Pill color="var(--c-recovery)">niedziela</Pill>}
                </div>
              </div>
            </label>
          )
        })}
        {tasks.length === 0 && <div className="py-6 text-center text-[14px] text-ink-2">Brak zadań w data/tasks.json</div>}
      </Card>
      <p className="mt-3 px-1 text-[12.5px] text-ink-2">Zadania z flagą „niedziela” pokazują się w niedzielę jako baner „Do odprawy” w widoku tygodnia.</p>
    </div>
  )
}
