import type { Block, Day } from '../types'
import { PART_LABEL } from '../lib/sports'
import { watts, zoneForPct } from '../lib/zones'

function pctLabel(b: Block) {
  if (b.ftpTo !== undefined && b.ftpTo !== b.ftp) return `${b.ftp}→${b.ftpTo}%`
  return `${b.ftp}%`
}
function wattsLabel(ftp: number, b: Block) {
  if (b.ftpTo !== undefined && b.ftpTo !== b.ftp) return `${watts(ftp, b.ftp ?? 0)}→${watts(ftp, b.ftpTo)} W`
  return `${watts(ftp, b.ftp ?? 0)} W`
}

/** Jeden blok treningu – rower (W, %FTP), basen (m), siła (ćwiczenia) lub opis. */
export function BlockRow({ b, ftp, compact = false }: { b: Block; ftp: number; compact?: boolean }) {
  const label = b.name ?? PART_LABEL[b.part]
  const isInterval = b.repeat && b.on && b.off
  const isBike = b.ftp !== undefined || isInterval
  return (
    <div className="flex gap-3 py-2.5">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: b.part === 'main' ? 'var(--ink)' : 'var(--ink-3)' }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <div className="text-[15px] font-semibold">{label}</div>
          <div className="text-[13px] text-ink-2">
            {isInterval
              ? `${b.repeat}× (${b.on!.duration}' + ${b.off!.duration}')`
              : [b.duration ? `${b.duration}'` : null, b.meters ? `${b.meters} m` : null].filter(Boolean).join(' · ')}
          </div>
        </div>
        {isBike && !compact && (
          <div className="mt-1 text-[14px]">
            {isInterval ? (
              <>
                <span className="font-semibold">{watts(ftp, b.on!.ftp)} W</span> <span className="text-ink-2">({b.on!.ftp}% · {zoneForPct(b.on!.ftp)})</span>
                <span className="text-ink-2"> / </span>
                <span className="font-semibold">{watts(ftp, b.off!.ftp)} W</span> <span className="text-ink-2">({b.off!.ftp}% · {zoneForPct(b.off!.ftp)})</span>
              </>
            ) : (
              <>
                <span className="font-semibold">{wattsLabel(ftp, b)}</span>{' '}
                <span className="text-ink-2">({pctLabel(b)} FTP · {zoneForPct(b.ftpTo ?? b.ftp ?? 0)})</span>
              </>
            )}
          </div>
        )}
        {b.exercises && !compact && (
          <ul className="mt-1.5 space-y-1 text-[14px]">
            {b.exercises.map((e, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>{e.name}{e.note ? <span className="text-ink-2"> · {e.note}</span> : null}</span>
                <span className="shrink-0 tabular-nums text-ink-2">{e.sets ? `${e.sets}×` : ''}{e.reps ?? ''}</span>
              </li>
            ))}
          </ul>
        )}
        {b.text && <div className={`mt-0.5 text-[13.5px] text-ink-2 ${compact ? 'line-clamp-1' : ''}`}>{b.text}</div>}
      </div>
    </div>
  )
}

export function BlockList({ day, ftp, compact = false }: { day: Day; ftp: number; compact?: boolean }) {
  return (
    <div className="divide-y divide-line">
      {(day.blocks ?? []).map((b, i) => (
        <BlockRow key={i} b={b} ftp={ftp} compact={compact} />
      ))}
    </div>
  )
}

/** Krótki opis dnia do karty (np. "10' 45→65% · 40' 65% · 10' 60→40%"). */
export function blocksOneLine(day: Day, ftp: number): string {
  return (day.blocks ?? [])
    .map((b) => {
      if (b.repeat && b.on && b.off) return `${b.repeat}×${b.on.duration}' @${watts(ftp, b.on.ftp)} W`
      if (b.ftp !== undefined) return `${b.duration}' ${wattsLabel(ftp, b)}`
      if (b.meters) return `${b.meters} m`
      if (b.exercises) return `${b.exercises.length} ćwiczeń`
      if (b.duration) return `${b.duration}' ${(b.name ?? '').toLowerCase()}`.trim()
      return ''
    })
    .filter(Boolean)
    .join(' · ')
}
