# Dearly demo video script

Target length: about 3 minutes 30 seconds, and never more than 4. Judges often stop watching at 3
minutes, so the problem, the app working, and the Frankenstein stitches all come first, and the
Kiro section starts before 3:00.

Read the **Say** lines in your own words. The **Do** lines are what to click.

## Before you record

- Use Chrome in a fresh guest window, at 100% zoom, with the window about 1280 × 800.
- Open the live app: https://www.sizaadhikari.com.np/kiroween_project_manifest/
  If the Vercel version has the Gemini keys set, record there instead, so the letters come from
  Gemini and the AI card on Connections says "Connected".
- Allow microphone access once before recording, so the permission pop-up isn't in the video.
- Hide bookmarks and close other tabs. Turn on Do Not Disturb.
- Have a second tab ready with the GitHub repo open on the `.kiro` folder.
- Make the opening slide: two lines of navy text on a `#ece1db` background (Canva, Google Slides,
  or Keynote all work). Cormorant Garamond italic matches the app.
- Do one practice run. If you click **Reset demo** in the footer, Maya's journal starts fresh.

## Script

### 0:00 to 0:20 · The problem

**Do:** Start on a plain cream screen, or a slide in the app's background color `#ece1db`, with
one line at a time fading in, in navy:

1. "Every year, we write down who we want to become."
2. "And then the page goes quiet."

Speak slowly, and leave a short pause after each sentence.

**Say:** "Every year, we write down who we want to become, in a notebook, a notes app, or on a
vision board. A few weeks later, the page goes quiet. We didn't stop caring. The dream just stopped
talking back. Nobody noticed the small steps we took, and nobody reminded us why we started."

### 0:20 to 0:30 · The answer (Home)

**Do:** Cut to the Dearly Home page. Let "Dear me, write it down, watch it bloom." sit on screen
for a second, then move the mouse slowly over the polaroid.

**Say:** "So I made Dearly. A little journal that turns a dream into tiny daily steps, notices
every one you take, and lets future you write back."

### 0:30 to 0:45 · Why it's a Frankenstein

**Do:** Click **Peek at a demo**. Scroll down to "Seven tiny pieces, one sweet journal".

**Say:** "This is Maya's demo journal. Dearly stitches seven unrelated pieces into one: your
journal, live weather, the moon, your calendar, GitHub, Google Gemini, and your own voice. Each
stitch makes something none of them could do alone."

### 0:45 to 1:10 · My Dreams

**Do:** Open **My Dreams**. Click **New dream**. Type the dream "Run my first 5K", pick a date, and
write a one-line "why". Under "One little step that gets me there" type "Run 3 times a week".
Click **Add to my dreams** and point at the new step on the card. Switch the view to **Calendar**
for two seconds.

**Say:** "A dream is written like a diary entry. I add one little step in plain words, and Dearly
turns it into something it can actually count: three runs a week. Here are my dreams on a
calendar, and with one click the dream dates go into Google or Apple Calendar as reminders."

### 1:10 to 1:40 · Journal

**Do:** Open **Journal**. Hover the daily card. Pick a mood. Click the microphone and say one
sentence, for example "Today I finally finished the first glaze." Click **Save page**.

**Say:** "Every day there's a prompt card, and on new and full moons it becomes a moon ritual.
Today's weather is already on the page. I can type, or just speak my page. Then I tick off my
little steps for today."

### 1:40 to 2:10 · Progress

**Do:** Open **Progress**. Scroll slowly through the dream timeline and the habit hearts, then stop
on **Stitched insights**.

**Say:** "Progress shows a timeline of my dreams and a habit tracker. This is my favourite part:
Stitched insights. Dearly joins my moods with the weather and the moon and finds patterns, like
'you glow on sunny days'. Each insight names the sources it joined, and it stays quiet until
there's enough data to be fair."

### 2:10 to 2:35 · Future Me

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
Keep the opening problem, Stitched insights, and the Kiro section, because those match the judging criteria most
directly.

## After recording

1. Upload to YouTube. Title: "Dearly · a journal where future you writes back (Kiroween,
   Frankenstein)". Put the live link and the repo link in the description.
2. Before the deadline, check the hackathon rules for whether the video must be **public**. Many
   Devpost hackathons ask for a "publicly visible" video. Unlisted links play for anyone who has
   them, but if the rules say public, switch it to public before you submit.
3. Send the YouTube link to Kiro. It goes in `src/config.ts` (or `VITE_DEMO_VIDEO_URL`), and the
   **Watch the demo** button on Home will play it in an embed.
