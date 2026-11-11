import { useCallback, useSyncExternalStore } from 'react'
import type { LogEntry } from '../types'

const PREFIX = 't703:'
const listeners = new Set<() => void>()
let version = 0
function emit() {
  version++
  listeners.forEach((l) => l())
}
/** Licznik zapisów – do przeliczania widoków zależnych od wielu kluczy. */
export function useStoreVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => 0)
}
function subscribe(l: () => void) {
  listeners.add(l)
  window.addEventListener('storage', l)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', l)
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
export function writeJSON(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(PREFIX + key)
    else localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* prywatny tryb / brak miejsca – ignorujemy */
  }
  emit()
}

/** Hook: wartość z localStorage synchronizowana między komponentami. */
export function useStored<T>(key: string, fallback: T): [T, (v: T | null) => void] {
  const get = () => localStorage.getItem(PREFIX + key)
  const raw = useSyncExternalStore(subscribe, get, () => null)
  let value = fallback
  if (raw) {
    try {
      value = JSON.parse(raw) as T
    } catch {
      /* noop */
    }
  }
  const set = useCallback((v: T | null) => writeJSON(key, v), [key])
  return [value, set]
}

export const logKey = (dateISO: string) => `log:${dateISO}`
export function getLog(dateISO: string): LogEntry | null {
  return readJSON<LogEntry | null>(logKey(dateISO), null)
}
export function getTasksDone(): Record<string, boolean> {
  return readJSON<Record<string, boolean>>('tasks', {})
}
