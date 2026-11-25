# Manifest

> Write it down. Watch it grow.

Manifest is a cozy journal that turns your dreams into little daily steps, shows how far you've
come, and lets future versions of you write back. It is stitched together from seven pieces:

| Piece    | Powered by                                          | What the stitch makes                                  |
| -------- | --------------------------------------------------- | ------------------------------------------------------ |
| Journal  | Your device                                         | Pages, moods, dreams, and little steps                 |
| Weather  | [Open-Meteo](https://open-meteo.com) (free, no key) | "You glow on sunny days" style mood patterns           |
| Moon     | Astronomy maths on your device                      | New and full moon ritual cards, moon and mood patterns |
| Calendar | `.ics` import and export                            | Steps that count themselves, dream dates as reminders  |
| GitHub   | GitHub REST API                                     | Coding steps that count themselves                     |
| AI       | Any OpenAI-compatible model                         | Steps from plain goals, letters from Future Me         |
| Voice    | Web Speech API in the browser                       | Speak your pages, hear your letters                    | It is a submission for the Kiro hackathon, **Frankenstein** category. |

**Status:** first working version. Every feature below is in place and is being refined.

## Try it

1. Open the app and choose **Peek at a demo**. It loads Maya's journal with two weeks of history,
   so every screen has something to show. No account and no API key needed.
2. Or choose **Write my first dream** and start your own.

## Screens

| Tab             | What it does                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **Home**        | Greeting, illustration, quick stats, and a tile for each feature.                                  |
| **My Dreams**   | Write a dream like a diary entry: what, by when, where, why, and a little step. Board or calendar. |
| **Journal**     | Today's card gives you a prompt. Write a page, pick a mood, tick off today's steps.                |
| **Progress**    | Dream timeline, mood line, gentle nudges, a habit dot grid, and optional calendar or GitHub.       |
| **Connections** | Every stitched piece, its live status, and what it adds.                                           |
| **Future Me**   | Letters from you in 1, 5, and 20 years, written from your real progress. Write back.               |

AI is optional. With no API key set, steps are drafted and letters are written by local logic, so
the whole app still works.

## Tech stack

Vite, React 19, TypeScript, Vitest, fast-check, and Vercel Functions for server-side LLM calls.

## Getting started

Requirements: Node.js 20 or newer (`.nvmrc` pins 22).

```bash
git clone https://github.com/Si-za1/kiroween_project_manifest.git
cd kiroween_project_manifest
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start the dev server                         |
| `npm run typecheck`  | TypeScript check                             |
| `npm test`           | Run tests once                               |
| `npm run build`      | Typecheck and production build               |
| `npm run check:kiro` | Verify `.kiro` is present and not gitignored |

To run the serverless functions in `/api` locally, use `npx vercel dev` (requires a free Vercel
account). Environment variables are listed in `.env.example`.

## Deploying

Import the repository into Vercel. It detects Vite automatically. Add the variables from
`.env.example` in the project settings.

## Built with Kiro

The `.kiro` directory holds the specs, steering files, hooks, and custom agent used to build this
project. See [docs/KIRO_JOURNAL.md](docs/KIRO_JOURNAL.md) for how each Kiro feature was used.

## License

[MIT](LICENSE)
