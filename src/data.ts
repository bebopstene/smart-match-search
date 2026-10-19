/* Mock data for the Smart Match Search prototype.
   Seeded so every reviewer sees the same counts on every reload. All people and hospitals are fictional. */

export type Specialty = "icu" | "er" | "stepdown" | "medsurg"
export type Shift = "nights" | "days" | "weekends" | "perdiem"
export type LicenceKind = "de" | "eu" | "noneu"
export type Mode = "required" | "preferred"

export interface Licence { country: string; kind: LicenceKind }

export interface Clinician {
  id: string
  first: string
  last: string
  creds: string
  specialty: Specialty
  years: number
  licences: Licence[]
  shifts: Shift[]
  startDays: number
  distance: number // km from the facility
  city: string
  lastActive: number // days since last login, profile update or reply
  icuCert: boolean
  replyRate: number
  about: string
  history: [role: string, place: string, years: string][]
}

export interface Filters {
  specialty: Specialty
  acceptEU: boolean
  shift: Shift
  shiftMode: Mode
  startWithin: number
  startMode: Mode
  radius: number
  radiusMode: Mode
  certMode: Mode
  activeOnly: boolean
}

export const FACILITY = { name: "Spreeufer Klinikum", area: "Berlin-Mitte", city: "Berlin" }
export const RECRUITER = { name: "Julia Brandt", first: "Julia", initials: "JB", title: "Talent Acquisition" }

export const SPECIALTY: Record<Specialty, string> = { icu: "Intensive care (ICU)", er: "Emergency", stepdown: "Step-down", medsurg: "Med-Surg" }
export const SPECIALTY_SHORT: Record<Specialty, string> = { icu: "ICU", er: "Emergency", stepdown: "Step-down", medsurg: "Med-Surg" }
export const SHIFT: Record<Shift, string> = { nights: "Nights", days: "Days", weekends: "Weekends", perdiem: "Per diem" }
export const COUNTRY: Record<string, { name: string; adj: string }> = {
  DE: { name: "Germany", adj: "German" }, ES: { name: "Spain", adj: "Spanish" }, IT: { name: "Italy", adj: "Italian" },
  PL: { name: "Poland", adj: "Polish" }, PT: { name: "Portugal", adj: "Portuguese" }, RO: { name: "Romania", adj: "Romanian" },
  GR: { name: "Greece", adj: "Greek" }, HR: { name: "Croatia", adj: "Croatian" }, GB: { name: "United Kingdom", adj: "UK" },
  UA: { name: "Ukraine", adj: "Ukrainian" }, RS: { name: "Serbia", adj: "Serbian" }, TR: { name: "Türkiye", adj: "Turkish" },
}

export const RADIUS_STEPS = [15, 30, 50, 100]
export const START_STEPS = [7, 14, 30, 60, 90]

export const DEFAULT_FILTERS: Filters = {
  specialty: "icu",
  acceptEU: true,
  shift: "nights", shiftMode: "required",
  startWithin: 30, startMode: "required",
  radius: 30, radiusMode: "required",
  certMode: "preferred",
  activeOnly: true,
}

// Edge state B: a recruiter in a hurry narrows everything at once.
export const EDGE_B_FILTERS: Filters = { ...DEFAULT_FILTERS, acceptEU: false, startWithin: 7, radius: 15 }

