# How Kiro was used

A running log for the hackathon write-up. Add notes as you go, including what did not work.

## Kiro apps tried

| App      | Used for                                 | Notes                                                                             |
| -------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| Kiro Web | Project scaffold, specs, steering, hooks | Sandbox had no npm registry access, so dependencies could not be installed there. |
| Kiro IDE |                                          |                                                                                   |
| Kiro CLI |                                          |                                                                                   |

## Specs

- `.kiro/specs/charter-and-claims`: requirements written first. Design and tasks follow after review.
- How spec-driven compared with vibe coding: _fill in_

## Steering

- Files: `product.md`, `tech.md`, `structure.md`, `voice-and-tone.md`, `testing.md`.
- Which strategy made the biggest difference: _fill in_

## Hooks

- `typecheck-on-save`: runs the TypeScript check when a `.ts` or `.tsx` file is saved.
- `guard-kiro-dir`: re-checks that `.kiro` is not gitignored whenever `.gitignore` is saved.
- `block-secrets`: blocks file writes that contain what looks like an API key or token.
- Impact: _fill in_

## Custom agents

- `council-writer`: reviews the prompts that generate future-self letters for grounding, tone, and
  safety.
- Impact: _fill in_

## MCP

_Planned: GitHub MCP, and a small custom MCP server that exposes claims and results to Kiro._

## Property-based testing

_Planned targets: claim round trip, score bounds, conflict-detection order independence, date and
streak logic._

## Powers

_Planned: GitHub CLI power for the repo workflow, Playwright for demo screenshots._
