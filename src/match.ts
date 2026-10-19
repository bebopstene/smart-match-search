/* Matching rules behind R1–R5 of the PRD: required criteria gate, everything adds to a 0–100 fit score. */
import {
  CLINICIANS, COUNTRY, DEFAULT_FILTERS, FACILITY, RADIUS_STEPS, SHIFT, SPECIALTY_SHORT, START_STEPS,
  type Clinician, type Filters,
} from "./data"

export type CritMode = "required" | "preferred" | "signal"
export type CritKey = "specialty" | "licence" | "shift" | "start" | "radius" | "active" | "cert" | "experience"
export interface Criterion { key: CritKey; label: string; mode: CritMode; met: boolean; points: number; max: number; detail: string }
export type FitStatus = "green" | "amber" | "red"
export interface Evaluation { crit: Criterion[]; score: number; requiredMissed: Criterion[]; preferredMissed: Criterion[]; status: FitStatus }
export interface Result { c: Clinician; ev: Evaluation }

export const MODE_LABEL: Record<CritMode, string> = { required: "Must-have", preferred: "Preferred", signal: "Boosts score" }

export const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`
export const ago = (d: number) => (d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`)
export const dateIn = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}
export const fullName = (c: Clinician) => `${c.first} ${c.last}`

export function licenceCheck(c: Clinician, f: Filters): { met: boolean; detail: string; short: string } {
  const de = c.licences.find((l) => l.kind === "de")
  const eu = c.licences.find((l) => l.kind === "eu")
  if (de) return { met: true, detail: "German nursing licence", short: "DE licence" }
  if (eu && f.acceptEU) return { met: true, detail: `${COUNTRY[eu.country].adj} qualification, recognised automatically under EU rules`, short: `EU (${eu.country})` }
  if (eu) return { met: false, detail: `${COUNTRY[eu.country].adj} qualification only. EU qualifications are excluded in this search.`, short: `${eu.country} only` }
  const other = c.licences[0]
  return {
    met: false,
    detail: `${COUNTRY[other.country].adj} qualification only. ${COUNTRY[other.country].name} is outside the EU, so it needs German recognition (Anerkennung), which is not approved yet.`,
    short: `${other.country} only`,
  }
}

export function evaluate(c: Clinician, f: Filters): Evaluation {
  const crit: Criterion[] = []
  const add = (key: CritKey, label: string, mode: CritMode, met: boolean, points: number, max: number, detail: string) =>
    crit.push({ key, label, mode, met, points: met ? points : 0, max, detail })

  add("specialty", `${SPECIALTY_SHORT[f.specialty]} specialty`, "required", c.specialty === f.specialty, 15, 15,
    `${SPECIALTY_SHORT[c.specialty]} nurse, ${plural(c.years, "year")}`)
  const lic = licenceCheck(c, f)
  add("licence", f.acceptEU ? "Licensed to practise in Germany (incl. EU recognition)" : "German nursing licence", "required", lic.met, 20, 20, lic.detail)
  add("shift", `Works ${SHIFT[f.shift].toLowerCase()}`, f.shiftMode, c.shifts.includes(f.shift), 15, 15,
    `Open to ${c.shifts.map((s) => SHIFT[s].toLowerCase()).join(", ")}`)
  add("start", `Can start within ${f.startWithin} days`, f.startMode, c.startDays <= f.startWithin, 15, 15,
    `Available in ${c.startDays} days (${dateIn(c.startDays)})`)
  add("radius", `Within ${f.radius} km of ${FACILITY.name}`, f.radiusMode, c.distance <= f.radius, c.distance <= f.radius / 2 ? 10 : 7, 10,
    `${c.distance} km away, ${c.city}`)
  add("active", "Active in last 30 days", f.activeOnly ? "required" : "preferred", c.lastActive <= 30, c.lastActive <= 7 ? 10 : 6, 10,
    `Last active ${ago(c.lastActive)}`)
  add("cert", "ICU specialist training", f.certMode, c.icuCert, 10, 10, c.icuCert ? "Fachweiterbildung Intensivpflege completed" : "No ICU specialist training on file")
  add("experience", "3+ years experience", "signal", c.years >= 3, c.years >= 5 ? 5 : 3, 5, plural(c.years, "year"))

  const requiredMissed = crit.filter((k) => k.mode === "required" && !k.met)
  const preferredMissed = crit.filter((k) => k.mode === "preferred" && !k.met)
  const score = Math.min(100, crit.reduce((s, k) => s + k.points, 0))
  const status: FitStatus = requiredMissed.length ? "red" : preferredMissed.length ? "amber" : "green"
  return { crit, score, requiredMissed, preferredMissed, status }
}

