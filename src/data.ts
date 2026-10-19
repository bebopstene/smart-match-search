/* Mock data for the Smart Match Search prototype.
   Seeded so every reviewer sees the same counts on every reload. All people and hospitals are fictional. */

export type Specialty = "icu" | "er" | "stepdown" | "medsurg"
export type Shift = "nights" | "days" | "weekends" | "perdiem"
export type Mode = "required" | "preferred"

// compact = multistate license under the Nurse Licensure Compact (NLC)
export interface License { state: string; compact: boolean }

export interface Clinician {
  id: string
  first: string
  last: string
  creds: string
  specialty: Specialty
  years: number
  licenses: License[]
  shifts: Shift[]
  startDays: number
  distance: number // miles from the facility
  city: string
  lastActive: number // days since last login, profile update or reply
  ccrn: boolean
  replyRate: number
  about: string
  history: [role: string, place: string, years: string][]
}

export interface Filters {
  specialty: Specialty
  acceptNLC: boolean
  shift: Shift
  shiftMode: Mode
  startWithin: number
  startMode: Mode
  radius: number
  radiusMode: Mode
  certMode: Mode
  activeOnly: boolean
}

export const FACILITY = { name: "Bayou General Hospital", area: "Medical Center, Houston", city: "Houston, TX" }
export const RECRUITER = { name: "Dana Ortiz", first: "Dana", initials: "DO", title: "Talent Acquisition" }

export const SPECIALTY: Record<Specialty, string> = { icu: "ICU", er: "Emergency", stepdown: "Step-down", medsurg: "Med-Surg" }
export const SHIFT: Record<Shift, string> = { nights: "Nights", days: "Days", weekends: "Weekends", perdiem: "Per diem" }
export const STATE: Record<string, string> = {
  TX: "Texas", FL: "Florida", AZ: "Arizona", CO: "Colorado", GA: "Georgia", NC: "North Carolina",
  TN: "Tennessee", VA: "Virginia", MO: "Missouri", CA: "California", NY: "New York",
  IL: "Illinois", MA: "Massachusetts", NV: "Nevada", MN: "Minnesota",
}

export const RADIUS_STEPS = [10, 25, 50, 100]
export const START_STEPS = [7, 14, 30, 60, 90]

export const DEFAULT_FILTERS: Filters = {
  specialty: "icu",
  acceptNLC: true,
  shift: "nights", shiftMode: "required",
  startWithin: 30, startMode: "required",
  radius: 25, radiusMode: "required",
  certMode: "preferred",
  activeOnly: true,
}

// Edge state B (PRD §8): 10-mile radius, start in 7 days, Texas license only.
export const EDGE_B_FILTERS: Filters = { ...DEFAULT_FILTERS, acceptNLC: false, startWithin: 7, radius: 10 }

