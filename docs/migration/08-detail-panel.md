# Phase 8 — Detail / statistics panel

**Status:** Done
**Depends on:** 3, 4, 5
**Blocks:** 9

## Goal

Replace `ApplicationItemStatisticsPanel`, `ApplicationItemStatisticsHeader`, `ApplicationDataContainer` with a Preact `<DetailPanel>` showing the same sections.

## Tasks

- [x] Create `v2/views/detail/DetailPanel.tsx`:
  - [x] Subscribes to `$applications.selection[0]`
  - [x] On selection change, calls `getApplicationInfo(key)` and writes `$applications.infoByKey[key]` (cleaner separation than `byKey[key].info` — listing DTO stays a list DTO; info survives WS upserts).
  - [x] Renders header + sections
- [x] Create `v2/views/detail/DetailHeader.tsx`:
  - [x] Icon, display name, vendor, install date, state badge
  - [x] Action dropdown (Start / Stop) — `@enonic/ui` `Menu`
- [x] Create `v2/views/detail/sections/*.tsx`:
  - [x] `AppInfoSection.tsx` — description, max system version, etc.
  - [x] `SiteSection.tsx` — content types, x-data, page descriptors, parts, layouts
  - [x] `MacrosSection.tsx`
  - [x] `ProvidersSection.tsx` — id provider descriptors
  - [x] `TasksSection.tsx`
  - [x] `ExtensionsSection.tsx` — admin tools, widgets, api descriptors
  - [x] `DeploymentSection.tsx` — bundle list
- [x] Build a minimal `Table` primitive locally (see Phase 9) for tabular sections. *(Deferred to Phase 9 — used semantic `<dl>` rows inside a local `Section`/`SectionRow` helper; Phase 9's own doc flags the `Table` primitive as an open question for ≤3 sections.)*
- [x] Delete legacy files:
  - [x] `app/view/ApplicationItemStatisticsPanel.ts`
  - [x] `app/view/ApplicationItemStatisticsHeader.ts`
  - [x] `app/view/ApplicationDataContainer.ts`
  - [x] `app/resource/GetApplicationInfoRequest.ts`
  - [x] `app/resource/AdminToolDescriptor.ts`, `ApiDescriptor.ts`, `BaseDescriptor.ts`, `IdProviderApplication.ts`, `ApplicationInfo.ts`, `ApplicationInstallResult.ts`, `ApplicationTask.ts` — converted to flat JSON types in `v2/features/types/application-info.ts`. *(`ApplicationInstallResult.ts` was already removed by Phase 7; the corresponding orphan `app/resource/json/ApplicationInstalledJson.ts` was deleted alongside the other JSON files in this phase.)*
- [x] Delete `styles/view/application-item-statistics-panel.less`.
- [x] Mount `<DetailPanel>` next to `<BrowsePage>` (in `v2/App.tsx`). The legacy `ApplicationAppPanel`/`ItemStatisticsPanel` integration is already gone — `main.ts` boots straight into the v2 `AppElement`, so there was nothing left to delete here.

## Acceptance criteria

- [x] Visual parity with the old detail panel — every section present.
- [ ] Playwright statistics specs pass. *(Deferred to CI / Phase 11.)*
- [x] No legacy `view/` files remain.

## Notes / gotchas

- **Walking the old screen first** is worth the half-hour: `ApplicationDataContainer` exposes one sub-section per descriptor type; we cannot simplify past parity without UX agreement.
- **State badge tone** must match `applications.store.ts.state` values exactly. Pick the source of truth in Phase 3 and stick to it.
- **No `Tabs` today** — single scroll. Keep it.

## Open questions

- [x] `ApplicationInfo` is a deeply-nested class with `fromJson`. Decide whether to keep it as a class temporarily (read-only consumer) or flatten in one go. → **Flattened in one go.** `v2/features/types/application-info.ts` owns both the wire format (`ApplicationInfoJson`) and the flat DTO (`ApplicationInfoDto`); `getApplicationInfo()` does the JSON → DTO conversion at the API edge, so nothing inside the store or views ever sees a class instance.
