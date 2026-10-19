import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { DEFAULT_FILTERS, type Filters } from "./data"

export interface AppEvent { t: string; name: string; props: Record<string, string | number | boolean> }

interface Store {
  filters: Filters
  setFilters: (f: Filters) => void
  patchFilters: (p: Partial<Filters>) => void
  sent: Set<string>
  markSent: (id: string) => void
  events: AppEvent[]
  log: (name: string, props?: AppEvent["props"]) => void
  reset: () => void
}

const KEY = "sms-prototype-eu-v1"
const Ctx = createContext<Store | null>(null)

function load(): { filters?: Filters; sent?: string[]; events?: AppEvent[] } {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}") } catch { return {} }
}

// Filters persist across pages (R1) via sessionStorage, so going back to results keeps the search.
export function StoreProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(load, [])
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, ...saved.filters })
  const [sent, setSent] = useState<Set<string>>(new Set(saved.sent))
  const [events, setEvents] = useState<AppEvent[]>(saved.events || [])

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ filters, sent: [...sent], events })) } catch { /* private mode */ }
  }, [filters, sent, events])

  const log = useCallback((name: string, props: AppEvent["props"] = {}) => {
    const t = new Date().toLocaleTimeString("en-GB")
    setEvents((e) => [{ t, name, props }, ...e].slice(0, 40))
  }, [])

  const value: Store = {
    filters,
    setFilters,
    patchFilters: (p) => setFilters((f) => ({ ...f, ...p })),
    sent,
    markSent: (id) => setSent((s) => new Set(s).add(id)),
    events,
    log,
    reset: () => { setFilters({ ...DEFAULT_FILTERS }); setSent(new Set()); setEvents([]) },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error("useStore outside StoreProvider")
  return s
}

// Minimal hash router: #/search, #/results, #/profile/:id, #/send/:id, #/sent/:id
export function useRoute() {
  const parse = () => {
    const [, view = "search", id] = (window.location.hash || "#/search").split("/")
    return { view, id }
  }
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0) }
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}

export const go = (hash: string) => {
  if (window.location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"))
  else window.location.hash = hash
}
