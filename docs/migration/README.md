# app-applications UI Migration

Migration of `app-applications` to the new Enonic UI stack: Preact + `@enonic/ui` + Tailwind v4 + nanostores + plain `fetch`, mirroring the patterns established in `app-contentstudio`.

## Goal

Replace the legacy `lib-admin-ui` class-based UI in `app-applications` with:

- **Framework**: Preact 10 (React aliased to `preact/compat`)
- **Components**: `@enonic/ui ~1.0.0-beta.1`
- **Styling**: Tailwind v4 + `@enonic/ui/preset.css` + `tw-animate-css`
- **State**: `nanostores ^0.11.4` + `@nanostores/preact ^1`
- **HTTP**: plain `async function`s with `fetch()`
- **Bridge**: `LegacyElement` from `@enonic/lib-admin-ui/ui2`
- **E2E tests**: Playwright (replacing WDIO + Mocha + Allure)

All new code lives under `src/main/resources/assets/js/v2/`. Legacy code under `src/main/resources/assets/js/app/` is deleted phase by phase once superseded.

## Status

| # | Phase | Status |
|---|-------|--------|
| — | [Overview & principles](./00-overview.md) | — |
| 1 | [Foundation — build, deps, Tailwind](./01-foundation.md) | Done |
| 2 | [App shell — LegacyElement + App.tsx](./02-app-shell.md) | Done |
| 3 | [Global state — nanostores](./03-global-state.md) | Done |
| 4 | [Data layer — fetch wrappers](./04-data-layer.md) | Not started |
| 5 | [Server events — WS → stores](./05-server-events.md) | Not started |
| 6 | [Browse panel](./06-browse-panel.md) | Not started |
| 7 | [Install dialog](./07-install-dialog.md) | Not started |
| 8 | [Detail / statistics panel](./08-detail-panel.md) | Not started |
| 9 | [Component gap-filling](./09-component-gaps.md) | Not started |
| 10 | [Storybook integration](./10-storybook.md) | Not started |
| 11 | [Playwright E2E](./11-playwright-tests.md) | Not started |
| — | [Verbatim references from CS](./references.md) | — |

Statuses: `Not started` · `In progress` · `Blocked` · `Done`.

## Sequencing

Phases 1 and 11 can start in parallel — they touch disjoint trees. Phases 2–5 unlock the UI features (6–8). Phases 9 and 10 are continuous; tackled as components are built.

```
1 Foundation ──┬─► 2 App shell ──┬─► 3 Global state ─┐
               │                  ├─► 4 Data layer ───┼─► 5 Server events ─┬─► 6 Browse panel ─┐
               │                  │                   │                    ├─► 7 Install dialog ┼─► 9 Components ─► 10 Storybook
               │                  │                   │                    └─► 8 Detail panel ──┘
               └─► 11 Playwright (independent — runs against current UI first, then post-migration UI)
```

## How to update this plan

- Every phase doc has a **Tasks** checklist. Tick `[x]` in the PR that completes a task.
- Update the **Status** column in this README in the same PR (`Not started` → `In progress` → `Done`).
- If scope changes inside a phase, edit the phase doc directly and call out the change in the PR description.
- If new cross-cutting concerns surface, add a new phase doc and reference it from this README.
- Reference files in [references.md](./references.md) are templates to copy/adapt — keep them stable; treat them as read-only snapshots from `app-contentstudio` master.

## Branch convention

All work for this migration is committed on `claude/migrate-app-ui-framework-g4OPC` across the four repos: `app-applications`, `app-contentstudio`, `lib-admin-ui`, `npm-enonic-ui`. Per-feature PRs branch from there as needed.
