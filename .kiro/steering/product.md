# Product: Dearly

Dearly is a sweet journaling and dream-planning web app (formerly "Manifest"). Tagline:
**Dear me, I'm becoming you.** The name comes from how everything in it is addressed: "Dear
diary" on the page and "Dear you" in the letters from future selves.
It turns what you want to manifest into little daily steps, shows your progress, and lets future
versions of you write back.

Built for the Kiro hackathon, category **Frankenstein**. Dearly stitches seven sources into one
journal, and every stitch must produce something none of the pieces could alone:

| Piece    | Source                                 | What the stitch makes                                            |
| -------- | -------------------------------------- | ---------------------------------------------------------------- |
| Journal  | Local storage                          | The heart. Pages, moods, dreams, steps.                          |
| Weather  | Open-Meteo API (free, no key, browser) | Mood and weather patterns; today's sky on the page               |
| Moon     | Astronomy maths, on device             | New and full moon ritual cards; mood and moon patterns           |
| Calendar | .ics in and out                        | Steps that count themselves; dream dates exported with reminders |
| GitHub   | GitHub REST API (server)               | Coding steps that count themselves                               |
| AI       | OpenAI-compatible LLM (server)         | Steps from plain goals; Future Me letters                        |
| Voice    | Web Speech API (browser)               | Speak a page; hear letters read aloud                            |

The Home page shows the chain, and the **Connections** tab explains every stitch with live status.
Insights on Progress name their sources ("Journal × Weather").

## Screens (tabs at the top)

1. **Home.** Greeting, illustration, quick stats, and a tile for each feature.
2. **My Dreams.** Write a dream like a journal entry: what, by when, where, why, and one little step.
   Board view (cards) and Calendar view (month grid with dream dates, journal days, and ticked steps).
3. **Journal.** Today's card gives a prompt. Write a page, pick a mood, tick off today's steps.
   Past pages below.
4. **Progress.** Stats, a dream timeline, a mood line, gentle nudges, a 14-day habit dot grid, and
   optional calendar or GitHub connections.
5. **Future Me.** Letters from you in 1, 5, and 20 years. Each future self looks after one life
   area (Growth, Love, Wellbeing), so they can kindly disagree. They mention stitched insights.
   You can write back or listen to them.
6. **Connections.** Every source, its status, what it adds, and controls to connect or disconnect.

## Principles

- **Plain words for everyone.** No software or git terms in the UI. Use dream, little step, page,
  progress, nudge, letter.
- **Encouraging, never judgmental.** Celebrate wins first. When something is behind, be gentle and
  curious.
- Local-first. Everything lives on the device. No accounts.
- A **demo mode** (Maya's journal) must work with no login or API key, so judges can try everything.
- AI is optional. Every AI feature has a local fallback.

## Out of scope

Accounts and login, mobile apps, social features, payments.
