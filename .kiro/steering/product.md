# Product: Manifest.git

Manifest.git is a journaling and goal-reflection web app. Tagline: **Manifestation with receipts.
Your future selves write back, and your data decides who's lying.**

Built for the Kiro hackathon, category **Frankenstein**: it stitches together things that do not
normally belong together (manifestation and journaling, software testing and version control,
tarot-style cards, LLM letters from future selves).

## Core loop

1. **Charter.** The user writes goals in plain English. Each goal becomes an editable, testable
   _claim_ (for example "3 workouts a week").
2. **Daily card and entry.** A personalized prompt card, then a short journal entry saved as a
   "commit" in the user's timeline.
3. **Check-in and evidence.** Quick check-in (did I do it, mood, sleep) plus optional evidence:
   public GitHub activity and an uploaded calendar `.ics` file.
4. **Report card.** Each claim is on track or off track. Where words and actions disagree, show a
   "conflict".
5. **Council letters.** Future-self letters at 1, 5, and 20 years, grounded in real results and
   written in the user's own voice. The selves disagree with each other. The user can write back.

## Principles

- The user never needs to code. Git language is theme and metaphor only.
- Local-first. Journals live in the browser (IndexedDB). No accounts. Nothing is sent to a server
  except what the LLM needs for a single request.
- A **demo mode** with a pre-seeded persona must work with no login, so judges can try everything.
- Honest, not harsh. Conflicts are shown with care, never as shaming.

## Out of scope

Accounts and login, mobile apps, social features, payments.
