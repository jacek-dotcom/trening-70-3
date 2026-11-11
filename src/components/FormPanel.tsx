import { metrics } from '../lib/data'
import { fmtDate } from '../lib/dates'
import { latest, zonesInWatts } from '../lib/zones'
import LineChart from './LineChart'
import { Card, SectionTitle } from './ui'

const ZONE_COLORS = ['#8e8e93', '#34c759', '#ffcc00', '#ff9500', '#ff3b30', '#af52de', 'var(--ink)']

function MetricCard({ title, points, unit, color }: { title: string; points: typeof metrics.ftp; unit: string; color: string }) {
  const last = latest(points)
  const prev = [...points].sort((a, b) => a.date.localeCompare(b.date)).at(-2)
  const delta = last && prev ? last.value - prev.value : null
  return (
    <Card className="fade-up p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] font-semibold uppercase tracking-wide text-ink-2">{title}</div>
        {delta !== null && (
          <div className="text-[12px] font-semibold" style={{ color: delta >= 0 ? 'var(--c-recovery)' : 'var(--c-run)' }}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} {unit}
          </div>
        )}
      </div>
      <div className="mt-1 text-[34px] font-bold leading-none tracking-tight">
        {last?.value ?? '–'} <span className="text-[16px] font-semibold text-ink-2">{unit}</span>
      </div>
      {last && <div className="mt-1 text-[12px] text-ink-2">{fmtDate(last.date)}{last.note ? ` · ${last.note}` : ''}</div>}
      <div className="mt-3">
        <LineChart points={points} color={color} unit={unit} />
      </div>
      <details className="mt-1 text-[13px] text-ink-2">
        <summary className="cursor-pointer font-semibold text-tint">Wszystkie pomiary</summary>
        <table className="mt-1 w-full">
          <tbody>
            {[...points].sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
              <tr key={p.date} className="border-t border-line">
                <td className="py-1 tabular-nums">{fmtDate(p.date)}</td>
                <td className="py-1 text-right font-semibold text-ink tabular-nums">{p.value} {unit}</td>
                <td className="py-1 pl-3 text-right">{p.note ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  )
}

export default function FormPanel({ ftp }: { ftp: number }) {
  const zones = zonesInWatts(ftp)
  const hr = latest(metrics.restingHr)
  return (
    <div>
      <SectionTitle>Forma</SectionTitle>
      <div className="grid gap-3 lg:grid-cols-3">
        <MetricCard title="FTP" points={metrics.ftp} unit="W" color="var(--c-bike)" />
        <MetricCard title="VO₂max" points={metrics.vo2max} unit="ml/kg/min" color="var(--c-run)" />
        <Card className="fade-up p-4">
          <div className="text-[13px] font-semibold uppercase tracking-wide text-ink-2">Tętno spoczynkowe</div>
          <div className="mt-1 text-[34px] font-bold leading-none tracking-tight">
            {hr?.value ?? '–'} <span className="text-[16px] font-semibold text-ink-2">bpm</span>
          </div>
          {hr && <div className="mt-1 text-[12px] text-ink-2">{fmtDate(hr.date)}</div>}
          <div className="mt-3">
            <LineChart points={metrics.restingHr} color="var(--c-recovery)" unit="bpm" height={120} />
          </div>
        </Card>
      </div>

      <Card className="fade-up mt-3 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <div className="text-[16px] font-bold">Strefy rowerowe (Coggan)</div>
            <div className="text-[13px] text-ink-2">liczone z FTP {ftp} W</div>
          </div>
        </div>
        <div className="divide-y divide-line">
          {zones.map((z, i) => (
            <div key={z.z} className="flex items-center gap-3 py-2">
              <div className="w-8 text-[14px] font-bold" style={{ color: ZONE_COLORS[i] }}>{z.z}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-semibold">{z.name}</div>
                <div className="text-[12px] text-ink-2">{z.lo}{z.hi === Infinity ? '%+' : `–${z.hi}%`} FTP</div>
              </div>
              <div className="text-right text-[15px] font-semibold tabular-nums">
                {z.wHi === null ? `> ${z.wLo} W` : `${z.wLo}–${z.wHi} W`}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
