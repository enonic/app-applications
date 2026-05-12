# Phase 4 — Data layer (`fetch` wrappers)

**Status:** Not started
**Depends on:** 2
**Blocks:** 5, 6, 7, 8

## Goal

Replace the 8 `*Request.ts` classes with plain `async function`s under `v2/features/api/`. No shared HTTP client — each function calls `fetch` directly, throws `AppError` on failure.

## URL & request map

Verbatim from the audit of the existing Request classes:

| Operation | URL | Method | Body | Notes |
|---|---|---|---|---|
| `listApplications(query?)` | `/admin/rest-v2/apps/application/list?query=…` | GET | — | response `{applications: ApplicationJson[]}` |
| `getApplication(key)` | `/admin/rest-v2/apps/application?applicationKey=…` | GET | — | heavy (no timeout) |
| `getApplicationInfo(key)` | `/admin/rest-v2/apps/application/info?applicationKey=…` | GET | — | |
| `startApplications(keys)` | `CONFIG.serverAppApi.start` (absolute) | POST | `{key: string[]}` | |
| `stopApplications(keys)` | `CONFIG.serverAppApi.stop` | POST | `{key: string[]}` | |
| `uninstallApplications(keys)` | `CONFIG.serverAppApi.uninstall` | POST | `{key: string[]}` | |
| `installApplicationFromUrl(url, sha512?)` | `CONFIG.serverAppApi.installUrl` | POST | `{URL, sha512?}` | heavy |
| Upload jar/zip | `CONFIG.serverAppApi.install` | POST multipart | field `file`, filename in `name` | use `fine-uploader` inside Preact for now |
| `listMarketApplications()` | `CONFIG.marketApi` (GraphQL) | POST | `{query: <gql>}` | already on fetch — copy from `ListMarketApplicationsRequest.ts` |

Headers: `Accept: application/json`; for POST JSON also `Content-Type: application/json;charset=UTF-8`. **No CSRF token** — `credentials: 'same-origin'` (default) is enough; cookies authenticate.

Timeouts: replicate `heavyOperation` by **omitting** `AbortSignal`. Default 10 s pattern: `AbortSignal.timeout(10_000)`. Market: 30 s (matches existing `ListMarketApplicationsRequest`).

## Tasks

- [ ] Create `v2/features/utils/url/api.ts` with helpers — see [references.md §8](./references.md#8-utilsurlapits).
- [ ] Create `v2/features/api/errors/AppError.ts` — `Error` with `cause`, status code, optional response message.
- [ ] Create `v2/features/api/applications.ts`:
  - [ ] `listApplications(query?: string)`
  - [ ] `getApplication(key: string)` (heavy)
  - [ ] `getApplicationInfo(key: string)`
  - [ ] `startApplications(keys: string[])`
  - [ ] `stopApplications(keys: string[])`
  - [ ] `uninstallApplications(keys: string[])`
- [ ] Create `v2/features/api/install.ts`:
  - [ ] `installApplicationFromUrl(url: string, sha512?: string)` (heavy)
  - [ ] `uploadApplication(file: File, params?)` — wrap `fine-uploader` later in Phase 7; for now a thin XHR/`fetch` POST will do
- [ ] Create `v2/features/api/market.ts`:
  - [ ] `listMarketApplications(query: string, version: string)` — port `ListMarketApplicationsRequest`, drop `Q.defer`, return native `Promise`.
- [ ] Shared helper `unwrapError(response: Response): never` — parses non-2xx body, throws `AppError`.
- [ ] Vitest tests for each function — mock `fetch` (`vi.spyOn(global, 'fetch')`), one happy + one error case each.

## Canonical shape

```ts
export async function listApplications(query?: string): Promise<ApplicationDto[]> {
  const url = getApiUrl('application/list') + (query ? `?query=${encodeURIComponent(query)}` : '');
  const r = await fetch(url, {
    headers: {'Accept': 'application/json'},
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw await fromResponse(r, 'listApplications');
  const json = (await r.json()) as {applications: ApplicationJson[]};
  return json.applications.map(toDto);
}
```

## Files to add

- `v2/features/utils/url/api.ts`
- `v2/features/api/errors/AppError.ts`
- `v2/features/api/applications.ts`
- `v2/features/api/install.ts`
- `v2/features/api/market.ts`
- `*.test.ts` next to each

## Acceptance criteria

- [ ] All 6+3 fetch functions exist with types and tests.
- [ ] `pnpm test` green.
- [ ] No legacy `*Request.ts` deleted yet (callers still use them); deletion happens in feature phases 6–8.

## Notes / gotchas

- **Server URLs come from `CONFIG`.** Use `CONFIG.getString('serverAppApi.install')` etc. — these are absolute portal URLs injected at HTML render time. Do NOT hardcode `/admin/...` for these.
- **REST-v2 endpoints** use the default admin prefix (`/admin/rest-v2/apps/...`) — no CONFIG key for the base; derive in `api.ts`.
- **Market is cross-origin.** No credentials. Existing code uses `AbortSignal.timeout(30000)`.
- **`Q.Promise` callers** must convert to `async/await`. Lint rule from Phase 1 enforces this in `v2/`.

## Open questions

- [ ] Should `installApplicationFromUrl` return a discriminated union `{kind: 'sync', result} | {kind: 'task', taskId}`? Today the server can respond either way. Leave the union in the type and let Phase 5 (events) settle it.
