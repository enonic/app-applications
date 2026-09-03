# App Applications

The Applications section of Enonic XP's admin, shipped as a `settings.section` admin extension. It is
a **guest**: the app-settings shell discovers it at runtime, creates an open shadow root and calls
`mount({ container, host })` — this app has no page and no admin tool of its own. Single Gradle
project, XP 8.1, TypeScript, Preact (React compat), Tailwind v4, nanostores, `@enonic/ui` ^1.2.0. No
`lib-admin-ui`; the class-based app this replaces is on `master`.

Read `.claude/rules/sections.md` before touching anything under `assets/js/` — the host boundary is
what makes this app different from an ordinary one, and `shared/sections/contract.ts` is its whole
surface. `shared/host/` is how this app consumes it: a `HostFrame` per mount, handed down by context,
the same shape app-users built for its four sections.

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
src/main/java/                  script beans for data no XP JS lib exposes, plus the OSGi
                                component contributing the section's CSP source
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
    shared/                     host (the per-mount frame), api, config, i18n, admin events, ui
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
- **The section contributes its own CSP source.** The page's policy belongs to the host, which seeds
  a strict baseline; the market origin the icons come from is added here, by the
  `AdminExtensionResponseProcessor` in `csp/` — keyed to the extension, run by the platform after the
  host's tool controller, and only for a caller the section's `allow` admits. It **extends**
  `img-src` and never creates it: creating that directive would block every same-origin image on the
  page. So `marketApiUrl` has a Java reader beside the JS one, and the host names no market host.
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

`widgets/`, `shared/ui/` and most of `shared/` are duplicated with app-users on purpose, byte for byte
where the code is the same: `@enonic/ui-kit` and `@enonic/ui-utils` (the `npm-enonic-ui-toolkit`
repository) will extract the common ground, and two identical copies extract as a move. `cmp` against
`../app-users/assets/js` is the drift check. Keep anything written here portable — no reaching for this
app's config, stores or i18n keys beyond what props carry. The browse screen these widgets make up is
specified in the toolkit's `docs/browse-framework.md`; app-settings is a shell now and carries none of
this code.

`AGENTS.md` is a copy of this file for agents that read that name. Edit both, keep them identical.

## Git & GitHub

No conventional commit prefixes. Plain descriptive language throughout.

- **Issue title**: plain descriptive text — `Applications section`, `BrowseList: add infinite scroll`
- **Commit**: `<Issue Title> #<number>`, body in imperative mood, one line per change
- **PR**: title matches the commit; body says what and why, then `Closes #<number>`

Both end with `<sub>*Drafted with AI assistance*</sub>`. No emojis.
