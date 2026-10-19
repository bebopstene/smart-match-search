import { useEffect, useState } from "react"
import { AlertTriangle, ArrowLeft, Check, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eyebrow } from "@/components/bits"
import { cn } from "@/lib/utils"
import { BY_ID, FACILITY, RECRUITER, SHIFT, SPECIALTY } from "@/data"
import { ago, dateIn, evaluate, fullName, replyEstimate, search } from "@/match"
import { go, useStore } from "@/store"
import { NotFound } from "./ProfileView"

export function SendView({ id }: { id: string }) {
  const { filters: f, sent, markSent, log } = useStore()
  const c = BY_ID[id]
  const ev = c ? evaluate(c, f) : null
  const [msg, setMsg] = useState(() => c ? `Hi ${c.first},

I'm ${RECRUITER.first}, a recruiter at ${FACILITY.name} in Houston. We're hiring ${/^[AEIOU]/.test(SPECIALTY[f.specialty]) ? "an" : "a"} ${SPECIALTY[f.specialty]} Registered Nurse for ${SHIFT[f.shift].toLowerCase()} (3×12h), starting by ${dateIn(f.startWithin)}. Your ${SPECIALTY[c.specialty]} experience${c.ccrn ? " and CCRN look" : " looks"} like a strong fit.

Would you be open to a 15-minute call this week?

${RECRUITER.name}
${RECRUITER.title}, ${FACILITY.name}` : "")

  // Guard is decided on arrival only, so marking this proposal as sent doesn't bounce us back to the profile.
  const [blocked] = useState(() => !c || !ev || ev.status === "red" || sent.has(id))
  useEffect(() => { if (c && blocked) go(`#/profile/${id}`) }, [c, blocked, id])
  if (!c || !ev) return <NotFound />
  if (blocked) return null

  const onSend = () => {
    // R3: re-check must-haves at the moment of sending.
    const recheck = evaluate(c, f)
    if (recheck.status === "red") { go(`#/profile/${id}`); return }
    markSent(id)
    log("proposal_sent", { clinician: id, fit: recheck.score, fit_check: recheck.status })
    go(`#/sent/${id}`)
  }

  return (
    <section>
      <a href={`#/profile/${id}`} className="mb-4 inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to {c.first}'s profile</a>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent>
            <Eyebrow>Send proposal</Eyebrow>
            <h1 className="mb-4 text-2xl font-extrabold tracking-tight">To {fullName(c)}, {c.creds}</h1>
            <Label htmlFor="msg" className="mb-2 font-bold">Message</Label>
            <Textarea id="msg" rows={11} value={msg} onChange={(e) => setMsg(e.target.value)} className="bg-card leading-relaxed" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">{msg.length} characters</span>
              <div className="flex w-full gap-2.5 sm:w-auto">
                <Button asChild variant="outline" size="lg" className="h-11 flex-1 sm:flex-none"><a href={`#/profile/${id}`}>Cancel</a></Button>
                <Button size="lg" className="h-11 flex-1 px-5 text-base font-bold sm:flex-none" onClick={onSend} disabled={!msg.trim()}><Send /> Send proposal</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className={cn("flex-row items-center gap-3 px-4 py-4", ev.status === "green" ? "bg-ok-soft" : "bg-warn-soft")}>
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-white", ev.status === "green" ? "bg-ok" : "bg-warn")}>
              {ev.status === "green" ? <Check className="size-4" strokeWidth={3} /> : <AlertTriangle className="size-4" />}
            </span>
            <div>
              <strong>{ev.status === "green" ? "Fit Check passed" : "OK to send"}</strong>
              <small className="block text-foreground/70">
                {ev.status === "green" ? "All must-haves met" : `Missing preferred: ${ev.preferredMissed.map((k) => k.label).join(", ")}`} · fit {ev.score}
              </small>
            </div>
          </Card>
          <Card>
            <CardHeader><CardTitle className="font-bold">Role details shared</CardTitle></CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-2.5">
                {[
                  ["Role", `${SPECIALTY[f.specialty]} Registered Nurse`],
                  ["Hospital", `${FACILITY.name}, ${FACILITY.area}`],
                  ["Shift", `${SHIFT[f.shift]}, 3×12h`],
                  ["Start", `By ${dateIn(f.startWithin)}`],
                ].map(([k, v]) => (
                  <div key={k}><dt className="text-xs font-bold tracking-[.06em] text-muted-foreground uppercase">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
                <div><dt className="text-xs font-bold tracking-[.06em] text-muted-foreground uppercase">Pay range</dt><dd className="text-muted-foreground">Coming next: structured proposals</dd></div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function SentView({ id }: { id: string }) {
  const { filters, sent } = useStore()
  const c = BY_ID[id]
  if (!c) return <NotFound />
  const ev = evaluate(c, filters)
  const est = replyEstimate(c, ev)
  const next = search(filters).find((r) => !sent.has(r.c.id))
  return (
    <section className="mx-auto max-w-2xl">
      <Card className="text-center">
        <CardContent className="px-6 py-6 sm:px-10">
          <div className="mx-auto mb-4 grid size-18 animate-in place-items-center rounded-full bg-primary zoom-in-50 duration-500"><Check className="size-10" strokeWidth={3} /></div>
          <Eyebrow>Proposal sent</Eyebrow>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">{c.first} has your proposal</h1>
          <div className="mt-6 mb-2 flex gap-4 rounded-2xl border border-peach bg-background p-5 text-left">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-peach"><Clock className="size-6" /></span>
            <div>
              <p className="text-sm text-muted-foreground">Expected reply</p>
              <p className="text-[28px] leading-tight font-extrabold tracking-tight">{est.label}</p>
              <p className="text-sm text-muted-foreground">Most likely by {est.by}. Based on a fit score of {ev.score} and {c.first}'s activity ({ago(c.lastActive)}).</p>
            </div>
          </div>
          <ol className="my-5 flex flex-col text-left">
            {[
              ["Sent", "Just now", true],
              [`${c.first} notified`, "Email and app notification", true],
              ["Reply expected", `${est.by}. We'll notify you.`, false],
            ].map(([t, s, done], i, arr) => (
              <li key={String(t)} className="relative flex flex-col pb-3.5 pl-7">
                <span className={cn("absolute top-1 left-1 size-3 rounded-full border-2 border-yellow", done ? "bg-yellow" : "bg-card")} />
                {i < arr.length - 1 && <span className="absolute top-5 bottom-0.5 left-[9.5px] w-0.5 bg-peach" />}
                <strong>{t}</strong><span className="text-sm text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap justify-center gap-2.5">
            {next && <Button asChild size="lg" className="h-11 font-bold"><a href={`#/profile/${next.c.id}`}>Next best match: {fullName(next.c)} ({next.ev.score})</a></Button>}
            <Button asChild size="lg" variant="outline" className="h-11"><a href="#/results">Back to results</a></Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
