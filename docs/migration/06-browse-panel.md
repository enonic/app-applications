# Phase 6 — Browse panel

**Status:** Not started
**Depends on:** 3, 4, 5
**Blocks:** 9

## Goal

Replace the legacy `ApplicationBrowsePanel` and its sub-components with a Preact tree backed entirely by stores and fetch wrappers.

## Tasks

- [ ] Create `v2/views/browse/BrowsePage.tsx` — root for the browse view; renders toolbar + grid.
- [ ] Create `v2/views/browse/BrowseToolbar.tsx`:
  - [ ] Install / Uninstall / Start / Stop / Refresh buttons using `@enonic/ui` `Toolbar` + `Button`
  - [ ] Disabled state derived from `$selectionInfo`
  - [ ] Click handlers call API functions; optimistic store updates
- [ ] Create `v2/views/browse/BrowseGrid.tsx`:
  - [ ] Use `@enonic/ui` `GridList` (keyboard-navigable, ARIA grid)
  - [ ] Items: `useStore($visibleApps)`
  - [ ] Multi-select writes to `$applications.selection`
  - [ ] System apps get a different tone via store-side derivation (use `SystemAppsHelper.isSystemApp` for now, port later)
  - [ ] Right-click → `@enonic/ui` `ContextMenu` with the same actions as toolbar
- [ ] Create `v2/views/browse/BrowseRow.tsx`:
  - [ ] Name, version, state badge (Badge from local primitive — see Phase 9), provider, install date
- [ ] Create `v2/views/browse/BrowseFilters.tsx`:
  - [ ] `@enonic/ui` `SearchField` filtering `$applications.filter`
  - [ ] Hide-system-apps toggle (preserve current behaviour)
- [ ] On mount: `App.tsx` triggers `listApplications().then(setApps)` once; subsequent events update the store.
- [ ] Delete legacy files (in same PR):
  - [ ] `app/browse/ApplicationBrowsePanel.ts`
  - [ ] `app/browse/ApplicationsGridList.ts`
  - [ ] `app/browse/ApplicationsListViewer.ts`
  - [ ] `app/browse/ApplicationsListToolbar.ts`
  - [ ] `app/browse/ApplicationBrowseActions.ts`
  - [ ] `app/browse/ApplicationBrowseItemPanel.ts`
  - [ ] `app/browse/StartApplicationAction.ts`, `StopApplicationAction.ts`, `UninstallApplicationAction.ts`, `InstallApplicationAction.ts`
  - [ ] `app/browse/Start/Stop/UninstallApplicationEvent.ts` (audit first — Phase 5 should already cover their replacement)
- [ ] Delete corresponding Less files:
  - [ ] `styles/browse/application-tree-grid.less`
  - [ ] `styles/view/application-browse-panel.less`
  - [ ] `styles/view/application-browse-item-panel.less`
- [ ] Replace `ApplicationAppPanel.route()` with a call into `<BrowsePage>` (eventually delete that file too — see Phase 8).

## Acceptance criteria

- [ ] All Playwright browse specs pass against the new UI: selection, toolbar enable/disable, system apps, context menu, multi-select, hide-system-apps toggle.
- [ ] Bundle size delta documented; Less files removed.
- [ ] No references to deleted legacy files remain (`pnpm exec tsc` clean).

## Notes / gotchas

- **Virtualization is probably unnecessary.** Most XP installs have <50 apps; plain `GridList` is fine. Switch to Virtuoso/VirtualizedTreeList only if a tenant report shows hundreds.
- **`data-testid`** — add stable `data-testid` to the row, toolbar buttons, and grid so Playwright locators stop relying on `id` prefixes (`ApplicationBrowsePanel`, `Toolbar`).
- **Selection sync with `ApplicationItemStatisticsPanel`.** Phase 8 owns the detail panel; while phase 6 is live alone, the legacy statistics panel will break — coordinate landing 6 + 8 in the same release.

## Open questions

- [ ] Should toolbar use `ActionMenu` (current overflow pattern) or stay flat? `@enonic/ui` has `Menu`/`Menubar` — pick one.
- [ ] Pagination: current API returns everything; if we add `?from/&count`, do it in Phase 4 or defer.
