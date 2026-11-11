import { useState } from 'react'
import SeasonBar from './components/SeasonBar'
import WeekView from './components/WeekView'
import FormPanel from './components/FormPanel'
import TasksView from './components/TasksView'
import { metrics } from './lib/data'
import { latest } from './lib/zones'

type Tab = 'week' | 'form' | 'tasks'
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'week', label: 'Tydzień', icon: '📅' },
  { id: 'form', label: 'Forma', icon: '📈' },
  { id: 'tasks', label: 'Zadania', icon: '☑️' },
]

function toggleTheme() {
  const cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  const next = cur === 'dark' ? 'light' : 'dark'
  try { localStorage.setItem('t703:theme', next) } catch { /* noop */ }
  window.dispatchEvent(new Event('t703:theme'))
}

export default function App() {
  const [tab, setTab] = useState<Tab>('week')
  const ftp = latest(metrics.ftp)?.value ?? 200

  return (
    <div className="safe-t mx-auto w-full max-w-6xl px-4 pb-28 sm:pb-10">
      <header className="flex items-center justify-between py-4">
        <h1 className="text-[28px] font-bold tracking-tight">Trening <span className="text-ink-2">70.3</span></h1>
        <div className="flex items-center gap-2">
          <nav className="glass hidden rounded-full p-1 sm:flex">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`press rounded-full px-4 py-1.5 text-[14px] font-semibold transition-colors ${tab === t.id ? 'bg-ink text-bg' : 'text-ink-2'}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <button type="button" onClick={toggleTheme} aria-label="Przełącz motyw" className="press glass grid h-9 w-9 place-items-center rounded-full text-[16px]">◐</button>
        </div>
      </header>

      <SeasonBar />

      <main className="mt-4" key={tab}>
        {tab === 'week' && <WeekView ftp={ftp} />}
        {tab === 'form' && <FormPanel ftp={ftp} />}
        {tab === 'tasks' && <TasksView />}
      </main>

      {/* Dolny pasek zakładek (telefon) */}
      <nav className="safe-b glass fixed inset-x-3 bottom-3 z-40 flex rounded-[26px] p-1.5 sm:hidden">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`press flex flex-1 flex-col items-center gap-0.5 rounded-[20px] py-1.5 text-[11px] font-semibold transition-colors ${tab === t.id ? 'bg-ink text-bg' : 'text-ink-2'}`}>
            <span className="text-[18px] leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
