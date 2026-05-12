# Phase 3 — Global state (nanostores)

**Status:** Done
**Depends on:** 2
**Blocks:** 5, 6, 7, 8

## Goal

Create the nanostores that will drive the new UI. After this phase the stores exist with mutators and computed selectors, are unit-tested, but no UI yet subscribes to them.

## Stores to create

Under `src/main/resources/assets/js/v2/features/store/`:

| Store | Shape | Purpose |
|---|---|---|
| `app.store.ts` | `map<{theme, page, readonly, config}>` | Boot config + UI mode. Persist `theme` via `syncMapStore`. |
| `applications.store.ts` | `map<{items: ApplicationDto[], byKey: Record<string, ApplicationDto>, status, filter, selection: string[]}>` | Browse-panel grid. |
| `app-actions.store.ts` | `map<{installing: Record<key, ProgressJson>, starting: Set<key>, stopping: Set<key>}>` | Per-app pending actions; drives toolbar disabled-state. |
| `market.store.ts` | `map<{query, items, status, hasMore, cursor}>` | Install dialog's market list state. |
| `upload.store.ts` | `map<{uploads: Record<id, UploadProgress>}>` | Drag-drop upload progress. |
| `dialogs.store.ts` | `map<{install: boolean, uninstallConfirm: {open, keys}}>` | Dialog open/closed flags. |

Derivations:
- `$visibleApps = computed($applications, ({items, filter}) => …)`
- `$selectionInfo = computed($applications, ({selection, byKey}) => {count, canStart, canStop, canUninstall, anySystem})`
- `$isInstalling = computed($appActions, a => Object.keys(a.installing).length > 0)`

## Tasks

- [x] Copy `utils/storage/sync.ts` (and any helpers it imports — `createThrottle`, `normalize`) from CS verbatim — see [references.md §5](./references.md#5-utilsstoragesynts).
- [x] Define `ApplicationDto` and `toDto(app: Application): ApplicationDto` under `v2/features/types/application.ts`. Flat JSON only — no class instances in stores.
- [x] Create each store file with `map<...>` initial value, mutator functions, and computed selectors. Pattern: see CS `app.store.ts` ([references.md §6](./references.md#6-appstorets-pattern)).
- [x] Add Vitest unit tests for every mutator and every computed selector. Aim for one test file per store: `*.store.test.ts`.
- [x] Wire `vitest.config.ts` (new file) — env `node`, aliases for react→preact/compat (mirror lib-admin-ui's vitest config — [references.md §7](./references.md#7-vitestconfigts)).
- [x] Add `pnpm test` script.

## Files to add

- `src/main/resources/assets/js/v2/features/types/application.ts`
- `src/main/resources/assets/js/v2/features/utils/storage/sync.ts`
- `src/main/resources/assets/js/v2/features/store/app.store.ts`
- `src/main/resources/assets/js/v2/features/store/applications.store.ts`
- `src/main/resources/assets/js/v2/features/store/app-actions.store.ts`
- `src/main/resources/assets/js/v2/features/store/market.store.ts`
- `src/main/resources/assets/js/v2/features/store/upload.store.ts`
- `src/main/resources/assets/js/v2/features/store/dialogs.store.ts`
- `*.store.test.ts` next to each
- `vitest.config.ts` — NEW

## Acceptance criteria

- [x] `pnpm test` runs and is green.
- [x] No UI is wired yet; main bundle unchanged in size by more than the cost of nanostores itself. *(Verified by inspection: nothing in `v2/App.tsx` imports the new stores; the bundle change is the tree-shaken footprint of the store modules. Final size check deferred to CI.)*
- [x] Stores have JSDoc on every exported function.

## Notes / gotchas

- **Plain DTOs, not class instances.** `Application` from lib-admin-ui is a class with methods; storing instances breaks structural equality and serialization (e.g. `syncMapStore`). Always convert at the edge.
- **Selection is centralised here.** The old grid did its own selection. Centralising lets every toolbar button derive `disabled` purely from store state.
- **Initialise side-effects at the bottom of the store module** (e.g. theme application). Mirror CS pattern.

## Open questions

- [x] Should we persist `selection` across reloads? CS does not; recommend no. *(Resolved: only `theme` is persisted via `syncMapStore` — `selection`, `filter`, and `page` reset on reload.)*
- [ ] Pagination of the browse grid — current code loads everything. If a tenant has hundreds of apps, plan for virtualization (in Phase 6) but store shape doesn't need to change. *(Deferred to Phase 6.)*
