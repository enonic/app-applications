---
paths:
  - '**/*.api.ts'
  - 'src/main/resources/assets/js/shared/api/**'
  - 'src/main/resources/apis/**'
---

# Requests

Mirrors app-settings' `requests.md`. The difference that matters: **urls do not come from a tool
config**, because this app has no page of its own.

## Client side

An `api/` segment is the only place that talks to the server. Two entity slices have one:
`application`, and `market` — what Enonic Market offers, a different domain from what is installed.

- Everything goes through `shared/api` and returns `ResultAsync<T, AppError>` — errors are values.
- **Two url sources, one of them the host's.** Our own data plane is `POST <host.baseUrl>/graphql`, set
  once by `setGraphQlEndpoint` in `app/bootstrap.ts`. XP core's apis come from our own server instead —
  `config.serverAppUrl`, joined with a path by `serverAppUrl()` in `shared/config`. It answers
  `undefined` only before the bootstrap has filled the config store, which is calling too early rather
  than a state to render; a host whose tool descriptor does not mount the api answers 403.
- **One request to this app at a time.** GraalJS gives an application one JS thread, so
  `requestGraphQl` queues; nothing may open a second channel.
- Ask for a root field and a selection (`requestGraphQl`), not a document. `requestGraphQlDocument`
  is for what that cannot express — arguments, variables, a mutation, or a field whose `null` is a
  real answer.
- `requestUploadJson` is the only `XMLHttpRequest`: `fetch` cannot observe upload progress, and the
  jar upload needs it. Keep it portable and put nothing else in it.
- Wire DTOs stay inside the api segment; map to `model/<domain>.types.ts` before returning.
- Pass an `AbortSignal` for anything a user can retrigger.
- Load failures become store state (`status: 'error'`); the outcome of a command the user triggered
  becomes a notification. Never the other way round.

## Server side

One API, `apis/graphql/`, reached through the extension controller rather than mounted on a tool:
`admin/extensions/applications/applications.ts` routes below its own prefix — `post /graphql` to
lib-graphql, `get /_static/*` to the assets, everything else 404.

- **The controller serves text only.** GraalJS puts no bytes on the wire, so lib-static and any
  binary response are out; `.js` must be `text/javascript`.
- Roots stay nullable, and no handler re-checks the role — the platform's gates and the descriptor's
  `allow` already ran.
- A bean is the last resort, for data no XP JS lib exposes: handler in `src/main/java`, a `lib/*.ts`
  wrapper over `__.newBean`, a double in `src/test/mocks/`, and an alias in `vite.config.ts`.
