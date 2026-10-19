import { useEffect, useRef } from "react"
import { AlertTriangle, ArrowLeft, Check, Clock, Lock, MapPin, Send } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActiveBadge, ClinicianAvatar, CritIcon, ScoreRing } from "@/components/bits"
import { cn } from "@/lib/utils"
import { BY_ID, COUNTRY, FACILITY, SHIFT, SPECIALTY, type Clinician } from "@/data"
import { MODE_LABEL, ago, alternatives, dateIn, evaluate, fullName, licenceCheck, type Criterion, type Evaluation } from "@/match"
import { useStore } from "@/store"

const STATUS = {
  green: { cls: "bg-ok-soft border-ok/25 text-foreground", icon: Check, iconCls: "bg-ok" },
  amber: { cls: "bg-warn-soft border-warn/25 text-foreground", icon: AlertTriangle, iconCls: "bg-warn" },
  red: { cls: "bg-bad-soft border-bad/25 text-foreground", icon: Lock, iconCls: "bg-bad" },
}

function CheckRow({ k }: { k: Criterion }) {
  const bad = !k.met && k.mode === "required"
  return (
    <li className={cn("grid grid-cols-[22px_1fr_auto] gap-2 border-b border-border/60 py-2.5 text-sm last:border-0", bad && "-mx-6 bg-bad-soft px-6")}>
      <CritIcon k={k} className="mt-0.5" />
      <span><strong className={cn(bad && "text-bad")}>{k.label}</strong><small className="block text-[13px] text-muted-foreground">{k.detail}</small></span>
      <span className="text-[11.5px] font-semibold whitespace-nowrap text-muted-foreground">{MODE_LABEL[k.mode]}</span>
    </li>
  )
}

