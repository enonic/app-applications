---
paths:
  - '**/*.store.ts'
  - '**/*.store.tsx'
---

# Nanostores

Mirrors app-settings' `stores.md`, minus its screen-api tier: a screen here reads one domain, so
loading lives in the entity.

- `atom` for a value, `map` for a keyed collection, `computed` for anything derivable — never a
  second atom holding what another one implies.
- A store file holds facts, computed values and the commands that write them. No I/O: it calls an
  `api/` function or a load helper.
- **Loading belongs to the slice**: `entities/<domain>/model/<domain>.load.ts` owns the request, the
  abort and the single-flight join. `ensure*` is what a screen calls; `load*` is a Refresh the user
  asked for.
- **Server-event reaction belongs to a sibling `*.service.ts`** with `start()`/`stop()`, wired in
  `main.ts` and stopped before the host readers it uses. `applications.service.ts` is the shape,
  including the reconnect reload — events missed while the socket was down are never replayed.
- Status is `'loading' | 'ready' | 'error'` on the store the widget renders. A refused command does
  not flip a list to `error`.
- A first load starts from `pages/applications/model/useApplicationsScreen.ts` — one `useEffect`,
  `ensure*`, nothing else.
- Per-screen state (selection, filter, sort) lives in `pages/applications/model/`; domain data does
  not.
- Components read stores with `useStore` from `@nanostores/preact`. A store never imports a component.
