# Dearly

> Dear me, write it down, watch it bloom.

**Live app:** https://www.sizaadhikari.com.np/kiroween_project_manifest/
**Demo video:** [public/media/manifest-demo.mp4](public/media/manifest-demo.mp4) (86 seconds), also
behind **Watch the demo** on the app's Home page
**Category:** Kiro hackathon, Frankenstein
**License:** [MIT](LICENSE)

Dearly is a sweet, scrapbook-style dream journal. You write what you want to manifest, break it into little daily
steps, and journal each day from a prompt card. Future versions of you then write back, using your
real progress. It's a Frankenstein app: seven unrelated pieces stitched into one, and each stitch
produces something none of the pieces could on their own.

| Piece    | Powered by                                          | What the stitch makes                                       |
| -------- | --------------------------------------------------- | ----------------------------------------------------------- |
| Journal  | Your browser (local storage)                        | Pages, moods, dreams, and little steps                      |
| Weather  | [Open-Meteo](https://open-meteo.com) (free, no key) | Mood and weather patterns, such as "You glow on sunny days" |
| Moon     | Astronomy maths on your device                      | New and full moon ritual cards, moon and mood patterns      |
| Calendar | `.ics` import and export                            | Steps that count themselves; dream dates as reminders       |
| GitHub   | GitHub REST API (server)                            | Coding steps that count themselves                          |
| AI       | Any OpenAI-compatible model (server)                | Little steps from plain goals; letters from Future Me       |
| Voice    | Web Speech API in the browser                       | Speak your journal page; hear your letters read aloud       |

## For judges: try it in two minutes

No account, login, or API key is needed.

1. Open the [live app](https://www.sizaadhikari.com.np/kiroween_project_manifest/) and click
   **Peek at a demo**. It loads Maya's journal with two weeks of history.
2. **Journal:** today's card (moon phases trigger ritual cards), the weather line, a lined page,
   and the microphone button for voice typing (Chrome, Edge, or Safari).
3. **Progress:** scroll to **Stitched insights**. Each finding names the sources it joins, for
   example "Journal × Weather".
4. **Future Me:** hover an envelope, then click it to open the letter.
5. **Connections:** every stitched piece with its live status. Search your own city under Weather to
   pull real data from Open-Meteo.

Everything is stored in your browser. **Erase my data** in the footer removes it.

### Which features need the server

The live app above is a static site on GitHub Pages. Two features need the small server in `/api`,
and each falls back gracefully without it:

| Feature                    | Without the server                         | With the server (Vercel)   |
| -------------------------- | ------------------------------------------ | -------------------------- |
| Future Me letters          | Written on your device from your real data | Written by an AI model     |
| Turning a goal into a step | Drafted by a local parser                  | Drafted by an AI model     |
| GitHub activity            | Shows a message that it needs the server   | Counts your public commits |

Weather, moon, calendar, voice, and everything else work on the live app.

## Screens

| Tab             | What it does                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **Home**        | Greeting, today's moon and weather, quick stats, feature tiles, and the stitch chain.              |
| **My Dreams**   | Write a dream like a diary entry: what, by when, where, why, and a little step. Board or calendar. |
| **Journal**     | A daily card, today's sky, a page you can type or speak, mood, and today's steps.                  |
| **Progress**    | Stats, dream timeline, mood line, nudges, stitched insights, and a habit dot grid.                 |
| **Future Me**   | Three envelopes from you in 1, 5, and 20 years. Open them, listen, and write back.                 |
| **Connections** | Every stitched piece, what it adds, and controls to connect or disconnect.                         |

## Run it locally

Requirements: Node.js 20 or newer (`.nvmrc` pins 22).

```bash
git clone https://github.com/Si-za1/kiroween_project_manifest.git
cd kiroween_project_manifest
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173). This runs the app without the server,
the same way the live site works.

To run the `/api` server functions as well, use the Vercel CLI (needs a free Vercel account):

```bash
cp .env.example .env.local   # add LLM_API_KEY, and optionally LLM_BASE_URL and LLM_MODEL
npx vercel dev
```

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Start the dev server                         |
| `npm run typecheck`  | TypeScript check                             |
| `npm test`           | Run tests once                               |
| `npm run build`      | Typecheck and production build               |
| `npm run check:kiro` | Verify `.kiro` is present and not gitignored |

## Changing the demo video

**Watch the demo** on the Home page plays `public/media/manifest-demo.mp4` by default. To use a
YouTube or Vimeo link instead, set `VITE_DEMO_VIDEO_URL` at build time (for example in Vercel's
environment variables), or edit the fallback in [`src/config.ts`](src/config.ts).

## Deploying

- **GitHub Pages (static, no AI):** `.github/workflows/deploy-pages.yml` builds and publishes on
  every push to `main`. In the repo settings, set Pages to use **GitHub Actions** once.
- **Vercel (full, with AI):** import the repository in Vercel. It detects Vite. Add `LLM_API_KEY`
  (plus `LLM_BASE_URL` and `LLM_MODEL` if you don't use OpenAI) in the project's environment
  variables. Keys are only read on the server and never reach the browser.

## Tech stack

Vite, React 19, and TypeScript (strict). Vercel Functions for the server. Open-Meteo for weather,
the Web Speech API for voice, and inline SVG for every illustration and icon (no image files).
Fonts are Cormorant Garamond, Manrope, and Caveat (handwriting) from Google Fonts. The look is a
Pinterest-style scrapbook: washi tape, stickers, a polaroid, sticky notes, and a notebook margin.

## Built with Kiro

The [`.kiro`](.kiro) directory at the root holds what was used to build this project:

- **Specs:** [`.kiro/specs/charter-and-claims`](.kiro/specs/charter-and-claims) (requirements in
  EARS format).
- **Steering:** product, tech, structure, testing, and voice-and-tone rules in
  [`.kiro/steering`](.kiro/steering). `voice-and-tone.md` maps code terms to the plain words the UI
  uses; `product.md` lists every stitch.
- **Hooks:** typecheck on save, a guard that keeps `.kiro` out of `.gitignore`, and a block on file
  writes that contain API keys, in [`.kiro/hooks`](.kiro/hooks).
- **Custom agent:** `council-writer` reviews the prompts behind the Future Me letters.

See [docs/KIRO_JOURNAL.md](docs/KIRO_JOURNAL.md) for how each Kiro feature was used along the way.

## Privacy

Journal pages, dreams, and moods stay in your browser. The weather service only receives your
city's coordinates. When an AI service is set up, writing letters sends a short summary of your
progress and your five most recent pages. Nothing is logged on the server.

## License

[MIT](LICENSE)
