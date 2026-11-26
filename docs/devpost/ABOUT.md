## Inspiration

Every year, I write down who I want to become. A few weeks later, the page goes quiet.

I didn't stop caring. The dream just stopped talking back. Nothing noticed the small steps I took, and nothing reminded me why I started. Manifestation apps give you affirmations, habit apps give you checkboxes, and journals give you a blank page. None of them talk to each other.

So I made **Dearly**: one gentle place where a dream becomes little daily steps, every step gets noticed, and future you writes back, using your real progress instead of generic quotes.

## What it does

- **My Dreams.** Write a dream like a diary entry, with a date and a "why". Add a little step in plain words ("run 3 times a week") and Dearly turns it into something it can count. See your dreams as cards or on a calendar.
- **Journal.** A daily prompt card (it becomes a ritual card on new and full moons), today's weather, a mood picker, and a lined page you can type or _speak_.
- **Progress.** A dream timeline, a heart-shaped habit tracker, your mood over two weeks, and **Stitched insights**: patterns found by joining your moods with the weather and the moon, like _"You glow on sunny days"_.
- **Future Me.** Three future versions of you, 1, 5 and 20 years away, read your real progress and write you letters. Each one looks after something different (growth, love, wellbeing), so they don't always agree. Letters open from a 3D envelope and can be read aloud.
- **Connections.** Every stitched piece and what it's doing right now.

### Why it's a Frankenstein

Dearly stitches **seven unrelated pieces** into one app, and each stitch makes something none of them could do alone:

| Piece    | Powered by                     | What the stitch makes                                 |
| -------- | ------------------------------ | ----------------------------------------------------- |
| Journal  | Browser storage                | Pages, moods, dreams, little steps                    |
| Weather  | Open-Meteo API                 | Mood and weather patterns                             |
| Moon     | Astronomy maths on your device | Moon ritual cards, moon and mood patterns             |
| Calendar | `.ics` import and export       | Steps that count themselves, dream dates as reminders |
| GitHub   | GitHub REST API                | Coding steps that count themselves                    |
| AI       | Google Gemini 2.5 Flash        | Little steps from plain goals, letters from Future Me |
| Voice    | Web Speech API                 | Speak your pages, hear your letters                   |

Your journal stays on your device. When you ask for letters, only a short summary and your last 5 pages are sent to the AI. Every AI feature has a local fallback, so Dearly works with no account, login, or API key.

## How I built it

I built Dearly solo with **Kiro**, in Kiro Web.

**Stack:** React 19, strict TypeScript, and Vite, with data in `localStorage`. Vercel Functions in `/api` talk to Gemini (through its OpenAI-compatible endpoint) and GitHub, so no key ever reaches the browser. GitHub Pages hosts the public demo, and GitHub Actions typechecks, tests and builds every pull request.

**Steering** shaped every change:

- `product.md` holds the table of stitches, so every new feature has to say which pieces it joins.
- `tech.md` sets rules such as "every AI feature needs a local fallback".
- `voice-and-tone.md` is a glossary that maps code words to friendly words (goal → _dream_, claim → _little step_, council → _Future Me_). That's why the app never shows technical language.
- `structure.md` and `testing.md` cover the layout and testing.

**Specs:** I wrote `charter-and-claims/requirements.md` before any code: user stories and acceptance criteria for turning a plain goal into a step that can be checked. That spec fixed the data model the whole app measures against.

**Hooks:**

- `typecheck-on-save` runs TypeScript whenever a file is saved.
- `guard-kiro-dir` makes sure `.kiro` is never gitignored.
- `block-secrets` blocks any file write that looks like an API key. That mattered once I had a real Gemini key.

**Custom agent:** `council-writer` reviews the letter prompts. It checks that letters only use real data, that each future self keeps its own value, and that the tone is kind and never shaming.

**Vibe coding:** the design grew out of conversation. My first version was dark and full of git words. I told Kiro it felt sad and technical, and in a few rounds we got to the cozy scrapbook look, the new name, and plain language. Kiro also took browser screenshots of each screen to check its own UI work.

### A little maths

The moon is calculated on the device. With $a$ the days since a known new moon and $T \approx 29.53$ days the synodic month, the lit fraction is

$$
\text{illumination} = \frac{1 - \cos\left(\frac{2\pi a}{T}\right)}{2}
$$

Stitched insights stay quiet until the data is fair. A pattern such as "you glow on sunny days" only appears when each group has at least two days of pages and the average moods differ clearly:

$$
n_{\text{best}},\ n_{\text{worst}} \ge 2 \quad\text{and}\quad \bar{m}_{\text{best}} - \bar{m}_{\text{worst}} \ge 0.5
$$

## Challenges I ran into

- **No npm in the sandbox.** Kiro Web's sandbox couldn't install packages. Kiro verified the logic by running the TypeScript directly in Node, typechecked the UI against stub types, and bundled the real app with a tiny React stand-in to take screenshots. GitHub Actions was the only place the real build ran, so every change went through a pull request and CI.
- **Making the Frankenstein real.** My first version only stitched _ideas_ together (a journal, tarot cards, letters), all on one data source. I rebuilt it around real, different sources, and every insight names the sources it joined.
- **Honest patterns.** A few days of data can sound confident and be wrong, which led to the thresholds above.
- **Keeping a key safe on a static site.** GitHub Pages can't hide a secret, so the AI runs behind Vercel Functions, the key lives only in environment variables, and a hook stops it from being written into any file.
- **A sneaky CSS bug.** An entrance animation used `transform`, which trapped the full-screen letter and video overlays inside the page. Making the animation opacity-only fixed it.

## Accomplishments I'm proud of

- It's kind. The words are plain and encouraging, and nothing shames you for a missed day.
- The letters feel personal because they quote your own words and your real numbers.
- It works fully with no login and no key, and the AI makes it better when it's there.
- The stitches are real: the weather and the moon change what your journal tells you.

## What I learned

- Steering files keep a project consistent. One glossary file kept every new screen in the same friendly voice.
- Hooks are a cheap safety net, especially for secrets.
- Writing the spec first made the AI part simpler, because the AI only fills in a shape that's already defined and checked.
- Letting Kiro screenshot its own work caught layout problems that typechecking never would.

## What's next for Dearly

- Property-based tests for the core logic (step parsing, patterns, calendar round trips)
- Optional sync between devices, with end-to-end encryption
- More stitches: sleep and steps from health apps
- Gentle reminders, and sharing a letter as a pretty card
