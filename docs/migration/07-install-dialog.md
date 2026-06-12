# Phase 7 — Install dialog

**Status:** Done
**Depends on:** 3, 4, 5
**Blocks:** 9

## Goal

Replace `InstallAppDialog` and its sub-components with a Preact dialog built on `@enonic/ui` `Dialog`, backed by `$market`, `$upload`, `$dialogs` stores. `UninstallApplicationDialog` was already replaced in Phase 6.

## Tasks

- [x] Create `v2/views/install/InstallDialog.tsx`:
  - [x] `@enonic/ui` `Dialog.Root / Portal / Overlay / Content / Header / Body / Footer / Close`
  - [x] Open state from `$dialogs.install`
  - [x] Sections: URL install row, Upload drop zone, Market grid
- [x] Create `v2/views/install/MarketGrid.tsx`:
  - [x] ~~Virtualised via `react-virtuoso`~~ *(Deferred — the registry currently returns <100 items and phase 6 made the same call for the browse grid. Re-evaluate if a tenant report shows hundreds.)*
  - [x] Items from `$market.items`
  - [x] Each item: name, vendor, version for current XP, install button
  - [x] Install button → `installApplicationFromUrl(item.url)`; optimistic-add to `$applications` with `state: 'installing'`; SSE INSTALLED clears it
- [x] Create `v2/views/install/UrlInstallRow.tsx`:
  - [x] `Input` + `Button` for paste-URL flow
  - [x] Validate URL; call `installApplicationFromUrl`
- [x] Create `v2/views/install/UploadDropZone.tsx`:
  - [x] ~~Wraps `fine-uploader` instance in a `useRef`/`useEffect`~~ — uses the XHR-based `uploadApplication()` from phase 4 directly. `fine-uploader` is no longer in the dependency graph for this dialog (still a transitive dep of `lib-admin-ui` until that side cleans up); we saved a `useRef` dance and a ~100 kB dependency footprint by not re-wrapping it.
  - [x] Drag-over state via Tailwind
  - [x] Per-file progress rows read from `$upload.uploads`
  - [x] On done, SSE INSTALLED upserts the app; clear the upload row
- [x] Port version-matching logic from `MarketAppsTreeGridHelper` into `v2/features/store/market.store.ts` (as a `computed` or pure helper). Now exposed as `compareVersionNumbers`, `getMarketAppStatus`, plus the `$marketAppStatuses` / `$visibleMarketItems` computed stores.
- [x] ~~Create `v2/views/install/UninstallConfirmDialog.tsx`~~ — already created in Phase 6 (`v2/views/browse/UninstallConfirmDialog.tsx`).
- [x] Wire all open-dialog actions through `setDialog(...)` store mutators. `BrowseToolbar` and `BrowseContextMenu` now call `openInstallDialog()` instead of firing the legacy `InstallAppPromptEvent`.
- [x] Delete legacy files:
  - [x] `app/installation/InstallAppDialog.ts`
  - [x] `app/installation/InstallAppPromptEvent.ts`
  - [x] `app/installation/ApplicationUploaderEl.ts`
  - [x] `app/installation/AppInstalledEvent.ts`, `AppUninstalledEvent.ts`
  - [x] `app/installation/view/ApplicationInput.ts`, `MarketAppsTreeGrid.ts`, `MarketAppsTreeGridHelper.ts`, `MarketAppViewer.ts`, `MarketListViewer.ts`
  - [x] `app/browse/UninstallApplicationDialog.ts` *(already deleted in Phase 6.)*
  - [x] `app/browse/ApplicationUploadStartedEvent.ts` *(only consumer was `InstallAppDialog`.)*
  - [x] `app/ListMarketApplicationsRequest.ts` (now in `api/market.ts`)
  - [x] `app/resource/InstallUrlApplicationRequest.ts`, `MarketApplicationFetcher.ts`, `ApplicationInstallResult.ts`, `resource/json/ApplicationInstallResultJson.ts`
  - [x] `app/MarketApplication.ts`, `MarketApplicationMetadata.ts`, `MarketApplicationResponse.ts`, `MarketHelper.ts`, `json/MarketApplicationJson.ts`
- [x] Delete corresponding Less:
  - [x] `styles/installation/install-application-dialog.less`
  - [x] `styles/installation/market-app-tree-grid.less` (and the now-empty `styles/installation/` directory)
  - [x] `styles/new/new-schema-dialog.less` *(Kept — still referenced by surviving `app/view/` code. Re-audit when Phase 8 lands.)*
  - [x] `styles/dialog/confirm-upgrade-dialog.less` (and the now-empty `styles/dialog/` directory)

## Acceptance criteria

- [ ] Playwright install/uninstall specs pass. *(Deferred to Phase 11 — the WDIO suite still targets legacy IDs.)*
- [ ] Drag-drop install (jar/zip) works end-to-end against a running XP. *(Deferred to manual QA / Phase 11.)*
- [ ] URL install works. *(Deferred to manual QA / Phase 11.)*
- [ ] Market install (Chuck Norris) works (live network — `@external` tagged). *(Deferred to manual QA / Phase 11.)*
- [x] No references to deleted files remain (`pnpm run check` is clean — both `tsc --noEmit` and `eslint . --quiet --cache`).
- [x] Bundle size delta documented. `pnpm run build:dev` reports `bundle.js 1,236.37 kB / gzip 303.26 kB` (down from 1,625.78 kB / 386.00 kB at Phase 6 tip) and `main.css 8.73 kB / gzip 1.28 kB` (down from 15.32 kB / 2.26 kB).

## Notes / gotchas

- **`fine-uploader` is no longer needed.** The phase 4 `uploadApplication()` wrapper already exposes XHR upload progress; `UploadDropZone` calls it directly inside `useEffect`. This deviates from the original task description (which suggested wrapping `fine-uploader`) but lands fewer LOC and zero new third-party DOM bridges. The package is still in `pnpm-lock.yaml` as a transitive dep of `lib-admin-ui` itself.
- **Multipart upload field name is `file`**; filename via `name` form field. Don't accidentally rename — server reads them by name. Already handled inside `uploadApplication`.
- **Server response shapes**: `installApplicationFromUrl` can return either a synchronous `ApplicationInstallResultJson` or a task ID for long installs. Phase 4 typed this as `InstallResultJson`; today's UI fires the request and waits for the `INSTALLED` server event to reconcile the store, so both branches are handled uniformly.
- **Cross-origin market call** uses `credentials: 'omit'` and `AbortSignal.timeout(30_000)` (see `api/market.ts`); unchanged in this phase.
- **`InstallAppPromptEvent` is gone.** `BrowseToolbar`/`BrowseContextMenu` now call `openInstallDialog()` directly; `main.ts` no longer creates an `InstallAppDialog` instance or binds the legacy event.

## Open questions

- [x] Should we drop `fine-uploader` and write a small `fetch` + progress streaming uploader? **Yes** — done; `UploadDropZone` uses `uploadApplication()`.
- [x] Tabs vs single page for URL / upload / market? **Single page**; matches legacy.
