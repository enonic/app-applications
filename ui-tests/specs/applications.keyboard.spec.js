const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');
const InstallAppDialog = require('../page_objects/install.app.dialog');

describe('applications.keyboard.spec - the keyboard in the list: the arrows move the row on show, Space ticks it and Escape unticks, and Escape closes the row menu, the filter dropdown, the state menu and the Install dialog', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  // The first two rows of the list, in its order: read once the list is loaded.
  let FIRST, SECOND;

  // The row is the one on show: painted, the list's cursor on it, its details on the right.
  async function assertRowIsShown(row) {
    const applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForRowActive(row.key);
    await new ApplicationDetails().waitForTitle(row.displayName);
    assert.ok(await applicationsPage.isRowHighlighted(row.key), `'${row.key}' should be painted`);
  }

  it('GIVEN the first row has been clicked WHEN ArrowDown has been pressed THEN the second row should be on show AND WHEN ArrowUp has been pressed THEN the first one again', async () => {
    let applicationsPage = new ApplicationsPage();
    // 1. Click on the first row: it takes the focus, and the arrows move from it.
    await applicationsPage.clickOnRowByKey(FIRST.key);
    await assertRowIsShown(FIRST);
    // 2. ArrowDown: the second row.
    await applicationsPage.pressArrowDown();
    await assertRowIsShown(SECOND);
    await settingsUtils.saveScreenshot('keyboard_arrow_down');
    // 3. ArrowUp: the first row again.
    await applicationsPage.pressArrowUp();
    await assertRowIsShown(FIRST);
  });

  it('GIVEN the first row is on show WHEN Space has been pressed THEN the row should be ticked AND the select-all checkbox should turn mixed AND WHEN Space has been pressed again THEN the row should be unticked', async () => {
    let applicationsPage = new ApplicationsPage();
    // 1. Space: the row is ticked, and the list counts it as part of a selection.
    await applicationsPage.pressWhiteSpace();
    await applicationsPage.waitForRowChecked(FIRST.key);
    await settingsUtils
      .getBrowser()
      .waitUntil(() => applicationsPage.isSelectAllCheckboxIndeterminate(), {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'One ticked row of several should leave select-all mixed',
      });
    // 2. Space again: the tick is gone, and select-all with it.
    await applicationsPage.pressWhiteSpace();
    await settingsUtils
      .getBrowser()
      .waitUntil(
        async () =>
          !(await applicationsPage.isRowChecked(FIRST.key)) &&
          !(await applicationsPage.isSelectAllCheckboxIndeterminate()),
        {
          timeout: appConst.TIMEOUT.MEDIUM,
          timeoutMsg: 'The row should be unticked by Space',
        },
      );
  });

  it('GIVEN the first row is ticked WHEN Escape has been pressed THEN the tick should be dropped', async () => {
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.pressWhiteSpace();
    await applicationsPage.waitForRowChecked(FIRST.key);
    await applicationsPage.pressEscKey();
    await settingsUtils
      .getBrowser()
      .waitUntil(async () => !(await applicationsPage.isRowChecked(FIRST.key)), {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'The tick should be dropped by Escape',
      });
  });

  it('GIVEN the row menu, the filter dropdown and the state menu have been opened in turn WHEN Escape has been pressed in each THEN each should close', async () => {
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    // 1. The row menu.
    await applicationsPage.openContextMenuOnRow(FIRST.key);
    await applicationsPage.pressEscKey();
    await applicationsPage.waitForContextMenuClosed();
    // 2. The filter dropdown.
    await applicationsPage.clickOnFilterButton();
    await applicationsPage.waitForFilterPopupOpened();
    await applicationsPage.pressEscKey();
    await applicationsPage.waitForFilterPopupClosed();
    // 3. The state menu in the details of the row on show.
    await applicationDetails.clickOnStateMenuButton();
    await applicationDetails.waitForStateMenuOpened();
    await applicationDetails.pressEscKey();
    await applicationDetails.waitForStateMenuClosed();
    // 4. The row is still on show once everything is closed.
    await assertRowIsShown(FIRST);
  });

  it("GIVEN 'Install applications' dialog is opened WHEN Escape has been pressed THEN the dialog should close", async () => {
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.pressEscKey();
    await installAppDialog.waitForDialogClosed();
  });

  before(async () => {
    let applicationsPage = new ApplicationsPage();
    await settingsUtils.navigateToSettingsApp('su', 'password', APPLICATIONS);
    await applicationsPage.waitForApplicationsListLoaded();
    const names = await applicationsPage.getApplicationDisplayNames();
    assert.ok(names.length >= 2, `The list should hold two rows at least, got ${names.length}`);
    FIRST = {
      displayName: names[0],
      key: await applicationsPage.getApplicationKeyByDisplayName(names[0]),
    };
    SECOND = {
      displayName: names[1],
      key: await applicationsPage.getApplicationKeyByDisplayName(names[1]),
    };
  });
});
