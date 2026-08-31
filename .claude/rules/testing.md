---
paths:
  - '**/*.test.{ts,tsx}'
  - 'src/test/**'
---

# Testing

Mirrors app-settings' `testing.md`. One difference: **the script beans have no Java harness here** —
no `src/test/java`, no golden fixtures, no JUnit in `build.gradle`. Adding one mirrors app-settings
(`ScriptTestSupport` + `t.assertJsonEquals` fixtures, `dependsOn pnpmPack`) and is its own task, not a
line in a feature PR.

- Vitest through `vp test`, config in the `test` block of `vite.config.ts`. Tests sit next to their
  subject. Client and server code are covered by the same run.
- **The environment is `node` and no DOM library is installed, by decision.** Components are not
  rendered. Keep the testable part in a pure helper beside the component: row mapping, `enabled`
  predicates, sort and overflow maths.
- `describe` per unit, `it` naming the observable behaviour in present tense. Assert on values and
  error results, not on a mock having been called.
- **A test that needs the host passes a double**, not a store: `{ notify } as unknown as Host` with
  `setHost`, released in `afterEach`. `shared/notifications/notifications.test.ts` is the shape. A test
  that needs the section's own configuration calls `setConfig` instead and clears `$config` in
  `afterEach` — `entities/application/api/application-lifecycle.api.test.ts`.
- XP libs and the two CJS packages that require `react` (`@enonic/ui`, `lucide-react`) resolve to
  doubles in `src/test/mocks/` through `test.alias`. A new XP lib, or a new icon reached through an
  entity barrel, needs its double added there first.
- `vi.restoreAllMocks()` in `afterEach` whenever a global was replaced; `vi.useFakeTimers()` plus
  `await vi.runAllTimersAsync()` for debounced behaviour.
