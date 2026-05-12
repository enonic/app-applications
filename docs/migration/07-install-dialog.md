# Phase 7 — Install dialog

**Status:** Not started
**Depends on:** 3, 4, 5
**Blocks:** 9

## Goal

Replace `InstallAppDialog` and its sub-components with a Preact dialog built on `@enonic/ui` `Dialog`, backed by `$market`, `$upload`, `$dialogs` stores. Also replace `UninstallApplicationDialog`.

## Tasks

- [ ] Create `v2/views/install/InstallDialog.tsx`:
  - [ ] `@enonic/ui` `Dialog.Root / Portal / Overlay / Content / Header / Body / Footer / Close`
  - [ ] Open state from `$dialogs.install`
  - [ ] Sections: URL install row, Upload drop zone, Market grid
- [ ] Create `v2/views/install/MarketGrid.tsx`:
  - [ ] Virtualised via `react-virtuoso` (peer dep of `@enonic/ui`)
  - [ ] Items from `$market.items`
  - [ ] Each item: name, vendor, version for current XP, install button
  - [ ] Install button → `installApplicationFromUrl(item.url)`; optimistic-add to `$applications` with `state: 'installing'`; SSE INSTALLED clears it
- [ ] Create `v2/views/install/UrlInstallRow.tsx`:
  - [ ] `Input` + `Button` for paste-URL flow
  - [ ] Validate URL; call `installApplicationFromUrl`
- [ ] Create `v2/views/install/UploadDropZone.tsx`:
  - [ ] Wraps `fine-uploader` instance in a `useRef`/`useEffect`
  - [ ] Drag-over state via Tailwind
  - [ ] Per-file progress rows read from `$upload.uploads`
  - [ ] On done, SSE INSTALLED upserts the app; clear the upload row
- [ ] Port version-matching logic from `MarketAppsTreeGridHelper` into `v2/features/store/market.store.ts` (as a `computed` or pure helper).
- [ ] Create `v2/views/install/UninstallConfirmDialog.tsx`:
  - [ ] `ConfirmationDialog` pattern from `@enonic/ui`
  - [ ] Open from `$dialogs.uninstallConfirm`
  - [ ] On confirm: `uninstallApplications(keys)` → SSE clears rows
- [ ] Wire all open-dialog actions through `setDialog(...)` store mutators.
- [ ] Delete legacy files:
  - [ ] `app/installation/InstallAppDialog.ts`
  - [ ] `app/installation/InstallAppPromptEvent.ts`
  - [ ] `app/installation/ApplicationUploaderEl.ts` (replaced by `UploadDropZone` wrapping fine-uploader directly)
  - [ ] `app/installation/AppInstalledEvent.ts`, `AppUninstalledEvent.ts`
  - [ ] `app/installation/view/ApplicationInput.ts`, `MarketAppsTreeGrid.ts`, `MarketAppsTreeGridHelper.ts`, `MarketAppViewer.ts`, `MarketListViewer.ts`
  - [ ] `app/browse/UninstallApplicationDialog.ts`
  - [ ] `app/ListMarketApplicationsRequest.ts` (now in `api/market.ts`)
  - [ ] `app/resource/InstallUrlApplicationRequest.ts`
  - [ ] `app/MarketApplication.ts`, `MarketApplicationMetadata.ts`, `MarketApplicationResponse.ts`, `MarketHelper.ts` — replace with flat types
- [ ] Delete corresponding Less:
  - [ ] `styles/installation/install-application-dialog.less`
  - [ ] `styles/installation/market-app-tree-grid.less`
  - [ ] `styles/new/new-schema-dialog.less` (audit — was it ever needed here?)
  - [ ] `styles/dialog/confirm-upgrade-dialog.less`

## Acceptance criteria

- [ ] Playwright install/uninstall specs pass.
- [ ] Drag-drop install (jar/zip) works end-to-end against a running XP.
- [ ] URL install works.
- [ ] Market install (Chuck Norris) works (live network — `@external` tagged).
- [ ] No references to deleted files remain.

## Notes / gotchas

- **`fine-uploader` is third-party and not React-aware.** Manage its instance imperatively inside `useEffect`; clean up in the cleanup function. Push progress to `$upload`, never bypass.
- **Multipart upload field name is `file`**; filename via `name` form field. Don't accidentally rename — server reads them by name.
- **Server response shapes**: `installApplicationFromUrl` can return either a synchronous `ApplicationInstallResultJson` or a task ID for long installs. Phase 4 typed this as a discriminated union — handle both branches.
- **Cross-origin market call** uses `mode: 'cors'`, no `credentials`. Existing code uses `AbortSignal.timeout(30000)`.

## Open questions

- [ ] Should we drop `fine-uploader` and write a small `fetch` + progress streaming uploader? Recommend NO for this phase — keep `fine-uploader`, replace it later if value emerges.
- [ ] Tabs vs single page for URL / upload / market? Today is single page; preserve unless UX wants tabs.
