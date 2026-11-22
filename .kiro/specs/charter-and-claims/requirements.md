# Requirements: My Dreams and little steps

## Introduction

In the UI this is the **My Dreams** tab. Code names are kept (goal, claim) but users see "dream"
and "little step" (see `.kiro/steering/voice-and-tone.md`).

The Charter is where a user states their goals in plain English. Each goal is turned into one or
more _claims_: simple, checkable statements such as "3 workouts a week". Claims are what the rest
of the app (nightly checks, report card, Council letters) measures against.

## Glossary

- **Charter**: the user's collection of goals and claims.
- **Goal**: a plain-English statement of what the user wants.
- **Claim**: a structured, checkable version of a goal, with a metric, a target, and a period.
- **Window**: the rolling period a claim is measured over. Day is today, week is the last 7 days,
  month is the last 30 days.
- **Evidence source**: where data for a claim comes from (manual check-in, GitHub activity,
  calendar file).

## Requirements

### Requirement 1: Write goals

**User story:** As a user, I want to write my goals in plain English, so that I do not need to
learn any special format.

#### Acceptance criteria

1. WHEN the user submits a goal, THE app SHALL save it to the Charter.
2. THE app SHALL accept goals of 1 to 280 characters and SHALL reject empty or whitespace-only
   input with a clear message.
3. THE app SHALL store the Charter in the browser, and SHALL work without an account.

### Requirement 2: Turn goals into claims

**User story:** As a user, I want each goal turned into a checkable claim, so that the app can
tell me whether I am on track.

#### Acceptance criteria

1. WHEN a goal is saved, THE app SHALL let the user add an optional target date, place, and reason.
2. WHEN a step is added, THE app SHALL request a proposed claim from the LLM through a server
   function and SHALL show it to the user as a suggestion.
3. THE proposed claim SHALL include a metric, a numeric target, a period (day, week, or month),
   and an evidence source.
4. IF the LLM request fails or returns an invalid claim, THEN THE app SHALL keep the goal, show a
   friendly error, and let the user create the claim manually.
5. THE server function SHALL validate the LLM output against the claim schema before returning it.

### Requirement 3: Edit and confirm claims

**User story:** As a user, I want to edit the suggested claim, so that it matches what I actually
mean.

#### Acceptance criteria

1. THE app SHALL let the user change the metric, target, period, and evidence source of a claim.
2. THE app SHALL make a new step active right away and let the user edit it at any time.
   (Changed from "only after the user confirms it": user testing showed the confirm step felt like
   paperwork.)
3. THE app SHALL let the user archive or delete a goal and its claims.

### Requirement 4: Claim integrity

**User story:** As a developer, I want claims to be validated and round-trip safely, so that stored
data never becomes corrupt.

#### Acceptance criteria

1. FOR ALL valid claims, serializing a claim and then parsing it SHALL produce an equivalent
   claim.
2. THE app SHALL reject claims with a non-positive target or an unknown period.

### Requirement 5: Demo mode

**User story:** As a judge, I want to try the Charter without setup, so that I can evaluate the app
quickly.

#### Acceptance criteria

1. WHEN demo mode is on, THE app SHALL load a pre-filled Charter for a sample persona.
2. WHILE demo mode is on, THE app SHALL NOT require an account or an API key from the user.

## Open questions

- Which evidence sources are supported in the first release for each metric type?
- Can one goal have more than one claim?