// Hand-written clinicians that carry the demo paths.
const FEATURED: Clinician[] = [
  {
    id: "maria-delgado", first: "Maria", last: "Delgado", creds: "RN, CCRN", specialty: "icu", years: 7,
    licenses: [{ state: "TX", compact: true }], shifts: ["nights", "weekends"], startDays: 10, distance: 6,
    city: "Bellaire, TX", lastActive: 1, ccrn: true, replyRate: 74,
    about: "Night-shift ICU nurse on a 40-bed cardiovascular unit. Precepts new grads, CRRT and ECMO trained.",
    history: [["ICU RN, Cardiovascular ICU", "Gulf Coast Medical Center", "2021 – now"], ["RN, Step-down", "Harbor Regional Hospital", "2019 – 2021"]],
  },
  {
    id: "jordan-pike", first: "Jordan", last: "Pike", creds: "RN, CCRN", specialty: "icu", years: 9,
    licenses: [{ state: "CA", compact: false }], shifts: ["nights"], startDays: 14, distance: 12,
    city: "Houston, TX", lastActive: 2, ccrn: true, replyRate: 61,
    about: "Recently relocated from Sacramento. Neuro and trauma ICU background. Texas license application not on file.",
    history: [["ICU RN, Neuro/Trauma ICU", "Sierra Valley Medical Center (CA)", "2017 – 2026"]],
  },
  {
    id: "kwame-mensah", first: "Kwame", last: "Mensah", creds: "RN, CCRN", specialty: "icu", years: 6,
    licenses: [{ state: "TX", compact: true }], shifts: ["nights", "days"], startDays: 5, distance: 18,
    city: "Sugar Land, TX", lastActive: 3, ccrn: true, replyRate: 69,
    about: "Medical ICU nurse, rapid response team member. Finishing a travel contract this week.",
    history: [["Travel ICU RN", "Brazos Valley Hospital", "2025 – now"], ["ICU RN, MICU", "Lone Star Health", "2020 – 2025"]],
  },
  {
    id: "ethan-wallace", first: "Ethan", last: "Wallace", creds: "RN, CCRN", specialty: "icu", years: 3,
    licenses: [{ state: "TX", compact: true }], shifts: ["nights"], startDays: 14, distance: 11,
    city: "Houston, TX", lastActive: 0, ccrn: true, replyRate: 66,
    about: "Surgical ICU nurse, comfortable with fresh post-op hearts. Looking to stay on permanent nights.",
    history: [["ICU RN, Surgical ICU", "Pinewood Regional", "2023 – now"]],
  },
  {
    id: "sofia-brennan", first: "Sofia", last: "Brennan", creds: "RN", specialty: "icu", years: 4,
    licenses: [{ state: "TX", compact: true }], shifts: ["nights", "weekends"], startDays: 21, distance: 7,
    city: "West University Place, TX", lastActive: 5, ccrn: false, replyRate: 58,
    about: "Medical ICU nurse, sitting the CCRN exam in December. Two weeks notice at current job.",
    history: [["ICU RN, MICU", "Harbor Regional Hospital", "2022 – now"]],
  },
  {
    id: "lena-okafor", first: "Lena", last: "Okafor", creds: "RN, CCRN", specialty: "icu", years: 5,
    licenses: [{ state: "FL", compact: true }], shifts: ["nights"], startDays: 6, distance: 9,
    city: "Houston, TX", lastActive: 2, ccrn: true, replyRate: 63,
    about: "Moved from Tampa last month. Holds a Florida multistate (NLC) license, valid in Texas.",
    history: [["ICU RN, Cardiac ICU", "Bayshore Heart Institute (FL)", "2021 – 2026"]],
  },
  {
    id: "priya-raman", first: "Priya", last: "Raman", creds: "RN, CCRN", specialty: "icu", years: 11,
    licenses: [{ state: "TX", compact: true }], shifts: ["nights", "days"], startDays: 4, distance: 8,
    city: "Houston, TX", lastActive: 52, ccrn: true, replyRate: 19,
    about: "Senior ICU nurse and charge nurse. Profile not updated since August.",
    history: [["Charge RN, MICU", "Lone Star Health", "2018 – now"]],
  },
]

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generatePool(count: number): Clinician[] {
  const rnd = mulberry32(20261019)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]
  const between = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))
  const FIRST = ["Aisha", "Ben", "Carmen", "Daniel", "Elena", "Femi", "Grace", "Hector", "Ines", "Jamal", "Kara", "Luis", "Mei", "Nadia", "Omar", "Paula", "Quinn", "Rosa", "Sam", "Tara", "Uche", "Vera", "Will", "Ximena", "Yusuf", "Zoe", "Andre", "Bianca", "Chris", "Dalia", "Erin", "Felix", "Gina", "Hana", "Ivan", "Jade", "Kofi", "Lucia", "Marco", "Nina"]
  const LAST = ["Alvarez", "Brooks", "Chen", "Diaz", "Ellis", "Fischer", "Garcia", "Huang", "Ibrahim", "Johnson", "Kim", "Lopez", "Moreno", "Nguyen", "Owens", "Patel", "Quintero", "Reyes", "Silva", "Tran", "Usman", "Vasquez", "Walker", "Young", "Zamora", "Bennett", "Castillo", "Doyle", "Herrera", "Jackson", "Khan", "Morales", "Ortega", "Price", "Ramos", "Shah", "Torres", "Ward"]
  const COMPACT = ["FL", "AZ", "CO", "GA", "NC", "TN", "VA", "MO"]
  const SINGLE = ["CA", "NY", "IL", "MA", "NV", "MN"]
  const PLACES = ["Gulf Coast Medical Center", "Harbor Regional Hospital", "Lone Star Health", "Brazos Valley Hospital", "Pinewood Regional", "Cypress Creek Medical", "San Jacinto General"]
  const cityFor = (d: number) =>
    d <= 9 ? pick(["Houston, TX", "Bellaire, TX", "Montrose, TX"]) :
    d <= 22 ? pick(["Pasadena, TX", "Pearland, TX", "Sugar Land, TX", "Missouri City, TX"]) :
    d <= 40 ? pick(["Katy, TX", "The Woodlands, TX", "League City, TX", "Baytown, TX", "Cypress, TX"]) :
    d <= 70 ? pick(["Galveston, TX", "Conroe, TX", "Sealy, TX"]) :
    pick(["Beaumont, TX", "College Station, TX", "Austin, TX", "San Antonio, TX"])

  const out: Clinician[] = []
  const used = new Set(FEATURED.map((c) => `${c.first} ${c.last}`))
  while (out.length < count) {
    const first = pick(FIRST), last = pick(LAST)
    if (used.has(`${first} ${last}`)) continue
    used.add(`${first} ${last}`)

    const r = rnd()
    const specialty: Specialty = r < 0.62 ? "icu" : r < 0.8 ? "er" : r < 0.9 ? "stepdown" : "medsurg"
    const l = rnd()
    const licenses: License[] = l < 0.55 ? [{ state: "TX", compact: true }] : l < 0.8 ? [{ state: pick(COMPACT), compact: true }] : [{ state: pick(SINGLE), compact: false }]
    const odds: Record<Shift, number> = { nights: 0.55, days: 0.6, weekends: 0.35, perdiem: 0.15 }
    const shifts = (Object.keys(SHIFT) as Shift[]).filter((s) => rnd() < odds[s])
    if (!shifts.length) shifts.push("days")
    const s = rnd()
    const startDays = s < 0.15 ? between(3, 7) : s < 0.55 ? between(8, 30) : s < 0.8 ? between(31, 60) : between(61, 120)
    const d = rnd()
    const distance = d < 0.2 ? between(2, 10) : d < 0.6 ? between(11, 25) : d < 0.85 ? between(26, 50) : between(51, 160)
    const a = rnd()
    const lastActive = a < 0.55 ? between(0, 14) : a < 0.75 ? between(15, 30) : between(31, 200)
    const ccrn = specialty === "icu" ? rnd() < 0.45 : rnd() < 0.08
    const years = between(1, 18)

    const c: Clinician = {
      id: `${first}-${last}`.toLowerCase(), first, last, creds: ccrn ? "RN, CCRN" : "RN", specialty, years,
      licenses, shifts, startDays, distance, city: cityFor(distance), lastActive, ccrn,
      replyRate: Math.max(8, Math.min(78, Math.round(70 - lastActive * 0.6 + rnd() * 10))),
      about: `${SPECIALTY[specialty]} nurse with ${years} year${years > 1 ? "s" : ""} of experience.`,
      history: [[`${SPECIALTY[specialty]} RN`, pick(PLACES), `${2026 - Math.min(years, 6)} – now`]],
    }

    // Keep edge state B honest: nobody may match the narrow search.
    const narrowMatch = specialty === "icu" && licenses[0].state === "TX" && shifts.includes("nights") &&
      startDays <= 7 && distance <= 10 && lastActive <= 30
    if (narrowMatch) c.startDays = between(15, 28)

    out.push(c)
  }
  return out
}

export const CLINICIANS: Clinician[] = [...FEATURED, ...generatePool(200)]
export const BY_ID: Record<string, Clinician> = Object.fromEntries(CLINICIANS.map((c) => [c.id, c]))