// Hand-written clinicians that carry the demo paths.
const FEATURED: Clinician[] = [
  {
    id: "anna-becker", first: "Anna", last: "Becker", creds: "RN, ICU specialist", specialty: "icu", years: 7,
    licences: [{ country: "DE", kind: "de" }], shifts: ["nights", "weekends"], startDays: 10, distance: 6,
    city: "Prenzlauer Berg, Berlin", lastActive: 1, icuCert: true, replyRate: 74,
    about: "Night-shift ICU nurse on a 30-bed cardiac intensive care unit. Mentors new nurses, trained in CRRT and ECMO.",
    history: [["ICU nurse, Cardiac ICU", "Havelblick Krankenhaus", "2021 – now"], ["Nurse, Step-down", "Lindenhof Medical Centre", "2019 – 2021"]],
  },
  {
    id: "tom-hughes", first: "Tom", last: "Hughes", creds: "RN, ICU specialist", specialty: "icu", years: 9,
    licences: [{ country: "GB", kind: "noneu" }], shifts: ["nights"], startDays: 14, distance: 12,
    city: "Friedrichshain, Berlin", lastActive: 2, icuCert: true, replyRate: 61,
    about: "Moved from Manchester in August. Neuro and trauma ICU background. German recognition (Anerkennung) applied for, not yet approved.",
    history: [["ICU nurse, Neuro/Trauma ICU", "Northgate General (Manchester, UK)", "2017 – 2026"]],
  },
  {
    id: "kwame-mensah", first: "Kwame", last: "Mensah", creds: "RN, ICU specialist", specialty: "icu", years: 6,
    licences: [{ country: "DE", kind: "de" }], shifts: ["nights", "days"], startDays: 5, distance: 22,
    city: "Spandau, Berlin", lastActive: 3, icuCert: true, replyRate: 69,
    about: "Medical ICU nurse and rapid response team member. Finishing an agency contract this week.",
    history: [["Agency ICU nurse", "Müggelsee Klinik", "2025 – now"], ["ICU nurse, Medical ICU", "Lindenhof Medical Centre", "2020 – 2025"]],
  },
  {
    id: "lukas-weber", first: "Lukas", last: "Weber", creds: "RN, ICU specialist", specialty: "icu", years: 3,
    licences: [{ country: "DE", kind: "de" }], shifts: ["nights"], startDays: 14, distance: 13,
    city: "Moabit, Berlin", lastActive: 0, icuCert: true, replyRate: 66,
    about: "Surgical ICU nurse, comfortable with post-op cardiac patients. Wants to stay on permanent nights.",
    history: [["ICU nurse, Surgical ICU", "Tegeler Forst Klinikum", "2023 – now"]],
  },
  {
    id: "sophie-wagner", first: "Sophie", last: "Wagner", creds: "RN", specialty: "icu", years: 4,
    licences: [{ country: "DE", kind: "de" }], shifts: ["nights", "weekends"], startDays: 21, distance: 7,
    city: "Kreuzberg, Berlin", lastActive: 5, icuCert: false, replyRate: 58,
    about: "Medical ICU nurse, starting the ICU specialist training in January. Four weeks notice at current job.",
    history: [["ICU nurse, Medical ICU", "Havelblick Krankenhaus", "2022 – now"]],
  },
  {
    id: "lucia-fernandez", first: "Lucía", last: "Fernández", creds: "RN, ICU specialist", specialty: "icu", years: 5,
    licences: [{ country: "ES", kind: "eu" }], shifts: ["nights"], startDays: 6, distance: 9,
    city: "Neukölln, Berlin", lastActive: 2, icuCert: true, replyRate: 63,
    about: "Moved from Madrid last month. Spanish nursing degree, recognised automatically under EU rules. German B2.",
    history: [["ICU nurse, Cardiac ICU", "Hospital del Retiro (Madrid)", "2021 – 2026"]],
  },
  {
    id: "priya-raman", first: "Priya", last: "Raman", creds: "RN, ICU specialist", specialty: "icu", years: 11,
    licences: [{ country: "DE", kind: "de" }], shifts: ["nights", "days"], startDays: 4, distance: 8,
    city: "Mitte, Berlin", lastActive: 52, icuCert: true, replyRate: 19,
    about: "Senior ICU nurse and shift lead. Profile not updated since August.",
    history: [["Shift lead, Medical ICU", "Müggelsee Klinik", "2018 – now"]],
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
  const FIRST = ["Lea", "Jonas", "Marta", "Felix", "Elena", "Mehmet", "Clara", "Paul", "Ines", "Jakub", "Hanna", "Luca", "Mia", "Nikola", "Emil", "Sara", "Ole", "Zofia", "Ben", "Amira", "Tobias", "Giulia", "Max", "Ana", "Leon", "Marie", "David", "Olga", "Finn", "Ioana", "Anton", "Laura", "Samir", "Johanna", "Mateo", "Katarzyna", "Noah", "Eva", "Dimitris", "Lina"]
  const LAST = ["Müller", "Schmidt", "Fischer", "Meyer", "Wolf", "Schulz", "Koch", "Richter", "Klein", "Neumann", "Zimmermann", "Hartmann", "Krüger", "Lange", "Werner", "Kowalski", "Nowak", "Rossi", "Bianchi", "García", "López", "Silva", "Costa", "Popescu", "Ionescu", "Yilmaz", "Demir", "Papadopoulos", "Horvat", "Petrović", "Jansen", "Dubois", "Lindqvist", "Novák", "Kaya", "Schröder", "Braun", "Vogel"]
  const EU = ["ES", "IT", "PL", "PT", "RO", "GR", "HR"]
  const NON_EU = ["GB", "UA", "RS", "TR"]
  const PLACES = ["Havelblick Krankenhaus", "Lindenhof Medical Centre", "Müggelsee Klinik", "Tegeler Forst Klinikum", "Wannsee Klinik", "Ostkreuz Hospital", "Barnim Kreisklinik"]
  const cityFor = (d: number) =>
    d <= 9 ? pick(["Mitte, Berlin", "Kreuzberg, Berlin", "Friedrichshain, Berlin", "Neukölln, Berlin", "Moabit, Berlin"]) :
    d <= 22 ? pick(["Charlottenburg, Berlin", "Pankow, Berlin", "Lichtenberg, Berlin", "Steglitz, Berlin", "Köpenick, Berlin"]) :
    d <= 40 ? pick(["Potsdam", "Bernau bei Berlin", "Oranienburg", "Königs Wusterhausen"]) :
    d <= 80 ? pick(["Brandenburg an der Havel", "Eberswalde", "Frankfurt (Oder)"]) :
    pick(["Cottbus", "Szczecin", "Leipzig", "Dresden", "Hamburg"])

  const out: Clinician[] = []
  const used = new Set(FEATURED.map((c) => `${c.first} ${c.last}`))
  while (out.length < count) {
    const first = pick(FIRST), last = pick(LAST)
    if (used.has(`${first} ${last}`)) continue
    used.add(`${first} ${last}`)

    const r = rnd()
    const specialty: Specialty = r < 0.62 ? "icu" : r < 0.8 ? "er" : r < 0.9 ? "stepdown" : "medsurg"
    const l = rnd()
    const licences: Licence[] = l < 0.58 ? [{ country: "DE", kind: "de" }] : l < 0.82 ? [{ country: pick(EU), kind: "eu" }] : [{ country: pick(NON_EU), kind: "noneu" }]
    const odds: Record<Shift, number> = { nights: 0.55, days: 0.6, weekends: 0.35, perdiem: 0.15 }
    const shifts = (Object.keys(SHIFT) as Shift[]).filter((s) => rnd() < odds[s])
    if (!shifts.length) shifts.push("days")
    const s = rnd()
    const startDays = s < 0.15 ? between(3, 7) : s < 0.55 ? between(8, 30) : s < 0.8 ? between(31, 60) : between(61, 120)
    const d = rnd()
    const distance = d < 0.2 ? between(2, 15) : d < 0.6 ? between(16, 30) : d < 0.85 ? between(31, 60) : between(61, 300)
    const a = rnd()
    const lastActive = a < 0.55 ? between(0, 14) : a < 0.75 ? between(15, 30) : between(31, 200)
    const icuCert = specialty === "icu" ? rnd() < 0.45 : rnd() < 0.08
    const years = between(1, 18)

    const c: Clinician = {
      id: `${first}-${last}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z-]/g, ""),
      first, last, creds: icuCert ? "RN, ICU specialist" : "RN", specialty, years,
      licences, shifts, startDays, distance, city: cityFor(distance), lastActive, icuCert,
      replyRate: Math.max(8, Math.min(78, Math.round(70 - lastActive * 0.6 + rnd() * 10))),
      about: `${SPECIALTY_SHORT[specialty]} nurse with ${years} year${years > 1 ? "s" : ""} of experience.`,
      history: [[`${SPECIALTY_SHORT[specialty]} nurse`, pick(PLACES), `${2026 - Math.min(years, 6)} – now`]],
    }

    // Keep edge state B honest: nobody may match the narrow search.
    const narrowMatch = specialty === "icu" && licences[0].kind === "de" && shifts.includes("nights") &&
      startDays <= 7 && distance <= 15 && lastActive <= 30
    if (narrowMatch) c.startDays = between(15, 28)

    out.push(c)
  }
  return out
}

export const CLINICIANS: Clinician[] = [...FEATURED, ...generatePool(200)]
export const BY_ID: Record<string, Clinician> = Object.fromEntries(CLINICIANS.map((c) => [c.id, c]))
