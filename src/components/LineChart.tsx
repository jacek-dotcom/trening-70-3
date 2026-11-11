import { useRef, useState } from 'react'
import type { MetricPoint } from '../types'
import { fmtDate, parseISO } from '../lib/dates'

/** Prosty wykres liniowy (SVG, bez bibliotek): jedna seria, jedna oś, tooltip po najechaniu. */
export default function LineChart({ points, color, unit, height = 150 }: { points: MetricPoint[]; color: string; unit: string; height?: number }) {
  const data = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const [hover, setHover] = useState<number | null>(null)
  const ref = useRef<SVGSVGElement>(null)
  const W = 320
  const H = height
  const pad = { l: 34, r: 12, t: 12, b: 22 }

  if (data.length === 0) return <div className="py-8 text-center text-[13px] text-ink-2">Brak pomiarów</div>

  const xs = data.map((d) => parseISO(d.date).getTime())
  const ys = data.map((d) => d.value)
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const span = Math.max(yMax - yMin, 1)
  const lo = Math.floor((yMin - span * 0.25))
  const hi = Math.ceil((yMax + span * 0.25))
  const X = (t: number) => (x1 === x0 ? (pad.l + W - pad.r) / 2 : pad.l + ((t - x0) / (x1 - x0)) * (W - pad.l - pad.r))
  const Y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b)
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(d.value).toFixed(1)}`).join(' ')
  const ticks = [lo, (lo + hi) / 2, hi].map((v) => Math.round(v))

  const onMove = (clientX: number) => {
    const svg = ref.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * W
    let best = 0
    let bd = Infinity
    xs.forEach((t, i) => {
      const d = Math.abs(X(t) - px)
      if (d < bd) { bd = d; best = i }
    })
    setHover(best)
  }
  const h = hover !== null ? data[hover] : null

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => onMove(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={Y(v)} y2={Y(v)} stroke="var(--border)" strokeWidth="1" />
            <text x={pad.l - 6} y={Y(v) + 3.5} textAnchor="end" fontSize="10" fill="var(--ink-2)">{v}</text>
          </g>
        ))}
        <text x={pad.l} y={H - 6} fontSize="10" fill="var(--ink-2)">{fmtDate(data[0].date)}</text>
        {data.length > 1 && <text x={W - pad.r} y={H - 6} textAnchor="end" fontSize="10" fill="var(--ink-2)">{fmtDate(data[data.length - 1].date)}</text>}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={X(xs[i])} cy={Y(d.value)} r={hover === i ? 5.5 : 4} fill={color} stroke="var(--surface-solid)" strokeWidth="2" />
        ))}
        {h && <line x1={X(xs[hover!])} x2={X(xs[hover!])} y1={pad.t} y2={H - pad.b} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" />}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-1 rounded-xl bg-surface-solid px-2.5 py-1.5 text-[12px] shadow-md ring-1 ring-line"
          style={{ left: `${(X(xs[hover!]) / W) * 100}%`, transform: `translateX(${X(xs[hover!]) > W / 2 ? '-105%' : '5%'})` }}
        >
          <div className="font-semibold">{h.value} {unit}</div>
          <div className="text-ink-2">{fmtDate(h.date)}{h.note ? ` · ${h.note}` : ''}</div>
        </div>
      )}
    </div>
  )
}
