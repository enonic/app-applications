# UI tests

Browser tests of the Applications section this app adds to the Settings shell: WebdriverIO 10 +
Mocha against a real XP with the app deployed, Chrome driven over WebDriver Classic.

## What is covered

- `specs/applications.details.panel.spec.js` — the details panel of an application: the empty
  column before a row is clicked, the header and the Details section of a selected test application
  (badge, state, description, version, key, vendor, system required), the Schemas section by kind,
  the switch to another row, and the state dropdown — opened and dismissed, then used to stop and
  start the application, with the row and the toolbar following.
- `specs/applications.stop.start.spec.js` — stopping an application from the toolbar, the state menu
  and the row's context menu, and starting it again, with the State filter counting it on each side.
- `specs/applications.grid.filter.spec.js` — narrowing the grid: by a key typed in the filter (one
  row, counted by the State field), by a description three test applications share (three rows,
  counted by 'Upgrade available: No' and kept once it is picked), and with 'Show system
  applications' on — the applications XP ships listed with their checkboxes greyed, left out by
  'Select all', and one of them opened: Install alone enabled in the toolbar and the context menu, the
  state a plain label in the details and absent from the row.
- `specs/applications.install.dialog.spec.js` — the 'Install applications' dialog: its tabs and
  filter fields, the market list narrowed by text and by Vendor, an application (Chuck Norris)
  installed from the market — the row reading 'Installed', the toast, the grid and the details once
  the dialog is closed — and the Installed filter afterwards. The application is uninstalled again at
  the end, so the suite needs an XP that reaches Enonic Market.

`page_objects/` are the page objects, on three base classes: `section.page.js` (every lookup is CSS
through the section's shadow root; XPath cannot cross one), `browse.page.js` (the browse screen:
toolbar, filter, list header, rows) and `details.panel.js` (the details panel: sections, fields,
subsections, lists). `applications.page.js` and `applications.details.js` name what is this
section's own; `install.app.dialog.js` and `uninstall.app.dialog.js` are its two dialogs. `home.page.js`, `login.page.js` and `menu.sections.rail.js` are the shell's pages,
the same as app-users'.

`libs/app_const.js` holds the labels the section renders and the test applications the specs read;
`libs/settings.utils.js` the flows the specs share (log in, open the Settings app, open a section).

## Running

The suite is a Gradle subproject of this repository. The whole run — unpack an XP distro, deploy the
app, start the server, run the specs, write the Allure report, stop the server — is one task from
the repository root:

```bash
./gradlew build
./gradlew :ui-tests:testApplicationsApp
```

The first command makes `build/libs/app-applications.jar`, which `:ui-tests:deployApp` copies into
the distro in place of the bundled one; pass `-PappUrl=<url>` to deploy another build. The XP version
comes from `xpVersion` in `gradle.properties`; the test applications (`com.enonic.uitest:*`) come
from the `dev` repository.

Against an XP that is already running at `base.url` of `browser.properties`:

```bash
pnpm install
pnpm run test_applications:wdio_chrome
```

both from `ui-tests/`. The report lands in `ui-tests/build/reports/allure-report`, screenshots of
failures in `ui-tests/build/reports/screenshots`.

CI runs the suite as the `ui-tests` job of `.github/workflows/gradle.yml`, after `build`, the same
way app-users does: it downloads the jar the build job uploaded and runs
`:ui-tests:testApplicationsApp`; the Allure report is uploaded as the `ui-test-report` artifact, and a
failure is posted to Slack. Chrome comes preinstalled on the runner (`browser.version` in
`browser.properties` is left unset on purpose — see `wdio.chrome.conf.js`).