// R3: Fit Check. Green = all met; amber = only preferred missed (never blocks); red = must-have missed (blocks).
function FitCheck({ c, ev, sent }: { c: Clinician; ev: Evaluation; sent: boolean }) {
  const { log } = useStore()
  const blockedRef = useRef<HTMLButtonElement>(null)
  const s = STATUS[ev.status]
  const Icon = s.icon
  const title = { green: "Fit Check passed", amber: "Fit Check: OK to send", red: "Send blocked" }[ev.status]
  const body = {
    green: `All must-haves met. ${c.first} can take this job.`,
    amber: `All must-haves met. Missing preferred: ${ev.preferredMissed.map((k) => k.label).join(", ")}. You can still send.`,
    red: ev.requiredMissed[0]?.key === "licence"
      ? `${c.first} is not licensed to practise in Germany, so this proposal can't lead to a hire.`
      : `${c.first} is missing a must-have: ${ev.requiredMissed.map((k) => k.label).join(", ")}.`,
  }[ev.status]

  const onBlocked = () => {
    log("proposal_blocked", { clinician: c.id, reason: ev.requiredMissed[0].key })
    const b = blockedRef.current
    if (b) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake") }
    document.getElementById("alts")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <Card className={cn("gap-0 overflow-hidden pt-0", ev.status === "red" && "ring-bad/30")} aria-labelledby="fit-title">
      <Alert className={cn("rounded-none border-0 border-b px-6 py-5", s.cls)}>
        <span className={cn("grid size-9 place-items-center rounded-full text-white", s.iconCls)}><Icon className="size-5" strokeWidth={2.5} /></span>
        <AlertTitle id="fit-title" className="text-lg font-extrabold">{title}</AlertTitle>
        <AlertDescription className="text-foreground/80">{body}</AlertDescription>
      </Alert>
      <CardContent className="pt-4">
        <h3 className="text-xs font-bold tracking-[.06em] text-muted-foreground uppercase">Must-haves</h3>
        <ul>{ev.crit.filter((k) => k.mode === "required").map((k) => <CheckRow key={k.key} k={k} />)}</ul>
        <h3 className="mt-4 text-xs font-bold tracking-[.06em] text-muted-foreground uppercase">Preferences and score signals</h3>
        <ul>{ev.crit.filter((k) => k.mode !== "required").map((k) => <CheckRow key={k.key} k={k} />)}</ul>
        <div className="mt-4 flex flex-col gap-2.5">
          {ev.status === "red" ? (
            <>
              <Button ref={blockedRef} size="lg" variant="secondary" aria-disabled="true" aria-describedby="block-reason" onClick={onBlocked}
                className="h-12 w-full cursor-not-allowed bg-muted text-base text-muted-foreground hover:bg-muted">
                <Lock /> Send proposal
              </Button>
              <p id="block-reason" className="text-[13.5px] font-semibold text-bad">{ev.requiredMissed[0].detail}</p>
            </>
          ) : sent ? (
            <Button size="lg" disabled className="h-12 w-full bg-ok-soft text-base text-ok opacity-100"><Check /> Proposal sent</Button>
          ) : (
            <Button asChild size="lg" className="h-12 w-full text-base font-bold">
              <a href={`#/send/${c.id}`}><Send /> Send proposal</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileView({ id }: { id: string }) {
  const { filters, sent, log } = useStore()
  const c = BY_ID[id]
  const ev = c ? evaluate(c, filters) : null

  useEffect(() => {
    if (c && ev) log("fit_check_shown", { clinician: c.id, result: ev.status })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!c || !ev) return <NotFound />
  const alts = ev.status === "red" ? alternatives(c, filters, sent) : []

  return (
    <section>
      <a href="#/results" className="mb-4 inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to results</a>
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_420px] lg:gap-x-6">
        <div className="order-1 flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 sm:flex-nowrap sm:gap-5">
              <ClinicianAvatar c={c} className="order-1 size-14 text-xl sm:size-18 sm:text-2xl" />
              <div className="order-3 min-w-0 basis-full sm:order-2 sm:flex-1 sm:basis-auto">
                <h1 className="text-[26px] font-extrabold tracking-tight">{fullName(c)} <span className="text-base font-medium text-muted-foreground">{c.creds}</span></h1>
                <p className="mt-0.5 mb-2 text-sm text-muted-foreground">
                  {SPECIALTY[c.specialty]} nurse · <MapPin className="inline size-3.5 align-[-2px]" /> {c.city} · {c.distance} km from {FACILITY.name}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <ActiveBadge c={c} />
                  <Badge variant="secondary" className="gap-1 bg-muted"><Clock className="size-3" /> Active {ago(c.lastActive)}</Badge>
                  <Badge variant="secondary" className="bg-muted">Replies to {c.replyRate}% of proposals</Badge>
                </div>
              </div>
              <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0 sm:flex-col sm:gap-1">
                <ScoreRing score={ev.score} status={ev.status} size={76} />
                <small className="font-semibold text-muted-foreground">Fit score</small>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="order-3 flex flex-col gap-4 lg:col-start-1 lg:row-start-2">
          <Card>
            <CardHeader><CardTitle className="text-lg font-bold">About</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <p>{c.about}</p>
              <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                {[
                  ["Licence", c.licences.map((l) => `${COUNTRY[l.country].adj} nursing qualification${l.kind === "de" ? " · licensed in Germany" : l.kind === "eu" ? " · EU automatic recognition" : " · recognition pending"}`).join(", ")],
                  ["Certifications", c.icuCert ? "ICU specialist training, BLS, ALS" : "BLS, ALS"],
                  ["Shifts", c.shifts.map((s) => SHIFT[s]).join(", ")],
                  ["Available from", `${dateIn(c.startDays)} (in ${c.startDays} days)`],
                ].map(([k, v]) => (
                  <div key={k}><dt className="text-xs font-bold tracking-[.06em] text-muted-foreground uppercase">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>
                ))}
              </dl>
              <div>
                <h2 className="mb-3 text-lg font-bold">Experience</h2>
                <ul className="flex flex-col gap-3">
                  {c.history.map(([r, p, y]) => (
                    <li key={r + p} className="flex items-center justify-between gap-3 border-l-3 border-peach pl-3.5">
                      <span><strong className="block">{r}</strong><span className="text-muted-foreground">{p}</span></span>
                      <small className="whitespace-nowrap text-muted-foreground">{y}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="order-2 flex flex-col gap-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <FitCheck c={c} ev={ev} sent={sent.has(c.id)} />
          {ev.status === "red" && (
            <Card id="alts">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{alts.length} similar clinicians who can practise in Germany</CardTitle>
                <CardDescription>Same specialty and shift, all must-haves met.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {alts.map(({ c: a, ev: aev }) => (
                  <a key={a.id} href={`#/profile/${a.id}`} className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5 hover:border-primary">
                    <ClinicianAvatar c={a} className="size-9 text-sm" />
                    <span className="min-w-0 flex-1"><strong className="block">{fullName(a)}</strong>
                      <small className="text-muted-foreground">{licenceCheck(a, filters).short} · {a.distance} km · starts in {a.startDays}d</small></span>
                    <ScoreRing score={aev.score} size={40} />
                  </a>
                ))}
                <Button asChild variant="link" className="self-start px-0 font-semibold text-foreground underline"><a href="#/search">Edit search instead</a></Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}

export function NotFound() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-4">
        <h1 className="text-2xl font-extrabold">Page not found</h1>
        <Button asChild><a href="#/search">New search</a></Button>
      </CardContent>
    </Card>
  )
}
