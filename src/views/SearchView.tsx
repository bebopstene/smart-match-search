import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eyebrow } from "@/components/bits"
import { FilterForm } from "@/components/FilterForm"
import { DEFAULT_FILTERS, FACILITY } from "@/data"
import { search } from "@/match"
import { go, useStore } from "@/store"

export function SearchView() {
  const { filters, setFilters } = useStore()
  const n = search(filters).length
  return (
    <section className="mx-auto max-w-3xl">
      <Eyebrow>New search · {FACILITY.name}</Eyebrow>
      <h1 className="text-[clamp(30px,4.2vw,44px)] leading-tight font-extrabold tracking-tight">Who do you need to hire?</h1>
      <p className="mt-2 mb-6 max-w-xl text-lg text-muted-foreground">
        Set the must-haves. You only see clinicians who can actually take the job, ranked by how well they fit.
      </p>
      <Card className="shadow-sm">
        <CardContent className="space-y-5 pt-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Saved search</span>
            <Button size="sm" variant="secondary" className="rounded-full font-semibold" onClick={() => setFilters({ ...DEFAULT_FILTERS })}>
              ICU RN · Nights · Texas
            </Button>
          </div>
          <FilterForm />
        </CardContent>
        <Separator />
        <CardFooter className="flex flex-wrap items-center justify-between gap-4 border-0 bg-transparent">
          <p aria-live="polite" className="text-muted-foreground">
            <strong className="text-2xl text-foreground">{n}</strong>{" "}
            {n === 0 ? "clinicians match. You'll get suggestions on the next screen." : `${n === 1 ? "clinician matches" : "clinicians match"} every must-have`}
          </p>
          <Button size="lg" className="h-11 w-full px-5 text-base font-bold sm:w-auto" onClick={() => go("#/results")}>
            Show {n} {n === 1 ? "clinician" : "clinicians"} <ArrowRight />
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
