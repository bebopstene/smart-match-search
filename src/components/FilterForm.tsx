import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { RADIUS_STEPS, SHIFT, SPECIALTY, START_STEPS, type Filters, type Mode } from "@/data"
import { dateIn } from "@/match"
import { useStore } from "@/store"

function RequiredTag() {
  return <Badge className="gap-1 bg-peach font-bold text-ink"><Lock className="size-3" /> Required</Badge>
}

function ModeToggle({ value, onChange, label }: { value: Mode; onChange: (m: Mode) => void; label: string }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as Mode)} aria-label={`${label}: required or preferred`}
      className="rounded-full border bg-muted p-0.5" spacing={0}>
      {(["required", "preferred"] as Mode[]).map((m) => (
        <ToggleGroupItem key={m} value={m} size="sm"
          className="h-6 rounded-full! px-2.5 text-xs font-bold text-muted-foreground data-[state=on]:bg-ink data-[state=on]:text-cream">
          {m === "required" ? "Required" : "Preferred"}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function Field({ label, id, right, children, className }: { label: string; id: string; right?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex min-h-7 items-center justify-between gap-2">
        <Label htmlFor={id} className="font-bold">{label}</Label>
        {right}
      </div>
      {children}
    </div>
  )
}

function Pick<T extends string | number>({ id, value, options, onChange }: { id: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange((typeof value === "number" ? Number(v) : v) as T)}>
      <SelectTrigger id={id} className="h-10 w-full bg-card font-semibold"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map(([v, l]) => <SelectItem key={String(v)} value={String(v)}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

// R1: required-constraint filters. License and specialty are always required; the rest can be required or preferred.
export function FilterForm({ compact = false }: { compact?: boolean }) {
  const { filters: f, patchFilters, log } = useStore()
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    patchFilters({ [k]: v } as Partial<Filters>)
    log("filter_applied", { [k]: v as string | number | boolean })
  }

  return (
    <div className={cn("grid gap-x-6 gap-y-5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
      <Field label="Role" id="f-role" right={<RequiredTag />}>
        <Pick id="f-role" value={f.specialty} onChange={(v) => set("specialty", v)}
          options={Object.entries(SPECIALTY).map(([k, v]) => [k as Filters["specialty"], `${v} Registered Nurse`])} />
      </Field>
      <Field label="State license" id="f-license" right={<RequiredTag />}>
        <div id="f-license" className="flex h-10 items-center rounded-lg border bg-muted px-3 text-sm font-semibold">Texas</div>
        <div className="flex items-center gap-2">
          <Checkbox id="f-nlc" checked={f.acceptNLC} onCheckedChange={(v) => set("acceptNLC", v === true)} />
          <Label htmlFor="f-nlc" className="font-medium">Accept NLC multistate licenses</Label>
        </div>
      </Field>
      <Field label="Shift pattern" id="f-shift" right={<ModeToggle label="Shift" value={f.shiftMode} onChange={(m) => set("shiftMode", m)} />}>
        <Pick id="f-shift" value={f.shift} onChange={(v) => set("shift", v)} options={Object.entries(SHIFT) as [Filters["shift"], string][]} />
      </Field>
      <Field label="Start date" id="f-start" right={<ModeToggle label="Start date" value={f.startMode} onChange={(m) => set("startMode", m)} />}>
        <Pick id="f-start" value={f.startWithin} onChange={(v) => set("startWithin", v)}
          options={START_STEPS.map((d) => [d, `Within ${d} days (by ${dateIn(d)})`])} />
      </Field>
      <Field label="Distance from facility" id="f-radius" right={<ModeToggle label="Distance" value={f.radiusMode} onChange={(m) => set("radiusMode", m)} />}>
        <Pick id="f-radius" value={f.radius} onChange={(v) => set("radius", v)} options={RADIUS_STEPS.map((d) => [d, `Within ${d} miles`])} />
      </Field>
      <Field label="CCRN certification" id="f-cert" right={<ModeToggle label="CCRN certification" value={f.certMode} onChange={(m) => set("certMode", m)} />}>
        <p className="text-xs text-muted-foreground">Critical care RN certification (AACN)</p>
      </Field>
      <div className={cn("flex items-center gap-3", !compact && "sm:col-span-2")}>
        <Switch id="f-active" checked={f.activeOnly} onCheckedChange={(v) => set("activeOnly", v)} className="data-[state=checked]:bg-ok" />
        <Label htmlFor="f-active" className="font-semibold">Only clinicians active in the last 30 days</Label>
      </div>
    </div>
  )
}
