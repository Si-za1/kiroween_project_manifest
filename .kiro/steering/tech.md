# Tech stack and conventions

## Stack

- Front end: Vite, React 19, TypeScript (strict).
- Storage: `localStorage` in the browser, behind `src/data/store.ts` so it can be swapped for
  IndexedDB later. State is one JSON document. Demo mode uses a separate key.
- Back end: Vercel Functions in `/api`, using the Web Standard handler style
  (`export function GET(request: Request): Response`). No Express.
- LLM: called only from `/api`, through any OpenAI-compatible `/chat/completions` endpoint
  (`LLM_API_KEY`, optional `LLM_BASE_URL` and `LLM_MODEL`). The key is read from `process.env` and
  never reaches the browser bundle. When no key is set, the API returns 503 and the browser falls
  back to local logic, so the app always works.
- Imports: files in `src` use `.ts` extensions. Files in `api` use `.js` extensions for local
  imports (they resolve to the `.ts` sources).
- Tests: Vitest and fast-check.
- Hosting: Vercel, deployed from the public GitHub repo.

## Conventions

- Pure logic (claim parsing, scoring, conflict detection, streaks, dates) lives in `src/lib` as
  plain functions with no React or browser imports, so it is easy to unit and property test.
- Use the `@/` alias for imports from `src`.
- Validate all input at the `/api` boundary. Return JSON with a clear error shape
  (`{ "error": "message" }`) and an appropriate status code.
- Prompts sent to the LLM live in `api/_lib/prompts.ts` so they can be reviewed.
- Every AI feature has a deterministic local fallback in `src/lib` (claim drafting, Council letters).
- Styling: one stylesheet, `src/index.css`, with CSS variables. Brand palette: greige `#ece1db`
  (ground), navy `#214669` (ink and primary), pink `#f275a6` (accent and stitches). Fonts: Cormorant
  Garamond (display, letters, italics) and Manrope (body and UI). Card colors come from `.tint-*`
  classes (blush, navy, sand, mauve, powder, rose), all derived from the brand colors.
- Free browser APIs with no key (Open-Meteo, Web Speech) are called from `src/lib`. Anything that
  needs a secret goes through `/api`. Every integration must work offline or fail gracefully.
- Patterns (`src/lib/patterns.ts`) need at least 2 days per group and a 0.5 mood-point gap before
  they say anything, so small samples never produce confident claims. Illustrations and icons are inline SVG, no image files.
- Evidence windows are rolling: day = today, week = last 7 days, month = last 30 days.
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
