# Phase 10 — Storybook integration

**Status:** Not started
**Depends on:** 9
**Blocks:** —

## Context

Storybook **already exists** in `lib-admin-ui` (`.storybook/{main.ts, preview.tsx, storybook.css}`, `@storybook/preact-vite ~10.3.6` + `addon-docs` + `addon-themes`). 19 stories exist for `form2/` inputs. `ui2/` has no stories.

We do NOT add Storybook to `app-applications` — that doubles maintenance and the visual outputs may diverge. Instead, components reusable enough to be shared go into `lib-admin-ui/ui2/` (under the existing Storybook); app-specific composites (`BrowseGrid`, `InstallDialog`) stay in `app-applications` without stories.

## Tasks (in `enonic/lib-admin-ui` repo on the migration branch)

- [ ] Add `*.stories.tsx` for every existing `ui2/` component (currently storyless):
  - [ ] `ActionButton.stories.tsx`
  - [ ] `ActionIcon.stories.tsx`
  - [ ] `Button.stories.tsx`
  - [ ] `Checkbox.stories.tsx`
  - [ ] `LegacyElement.stories.tsx` (showcase the bridge with a tiny demo Preact component)
  - [ ] `Notification.stories.tsx`
  - [ ] `SearchInput.stories.tsx`
- [ ] Use existing story conventions: `tags: ['autodocs']`, `Examples/*`, `States/*`, optional `AllStates` render — see [references.md §9](./references.md#9-checkboxinputstoriestsx-template).
- [ ] Light + dark variants verified per story (theme toggle in toolbar from `addon-themes`).
- [ ] If we upstream `Badge`/`Spinner`/`Table` from Phase 9 — also add stories here.
- [ ] Document in `lib-admin-ui/CLAUDE.md` (or a sibling doc) that every new `ui2/` component must ship with a `*.stories.tsx`.

## Acceptance criteria

- [ ] `pnpm storybook` in `lib-admin-ui` shows all `ui2/` components and any newly upstreamed primitives.
- [ ] Story PRs gated by a CI check (existing or new) that fails if `*.stories.tsx` is missing for new `ui2/*.tsx`.

## Notes / gotchas

- **No Chromatic yet.** `@chromatic-com/storybook` is in `npm-enonic-ui` but not in `lib-admin-ui`. Optional follow-up; not blocking.
- **Test-runner.** `@storybook/test-runner` over Playwright could turn stories into interaction tests; not required for this migration.

## Open questions

- [ ] Should Storybook be hosted (GitHub Pages / Chromatic) for designer review? Out of scope for this plan; raise if needed.
