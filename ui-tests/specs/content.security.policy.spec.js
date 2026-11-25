const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const InstallAppDialog = require('../page_objects/install.app.dialog');

describe("content.security.policy.spec - the Applications section does not violate the Content-Security-Policy the Settings page is served with, and the market origin it adds to 'img-src' lets the icons of Enonic Market load", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // The section this app adds. The policy itself is the shell's, and its header is tested there
  // (app-settings); the sections of Users are tested in app-users.
  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  // How Chrome words a violation in its log: "Refused to load the image '...' because it violates
  // the following Content Security Policy directive: ...".
  const VIOLATION = /Content Security Policy/i;

  // The violations logged since the last read, as their messages.
  async function readViolations() {
    const logs = await settingsUtils.getBrowserLogs();
    return logs.map((entry) => entry.message).filter((message) => VIOLATION.test(message));
  }

  // The section's own icons cannot touch the policy: an installed application's icon is a `data:`
  // uri the server builds. The one thing the section adds to the policy is the market origin in
  // 'img-src', for the icons of the 'Install applications' dialog, which are fetched from Enonic
  // Market: a policy without that origin refuses every one of them, and the dialog shows a generic
  // glyph in its place - no failure anywhere else.
  it("GIVEN SU is logged in WHEN 'Applications' section has been opened by its direct link AND 'Install applications' dialog has listed Enonic Market THEN no Content-Security-Policy violation should be logged AND the market icons should be loaded from another origin", async () => {
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await settingsUtils.navigateToSettingsApp('su', 'password');
    // 1. Start from an empty log.
    await settingsUtils.getBrowserLogs();
    // 2. Load the page at the section: its module, cold, and its list.
    await settingsUtils.openSectionByUrl(APPLICATIONS);
    await settingsUtils.waitForSectionScreenLoaded(APPLICATIONS);
    await applicationsPage.waitForApplicationsListLoaded();
    const violationsBySection = await readViolations();
    // 3. Open the dialog on 'Enonic Market': one icon per row, each requested from the market.
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.waitForMarketListLoaded(appConst.TIMEOUT.LONG);
    await installAppDialog.waitForMarketIconsLoaded(appConst.TIMEOUT.LONG);
    await settingsUtils.saveScreenshot('csp_market_icons');
    const violationsByMarket = await readViolations();
    const iconUrls = await installAppDialog.getMarketIconUrls();
    await installAppDialog.clickOnCloseButton();
    // 4. Verify that the icons came from another origin: the request the policy had to admit.
    const pageOrigin = new URL(await settingsUtils.getBrowser().getUrl()).origin;
    assert.ok(iconUrls.length > 0, 'The market list should show icons');
    assert.ok(
      iconUrls.every((url) => new URL(url).origin !== pageOrigin),
      `Every market icon should come from another origin: ${iconUrls.join(', ')}`,
    );
    // 5. Verify that neither the section nor the market list logged a violation.
    assert.deepEqual(violationsBySection, [], 'Violations were logged by the section');
    assert.deepEqual(violationsByMarket, [], 'Violations were logged by the market list');
  });

  // The control of the test above: with nothing logged it would pass just the same, so the policy
  // is shown to be enforced on this page and its violations to reach the log that test reads.
  it("GIVEN 'Applications' section is opened WHEN the page has requested an image from another origin the policy does not name THEN the request should be refused AND the violation should be logged", async () => {
    await settingsUtils.getBrowserLogs();
    // 1. An image from a host the policy does not name: refused before any request is made.
    await settingsUtils.getBrowser().execute(() => {
      const image = document.createElement('img');
      image.src = 'https://csp-control.invalid/pixel.png';
      document.body.appendChild(image);
      image.remove();
    });
    // 2. Verify that the violation is in the log, and that it names the refused url.
    let violations = [];
    await settingsUtils.getBrowser().waitUntil(
      async () => {
        violations.push(...(await readViolations()));
        return violations.length > 0;
      },
      {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'The refused image should be logged as a Content-Security-Policy violation',
      },
    );
    assert.ok(
      violations.some((message) => message.includes('csp-control.invalid')),
      `The violation should name the refused url: ${violations.join(' | ')}`,
    );
  });
});
