# Phase 8 — Detail / statistics panel

**Status:** Not started
**Depends on:** 3, 4, 5
**Blocks:** 9

## Goal

Replace `ApplicationItemStatisticsPanel`, `ApplicationItemStatisticsHeader`, `ApplicationDataContainer` with a Preact `<DetailPanel>` showing the same sections.

## Tasks

- [ ] Create `v2/views/detail/DetailPanel.tsx`:
  - [ ] Subscribes to `$applications.selection[0]`
  - [ ] On selection change, calls `getApplicationInfo(key)` and writes `$applications.byKey[key].info`
  - [ ] Renders header + sections
- [ ] Create `v2/views/detail/DetailHeader.tsx`:
  - [ ] Icon, display name, vendor, install date, state badge
  - [ ] Action dropdown (Start / Stop) — `@enonic/ui` `Menu`
- [ ] Create `v2/views/detail/sections/*.tsx`:
  - [ ] `AppInfoSection.tsx` — description, max system version, etc.
  - [ ] `SiteSection.tsx` — content types, x-data, page descriptors, parts, layouts
  - [ ] `MacrosSection.tsx`
  - [ ] `ProvidersSection.tsx` — id provider descriptors
  - [ ] `TasksSection.tsx`
  - [ ] `ExtensionsSection.tsx` — admin tools, widgets, api descriptors
  - [ ] `DeploymentSection.tsx` — bundle list
- [ ] Build a minimal `Table` primitive locally (see Phase 9) for tabular sections.
- [ ] Delete legacy files:
  - [ ] `app/view/ApplicationItemStatisticsPanel.ts`
  - [ ] `app/view/ApplicationItemStatisticsHeader.ts`
  - [ ] `app/view/ApplicationDataContainer.ts`
  - [ ] `app/resource/GetApplicationInfoRequest.ts`
  - [ ] `app/resource/AdminToolDescriptor.ts`, `ApiDescriptor.ts`, `BaseDescriptor.ts`, `IdProviderApplication.ts`, `ApplicationInfo.ts`, `ApplicationInstallResult.ts`, `ApplicationTask.ts` — convert each to flat JSON types in `v2/features/types/`.
- [ ] Delete `styles/view/application-item-statistics-panel.less`.
- [ ] In `ApplicationAppPanel`, mount `<DetailPanel>` next to `<BrowsePage>`. After this phase the entire `ApplicationAppPanel` body is Preact — delete the lib-admin-ui `ItemStatisticsPanel` integration.

## Acceptance criteria

- [ ] Visual parity with the old detail panel — every section present.
- [ ] Playwright statistics specs pass.
- [ ] No legacy `view/` files remain.

## Notes / gotchas

- **Walking the old screen first** is worth the half-hour: `ApplicationDataContainer` exposes one sub-section per descriptor type; we cannot simplify past parity without UX agreement.
- **State badge tone** must match `applications.store.ts.state` values exactly. Pick the source of truth in Phase 3 and stick to it.
- **No `Tabs` today** — single scroll. Keep it.

## Open questions

- [ ] `ApplicationInfo` is a deeply-nested class with `fromJson`. Decide whether to keep it as a class temporarily (read-only consumer) or flatten in one go.
