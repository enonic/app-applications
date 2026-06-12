# Phase 9 — Component gap-filling

**Status:** Done
**Depends on:** 6, 7, 8 (built progressively alongside)
**Blocks:** 10 (storybook needs components)

## Goal

Fill the gaps in `@enonic/ui` with minimal local primitives. Build only what we use. Push reusable pieces upstream to `lib-admin-ui/ui2/` after they stabilize.

## Components needed (and where they're used)

| Component | Used by | Status |
|---|---|---|
| `Badge` | Browse row (state), detail header | [x] |
| `Spinner` | Install progress, list loading | [x] |
| `Table` | Detail panel sections | [x] *(Skipped — see decision below.)* |
| `Toast` (adopt) | All notifications | [x] |

Not needed:
- Pagination (no paginated grids)
- Sheet/Drawer
- Popover (use `Tooltip`/`Menu`)
- Card (just Tailwind)
- Tag (use `Badge`)
- Breadcrumbs
- ErrorBoundary (Preact 10 supports class-based error boundary; skip unless we hit a need)

## Tasks

- [x] Create `v2/shared/ui/Badge.tsx`:
  - [x] CVA variants: `tone: 'neutral'|'info'|'success'|'warning'|'error'`
  - [x] Uses `@enonic/ui` design tokens (`bg-success/15`, `text-warn`, etc.) — no new colours
- [x] Create `v2/shared/ui/Spinner.tsx`:
  - [x] Animated SVG via Tailwind utilities (`animate-spin` on `lucide-react`'s `Loader2`)
  - [x] Sizes: `sm | md | lg`
- [x] ~~Create `v2/shared/ui/Table.tsx`~~ — **deferred**. Every detail section is a definition list (`<dt>/<dd>` via `Section`/`SectionRow`), not tabular data. Building a `Table` primitive with no consumer would violate the "Build only what we use" rule (this phase's opening principle). Recreate when a tabular grid actually lands.
- [x] Adopt `@enonic/ui` `ToastProvider`:
  - [x] `v2/features/store/notifications.store.ts` owns `$notifications` (array) with `pushToast({tone, message, title?, duration?})` / `dismissToast(id)` / `resetNotifications()`
  - [x] `v2/shared/ui/Toaster.tsx` mounts inside `App.tsx` (after `InstallDialog`), positions fixed top-right, renders one `<Toast>` per item with auto-hide and pause-on-hover
  - [x] Migrated existing failure / success sites: `BrowsePage` (list failure), `DetailPanel` (info failure), `MarketRow` (install failure), `applicationEvents` (`INSTALLED` / `UNINSTALLED` success — restores legacy `notify.installed` / `notify.uninstalled` feedback that the phase 6 cutover dropped)
- [x] Stories alongside each primitive (`Badge.stories.tsx`, `Spinner.stories.tsx`, `Toaster.stories.tsx`) — currently excluded from `tsc` / `eslint` via `tsconfig.json` + `eslint.config.ts` until Phase 10 wires Storybook in.

## Files added / changed

- `v2/shared/ui/Badge.tsx` (+ `Badge.stories.tsx`)
- `v2/shared/ui/Spinner.tsx` (+ `Spinner.stories.tsx`)
- `v2/shared/ui/Toaster.tsx` (+ `Toaster.stories.tsx`)
- `v2/features/store/notifications.store.ts` (+ `.test.ts`)
- `v2/App.tsx` — mounts `<Toaster />`
- `v2/views/browse/BrowseRow.tsx` — state pill → `Badge`
- `v2/views/detail/DetailHeader.tsx` — state pill → `Badge`
- `v2/views/install/MarketGrid.tsx` — loading row → `Spinner`
- `v2/views/install/MarketRow.tsx` — installing button → `Spinner`, install failure → toast
- `v2/views/browse/BrowsePage.tsx` — list failure → toast
- `v2/views/detail/DetailPanel.tsx` — info failure → toast (replaces silent catch)
- `v2/features/events/applicationEvents.ts` — `INSTALLED` / `UNINSTALLED` success → toast
- `v2/features/hooks/useI18n.ts` — exposes a plain `i18n()` helper alongside `useI18n` so non-React modules (event bridge) can resolve messages without bending hook rules
- `src/main/resources/i18n/phrases.properties` — adds `notify.error.listFailed`, `notify.error.infoFailed`, `notify.error.installFailed`
- `tsconfig.json` + `eslint.config.ts` — exclude `*.stories.tsx` until Phase 10 installs Storybook deps

## Acceptance criteria

- [x] Every consuming feature (Phases 6–8) uses our `Badge`/`Spinner` and not bespoke local divs.
- [x] `pnpm test` and `pnpm run check` pass locally (185 tests, tsc + eslint clean).
- [ ] Storybook (Phase 10) covers each. *(Deferred to Phase 10 — stories are written and waiting.)*

## Notes / gotchas

- **Use tokens, not hex colours.** Every primitive uses `@enonic/ui` design tokens (`text-success`, `bg-warn/15`, `text-subtle`, …). Tokens are sourced from `@enonic/ui/preset.css`; the canonical name for the amber tone is **`warn`**, not `warning` — the previous inline `bg-warning/15 text-warning` classes in `BrowseRow`/`DetailHeader` were silently dropped at compile time. The `Badge` props keep `tone: 'warning'` for ergonomics and remap to `warn` internally.
- **Toast auto-hide vs. portaled content.** The Toaster renders inside the v2 tree (no portal). `@enonic/ui`'s `Toast` already sets `data-click-outside-ignore`, so toasts will never collapse dialog/menu UI when clicked. Pause-on-hover and pause-on-focus are handled via local `useState` on each `<ToasterItem>`.
- **Upstream candidates.** `Badge` and `Spinner` are good upstream candidates for `lib-admin-ui/ui2/`; the Toaster ↔ store wiring is too app-specific to lift as-is. Don't block this migration on upstreaming.

## Open questions

- [x] `Table` vs raw `<table>` — resolved: skip. None of the seven detail sections render tabular data; they're definition lists. Revisit when a feature actually needs row × column layout.