export function search(f: Filters): Result[] {
  return CLINICIANS.map((c) => ({ c, ev: evaluate(c, f) }))
    .filter((r) => r.ev.requiredMissed.length === 0)
    .sort((a, b) => b.ev.score - a.ev.score || a.c.distance - b.c.distance)
}

// Clinicians in the chosen specialty that miss exactly one must-have: shown collapsed under results.
export function nearMisses(f: Filters): Result[] {
  return CLINICIANS.map((c) => ({ c, ev: evaluate(c, f) }))
    .filter((r) => r.ev.requiredMissed.length === 1 && r.c.specialty === f.specialty)
    .sort((a, b) => b.ev.score - a.ev.score)
    .slice(0, 8)
}

export interface Relaxation { key: string; label: string; filter: string; patch: Partial<Filters>; adds: number }

// R5: one-click relaxations, each with the number of clinicians it adds.
export function relaxations(f: Filters): Relaxation[] {
  const base = search(f).length
  const opts: Omit<Relaxation, "adds">[] = []
  const nextStep = (steps: number[], v: number) => steps.find((s) => s > v)
  if (f.startMode === "required") {
    const to = f.startWithin < 30 ? 30 : nextStep(START_STEPS, f.startWithin)
    if (to) opts.push({ key: "start", label: `Extend start date to within ${to} days`, filter: "Start date", patch: { startWithin: to } })
  }
  if (f.radiusMode === "required") {
    const to = nextStep(RADIUS_STEPS, f.radius)
    if (to) opts.push({ key: "radius", label: `Widen radius to ${to} km`, filter: "Distance", patch: { radius: to } })
  }
  if (!f.acceptEU) opts.push({ key: "eu", label: "Include EU qualifications (automatic recognition)", filter: "German licence only", patch: { acceptEU: true } })
  if (f.activeOnly) opts.push({ key: "active", label: "Include clinicians not active in 30 days", filter: "Active recently", patch: { activeOnly: false } })
  if (f.shiftMode === "required") opts.push({ key: "shift", label: `Make ${SHIFT[f.shift].toLowerCase()} preferred, not required`, filter: "Shift", patch: { shiftMode: "preferred" } })
  if (f.certMode === "required") opts.push({ key: "cert", label: "Make ICU specialist training preferred", filter: "ICU specialist training", patch: { certMode: "preferred" } })
  return opts
    .map((o) => ({ ...o, adds: search({ ...f, ...o.patch }).length - base }))
    .filter((o) => o.adds > 0)
    .sort((a, b) => b.adds - a.adds)
}

export function alternatives(c: Clinician, f: Filters, sent: Set<string>): Result[] {
  let pool = search(f)
  if (pool.length < 4) pool = search(DEFAULT_FILTERS)
  const shift = c.shifts[0]
  return pool
    .filter((r) => r.c.id !== c.id && !sent.has(r.c.id))
    .sort((a, b) => Number(b.c.shifts.includes(shift)) - Number(a.c.shifts.includes(shift)) || b.ev.score - a.ev.score)
    .slice(0, 3)
}

// P1: expected reply time from fit and recent activity.
export function replyEstimate(c: Clinician, ev: Evaluation) {
  let hours = c.lastActive <= 2 ? 18 : c.lastActive <= 7 ? 24 : c.lastActive <= 30 ? 48 : 120
  if (ev.score < 90) hours += 12
  const when = new Date(Date.now() + hours * 3600e3)
  return {
    label: hours <= 24 ? `within ${hours} hours` : `within ${Math.round(hours / 24)} days`,
    by: `${when.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}, ${when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
  }
}

export function querySummary(f: Filters): string[] {
  const pref = (m: string) => (m === "preferred" ? " (preferred)" : "")
  return [
    `${SPECIALTY_SHORT[f.specialty]} nurse`,
    f.acceptEU ? "DE or EU-recognised" : "German licence only",
    `${SHIFT[f.shift]}${pref(f.shiftMode)}`,
    `Start ≤ ${f.startWithin} days${pref(f.startMode)}`,
    `≤ ${f.radius} km${pref(f.radiusMode)}`,
    ...(f.activeOnly ? ["Active recently"] : []),
  ]
}

export const shortCrit = (k: Criterion, c: Clinician, f: Filters) => {
  switch (k.key) {
    case "specialty": return SPECIALTY_SHORT[c.specialty]
    case "licence": return licenceCheck(c, f).short
    case "shift": return SHIFT[f.shift]
    case "start": return `Starts in ${c.startDays}d`
    case "radius": return `${c.distance} km`
    case "cert": return c.icuCert ? "ICU specialist" : "No ICU training"
    default: return k.label
  }
}
