# App Applications

The Applications section of Enonic XP's admin, shipped as a `settings.section` admin extension. It is
a **guest**: the app-settings shell discovers it at runtime, creates an open shadow root and calls
`mount({ container, host })` — this app has no page and no admin tool of its own. Single Gradle
project, XP 8.1, TypeScript, Preact (React compat), Tailwind v4, nanostores, `@enonic/ui` ^1.2.0. No
`lib-admin-ui`; the class-based app this replaces is on `master`.

Read `.claude/rules/sections.md` before touching anything under `assets/js/` — the host boundary is
what makes this app different from an ordinary one, and `shared/sections/contract.ts` is its whole
surface.

## Scripts

| Intent                         | Command                         |
| ------------------------------ | ------------------------------- |
| Verify changes                 | `pnpm check`                    |
| Verify, fixing format and lint | `pnpm check:fix`                |
| Tests                          | `pnpm test` / `pnpm test:watch` |
| Frontend watch build           | `pnpm dev`                      |
| Server-side TS → CommonJS      | `pnpm pack:server`              |
| Build + deploy to local XP     | `./gradlew deploy -Penv=dev`    |

`pnpm check` is what CI runs: format, lint, client typecheck, server typecheck, tests. Reach for
Gradle when descriptors, `build.gradle` or `src/main/java` matter.

## Structure

```
src/main/java/                  script beans — only for data no XP JS lib exposes
src/main/resources/
  admin/extensions/applications/ the descriptor, its icon, and the one controller for the prefix
  apis/graphql/                 the section's own data plane
  lib/                          server modules and bean wrappers
  i18n/phrases.properties       served to the client by the `phrases(locale)` root field
  assets/js/
    app/                        mount glue, bootstrap, App
    pages/applications/         the one section — composition only
    widgets/                    the browse framework
    features/                   user actions: install, uninstall
    entities/                   application, market
    shared/                     host, routing, api, config, i18n, notifications, admin events, ui
```

Imports run one way: `app → pages → widgets/features → entities → shared`. Details in
`.claude/rules/structure.md`.

## Platform facts worth knowing before you debug

Each is load-bearing and each is enforced somewhere in the code:

- **GraalJS serves no bytes and gives the app one JS thread.** The controller answers text only —
  lib-static and any binary response are impossible — and `shared/api` queues requests so two never
  overlap.
- **XP checks an api mount against the _page_, not the caller.** Core api urls are built by our own
  server — `portal.apiUrl`, served as `config.serverAppUrl` — and a request to an extension keeps the
  hosting tool's `baseUri`, so they anchor at the host page anyway. A url is not a grant: the _host
  tool's_ descriptor still has to list the api, and a host that does not answers 403 — the section
  cannot know beforehand.
- **`installUrl` can never move here.** Its allowlist, checksum policy and progress events read core's
  own `AppManagementConfig`, so that call stays core's whatever else a bean absorbs.
- **Install progress is node-local.** Core publishes it `distributed(false)`, and the hub delivers only
  to the sockets on its own node, so a clustered instance fills the bar only where the browser's socket
  and the `installUrl` request met on one node. Neither app can widen that.
- **`@enonic/ui`'s shadow tax is permanent.** Every overlay has to be checked inside the shadow root
  by hand; the test environment is `node` and can never catch it.
- **`@enonic-types` understates nullability** — a field XP omits arrives absent, not null. Api mappers
  turn that into `undefined` at the boundary.
- **Preact and `@enonic/ui` are per provider by design**, and `@enonic/ui` does not tree-shake: a
  section pays roughly 88 kB gz of JS and 15 kB gz of CSS before it renders anything.

## Conventions

`.claude/rules/` holds them, scoped by file pattern: `sections.md`, `structure.md`, `requests.md`,
`stores.md`, `preact.md`, `enonic-ui.md`, `typescript.md`, `testing.md`, `comments.md`. Read the
relevant rule before writing in that area.

Every rule but `sections.md` mirrors one of app-settings' — **the two are edited together.** Where a
provider's copy deliberately differs, its opening line says so. `shared/`, `widgets/` and parts of
`shared/ui/` are duplicated with app-settings on purpose: `@enonic/toolkit` will extract the common
ground, so keep anything written here portable — no reaching for this app's config, stores or i18n
keys beyond what props carry.

`AGENTS.md` is a copy of this file for agents that read that name. Edit both, keep them identical.

## Git & GitHub

No conventional commit prefixes. Plain descriptive language throughout.

- **Issue title**: plain descriptive text — `Applications section`, `BrowseList: add infinite scroll`
- **Commit**: `<Issue Title> #<number>`, body in imperative mood, one line per change
- **PR**: title matches the commit; body says what and why, then `Closes #<number>`

Both end with `<sub>*Drafted with AI assistance*</sub>`. No emojis.
