import { AlertTriangle, Check, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Clinician, Filters } from "@/data"
import { MODE_LABEL, shortCrit, type Criterion, type Evaluation, type FitStatus } from "@/match"

export function ClinicianAvatar({ c, className }: { c: Clinician; className?: string }) {
  return (
    <Avatar className={cn("size-12", className)}>
      <AvatarFallback className="bg-peach font-bold text-ink">{c.first[0] + c.last[0]}</AvatarFallback>
    </Avatar>
  )
}

export function ScoreRing({ score, status = "green", size = 54, className }: { score: number; status?: FitStatus; size?: number; className?: string }) {
  const tone = status === "red" ? "var(--bad)" : "var(--primary)"
  return (
    <span
      role="img"
      aria-label={`Fit score ${score} out of 100`}
      className={cn("grid shrink-0 place-items-center rounded-full", className)}
      style={{ width: size, height: size, background: `conic-gradient(${tone} ${score}%, #F2E6D4 0)` }}
    >
      <span className="grid place-items-center rounded-full bg-card font-extrabold" style={{ width: size - 10, height: size - 10, fontSize: size * 0.32 }}>
        {score}
      </span>
    </span>
  )
}

export function ActiveBadge({ c }: { c: Clinician }) {
  if (c.lastActive <= 30)
    return (
      <Badge className="gap-1.5 bg-ok-soft font-semibold text-ok">
        <span className="size-1.5 rounded-full bg-ok ring-3 ring-ok/20" /> Active recently
      </Badge>
    )
  return <Badge variant="secondary" className="bg-muted font-semibold text-muted-foreground">Not active in 30+ days</Badge>
}

const toneFor = (k: Criterion) => (k.met ? "ok" : k.mode === "required" ? "bad" : k.mode === "preferred" ? "warn" : "neutral")

export function CritIcon({ k, className }: { k: Criterion; className?: string }) {
  const t = toneFor(k)
  const Icon = t === "ok" ? Check : t === "bad" ? X : AlertTriangle
  return <Icon className={cn("size-4 shrink-0", t === "ok" && "text-ok", t === "bad" && "text-bad", t === "warn" && "text-warn", t === "neutral" && "text-muted-foreground", className)} strokeWidth={2.5} />
}

export function CriteriaChips({ c, ev, f }: { c: Clinician; ev: Evaluation; f: Filters }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ev.crit.filter((k) => k.key !== "experience" && k.key !== "active").map((k) => {
        const t = toneFor(k)
        return (
          <span key={k.key} className={cn("inline-flex items-center gap-1 rounded-md py-0.5 pr-2 pl-1 text-xs font-semibold",
            t === "ok" && "bg-ok-soft text-ok", t === "bad" && "bg-bad-soft text-bad", (t === "warn" || t === "neutral") && "bg-warn-soft text-warn")}>
            <CritIcon k={k} className="size-3.5 text-current" />
            {shortCrit(k, c, f)}
          </span>
        )
      })}
    </div>
  )
}

export function Breakdown({ ev }: { ev: Evaluation }) {
  return (
    <table className="mt-2 w-full border-collapse text-[13.5px]">
      <tbody>
        {ev.crit.map((k) => (
          <tr key={k.key} className="border-t border-border/60">
            <td className="w-6 py-1.5 pt-2 align-top"><CritIcon k={k} /></td>
            <td className="py-1.5">{k.label}<small className="block text-muted-foreground">{k.detail}</small></td>
            <td className="hidden py-1.5 text-xs whitespace-nowrap text-muted-foreground sm:table-cell">{MODE_LABEL[k.mode]}</td>
            <td className="py-1.5 text-right font-bold whitespace-nowrap">{k.points}/{k.max}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-bold tracking-[.08em] text-muted-foreground uppercase">{children}</p>
}
