---
paths:
  - 'src/main/resources/assets/js/**'
---

# The host boundary

This app is a guest. The app-settings shell owns the page, the url, the socket and the toast stack,
and hands over what it owns as the `host` object — `shared/sections/contract.ts` is the whole surface.
No rule here has an app-settings counterpart; it is the one thing being a provider adds.

- **Nothing reaches around the host.** No `window.location`, no `history`, no `document.title`, no
  style on anything outside our shadow root. Navigate through the frame's `openItem`/`closeItem`, read
  the selected row through `useItemId`.
- **Every declaration in `contract.ts` is identical with app-settings' copy** until `@enonic/ui-types`
  publishes it. Changing a declaration means changing every copy, or this app compiles against a host
  that does not implement it. The hub topic names are not contract: `shared/admin-events/topics.ts`
  carries the ones this section subscribes, copied from the table in app-settings'
  `docs/extensions/docs.md` § Events.
- **The host lives on the frame, one per mount, never at module level.** `main.ts` builds a
  `HostFrame` per `mount` and hands it down through `HostFrameProvider`; components reach it with
  `useHostFrame()`. The host may serve every section of an app from one module instance, so a module
  singleton would be the first mount's host for all of them. This app ships one section, which makes
  that a latent bug rather than a visible one — the shape is the multi-section one regardless.
- **A command never touches the host.** It takes the frame's `notify` as an argument and sends its
  messages there, localized; a store's callback or a service reaches for nothing. What lives for the
  module — the services, the bootstrap, the hub connection — starts with the first mount and stops
  with the last (`mounts` in `main.ts`).
- **A `Readable` never calls back on subscribe.** Read `get()` first, then subscribe for changes:
  `createHostFrame` does it for `path`, `App` for `theme`.
- **`mount` returns its disposer synchronously** (`main.ts`). The bootstrap is not awaited; `App` gates
  on `$bootstrap` instead.
- **Core api urls come from our own server, not from the host.** `config.fields.ts` builds them with
  `portal.apiUrl` — a request to an extension keeps the hosting tool's `baseUri`, so the url anchors at
  the host page anyway — and the client joins its path with `(serverAppUrl)`. It is a url, not a grant:
  XP checks the mount against the _page's_ tool descriptor, so the host tool must still list the api in
  its `apis:`, and a host that does not refuses the call however it was addressed.
- **Events do not cross the contract.** The section connects to the admin events hub itself
  (`app/events.ts`, once per module from the bootstrap) and subscribes the topics it cares about
  through `shared/admin-events`. app-settings owns and publishes those topics; we are a subscriber
  with no event code on the server at all. A gap (`onLoss`) means refetch — nothing is ever replayed.
- **Everything inside the shadow root.** `AppRoot` adopts the stylesheet, sets the theme class and
  portals overlays in; `.dark` never crosses the boundary. Nothing renders to `document.body`.
