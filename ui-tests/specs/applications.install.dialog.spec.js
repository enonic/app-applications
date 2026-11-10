/**
 * Created on 10.11.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');
const InstallAppDialog = require('../page_objects/install.app.dialog');
const UninstallAppDialog = require('../page_objects/uninstall.app.dialog');

describe("applications.install.dialog.spec - the 'Install applications' dialog: the market list narrowed by text and by Vendor, an application installed from it, and what the grid shows once the dialog is closed", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Installed from Enonic Market in this spec, and uninstalled again at the end so the XP is left as
  // it was found. Not a test application: the market has to carry it.
  const APP = appConst.MARKET_APPS.CHUCK_NORRIS;

  it("WHEN 'Install' in the toolbar has been clicked THEN the 'Install applications' dialog should be opened on the 'Enonic Market' tab AND the market list should be loaded", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    // 1. The application is not installed yet: no row in the grid.
    await applicationsPage.waitForApplicationsListLoaded();
    assert.ok(
      !(await applicationsPage.isRowDisplayed(APP.key)),
      `'${APP.displayName}' should not be installed before the test`,
    );
    // 2. Click on 'Install' in the toolbar: the dialog opens.
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    assert.equal(await installAppDialog.getTitle(), appConst.INSTALL_DIALOG.TITLE);
    // 3. Two tabs, 'Enonic Market' the active one; the catalogue is loaded into the list.
    assert.deepEqual(await installAppDialog.getTabs(), [
      appConst.INSTALL_DIALOG.TAB.MARKET,
      appConst.INSTALL_DIALOG.TAB.UPLOAD,
    ]);
    assert.equal(await installAppDialog.getActiveTab(), appConst.INSTALL_DIALOG.TAB.MARKET);
    await installAppDialog.waitForMarketListLoaded(appConst.TIMEOUT.LONG);
    assert.ok(
      (await installAppDialog.getMarketAppDisplayNames()).length > 1,
      'The market list should hold more than one application before it is narrowed',
    );
    assert.equal(await installAppDialog.getListError(), undefined, 'The market should be reached');
    // 4. The filter offers License, Vendor, Upgrade available and Installed.
    await installAppDialog.clickOnFilterButton();
    assert.deepEqual(await installAppDialog.getFilterFields(), [
      appConst.INSTALL_DIALOG.FILTER_FIELD.LICENSE,
      appConst.INSTALL_DIALOG.FILTER_FIELD.VENDOR,
      appConst.INSTALL_DIALOG.FILTER_FIELD.UPGRADE,
      appConst.INSTALL_DIALOG.FILTER_FIELD.INSTALLED,
    ]);
    await settingsUtils.saveScreenshot('install_app_dialog_1');
    await installAppDialog.closeFilterPopup();
    // 5. Close the dialog with its cross.
    await installAppDialog.clickOnCloseButton();
    await installAppDialog.waitForDialogClosed();
  });

  it("GIVEN 'Install applications' dialog is opened WHEN 'chuck' has been typed AND 'Vendor: Enonic' has been picked THEN only 'Chuck Norris' should be listed, offering 'Install'", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.waitForMarketListLoaded(appConst.TIMEOUT.LONG);
    // 1. Type the text: the list narrows to what matches it.
    await installAppDialog.typeTextInSearchInput(APP.searchText);
    await installAppDialog.waitForRowDisplayed(APP.displayName);
    // 2. Open the Vendor field: 'Enonic' counts the one application the text left.
    await installAppDialog.clickOnFilterButton();
    await installAppDialog.clickOnFilterField(appConst.INSTALL_DIALOG.FILTER_FIELD.VENDOR);
    assert.equal(await installAppDialog.getFilterValueCount(APP.vendor), 1);
    // 3. Pick 'Enonic': the term shows as a tag beside the text, the list is the one application.
    await installAppDialog.clickOnFilterValue(APP.vendor);
    await settingsUtils.saveScreenshot('install_app_dialog_vendor_filtered');
    await installAppDialog.waitForFilterTerm(
      appConst.INSTALL_DIALOG.FILTER_FIELD.VENDOR,
      APP.vendor,
    );
    assert.deepEqual(await installAppDialog.getFilterTerms(), [
      { field: undefined, value: APP.searchText },
      { field: appConst.INSTALL_DIALOG.FILTER_FIELD.VENDOR, value: APP.vendor },
    ]);
    await installAppDialog.waitForMarketAppDisplayNames([APP.displayName]);
    assert.ok(
      await installAppDialog.isClearFilterButtonDisplayed(),
      "'Clear the filter' should be shown while the terms are in force",
    );
    // 4. The row: the description, a version linking to the market page, and 'Install' - the
    //    application is not installed.
    assert.equal(await installAppDialog.getMarketAppDescription(APP.displayName), APP.description);
    assert.ok(
      (await installAppDialog.getMarketAppVersion(APP.displayName)).length > 0,
      'The row should show the latest version',
    );
    assert.ok(
      await installAppDialog.isInstallButtonDisplayed(APP.displayName),
      "The row should offer an 'Install' button",
    );
    assert.equal(
      await installAppDialog.getMarketAppAction(APP.displayName),
      appConst.INSTALL_DIALOG.ACTION.INSTALL,
    );
    // 5. Clear the filter: the whole catalogue is back.
    await installAppDialog.clickOnClearFilterButton();
    assert.deepEqual(await installAppDialog.getFilterTerms(), [], 'No term should be left');
    assert.equal(await installAppDialog.getTextInSearchInput(), '');
    await installAppDialog
      .getBrowser()
      .waitUntil(async () => (await installAppDialog.getMarketAppDisplayNames()).length > 1, {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'The whole catalogue should be back',
      });
    await installAppDialog.clickOnCloseButton();
    await installAppDialog.waitForDialogClosed();
  });

  it("GIVEN 'Chuck Norris' is the one row left in the dialog WHEN 'Install' in the row has been clicked THEN the row should read 'Installed' AND the application should be listed in the grid, 'Started', once the dialog is closed", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    let installAppDialog = new InstallAppDialog();
    const listed = (await applicationsPage.getApplicationDisplayNames()).length;
    // 1. Open the dialog and narrow the list to the one application.
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.waitForMarketListLoaded(appConst.TIMEOUT.LONG);
    await installAppDialog.typeTextInSearchInput(APP.searchText);
    await installAppDialog.filterByFieldValue(
      appConst.INSTALL_DIALOG.FILTER_FIELD.VENDOR,
      APP.vendor,
    );
    await installAppDialog.waitForMarketAppDisplayNames([APP.displayName]);
    const version = await installAppDialog.getMarketAppVersion(APP.displayName);
    // 2. Click on 'Install' in the row: the download runs, then the row reads 'Installed' and the
    //    button is gone.
    await installAppDialog.clickOnInstallButton(APP.displayName);
    await installAppDialog.waitForMarketAppAction(
      APP.displayName,
      appConst.INSTALL_DIALOG.ACTION.INSTALLED,
      appConst.TIMEOUT.INSTALL,
    );
    await settingsUtils.saveScreenshot('install_app_dialog_installed');
    assert.ok(
      !(await installAppDialog.isInstallButtonDisplayed(APP.displayName)),
      'An installed application on the latest version has no button',
    );
    // 3. The toast says so.
    await applicationsPage.waitForExpectedNotificationMessage(
      appConst.applicationInstalledMessage(APP.displayName),
    );
    // 4. The filter still holds: the one row stays.
    assert.deepEqual(await installAppDialog.getMarketAppDisplayNames(), [APP.displayName]);
    // 5. Close the dialog: the grid lists the application, started, on the version the market
    //    offered, with no badge - neither a system nor a local application.
    await installAppDialog.clickOnCloseButton();
    await installAppDialog.waitForDialogClosed();
    await applicationsPage.waitForRowDisplayed(APP.key);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STARTED);
    assert.equal(await applicationsPage.getApplicationVersion(APP.key), version);
    assert.equal(
      await applicationsPage.getApplicationDescriptionByDisplayName(APP.displayName),
      APP.description,
    );
    assert.equal(await applicationsPage.getApplicationBadge(APP.key), undefined);
    assert.equal(
      (await applicationsPage.getApplicationDisplayNames()).length,
      listed + 1,
      'One application more should be listed',
    );
    // 6. Its details: the header reads the application, 'Started', with a link to the market.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
    assert.equal(await applicationDetails.getKey(), APP.key);
    assert.equal(await applicationDetails.getVersionInstalled(), version);
    assert.ok(
      await applicationDetails.isMarketLinkDisplayed(),
      'An application from the market links to its market page',
    );
  });

  it("GIVEN 'Chuck Norris' has been installed WHEN the dialog has been opened again THEN its row should read 'Installed' AND the 'Installed' filter should count it", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await applicationsPage.waitForRowDisplayed(APP.key);
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.waitForMarketListLoaded(appConst.TIMEOUT.LONG);
    await installAppDialog.typeTextInSearchInput(APP.searchText);
    // 1. The row remembers the install across a reopen: 'Installed', no button.
    await installAppDialog.waitForMarketAppAction(
      APP.displayName,
      appConst.INSTALL_DIALOG.ACTION.INSTALLED,
    );
    // 2. 'Installed: Yes' counts the one application the text left; 'No' counts nothing and is
    //    withheld - a value with no hit cannot be picked.
    await installAppDialog.clickOnFilterButton();
    await installAppDialog.clickOnFilterField(appConst.INSTALL_DIALOG.FILTER_FIELD.INSTALLED);
    const values = await installAppDialog.getFilterValues();
    assert.deepEqual(values, [
      { label: 'Yes', count: 1, disabled: false },
      { label: 'No', count: 0, disabled: true },
    ]);
    // 3. Pick 'Yes': the term shows as a tag and the application stays the one row.
    await installAppDialog.clickOnFilterValue('Yes');
    await installAppDialog.waitForFilterTerm(appConst.INSTALL_DIALOG.FILTER_FIELD.INSTALLED, 'Yes');
    await settingsUtils.saveScreenshot('install_app_dialog_installed_filtered');
    await installAppDialog.waitForMarketAppDisplayNames([APP.displayName]);
    // 4. Take the text out: every installed application of the catalogue is listed, this one among
    //    them, and every row reads 'Installed' or 'Update'.
    await installAppDialog.removeFilterTerm(undefined, APP.searchText);
    assert.deepEqual(await installAppDialog.getFilterTerms(), [
      { field: appConst.INSTALL_DIALOG.FILTER_FIELD.INSTALLED, value: 'Yes' },
    ]);
    await installAppDialog.waitForRowDisplayed(APP.displayName);
    for (const name of await installAppDialog.getMarketAppDisplayNames()) {
      const action = await installAppDialog.getMarketAppAction(name);
      assert.ok(
        action !== appConst.INSTALL_DIALOG.ACTION.INSTALL,
        `'${name}' is installed, so its row should not offer 'Install' (reads '${action}')`,
      );
    }
    await installAppDialog.clickOnCloseButton();
    await installAppDialog.waitForDialogClosed();
  });

  // Leaves the XP as it was found: the application installed above is uninstalled through the
  // section itself, so the spec can run again.
  after(async () => {
    let applicationsPage = new ApplicationsPage();
    let uninstallAppDialog = new UninstallAppDialog();
    await settingsUtils.navigateToSettingsApp();
    await settingsUtils.navigateToApplicationsSection();
    await applicationsPage.waitForApplicationsListLoaded();
    if (!(await applicationsPage.isRowDisplayed(APP.key))) {
      return;
    }
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationsPage.clickOnUninstallButton();
    await uninstallAppDialog.confirmUninstall();
    await applicationsPage.waitForExpectedNotificationMessage(
      appConst.applicationUninstalledMessage(APP.displayName),
    );
    await applicationsPage.waitForRowNotDisplayed(APP.key, appConst.TIMEOUT.LONG);
    await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  afterEach(() => settingsUtils.doCloseAllWindowTabsAndNavigateToHome());
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    return console.log('specification starting: ' + this.title);
  });
});
