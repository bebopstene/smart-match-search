import { useEffect, useState } from "react"
import { ChevronDown, MapPin, Plus, SlidersHorizontal, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ActiveBadge, Breakdown, ClinicianAvatar, CriteriaChips, Eyebrow, ScoreRing } from "@/components/bits"
import { FilterForm } from "@/components/FilterForm"
import { SPECIALTY_SHORT, type Filters } from "@/data"
import { ago, fullName, nearMisses, plural, querySummary, relaxations, search, type Result } from "@/match"
import { useStore } from "@/store"

function ResultCard({ r, f, sent }: { r: Result; f: Filters; sent: boolean }) {
  const { c, ev } = r
  const { log } = useStore()
  return (
    <Card className={`gap-0 py-0 transition-colors hover:ring-primary ${sent ? "opacity-70" : ""}`}>
      <a href={`#/profile/${c.id}`} onClick={() => log("result_opened", { clinician: c.id, fit: ev.score })}
        className="flex items-start gap-3 px-4 pt-4 pb-2 sm:items-center sm:gap-4 sm:px-5">
        <ClinicianAvatar c={c} className="size-10 sm:size-12" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[17px] font-extrabold">{fullName(c)}<span className="ml-1.5 text-sm font-medium text-muted-foreground">{c.creds}</span></h3>
            <ActiveBadge c={c} />
            {sent && <Badge className="bg-ink text-cream">Proposal sent</Badge>}
          </div>
          <p className="mt-0.5 mb-2 text-sm text-muted-foreground">
            {SPECIALTY_SHORT[c.specialty]} · {plural(c.years, "yr")} · <MapPin className="inline size-3.5 align-[-2px]" /> {c.city} · active {ago(c.lastActive)}
          </p>
          <CriteriaChips c={c} ev={ev} f={f} />
        </div>
        <ScoreRing score={ev.score} />
      </a>
      <Collapsible className="px-4 pb-3 sm:pr-5 sm:pl-[84px]">
        <CollapsibleTrigger className="group flex items-center gap-1 text-[13px] font-bold text-muted-foreground hover:text-foreground">
          Why {ev.score}? <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent><Breakdown ev={ev} /></CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function ZeroState({ f }: { f: Filters }) {
  const { patchFilters, log } = useStore()
  const opts = relaxations(f).slice(0, 4)
  const allPatch = Object.assign({}, ...opts.map((o) => o.patch)) as Partial<Filters>
  const allCount = search({ ...f, ...allPatch }).length
  const apply = (patch: Partial<Filters>, key: string) => {
    patchFilters(patch)
    log("suggestion_applied", { suggestion: key })
    toast.success(`Filter updated: ${search({ ...f, ...patch }).length} clinicians now match`)
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="grid size-14 place-items-center rounded-2xl bg-peach text-2xl font-extrabold">0</div>
        <div>
          <h2 className="mb-1 text-xl font-extrabold">Your search is narrower than the available pool</h2>
          {opts[0]
            ? <p className="text-muted-foreground">The most restrictive filter is <strong className="text-foreground">{opts[0].filter}</strong>. Loosen one filter and you'll see clinicians right away:</p>
            : <p className="text-muted-foreground">Try a different role or start a new search.</p>}
        </div>
        <ul className="flex flex-col gap-2.5">
          {opts.map((o) => (
            <li key={o.key}>
              <button type="button" onClick={() => apply(o.patch, o.key)}
                className="flex w-full items-center gap-3 rounded-xl border bg-background px-4 py-3.5 text-left font-bold transition-colors hover:border-primary hover:bg-card">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary"><Plus className="size-4" /></span>
                <span className="flex-1">{o.label}</span>
                <Badge className="bg-ok-soft text-sm font-bold text-ok">+{o.adds} {o.adds === 1 ? "clinician" : "clinicians"}</Badge>
              </button>
            </li>
          ))}
        </ul>
        {opts.length > 1 && (
          <Button variant="outline" className="h-10 self-start font-bold" onClick={() => apply(allPatch, opts.map((o) => o.key).join("+"))}>
            Apply all {opts.length} → {allCount} clinicians
          </Button>
        )}
        <p className="text-[13px] text-muted-foreground">We log every zero-result search so the team can see where the clinician pool is too small.</p>
      </CardContent>
    </Card>
  )
}

export function ResultsView() {
  const { filters: f, sent, log } = useStore()
  const results = search(f)
  const misses = nearMisses(f)
  const [showHidden, setShowHidden] = useState(false)
  const [railOpen, setRailOpen] = useState(() => window.innerWidth > 900)

  // R6: log every search and every zero-result search with its filters.
  const key = JSON.stringify(f)
  useEffect(() => {
    if (results.length) log("search_run", { results: results.length })
    else log("zero_results", { filters: querySummary(f).join(" · ") })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <section className="grid items-start gap-4 lg:grid-cols-[300px_1fr] lg:gap-7">
      <aside className="lg:sticky lg:top-20">
        <Collapsible open={railOpen} onOpenChange={setRailOpen}>
          <Card className="gap-0 py-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-5 font-extrabold">
              <span className="flex items-center gap-2"><SlidersHorizontal className="size-4" /> Filters</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">{results.length} match <ChevronDown className={`size-4 transition-transform ${railOpen ? "rotate-180" : ""}`} /></span>
            </CollapsibleTrigger>
            <CollapsibleContent><div className="px-5 pt-4"><FilterForm compact /></div></CollapsibleContent>
          </Card>
        </Collapsible>
      </aside>

      <div>
        <div className="mb-4 flex flex-col gap-3">
          <div>
            <Eyebrow>Results · sorted by fit</Eyebrow>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-[26px]">
              {results.length ? `${results.length} ${results.length === 1 ? "clinician fits" : "clinicians fit"} every must-have` : "No clinicians match every must-have"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {querySummary(f).map((q) => <Badge key={q} variant="outline" className="h-6 bg-card px-2.5 text-[13px] font-semibold">{q}</Badge>)}
          </div>
        </div>

        {!results.length ? <ZeroState f={f} /> : (
          <>
            <div className="flex flex-col gap-3">
              {results.map((r) => <ResultCard key={r.c.id} r={r} f={f} sent={sent.has(r.c.id)} />)}
            </div>
            {misses.length > 0 && (
              <div className="mt-6">
                <Button variant="link" className="px-0 font-semibold text-foreground underline" onClick={() => setShowHidden((s) => !s)} aria-expanded={showHidden}>
                  {showHidden ? "Hide" : "Show"} {misses.length} clinicians who miss one must-have
                </Button>
                {showHidden && (
                  <div className="mt-2 flex flex-col gap-2">
                    {misses.map(({ c, ev }) => (
                      <a key={c.id} href={`#/profile/${c.id}`} className="flex items-center gap-3.5 rounded-xl border bg-muted/60 px-4 py-3 hover:border-bad/40">
                        <ClinicianAvatar c={c} className="size-10 opacity-80 grayscale-[.5]" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold">{fullName(c)}<span className="ml-1.5 text-sm font-medium text-muted-foreground">{c.creds}</span></h3><ActiveBadge c={c} /></div>
                          <p className="mt-1 flex items-center gap-1 text-[13.5px] font-semibold text-bad"><X className="size-3.5" strokeWidth={3} /> Missing: {ev.requiredMissed[0].label}</p>
                        </div>
                        <ScoreRing score={ev.score} status="red" size={40} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
