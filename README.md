# Manifest.git

> Manifestation with receipts. Your future selves write back, and your data decides who's lying.

Manifest.git is a journaling and goal-reflection web app. You write your goals in plain English,
the app turns them into checkable claims, compares them with real evidence, and lets future
versions of you write back. It is a submission for the Kiro hackathon, **Frankenstein** category.

**Status:** first working version. Every feature below is in place and is being refined.

## Try it

1. Open the app and choose **Explore the demo**. It loads a sample person, Maya, with a week of
   history, so every screen has something to show. No account and no API key needed.
2. Or choose **Begin your Charter** and write your own goals.

## Where things are

| Screen      | What it does                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Today**   | A card is drawn from your own results. Write an entry, pick a mood, do a quick check-in.                                     |
| **Charter** | Write goals in plain English. Each becomes an editable claim you confirm.                                                    |
| **Report**  | Each claim is checked against evidence. Conflicts show where words and actions differ. Add GitHub or calendar evidence here. |
| **Council** | Letters from you at 1, 5, and 20 years out. Write back to them.                                                              |
| **Log**     | Every entry as a commit, newest first.                                                                                       |

AI is optional. With no API key set, claims are drafted and letters are written by local logic, so
the whole app still works.

## How it works

1. **Charter.** Write goals. Each becomes an editable claim, such as "3 workouts a week".
2. **Daily card and entry.** A personalized prompt, then a short journal entry.
3. **Check-in and evidence.** Quick check-in, plus optional public GitHub activity and a calendar
   `.ics` upload.
4. **Report card.** See which claims are on track, and where your words and actions disagree.
5. **Council letters.** Letters from you at 1, 5, and 20 years out, grounded in your real results.

Journals stay in your browser. There are no accounts.

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
