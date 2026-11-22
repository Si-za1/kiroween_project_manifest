# Project structure

```
.kiro/
  steering/    Project guidance for Kiro (this folder)
  specs/       One folder per feature: requirements.md, design.md, tasks.md
  hooks/       Agent hooks (JSON)
  agents/      Custom agents
api/           Vercel Functions: claim, council, github. Shared code in api/_lib
src/
  components/  React UI components (one file per view)
  lib/         Pure logic (no React, no browser APIs): claims, score, conflicts, cards,
               voice, council, ics, dates, api client
  data/        Storage, state actions, selectors, demo persona, useApp hook
  App.tsx
  main.tsx
scripts/       Repo checks and helper scripts
docs/          Notes for judges, including how Kiro was used
```

Create new folders under `src` only when a feature needs them. Keep files small and focused.
