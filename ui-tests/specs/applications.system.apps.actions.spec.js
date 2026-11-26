const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe("applications.system.apps.actions.spec - a system application on show offers no action but Install: Uninstall, Start and Stop are disabled in the toolbar and in the row's menu", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  const SYSTEM_APP = appConst.SYSTEM_APPS.MAIN;
  const BUTTON = appConst.TOOLBAR;
  const ON_A_SELECTION = [BUTTON.UNINSTALL, BUTTON.START, BUTTON.STOP];

  it("GIVEN the system applications are shown WHEN a system application's row has been clicked THEN 'Install' should be enabled AND 'Uninstall', 'Start' and 'Stop' should be disabled in the toolbar", async () => {
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    // 1. Click on the row: its details open.
    await applicationsPage.clickOnRowByKey(SYSTEM_APP.key);
    await applicationDetails.waitForTitle(SYSTEM_APP.displayName);
    await settingsUtils.saveScreenshot('system_app_toolbar');
    // 2. Install needs no selection and stays enabled; the actions on the selection have nothing
    //    they may act on.
    await applicationsPage.waitForToolbarButtonEnabled(BUTTON.INSTALL);
    for (const label of ON_A_SELECTION) {
      await applicationsPage.waitForToolbarButtonDisabled(label);
    }
  });

  it("GIVEN a system application's row has been right-clicked WHEN the row menu is opened THEN it should offer the four actions with 'Install' alone enabled", async () => {
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.openContextMenuOnRow(SYSTEM_APP.key);
    await settingsUtils.saveScreenshot('system_app_row_menu');
    assert.deepEqual(await applicationsPage.getContextMenuItems(), Object.values(BUTTON));
    assert.ok(
      await applicationsPage.isContextMenuItemEnabled(BUTTON.INSTALL),
      "'Install' should be enabled in the row menu",
    );
    for (const label of ON_A_SELECTION) {
      assert.ok(
        !(await applicationsPage.isContextMenuItemEnabled(label)),
        `'${label}' should be disabled in the row menu of a system application`,
      );
    }
    await applicationsPage.closeContextMenu();
  });

  before(async () => {
    let applicationsPage = new ApplicationsPage();
    await settingsUtils.navigateToSettingsApp('su', 'password', APPLICATIONS);
    await applicationsPage.waitForApplicationsListLoaded();
    // The system applications are listed only while the toggle is on.
    if (!(await applicationsPage.isSystemApplicationsShown())) {
      await applicationsPage.clickOnSystemApplicationsToggle();
      await applicationsPage.waitForSystemApplicationsShown(true);
    }
    await applicationsPage.waitForRowDisplayed(SYSTEM_APP.key);
  });

  // The toggle is left off, the way the other specs expect the list.
  after(async () => {
    let applicationsPage = new ApplicationsPage();
    if (await applicationsPage.isSystemApplicationsShown()) {
      await applicationsPage.clickOnSystemApplicationsToggle();
      await applicationsPage.waitForSystemApplicationsShown(false);
    }
  });
});
