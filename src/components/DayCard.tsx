import type { Day, DayKey, LogEntry } from '../types'
import { DAY_NAMES, DAY_SHORT, fmtDay } from '../lib/dates'
import { SPORT } from '../lib/sports'
import { blocksOneLine } from './Blocks'
import { Card } from './ui'

const STATUS_ICON: Record<LogEntry['status'], string> = { done: '✓', partial: '◐', skipped: '✕' }
const STATUS_COLOR: Record<LogEntry['status'], string> = { done: 'var(--c-recovery)', partial: 'var(--c-bike)', skipped: 'var(--c-run)' }

export default function DayCard({ k, date, day, ftp, log, isToday, onOpen }: {
  k: DayKey; date: Date; day?: Day; ftp: number; log: LogEntry | null; isToday: boolean; onOpen: () => void
}) {
  const sp = day ? SPORT[day.sport] : SPORT.rest
  return (
    <Card onClick={day ? onOpen : undefined} className={`fade-up relative overflow-hidden p-4 ${isToday ? 'ring-2 ring-tint/70' : ''} ${day ? '' : 'opacity-70'}`}>
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: sp.color }} />
      <div className="pl-2">
        <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-ink-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="xl:hidden">{DAY_NAMES[k]}</span>
            <span className="hidden xl:inline">{DAY_SHORT[k]}</span>
            <span className="tabular-nums">{fmtDay(date)}</span>
            {isToday && <span className="rounded-full bg-tint px-1.5 py-[1px] text-[10px] font-bold text-white">DZIŚ</span>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {day?.duration ? <span className="text-[14px] font-semibold tabular-nums text-ink">{day.duration}'</span> : null}
            {log && (
              <span className="grid h-6 w-6 place-items-center rounded-full text-[12px] font-black text-white" style={{ background: STATUS_COLOR[log.status] }} title={log.status}>
                {STATUS_ICON[log.status]}
              </span>
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[17px] font-bold leading-tight tracking-tight xl:text-[15px]">
          <span className="shrink-0">{sp.emoji}</span>
          <span className="min-w-0 xl:line-clamp-2">{day ? day.title : 'Brak planu'}</span>
        </div>
        {day?.goal && <div className="mt-1 line-clamp-2 text-[13.5px] text-ink-2 xl:line-clamp-3 xl:text-[12.5px]">{day.goal}</div>}
        {day && <div className="mt-1.5 line-clamp-2 text-[12.5px] font-medium xl:text-[11.5px]" style={{ color: sp.color }}>{blocksOneLine(day, ftp)}</div>}
      </div>
    </Card>
  )
}
