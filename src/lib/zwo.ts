import type { Block, Day } from '../types'

const sec = (min: number) => Math.round(min * 60)
const pw = (pct: number) => (pct / 100).toFixed(2)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function blockXml(b: Block): string {
  if (b.repeat && b.on && b.off) {
    return `    <IntervalsT Repeat="${b.repeat}" OnDuration="${sec(b.on.duration)}" OffDuration="${sec(b.off.duration)}" OnPower="${pw(b.on.ftp)}" OffPower="${pw(b.off.ftp)}"/>`
  }
  if (!b.duration) return ''
  const lo = b.ftp ?? 50
  const hi = b.ftpTo ?? lo
  if (b.part === 'warmup') return `    <Warmup Duration="${sec(b.duration)}" PowerLow="${pw(lo)}" PowerHigh="${pw(hi)}"/>`
  if (b.part === 'cooldown') return `    <Cooldown Duration="${sec(b.duration)}" PowerLow="${pw(lo)}" PowerHigh="${pw(hi)}"/>`
  if (b.ftpTo !== undefined && b.ftpTo !== lo) return `    <Ramp Duration="${sec(b.duration)}" PowerLow="${pw(lo)}" PowerHigh="${pw(hi)}"/>`
  return `    <SteadyState Duration="${sec(b.duration)}" Power="${pw(lo)}"/>`
}

/** Generuje plik .zwo (Zwift Workout) – format importowany też przez MyWhoosh. */
export function buildZwo(day: Day, name: string): string {
  const blocks = (day.blocks ?? []).map(blockXml).filter(Boolean).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
  <author>Trening 70.3</author>
  <name>${esc(name)}</name>
  <description>${esc(day.goal ?? '')}</description>
  <sportType>bike</sportType>
  <tags/>
  <workout>
${blocks}
  </workout>
</workout_file>
`
}

export function downloadText(filename: string, text: string, mime = 'application/octet-stream') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
