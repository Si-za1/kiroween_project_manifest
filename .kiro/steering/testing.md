# Testing

- Framework: Vitest. Property-based tests use fast-check.
- Test files sit next to the code as `*.test.ts` or `*.test.tsx`.
- Add property-based tests for pure logic where the rule is an invariant, for example:
  - claim parsing: a rendered claim parses back to an equivalent claim (round trip)
  - scoring: a score is always between 0 and 1, and more evidence never lowers it
  - conflict detection: the result does not depend on the order of the input events
  - streaks and dates: results are stable across time zones and daylight saving changes
- Use example-based unit tests for UI behavior and for specific bug regressions.
- Do not call real LLM or network services in tests. Inject fakes.
- Run `npm test` and `npm run typecheck` before declaring a task done.
