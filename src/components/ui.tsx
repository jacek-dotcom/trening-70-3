import { useEffect, type ReactNode } from 'react'

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`glass rounded-[22px] ${onClick ? 'press cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', className = '', disabled }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'ghost'; className?: string; disabled?: boolean
}) {
  const base = 'press inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold disabled:opacity-40'
  const v = {
    primary: 'bg-tint text-white shadow-[0_6px_20px_-6px_rgba(10,132,255,.6)]',
    soft: 'bg-surface-2 text-ink',
    ghost: 'text-tint',
  }[variant]
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${base} ${v} ${className}`}>
      {children}
    </button>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between px-1">
      <h2 className="text-[20px] font-bold tracking-tight sm:text-[22px]">{children}</h2>
      {right}
    </div>
  )
}

export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
      style={color ? { background: `color-mix(in srgb, ${color} 16%, transparent)`, color } : { background: 'var(--surface-2)' }}
    >
      {children}
    </span>
  )
}

/** Dolny arkusz (bottom sheet) w stylu iOS; na desktopie – wycentrowany modal. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="backdrop-in absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="sheet-in glass relative flex max-h-[92dvh] w-full flex-col rounded-t-[28px] sm:max-w-2xl sm:rounded-[28px]" style={{ background: 'var(--surface-solid)' }}>
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-ink-3/60 sm:hidden" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <div className="min-w-0 text-[20px] font-bold tracking-tight">{title}</div>
          <button type="button" onClick={onClose} aria-label="Zamknij" className="press grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-ink-2">
            ✕
          </button>
        </div>
        <div className="safe-b overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    </div>
  )
}

export function useCopy() {
  return async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    }
  }
}
