# Project structure

```
.kiro/
  steering/    Project guidance for Kiro (this folder)
  specs/       One folder per feature: requirements.md, design.md, tasks.md
  hooks/       Agent hooks (JSON)
  agents/      Custom agents
api/           Vercel Functions (server side, holds secrets)
src/
  components/  React UI components
  lib/         Pure logic (no React, no browser APIs)
  data/        IndexedDB storage and demo-mode seed data
  App.tsx
  main.tsx
scripts/       Repo checks and helper scripts
docs/          Notes for judges, including how Kiro was used
```

Create new folders under `src` only when a feature needs them. Keep files small and focused.
