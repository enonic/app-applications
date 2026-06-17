# Phase 5 — Server events → stores

**Status:** Done
**Depends on:** 3, 4
**Blocks:** 6, 7, 8

## Goal

One module subscribes to `ApplicationEvent` (delivered via the lib-admin-ui WebSocket bus) and writes to stores. Components become pure consumers. The old per-panel event handlers go away.

## Tasks

- [x] Create `v2/features/events/applicationEvents.ts`:
  - [x] Expose `registerApplicationEvents()` that calls `ApplicationEvent.on(handler)` from lib-admin-ui. The function is idempotent (module-level `registered` guard) so it can be invoked from multiple boot paths safely. *(Switched from "register on import" — keeping the side effect out of module load lets the event dispatcher be unit-tested without binding to lib-admin-ui's global event bus.)*
  - [x] `handler(ev)` switches on `ev.getEventType()` and calls store mutators (exported as `handleApplicationEvent` for direct unit testing).
- [x] Map every event type to a store action:
  - `INSTALLED` → `getApplication(key)` → `upsertApplication(dto)`, then `clearInstalling(key)`. *(Toast is deferred to a later phase when the new notification surface lands.)*
  - `UNINSTALLED` → `removeApplications([key])` + `clearInstalling(key)`
  - `RESOLVED` → no-op
  - `STARTING` → `markStarting([key])` *(uses the dedicated `$appActions` transient set instead of a per-DTO `transient` field)*
  - `STARTED` → `getApplication(key)` → `upsertApplication(dto)` + `clearStarting([key])`
  - `UPDATED` → `getApplication(key)` → `upsertApplication(dto)`
  - `STOPPING` → `markStopping([key])`
  - `STOPPED` → `getApplication(key)` → `upsertApplication(dto)` + `clearStopping([key])`
  - `UNRESOLVED` → `getApplication(key)` → `upsertApplication(dto)` *(state surfaces as `'unknown'` in the DTO, which the toolbar treats as not-started/not-stopped)*
  - `PROGRESS` → `setInstalling({key, progress})`
- [x] Call `registerApplicationEvents()` once from `App.tsx` (inside `AppElement.initialize()` so it lines up with the WebSocket lifecycle).
- [x] Keep `ServerEventsListener.start()` in `main.ts` as today; the WebSocket lifecycle is unchanged.
- [ ] Audit custom events for removal:
  - [ ] `AppInstalledEvent` — replaced by store, delete *(Deferred to phase 7 when the install dialog stops firing them.)*
  - [ ] `AppUninstalledEvent` — replaced by store, delete *(Deferred to phase 7.)*
  - [ ] `InstallAppPromptEvent` — replaced by `setDialog('install', true)`, delete *(Deferred to phase 7.)*
  - [ ] `Start/Stop/UninstallApplicationEvent` — panel-to-panel signals, delete *(Deferred to phase 6 when the new browse panel ships.)*
  - [ ] `ApplicationUploadStartedEvent` — replaced by `$upload` store, delete *(Deferred to phase 7 when uploads move to the new install dialog.)*
  - [x] Keep removals deferred until the legacy feature is gone (phase 6–7).

## Files to add / change

- `v2/features/events/applicationEvents.ts` — NEW
- `v2/features/events/applicationEvents.test.ts` — NEW (13 cases covering every event type)
- `v2/App.tsx` — call `registerApplicationEvents()` from `AppElement.initialize()`
- Eventually: delete `app/installation/AppInstalledEvent.ts`, `AppUninstalledEvent.ts`, `InstallAppPromptEvent.ts`, etc. (phase 7/8)

## Acceptance criteria

- [ ] In dev, install an app from the legacy install dialog; the new store updates and devtools show the new entries. *(Deferred to CI — needs a running XP instance.)*
- [ ] Disconnect/reconnect WebSocket (kill the XP process briefly) — stores eventually catch up after reconnect. *(Deferred to CI.)*
- [ ] No regressions in the legacy UI (the old browse panel still works because it subscribes to the same events). *(Deferred to CI — Playwright suite in phase 11 will guard this.)*

## Notes / gotchas

- **WebSocket, not SSE.** `eventApiUrl` from CONFIG is `admin:event` — a WS endpoint. `ServerEventsListener` handles reconnect (5 s) and keep-alive (30 s) internally.
- **Events are delivered statically.** `ApplicationEvent.on(handler)` registers a global handler — be careful not to register twice. We guard with a module-level `registered` flag rather than relying on import-time side effects.
- **Disconnect feedback.** `ServerEventsListener.onConnectionLost(cb)` can flip `$app.connected = false`. UI can show a banner. Optional polish, not required for parity.
- **Vitest `window` stub.** `AbstractEvent`'s constructor calls `ClassHelper.getFullName(this)`, which reaches for `window`. The events test stubs `globalThis.window = globalThis` so the lib-admin-ui class system loads in the Node test environment.

## Open questions

- [ ] `UPDATED` requires re-fetching the app. Decide whether to debounce when multiple `UPDATED` events arrive rapidly.
