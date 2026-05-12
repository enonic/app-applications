# Phase 2 — App shell

**Status:** Not started
**Depends on:** 1
**Blocks:** 3, 4, 5, 6, 7, 8

## Goal

Mount a single empty Preact tree as a top-level child (likely on `Body.get()` to allow dialogs to portal correctly). After this phase, the UI is visually unchanged but a Preact root is alive, ready for stores and components to plug in.

## Tasks

- [ ] Create `src/main/resources/assets/js/v2/shared/LegacyElement.tsx` — see [references.md §3](./references.md#3-legacyelementtsx).
  - Subclass `@enonic/lib-admin-ui/ui2/LegacyElement`
  - Override `renderJsx()` to wrap the rendered component in `<IdProvider prefix={this.getPrefix()}>` from `@enonic/ui`
- [ ] Create `src/main/resources/assets/js/v2/App.tsx`:
  - `App` returns `null` initially
  - `class AppElement extends LegacyElement<typeof App>` with `super({}, App)`
  - Singleton `AppElement.initialize()` mirrors CS — see [references.md §4](./references.md#4-apptsx-shape)
- [ ] Edit `js/main.ts`:
  - After `ApplicationAppPanel` instantiation, call `AppElement.initialize()` and append to `Body.get()`
  - Keep all existing lifecycle (server events listener, connection detector, install dialog) untouched for now
- [ ] Temporary verification: have `App` return `<div data-testid="v2-root">v2 mounted</div>` and confirm via devtools, then revert to `null` before merge.

## Files to add / change

- `src/main/resources/assets/js/v2/shared/LegacyElement.tsx` — NEW
- `src/main/resources/assets/js/v2/App.tsx` — NEW
- `src/main/resources/assets/js/main.ts` — boot `AppElement`

## Acceptance criteria

- [ ] App still boots and routes to the browse panel as before.
- [ ] Browser DOM contains a `<div class="contents">` from `AppElement` under `<body>`.
- [ ] No regressions in WDIO/Playwright smoke run.

## Notes / gotchas

- **No automatic unmount.** `LegacyElement` does not call `unmountComponentAtNode`. Subclasses that wire long-lived listeners outside `useEffect` must clean up manually. Stick to `useEffect` cleanup in components and this rarely bites.
- **`IdProvider` wrapping** is required for `@enonic/ui` components with internal ID generation (Dialog, Combobox, etc.) — our subclass always wraps.
- **Mount on `Body.get()`** so dialogs/portals work; the alternative (inside `ApplicationAppPanel`) breaks portaled overlays.

## Open questions

- [ ] Confirm `@enonic/ui` exports `IdProvider` from the top-level barrel (it does per `npm-enonic-ui` audit, but verify post-install).
