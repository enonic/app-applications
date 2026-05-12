# Phase 9 — Component gap-filling

**Status:** Not started
**Depends on:** 6, 7, 8 (built progressively alongside)
**Blocks:** 10 (storybook needs components)

## Goal

Fill the gaps in `@enonic/ui` with minimal local primitives. Build only what we use. Push reusable pieces upstream to `lib-admin-ui/ui2/` after they stabilize.

## Components needed (and where they're used)

| Component | Used by | Status |
|---|---|---|
| `Badge` | Browse row (state), detail header | [ ] |
| `Spinner` | Install progress, list loading | [ ] |
| `Table` | Detail panel sections | [ ] |
| `Toast` (adopt) | All notifications | [ ] (already in `@enonic/ui`) |

Not needed:
- Pagination (no paginated grids)
- Sheet/Drawer
- Popover (use `Tooltip`/`Menu`)
- Card (just Tailwind)
- Tag (use `Badge`)
- Breadcrumbs
- ErrorBoundary (Preact 10 supports class-based error boundary; skip unless we hit a need)

## Tasks

- [ ] Create `v2/shared/ui/Badge.tsx`:
  - [ ] CVA variants: `tone: 'neutral'|'info'|'success'|'warning'|'error'`
  - [ ] Uses `@enonic/ui` design tokens (`bg-surface-success-rev`, `text-main`, etc.) — no new colours
- [ ] Create `v2/shared/ui/Spinner.tsx`:
  - [ ] Animated SVG via Tailwind utilities
  - [ ] Sizes: `sm | md | lg`
- [ ] Create `v2/shared/ui/Table.tsx`:
  - [ ] Compound: `Table.Root`, `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell`, `Table.Cell`
  - [ ] Dumb semantic markup with Tailwind classes; no sorting/filtering built-in
- [ ] Adopt `@enonic/ui` `ToastProvider`:
  - [ ] Mount in `App.tsx` inside `IdProvider`
  - [ ] Bridge: `pushToast({tone, message})` mutator on `notifications.store.ts` adds a toast; provider renders
  - [ ] Migrate existing `NotifyManager` calls progressively
- [ ] For each primitive, write a `*.stories.tsx` next to it (Phase 10 picks these up).

## Files to add

- `v2/shared/ui/Badge.tsx` + stories
- `v2/shared/ui/Spinner.tsx` + stories
- `v2/shared/ui/Table.tsx` + stories
- `v2/features/store/notifications.store.ts`
- `v2/shared/ui/Toaster.tsx` (the host component reading the store)

## Acceptance criteria

- [ ] Every consuming feature (Phases 6–8) uses our `Badge`/`Spinner`/`Table` and not bespoke local divs.
- [ ] `pnpm test` and Storybook (Phase 10) cover each.

## Notes / gotchas

- **Use tokens, not hex colours.** Every primitive must theme correctly with the rest of the page.
- **Upstream candidates.** Once these stabilise, propose pushing them into `lib-admin-ui/ui2/` so CS can reuse them. Don't block this migration on upstreaming.

## Open questions

- [ ] `Table` vs raw `<table>` — keep the wrapper only if it earns its keep with consistent styling. If we only use it in 3 sections, plain `<table>` + Tailwind classes is fine.
