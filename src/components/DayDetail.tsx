import { useEffect, useState } from 'react'
import type { Day, DayKey, LogEntry, LogStatus } from '../types'
import { DAY_NAMES, fmtDate, toISO } from '../lib/dates'
import { SPORT } from '../lib/sports'
import { logKey, useStored } from '../lib/storage'
import { buildZwo, downloadText } from '../lib/zwo'
import { BlockList } from './Blocks'
import { Button, Pill, Sheet, useCopy } from './ui'

const STATUSES: { v: LogStatus; label: string; color: string }[] = [
  { v: 'done', label: 'Zrobione', color: 'var(--c-recovery)' },
  { v: 'partial', label: 'Częściowo', color: 'var(--c-bike)' },
  { v: 'skipped', label: 'Pominięte', color: 'var(--c-run)' },
]

export default function DayDetail({ k, date, day, ftp, onClose }: { k: DayKey; date: Date; day: Day; ftp: number; onClose: () => void }) {
  const iso = toISO(date)
  const [log, setLog] = useStored<LogEntry | null>(logKey(iso), null)
  const sp = SPORT[day.sport]

  // Formularz szybkiego wpisu
  const [status, setStatus] = useState<LogStatus | null>(log?.status ?? null)
  const [rpe, setRpe] = useState<number>(log?.rpe ?? 0)
  const [power, setPower] = useState(log?.power ? String(log.power) : '')
  const [hr, setHr] = useState(log?.hr ? String(log.hr) : '')
  const [note, setNote] = useState(log?.note ?? '')
  const [saved, setSaved] = useState(false)
  useEffect(() => { setSaved(false) }, [status, rpe, power, hr, note])

  const save = () => {
    if (!status) return
    setLog({ status, rpe: rpe || undefined, power: Number(power) || undefined, hr: Number(hr) || undefined, note: note.trim() || undefined, savedAt: new Date().toISOString() })
    setSaved(true)
  }
  const clear = () => { setLog(null); setStatus(null); setRpe(0); setPower(''); setHr(''); setNote('') }

  const copy = useCopy()
  const [copied, setCopied] = useState(false)
  const zwoName = `${day.title} ${iso}`
  const blockLines = (day.blocks ?? []).map((b) => {
    if (b.repeat && b.on && b.off) return `${b.repeat}× [${b.on.duration}' ${b.on.ftp}% FTP / ${b.off.duration}' ${b.off.ftp}% FTP]`
    const p = b.ftpTo !== undefined && b.ftpTo !== b.ftp ? `${b.ftp}→${b.ftpTo}%` : `${b.ftp}%`
    return `${b.part === 'warmup' ? 'Warmup' : b.part === 'cooldown' ? 'Cooldown' : 'Steady'} ${b.duration}' ${p} FTP`
  })

  return (
    <Sheet open onClose={onClose} title={<span><span className="mr-2">{sp.emoji}</span>{day.title}</span>}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
        <Pill color={sp.color}>{sp.label}</Pill>
        <span>{DAY_NAMES[k]}, {fmtDate(iso)}</span>
        {day.duration ? <span>· {day.duration} min</span> : null}
      </div>
      {day.goal && <p className="mb-4 text-[15px] leading-snug">{day.goal}</p>}

      <h3 className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-ink-2">Bloki</h3>
      <div className="mb-5 rounded-2xl bg-surface-2 px-4">
        <BlockList day={day} ftp={ftp} />
      </div>

      {day.sport === 'bike' && (
        <section className="mb-5 rounded-2xl border border-line p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-bold">MyWhoosh</div>
              <div className="text-[13px] text-ink-2">FTP {ftp} W · bloki w % FTP</div>
            </div>
            <Button onClick={() => downloadText(`${iso}-${day.title.replace(/\s+/g, '_')}.zwo`, buildZwo(day, zwoName), 'application/xml')}>
              ⬇︎ Pobierz plik treningu
            </Button>
          </div>
          <details className="text-[13.5px] text-ink-2">
            <summary className="cursor-pointer font-semibold text-tint">Jak zaimportować / przepisać</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Pobierz plik <b>.zwo</b> (format Zwift Workout; MyWhoosh importuje go w sekcji <b>Workouts → My Workouts → Import</b> / Upload).</li>
              <li>Na iPhonie: zapisz plik w aplikacji Pliki, potem w MyWhoosh wybierz Import i wskaż plik.</li>
              <li>Jeśli import nie działa – otwórz <b>Workout Builder</b> i przepisz bloki z listy poniżej (czasy i % FTP).</li>
            </ol>
            <div className="mt-3 rounded-xl bg-surface-2 p-3 font-mono text-[12.5px] leading-relaxed text-ink">
              {blockLines.map((l, i) => <div key={i}>{l}</div>)}
            </div>
            <div className="mt-2">
              <Button variant="soft" onClick={async () => { setCopied(await copy(blockLines.join('\n'))); setTimeout(() => setCopied(false), 1500) }}>
                {copied ? 'Skopiowano ✓' : 'Kopiuj listę bloków'}
              </Button>
            </div>
          </details>
        </section>
      )}

      <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-ink-2">Szybki wpis po treningu</h3>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.v}
            type="button"
            onClick={() => setStatus(s.v)}
            className="press rounded-2xl py-2.5 text-[14px] font-semibold transition-colors"
            style={status === s.v ? { background: s.color, color: '#fff' } : { background: 'var(--surface-2)' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mb-1 flex items-center justify-between text-[13px] text-ink-2">
        <span>RPE (1–10)</span>
        <span className="font-semibold text-ink">{rpe || '–'}</span>
      </div>
      <div className="mb-3 grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRpe(n)}
            className="press rounded-lg py-2 text-[13px] font-semibold"
            style={rpe === n ? { background: 'var(--ink)', color: 'var(--bg)' } : { background: 'var(--surface-2)' }}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="rounded-2xl bg-surface-2 px-3 py-2">
          <div className="text-[12px] text-ink-2">Śr. moc (W)</div>
          <input inputMode="numeric" value={power} onChange={(e) => setPower(e.target.value.replace(/\D/g, ''))} placeholder="–" className="w-full bg-transparent text-[17px] font-semibold outline-none" />
        </label>
        <label className="rounded-2xl bg-surface-2 px-3 py-2">
          <div className="text-[12px] text-ink-2">Śr. tętno (bpm)</div>
          <input inputMode="numeric" value={hr} onChange={(e) => setHr(e.target.value.replace(/\D/g, ''))} placeholder="–" className="w-full bg-transparent text-[17px] font-semibold outline-none" />
        </label>
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Notatka (samopoczucie, co poszło, co zmienić)…" className="mb-3 w-full resize-none rounded-2xl bg-surface-2 px-3 py-2.5 text-[15px] outline-none" />

      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] text-ink-2">
          {log ? `Zapisano ${new Date(log.savedAt).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Brak wpisu'}
        </div>
        <div className="flex gap-2">
          {log && <Button variant="ghost" onClick={clear}>Usuń</Button>}
          <Button onClick={save} disabled={!status}>{saved ? 'Zapisano ✓' : 'Zapisz'}</Button>
        </div>
      </div>
    </Sheet>
  )
}
