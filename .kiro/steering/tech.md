# Tech stack and conventions

## Stack

- Front end: Vite, React 19, TypeScript (strict).
- Storage: IndexedDB in the browser. Keep storage behind a small interface so it can be faked in
  tests.
- Back end: Vercel Functions in `/api`, using the Web Standard handler style
  (`export function GET(request: Request): Response`). No Express.
- LLM: called only from `/api`. The API key is read from `process.env` and never reaches the
  browser bundle.
- Tests: Vitest and fast-check.
- Hosting: Vercel, deployed from the public GitHub repo.

## Conventions

- Pure logic (claim parsing, scoring, conflict detection, streaks, dates) lives in `src/lib` as
  plain functions with no React or browser imports, so it is easy to unit and property test.
- Use the `@/` alias for imports from `src`.
- Validate all input at the `/api` boundary. Return JSON with a clear error shape
  (`{ "error": "message" }`) and an appropriate status code.
- Prompts sent to the LLM live in `src/lib/prompts` or `api/_lib`, one file per prompt, so they can
  be reviewed and tested.
- Never log journal text or API keys.

## Commands

- `npm run dev` start the dev server
- `npm run typecheck` TypeScript check
- `npm test` run tests once
- `npm run build` typecheck and production build
- `npm run check:kiro` verify `.kiro` is present and not gitignored

## Hard rules

- Never add `.kiro` or any path under it to `.gitignore`. The submission is disqualified if so.
- Never commit secrets. Use `.env.example` for variable names only.
