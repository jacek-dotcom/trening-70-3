import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Motyw: zapisany ręcznie albo systemowy.
function applyTheme() {
  let saved: string | null = null
  try { saved = localStorage.getItem('t703:theme') } catch { /* noop */ }
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : sys
}
applyTheme()
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme)
window.addEventListener('t703:theme', applyTheme)

// PWA: service worker tylko w buildzie produkcyjnym.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
