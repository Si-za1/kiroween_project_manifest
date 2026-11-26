# Dearly demo video script

Target length: about 3 minutes, and never more than 4. Judges often stop watching at 3 minutes, so
the most important parts (the app working and the Frankenstein stitches) come first, and the Kiro
section fits before 3:00. The last 30 seconds are buffer.

Read the **Say** lines in your own words. The **Do** lines are what to click.

## Before you record

- Use Chrome in a fresh guest window, at 100% zoom, with the window about 1280 × 800.
- Open the live app: https://www.sizaadhikari.com.np/kiroween_project_manifest/
  If the Vercel version has the Gemini keys set, record there instead, so the letters come from
  Gemini and the AI card on Connections says "Connected".
- Allow microphone access once before recording, so the permission pop-up isn't in the video.
- Hide bookmarks and close other tabs. Turn on Do Not Disturb.
- Have a second tab ready with the GitHub repo open on the `.kiro` folder.
- Do one practice run. If you click **Reset demo** in the footer, Maya's journal starts fresh.

## Script

### 0:00 to 0:15 · The hook (Home)

**Do:** Start on Home. Move the mouse slowly over the polaroid.

**Say:** "Most of us write goals down and never look at them again. Dearly is a little journal
that turns a dream into tiny daily steps, and then lets future you write back."

### 0:15 to 0:35 · Why it's a Frankenstein

**Do:** Click **Peek at a demo**. Scroll down to "Seven tiny pieces, one sweet journal".

**Say:** "This is Maya's demo journal. Dearly stitches seven unrelated pieces into one app: your
journal, live weather from Open-Meteo, moon phases calculated on the device, your calendar,
GitHub, Google Gemini, and your own voice. Each stitch creates something none of them could do
alone."

### 0:35 to 1:00 · My Dreams

**Do:** Open **My Dreams**. Click **New dream**. Type the dream "Run my first 5K", pick a date, and
write a one-line "why". Under "One little step that gets me there" type "Run 3 times a week".
Click **Add to my dreams** and point at the new step on the card. Switch the view to **Calendar**
for two seconds.

**Say:** "A dream is written like a diary entry. I add one little step in plain words, and Dearly
turns it into something it can actually count: three runs a week. Here are my dreams on a
calendar, and with one click the dream dates go into Google or Apple Calendar as reminders."

### 1:00 to 1:35 · Journal

**Do:** Open **Journal**. Hover the daily card. Pick a mood. Click the microphone and say one
sentence, for example "Today I finally finished the first glaze." Click **Save page**.

**Say:** "Every day there's a prompt card, and on new and full moons it becomes a moon ritual.
Today's weather is already on the page. I can type, or just speak my page. Then I tick off my
little steps for today."

### 1:35 to 2:05 · Progress

**Do:** Open **Progress**. Scroll slowly through the dream timeline and the habit hearts, then stop
on **Stitched insights**.

**Say:** "Progress shows a timeline of my dreams and a habit tracker. This is my favourite part:
Stitched insights. Dearly joins my moods with the weather and the moon and finds patterns, like
'you glow on sunny days'. Each insight names the sources it joined, and it stays quiet until
there's enough data to be fair."

### 2:05 to 2:35 · Future Me

**Do:** Open **Future Me**. Hover an envelope so it lifts. Click it and let it open. Click
**Listen** for three seconds, then close.

**Say:** "Three future versions of me, one year, five years, and twenty years away, read my real
progress and write me letters. They look after different things: growth, love, and wellbeing, so
they don't always agree. And they can read their letters out loud."

### 2:35 to 2:50 · Connections

**Do:** Open **Connections**. Point at the stitch list, then the **AI · Gemini** card and the
**Weather** card.

**Say:** "Connections shows every stitched piece and what it's doing right now. Your journal stays
on your device. Only a short summary goes to Gemini when you ask for letters, and the app still
works if the AI is off."

### 2:50 to 3:20 · Built with Kiro

**Do:** Switch to the GitHub tab. Click through `.kiro/steering`, `.kiro/specs`, and `.kiro/hooks`.
Open `docs/KIRO_JOURNAL.md` for a second.

**Say:** "I built Dearly with Kiro. Steering files hold the product rules, the tech choices, and a
voice-and-tone glossary that keeps every word friendly and non-technical. The spec defined dreams
and little steps before any code. Hooks typecheck on save, protect the .kiro folder, and block
secrets from being committed. And a custom agent writes the Future Me letters in the right voice."

### 3:20 to 3:30 · Close

**Do:** Switch back to the app's Home page.

**Say:** "Dearly. Dear me, write it down, watch it bloom. It's free, open source, and live at the
link below."

## If you're running long

Cut in this order: the calendar view in My Dreams, the Listen button, then the Connections section.
Keep Stitched insights and the Kiro section, because those match the judging criteria most
directly.

## After recording

1. Upload to YouTube. Title: "Dearly · a journal where future you writes back (Kiroween,
   Frankenstein)". Put the live link and the repo link in the description.
2. Before the deadline, check the hackathon rules for whether the video must be **public**. Many
   Devpost hackathons ask for a "publicly visible" video. Unlisted links play for anyone who has
   them, but if the rules say public, switch it to public before you submit.
3. Send the YouTube link to Kiro. It goes in `src/config.ts` (or `VITE_DEMO_VIDEO_URL`), and the
   **Watch the demo** button on Home will play it in an embed.
