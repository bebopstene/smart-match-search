import { useEffect, useState } from "react"
import { Check, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { DEFAULT_FILTERS, EDGE_B_FILTERS, FACILITY, RECRUITER } from "@/data"
import { go, StoreProvider, useRoute, useStore } from "@/store"
import { SearchView } from "@/views/SearchView"
import { ResultsView } from "@/views/ResultsView"
import { NotFound, ProfileView } from "@/views/ProfileView"
import { SendView, SentView } from "@/views/SendViews"

function Header({ view }: { view: string }) {
  const { sent } = useStore()
  const tab = (name: string, active: boolean) => (
    <a href={`#/${name.toLowerCase()}`} className={cn("rounded-full px-3 py-1.5 font-semibold text-muted-foreground", active && "bg-peach text-foreground")}>{name}</a>
  )
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/90 px-4 py-2.5 backdrop-blur sm:gap-6 sm:px-7">
      <a href="#/search" className="flex items-center gap-2.5 font-extrabold tracking-tight" aria-label="Dream Healthcare Job, new search">
        <span className="grid size-7 place-items-center rounded-lg bg-primary"><Check className="size-4.5" strokeWidth={3.2} /></span>
        <span className="hidden sm:inline">Dream Healthcare Job</span>
      </a>
      <nav className="flex items-center gap-1" aria-label="Main">
        {tab("Search", view === "search")}
        {tab("Results", view !== "search")}
        {sent.size > 0 && <Badge className="bg-ink text-cream">{sent.size} sent</Badge>}
      </nav>
      <div className="ml-auto flex items-center gap-2.5">
        <span className="hidden flex-col text-right leading-tight sm:flex"><strong>{RECRUITER.name}</strong><small className="text-muted-foreground">{FACILITY.name}</small></span>
        <Avatar className="size-9"><AvatarFallback className="bg-peach text-[13px] font-bold text-ink">{RECRUITER.initials}</AvatarFallback></Avatar>
      </div>
    </header>
  )
}

const DEMOS = [
  { key: "happy", tag: "1", tone: "bg-primary text-ink", title: "Happy path", sub: "Search → Results → Profile → Send" },
  { key: "green", tag: "✓", tone: "bg-[#2E9C63] text-white", title: "Fit Check green", sub: "Maria Delgado, all must-haves met" },
  { key: "red", tag: "A", tone: "bg-[#E05A3F] text-white", title: "Edge A · No Texas license", sub: "Send blocked + 3 alternatives" },
  { key: "zero", tag: "B", tone: "bg-primary text-ink", title: "Edge B · Zero results", sub: "10 mi, start in 7 days, TX license only" },
  { key: "amber", tag: "!", tone: "bg-[#E89A1B] text-ink", title: "Bonus · Fit Check amber", sub: "Preferred criterion missed" },
]

function DemoPanel() {
  const { setFilters, events, reset } = useStore()
  const [open, setOpen] = useState(() => window.innerWidth >= 1100)
  const run = (key: string) => {
    if (key === "zero") setFilters({ ...EDGE_B_FILTERS })
    else setFilters({ ...DEFAULT_FILTERS })
    const target = { happy: "#/search", green: "#/profile/maria-delgado", red: "#/profile/jordan-pike", zero: "#/results", amber: "#/profile/sofia-brennan" }[key]!
    go(target)
    if (key === "happy") toast("Happy path: click “Show clinicians”, then Maria Delgado")
    if (window.innerWidth < 1100) setOpen(false)
  }
  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <aside aria-label="Demo paths"
        className={cn("fixed right-3 bottom-3 z-40 flex max-h-[calc(100vh-90px)] flex-col overflow-hidden rounded-2xl bg-ink text-cream shadow-2xl sm:right-5 sm:bottom-5",
          open ? "w-[calc(100vw-24px)] max-w-[310px]" : "w-auto")}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3.5 text-left font-extrabold">
          <span className="size-2.5 rounded-full bg-primary ring-4 ring-primary/25" /> Demo paths
          <ChevronUp className={cn("ml-auto size-4 transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent className="min-h-0 overflow-y-auto px-3 pb-3">
          <p className="mx-1 -mt-1 mb-2.5 text-[12.5px] text-[#BDB3A6]">Prototype · mock data · nothing is sent.</p>
          <ol className="flex flex-col gap-1">
            {DEMOS.map((d) => (
              <li key={d.key}>
                <button type="button" onClick={() => run(d.key)} className="flex w-full items-center gap-2.5 rounded-lg bg-cream/5 px-2.5 py-2 text-left hover:bg-cream/15">
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-md text-xs font-extrabold", d.tone)}>{d.tag}</span>
                  <span><strong className="block text-sm">{d.title}</strong><small className="block text-xs text-[#BDB3A6]">{d.sub}</small></span>
                </button>
              </li>
            ))}
          </ol>
          <Collapsible className="mt-2.5 border-t border-cream/15 pt-2">
            <CollapsibleTrigger className="flex w-full items-center gap-1.5 p-1 text-[13px] font-bold">
              Event log <span className="font-medium text-[#9C9286]">(R6 instrumentation)</span>
              <span className="ml-auto rounded-full bg-cream/15 px-2 text-xs">{events.length}</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="mt-1.5 h-52">
                <ol className="flex flex-col gap-1.5 pr-2 text-xs">
                  {events.length === 0 && <li className="text-[#9C9286]">No events yet</li>}
                  {events.slice(0, 15).map((e, i) => (
                    <li key={i} className="grid grid-cols-[1fr_auto] gap-x-2 rounded-md bg-cream/5 px-1.5 py-1">
                      <code className="font-semibold text-primary">{e.name}</code>
                      <time className="text-[#9C9286]">{e.t}</time>
                      <span className="col-span-2 break-all text-[#BDB3A6]">{Object.entries(e.props).map(([k, v]) => `${k}=${v}`).join(" ")}</span>
                    </li>
                  ))}
                </ol>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
          <Button variant="outline" className="mt-2.5 h-9 w-full border-cream/20 bg-transparent font-bold text-cream hover:bg-cream/10 hover:text-cream"
            onClick={() => { reset(); go("#/search"); toast("Demo reset") }}>
            Reset demo
          </Button>
        </CollapsibleContent>
      </aside>
    </Collapsible>
  )
}

function Routes() {
  const { view, id } = useRoute()
  useEffect(() => { document.getElementById("main")?.focus({ preventScroll: true }) }, [view, id])
  const page =
    view === "search" ? <SearchView /> :
    view === "results" ? <ResultsView /> :
    view === "profile" && id ? <ProfileView key={id} id={id} /> :
    view === "send" && id ? <SendView key={id} id={id} /> :
    view === "sent" && id ? <SentView id={id} /> : <NotFound />
  return (
    <>
      <Header view={view} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-[1180px] px-4 pt-6 pb-36 outline-none sm:px-7 sm:pt-8">{page}</main>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Routes />
      <DemoPanel />
      <Toaster position="bottom-center" />
    </StoreProvider>
  )
}
