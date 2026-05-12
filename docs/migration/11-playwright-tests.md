# Phase 11 — Playwright E2E (replace WDIO)

**Status:** Not started
**Depends on:** 1 (only for the dev branch; phase content is independent)
**Blocks:** —

## Goal

Replace the WDIO 9 + Mocha + Allure setup in `testing/` with `@playwright/test`. Server lifecycle (Gradle: `unpackDistro`, `startServer`, `waitForServer`, `stopServer`) stays. Login becomes a single global setup; tests reuse `storageState`. CI updates to upload Playwright HTML report + traces.

## Stack

| Concern | Choice |
|---|---|
| Runner | `@playwright/test ^1.49` |
| Language | TypeScript, strict |
| Browser | Chromium only (matrix can expand later) |
| Reporter | Built-in `list` + `html` (no Allure) |
| Server lifecycle | Existing Gradle tasks |
| Storage | `globalSetup` writes `build/storage/admin.json` |
| Workers | 1, `fullyParallel: false` (matches WDIO `maxInstances: 1`) |

## New `testing/` layout

```
testing/
  package.json                  # rewritten — playwright deps only
  playwright.config.ts          # NEW
  tsconfig.json                 # NEW
  global-setup.ts               # NEW — login, save storageState
  fixtures/
    test.ts                     # extended test with openApplications fixture
  pages/
    application-browse.page.ts
    install-app.dialog.ts
    uninstall-app.dialog.ts
    application-item-statistics.page.ts
    home.page.ts
    login.page.ts
  specs/
    *.spec.ts
  helpers/
    constants.ts
  test-config/                  # unchanged
  build.gradle                  # updated
```

Delete: `wdio.chrome.conf.js`, `browser.properties`, `libs/`, `page_objects/`, `specs/*.spec.js`, `docker-compose.yaml`, `wdio.firefox.conf.js` (if exists).

## Tasks

### Scaffolding

- [ ] Rewrite `testing/package.json`:
  - deps: `@playwright/test ^1.49`, `typescript ^5.9`
  - scripts: `test`, `test:ui`, `test:report`, `postinstall: "playwright install chromium"`
