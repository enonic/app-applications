# Phase 5 — Server events → stores

**Status:** Not started
**Depends on:** 3, 4
**Blocks:** 6, 7, 8

## Goal

One module subscribes to `ApplicationEvent` (delivered via the lib-admin-ui WebSocket bus) and writes to stores. Components become pure consumers. The old per-panel event handlers go away.

## Tasks

- [ ] Create `v2/features/events/applicationEvents.ts`:
  - [ ] On module load, call `ApplicationEvent.on(handler)` from lib-admin-ui.
  - [ ] `handler(ev)` switches on `ev.getEventType()` and calls store mutators.
- [ ] Map every event type to a store action:
  - `INSTALLED` → `upsertApp(toDto(...))`, `clearInstalling(key)`, push success toast
  - `UNINSTALLED` → `removeApp(key)`
  - `RESOLVED` → no-op (or breadcrumb log)
  - `STARTING` → `setApp(key, {transient: 'starting'})`
  - `STARTED` → `setApp(key, {state: 'started', transient: null})`
  - `UPDATED` → trigger `getApplication(key)` then `upsertApp`
  - `STOPPING` → `setApp(key, {transient: 'stopping'})`
  - `STOPPED` → `setApp(key, {state: 'stopped', transient: null})`
  - `UNRESOLVED` → `setApp(key, {state: 'unresolved'})`
  - `PROGRESS` → `setInstalling(key, ev.getProgress())`
- [ ] Import the module once from `App.tsx` for its side effect.
- [ ] Keep `ServerEventsListener.start()` in `main.ts` as today; the WebSocket lifecycle is unchanged.
- [ ] Audit custom events for removal:
  - [ ] `AppInstalledEvent` — replaced by store, delete
  - [ ] `AppUninstalledEvent` — replaced by store, delete
  - [ ] `InstallAppPromptEvent` — replaced by `setDialog('install', true)`, delete
  - [ ] `Start/Stop/UninstallApplicationEvent` — panel-to-panel signals, delete
  - [ ] `ApplicationUploadStartedEvent` — replaced by `$upload` store, delete
  - [ ] Keep removals deferred until the legacy feature is gone (phase 6–7).

## Files to add / change

- `v2/features/events/applicationEvents.ts` — NEW
- `v2/App.tsx` — import the events module for side effect
- Eventually: delete `app/installation/AppInstalledEvent.ts`, `AppUninstalledEvent.ts`, `InstallAppPromptEvent.ts`, etc. (phase 7/8)

## Acceptance criteria

- [ ] In dev, install an app from the legacy install dialog; the new store updates and devtools show the new entries.
- [ ] Disconnect/reconnect WebSocket (kill the XP process briefly) — stores eventually catch up after reconnect.
- [ ] No regressions in the legacy UI (the old browse panel still works because it subscribes to the same events).

## Notes / gotchas

- **WebSocket, not SSE.** `eventApiUrl` from CONFIG is `admin:event` — a WS endpoint. `ServerEventsListener` handles reconnect (5 s) and keep-alive (30 s) internally.
- **Events are delivered statically.** `ApplicationEvent.on(handler)` registers a global handler — be careful not to register twice (use a module-level guard or import only from one place).
- **Disconnect feedback.** `ServerEventsListener.onConnectionLost(cb)` can flip `$app.connected = false`. UI can show a banner. Optional polish, not required for parity.

## Open questions

- [ ] `UPDATED` requires re-fetching the app. Decide whether to debounce when multiple `UPDATED` events arrive rapidly.
