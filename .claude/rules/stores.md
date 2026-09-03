---
paths:
  - '**/*.store.ts'
  - '**/*.store.tsx'
---

# Nanostores

## Store kinds

| Kind        | Type           | Mutated by                | Purpose                               |
| ----------- | -------------- | ------------------------- | ------------------------------------- |
| **Fact**    | `atom` / `map` | commands in the same file | single source of truth                |
| **Derived** | `computed`     | never                     | projection of fact stores             |
| **Signal**  | `atom`         | services, subscriptions   | ephemeral event, consumed and cleared |

A fact store never derives from another fact store — use `computed`. A signal store is consumed and
cleared, never cached.

## Conventions

- Stores are prefixed `$`: `$selected`, `$applications`, `$rolesQuery`.
- One domain concept per file. If the file needs "and" to describe it, split it.
- Mutations are exported functions in the store file (`setTheme`, `clear`), not `.set()` calls from
  components.
- Keep types out of a store file, except its own state type and types only its own API uses —
  `i18n.store.ts` carries `PhraseValue` because nothing else does.
- Reload orchestration and per-section subscriptions go in a sibling `<name>.service.ts` with
  `start()`/`stop()`, started from the app root — not in a component effect.

## Loading

One contract, so that "where does this list come from" has one answer.

- **A store file holds no transport.** Facts, `begin<Domain>Load()`, `receive<Domain>(result)` and pure
  commands over what it holds (`receiveApplication`, `removeApplication`), nothing that calls an api.
- **A loader owns the request and the cancelling**, and reports through those two commands. It lives in
  `entities/<domain>/model/<domain>.load.ts` while a section reads that domain alone, and in
  `pages/<section>/model/<section>.screen.ts` once a screen spans several — slices on one layer may not
  import each other, so the page is the lowest layer where domains meet.
- `load<Domain>()` reloads whatever the store holds: the Refresh button, a server event, a reconnect.
  `ensure<Domain>()` is the first visit's load and a no-op on a later one, so caching is a decision at
  one line rather than a side effect of where the load happens to live.
- A first load starts from `pages/<section>/model/use<Section>Screen.ts` — one `useEffect` and nothing
  else. Not from `onMount` on the store: a store that fetches on subscribe hides the request from the
  section that pays for it, and the moment a second domain joins the screen it has to be unpicked.
- Prefer `onMount` for a store that owns a browser subscription, as `theme.store.ts` does.
- Transport and parsing stay out of the store file: `bootstrap.store.ts` holds the `$bootstrap` map
  and its two setters, `bootstrap.ts` owns the request that feeds it.

## Reading

```ts
// ❌ .get() in a render path — no re-render
const rows = $rows.get();

// ✅ reactive
const rows = useStore($rows);

// ✅ subscribe to specific keys of a map store
const { status } = useStore($state, { keys: ['status'] });
```

`.get()` is right in event handlers, inside store files, in helpers outside components, and in
one-time initialization.

## Commands

A command is a mutation the user triggered: start, stop, install, delete, save.
`entities/application/model/application-commands.ts` is the worked example — read it before writing the
second one. `features/<action>/` holds the dialog or wizard that calls a command; the command itself
stays with its domain.

- A command is an `export function` in `entities/<domain>/model/<domain>-commands.ts`, beside the store
  it resyncs.
- **It never writes list state.** A failed command means the list is unchanged, not that the list failed
  to load; flipping a section to `error` over a refused Stop would report the wrong thing.
- **Its notices are localized messages that reach the user through the caller's own mount's
  `HostFrame`** — returned for the caller to toast (`deletePrincipals` in app-users), or sent to the
  frame's `notify` the caller passed in (`application-commands.ts` here, whose uploads report as each
  jar lands). A command never touches the host — one module serves several mounts, and only the
  component tree knows which mount it is in. The mirror of the loading rule — a load failure never
  becomes a notification.
- **The truth comes from a refetch, never from a local edit.** No optimistic writes: the list is a whole
  set fetched in one round trip, so `load<Domain>()` after the command is cheap, while a local state that
  quietly disagrees with the server is not. A command that needs optimism has to argue for it here first.
  **Users is the one section where that rationale fails**, and `replaceUser` is the argument: the list is
  paged, so a reload is a first page and throws away every `Load more` the user has clicked. It is still
  not an optimistic write — the row it puts back is the one the mutation answered with, not a guess — and
  the memberships behind it are invalidated so the panel re-reads them. A create still reloads, because a
  new user may belong on a page nobody has loaded and it moves the provider counts.
- **One request per command, not one per target.** Requests into this app are serialized, so a bulk
  action refetching per key costs as many round trips as it had targets — `resync` in
  `application-commands.ts` reloads the list instead as soon as there are two.
- **It returns `Promise<void>` only when nothing can act on the outcome**, which is what a toolbar action
  is. A caller that must branch — a dialog staying open on failure, a wizard needing the created key —
  gets a `Result` and branches on it, as `installApplication` hands `runMarketInstall` the result it
  waits on. The rule it does not escape is that the failure must land somewhere the user is looking —
  which is what the `notify` argument is for.
- **Silence on success is not a rule, visibility is.** Start and Stop say nothing because the row's state
  cell changes under the user. A command whose effect the screen does not show — and Delete of a row on
  another page is one — notifies instead.

## Section stores

Per-section state (selection, filter, paging cursor) lives in `pages/<section>/model/`. Domain data
lives in `entities/<domain>/model/*.store.ts`. A page store may read an entity store; never the
reverse.