- [ ] Create `testing/tsconfig.json` (Node ESNext, strict).
- [ ] Create `testing/playwright.config.ts`:
  - `testDir: './specs'`
  - `timeout: 120_000`, `expect.timeout: 10_000`
  - `fullyParallel: false`, `workers: 1`
  - `retries: process.env.CI ? 2 : 0`
  - `reporter: [['list'], ['html', {outputFolder: 'build/reports/playwright'}]]`
  - `use.baseURL`, `storageState`, `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
  - `globalSetup: require.resolve('./global-setup')`
  - One Chromium project
- [ ] Create `testing/global-setup.ts`:
  - Launch Chromium, navigate to `baseURL`, fill `su/password`, click login, save `storageState` to `build/storage/admin.json`

### Fixtures

- [ ] Create `testing/fixtures/test.ts`:
  - Extends `base` with `openApplications: () => Promise<void>` that goes to `/` and clicks the Applications tile (Playwright pierces `xp-menu` shadow root automatically)

### Page objects

- [ ] Port `page_objects/page.js` shared helpers — most become unnecessary (Playwright auto-waits). Keep only domain-specific helpers in `pages/`.
- [ ] `pages/login.page.ts`
- [ ] `pages/home.page.ts` — much shorter without manual shadow-DOM piercing
- [ ] `pages/application-browse.page.ts` — port `applications.browse.panel.js`
  - Literal XPath translation first (`page.locator('xpath=//div[contains(@id,"ApplicationBrowsePanel")]')`)
  - Opportunistic refactor to `getByRole`/`getByText` per locator
- [ ] `pages/install-app.dialog.ts`
- [ ] `pages/uninstall-app.dialog.ts`
- [ ] `pages/application-item-statistics.page.ts`

### Specs

Port all 12 specs to `*.spec.ts` (alphabetical to stay searchable):

- [ ] `app.browse.panel.multiple.selections.spec.ts`
- [ ] `app.browse.panel.selection.spec.ts`
- [ ] `app.browse.panel.system.apps.spec.ts`
- [ ] `app.browse.panel.toolbar.spec.ts`
- [ ] `app.item.statistics.action.menu.spec.ts`
- [ ] `app.item.statistics.spec.ts`
- [ ] `app_started.browse.panel.context.menu.spec.ts`
- [ ] `app_stopped.browse.panel.context.menu.spec.ts`
- [ ] `install.app.dialog.search.input.spec.ts`
- [ ] `install.app.dialog.spec.ts` — tag the Chuck Norris install tests `@external`
- [ ] `selection.panel.toggler.spec.ts`
- [ ] `uninstall.app.dialog.spec.ts`

Translation pattern:
- `it(name, async () => …)` → `test(name, async ({page}) => …)`
- `it.skip` → `test.skip` (preserve issue links in comment)
- `beforeEach(navigateToApplicationsApp)` → fixture `openApplications` consumed in each test
- `assert.equal` → `expect`
- `studioUtils.saveScreenshot` calls — delete (failure screenshots are automatic)
- `pause(ms)` — delete (Playwright auto-wait)

### Gradle

- [ ] Edit `testing/build.gradle`:
  - [ ] Keep `unpackDistro`, `copyConfig`, `downloadApps`, `deployApp`, `startServer`, `waitForServer`, `stopServer`
  - [ ] Delete `w_testAppChrome`, `testAppFirefox`, `w_testAppChromeLocal`, `generateReport`, `cleanup`
  - [ ] Add new task:
    ```groovy
    tasks.register('playwrightTest', PnpmTask) {
      dependsOn tasks.named('pnpmInstall'), tasks.named('unpackDistro'), tasks.named('copyConfig'),
                tasks.named('downloadApps'), tasks.named('deployApp'),
                tasks.named('startServer'), tasks.named('waitForServer')
      args = ['exec', 'playwright', 'test']
      environment = ['XP_URL': 'http://localhost:8080/admin']
      finalizedBy 'stopServer'
    }
    ```
  - [ ] Add `playwrightTestLocal` that skips server tasks

### CI

- [ ] Edit `.github/workflows/gradle.yml`:
  - [ ] Rename `selenium-test` job to `e2e-test`
  - [ ] Change matrix entry `w_testAppChrome` → `playwrightTest`
  - [ ] Add Playwright browser cache step keyed on `testing/pnpm-lock.yaml`
  - [ ] Update artifact upload path to include `testing/build/reports/playwright/` (HTML report) and `testing/build/reports/playwright-output/` (traces)

### Cleanup

- [ ] Delete `testing/wdio.chrome.conf.js`
- [ ] Delete `testing/browser.properties`
- [ ] Delete `testing/libs/`
- [ ] Delete `testing/page_objects/`
- [ ] Delete `testing/specs/*.spec.js`
- [ ] Delete `testing/docker-compose.yaml`
- [ ] Delete `testing/wdio.firefox.conf.js` (if present)

## Acceptance criteria

- [ ] `./gradlew :testing:playwrightTest` runs green locally and in CI.
- [ ] All 12 spec equivalents present and passing (or `@external`-tagged where applicable).
- [ ] Artifacts uploaded on failure (HTML report + trace).
- [ ] Old WDIO surface deleted.

## Sequencing

The Playwright port runs **against the current UI** (XPath-by-id locators continue to work). Land in this order:

1. Scaffold + login spec → first green run
2. Port `home.page.ts` + `login.page.ts` + smoke spec
3. Port `application-browse.page.ts` + 4 browse specs
4. Port install dialog + install specs
5. Port uninstall + uninstall spec
6. Port statistics + 2 statistics specs
7. Gradle + CI swap
8. Delete WDIO surface

Once 1–8 are green, every subsequent UI-feature PR uses Playwright as its acceptance test. As UI features migrate (Phases 6–8), update locators to `data-testid` opportunistically.

## Notes / gotchas

- **Shadow DOM**: `xp-menu` is open shadow DOM (CS works fine). Playwright pierces it automatically; no special path needed.
- **External network**: Chuck Norris install tests need `repo.enonic.com`. Tag `@external`; keep enabled in CI by default; document offline mode is `playwright test --grep-invert @external`.
- **Snapshot-stale screenshots** — current WDIO suite takes screenshots on success too; Playwright only on failure. Don't try to preserve that — it was noise.
- **`addCommand`** — none used; nothing to port.

## Open questions

- [ ] Add Firefox project later? Defer until Chromium is stable.
- [ ] Auth0/ADFS id-provider tests — are these covered today? Audit before final delete of the WDIO suite.
