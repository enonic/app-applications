---
paths:
  - 'src/main/resources/assets/js/**'
---

# The host boundary

This app is a guest. The app-settings shell owns the page, the url, the socket and the toast stack,
and hands over what it owns as the `host` object — `shared/sections/contract.ts` is the whole surface.
No rule here has an app-settings counterpart; it is the one thing being a provider adds.

- **Nothing reaches around the host.** No `window.location`, no `history`, no `document.title`, no
  style on anything outside our shadow root. Navigate through `host.navigate`, build hrefs with
  `host.url`, read the sub-path from `shared/routing`.
- **`contract.ts` is byte-identical with app-settings' copy** until `@enonic/toolkit` publishes it.
  Changing it means changing both, or this app compiles against a host that does not implement it.
- **`getHost()` returning `undefined` is an answer, not a bug.** A store's callback outlives the mount
  that armed it; a revoked host's calls are no-ops. Every reader in `shared/{notifications,host}`
  degrades to a no-op — follow that, do not assert.
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
