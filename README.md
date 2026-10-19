# Smart Match Search · clickable prototype

Prototype for the Dream Healthcare Job pitch (PRD §8). A hospital recruiter in Houston searches for an ICU nurse (Texas license, nights), sees results ranked by fit, runs a Fit Check and sends a proposal.

- Happy path: Search → Results (fit score, "Active recently") → Profile (Fit Check green) → Send → Confirmation with expected reply time
- Edge A: clinician without a Texas or NLC multistate license → send blocked, reason, 3 alternatives
- Edge B: narrow filters → zero results, one-click suggestions with counts
- "Demo paths" panel (bottom right) jumps to each state and shows the R6 event log

Mock data only, no backend, no login. Vite + React + Tailwind + shadcn/ui.

```bash
npm install
npm run dev
```
