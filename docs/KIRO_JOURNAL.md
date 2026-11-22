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

## Build log

- **Kiro Web, first full build.** The Kiro Web sandbox only allowed access to integrations, so the
  npm registry returned 403 and dependencies could not be installed. The pure logic in `src/lib`
  and the `api` handlers were still verified: strict TypeScript checks, plus Node 22 running the
  TypeScript directly against the demo persona and a mocked LLM. The React UI was typechecked
  against stub types only and still needs a real run.
- **A bug found by running the logic.** Claim validation required a `value` field that stored claims
  do not have, so every stored claim would have failed validation. A second run showed two
  overlapping conflicts for one claim, so the stronger one now replaces the weaker one. Both are
  good property-based test targets.
