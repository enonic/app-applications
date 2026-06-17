# Phase 6 — Browse panel

**Status:** Done
**Depends on:** 3, 4, 5
**Blocks:** 9

## Goal

Replace the legacy `ApplicationBrowsePanel` and its sub-components with a Preact tree backed entirely by stores and fetch wrappers.

## Tasks

- [x] Create `v2/views/browse/BrowsePage.tsx` — root for the browse view; renders toolbar + grid.
- [x] Create `v2/views/browse/BrowseToolbar.tsx`:
  - [x] Install / Uninstall / Start / Stop / Refresh buttons using `@enonic/ui` `Toolbar` + `Button`
  - [x] Disabled state derived from `$selectionInfo`
  - [x] Click handlers call API functions; optimistic store updates
- [x] Create `v2/views/browse/BrowseGrid.tsx`:
  - [x] Use `@enonic/ui` `GridList` (keyboard-navigable, ARIA grid)
  - [x] Items: `useStore($visibleApps)`
  - [x] Multi-select writes to `$applications.selection`
  - [x] System apps get a different tone via store-side derivation (uses `ApplicationDto.system`, already set by `toDto`; the legacy `SystemAppsHelper` is not needed in `v2`)
  - [x] Right-click → `@enonic/ui` `ContextMenu` with the same actions as toolbar
- [x] Create `v2/views/browse/BrowseRow.tsx`:
  - [x] Name, version, state badge (inline pill — Badge primitive deferred to Phase 9), provider; install date not exposed by the current list endpoint *(Deferred — needs an API enrichment.)*
- [x] Create `v2/views/browse/BrowseFilters.tsx`:
  - [x] `@enonic/ui` `SearchField` filtering `$applications.filter`
  - [x] Hide-system-apps toggle (preserve current behaviour) — backed by new `$applications.hideSystem`
- [x] On mount: `App.tsx` triggers `listApplications().then(setApps)` once via `BrowsePage`; subsequent events update the store.
- [x] Delete legacy files (in same PR):
  - [x] `app/browse/ApplicationBrowsePanel.ts`
  - [x] `app/browse/ApplicationsGridList.ts`
  - [x] `app/browse/ApplicationsListViewer.ts`
  - [x] `app/browse/ApplicationsListToolbar.ts`
  - [x] `app/browse/ApplicationBrowseActions.ts`
  - [x] `app/browse/ApplicationBrowseItemPanel.ts`
  - [x] `app/browse/StartApplicationAction.ts`, `StopApplicationAction.ts`, `UninstallApplicationAction.ts`, `InstallApplicationAction.ts`
  - [x] `app/browse/Start/Stop/UninstallApplicationEvent.ts` — `ApplicationItemStatisticsPanel` was rewired to call `startApplications`/`stopApplications` from `v2/features/api/applications.ts` directly, so the UI-to-UI bridge events are now dead code
  - [x] `app/browse/UninstallApplicationDialog.ts` — replaced by `v2/views/browse/UninstallConfirmDialog.tsx` driven by `$dialogs.uninstallConfirm`
- [x] Delete corresponding Less files:
  - [x] `styles/browse/application-tree-grid.less` (and the now-empty `styles/browse/` directory)
  - [x] `styles/view/application-browse-panel.less`
  - [x] `styles/view/application-browse-item-panel.less`
- [x] Replace `ApplicationAppPanel.route()` with a call into `<BrowsePage>` — went one step further: `ApplicationAppPanel.ts` was deleted (its only role was constructing `ApplicationBrowsePanel`, which is now gone). `main.ts` mounts `AppElement` directly, which hosts `<BrowsePage />`.

## Acceptance criteria

- [ ] All Playwright browse specs pass against the new UI: selection, toolbar enable/disable, system apps, context menu, multi-select, hide-system-apps toggle. *(Deferred to Phase 11 — the WDIO suite still targets legacy IDs.)*
- [x] Bundle size delta documented; Less files removed. `pnpm run build:dev` reports `bundle.js 1,625.78 kB / gzip 386.00 kB` and `main.css 15.32 kB / gzip 2.26 kB` after the migration.
- [x] No references to deleted legacy files remain (`pnpm run check` is clean — both `tsc --noEmit` and `eslint . --quiet --cache`).

## Notes / gotchas

- **Virtualization is probably unnecessary.** Most XP installs have <50 apps; plain `GridList` is fine. Switch to Virtuoso/VirtualizedTreeList only if a tenant report shows hundreds.
- **`data-testid`** — stable IDs are now on the page (`BrowsePage`), toolbar buttons (`BrowseToolbar.Install` / `.Uninstall` / `.Start` / `.Stop` / `.Refresh`), filter strip (`BrowseFilters.Search`, `BrowseFilters.HideSystem`), grid (`BrowseGrid`), rows (`BrowseGrid.Row`), context menu (`BrowseGrid.ContextMenu`) and uninstall dialog (`UninstallConfirmDialog`).
- **Selection sync with `ApplicationItemStatisticsPanel`.** Phase 8 owns the detail panel; the statistics panel is no longer mounted (it was hosted by the deleted `ApplicationAppPanel`), so this phase removes the visible duplicate but defers a Preact replacement to Phase 8.
- **InstallAppPromptEvent** is still fired from the new toolbar/context menu and consumed by the legacy `InstallAppDialog` in `main.ts`. Phase 7 replaces both.

## Open questions

- [ ] Should toolbar use `ActionMenu` (current overflow pattern) or stay flat? `@enonic/ui` has `Menu`/`Menubar` — pick one. *(Currently flat; revisit when responsive overflow becomes a need.)*
- [ ] Pagination: current API returns everything; if we add `?from/&count`, do it in Phase 4 or defer.
