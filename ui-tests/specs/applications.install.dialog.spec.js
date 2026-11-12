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
  //
  // ! The tests run in order and share that install: the ones after 'Install' in the row expect the
  // ! application on the XP, so a failed install fails each of them too - read the first failure.
  const APP = appConst.MARKET_APPS.CHUCK_NORRIS;
  // Set by `before` when the application was on the XP already: Mocha runs `after` even when
  // `before` throws, and `after` must not uninstall what this run did not install.
  let foundInstalled = false;

  it("WHEN 'Install' in the toolbar has been clicked THEN the 'Install applications' dialog should be opened on the 'Enonic Market' tab AND the market list should be loaded", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await applicationsPage.waitForApplicationsListLoaded();
    // 1. Click on 'Install' in the toolbar: the dialog opens.
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    assert.equal(await installAppDialog.getTitle(), appConst.INSTALL_DIALOG.TITLE);
    // 2. Two tabs, 'Enonic Market' the active one; the catalogue is loaded into the list.
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
    // 3. The filter offers License, Vendor, Upgrade available and Installed.
    await installAppDialog.clickOnFilterButton();
    assert.deepEqual(await installAppDialog.getFilterFields(), [
      appConst.INSTALL_DIALOG.FILTER_FIELD.LICENSE,
      appConst.INSTALL_DIALOG.FILTER_FIELD.VENDOR,
      appConst.INSTALL_DIALOG.FILTER_FIELD.UPGRADE,
      appConst.INSTALL_DIALOG.FILTER_FIELD.INSTALLED,
    ]);
    await settingsUtils.saveScreenshot('install_app_dialog_1');
    await installAppDialog.closeFilterPopup();
    // 4. Close the dialog with its cross.
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

  // The version of a market row links to the application's page on Enonic Market, in a new tab.
  it("GIVEN 'Install applications' dialog is narrowed to 'Chuck Norris' WHEN the version link has been clicked THEN the application's page on the Enonic Market should be loaded in a new tab", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.waitForMarketListLoaded(appConst.TIMEOUT.LONG);
    // 1. Narrow the list to the one application; its version is a link to the market.
    await installAppDialog.typeTextInSearchInput(APP.searchText);
    await installAppDialog.waitForRowDisplayed(APP.displayName);
    const pageUrl = await installAppDialog.getMarketAppPageUrl(APP.displayName);
    assert.ok(
      pageUrl !== undefined && pageUrl.startsWith('https://market.enonic.com/'),
      `The version should link to the Enonic Market, not '${pageUrl}'`,
    );
    // 2. Click the link: a new tab opens on that page, the dialog stays where it was.
    const handlesBefore = await settingsUtils.getBrowser().getWindowHandles();
    await installAppDialog.clickOnMarketAppPageLink(APP.displayName);
    await settingsUtils.switchToNewTab(handlesBefore);
    await settingsUtils.waitForPageLoaded();
    assert.equal(await settingsUtils.getBrowser().getUrl(), pageUrl);
    assert.ok(
      (await settingsUtils.getTitle()).includes(APP.displayName),
      'The market page should be titled after the application',
    );
    // 3. Back in the admin tab the dialog is still open on the narrowed list.
    await settingsUtils.getBrowser().switchToWindow(handlesBefore[handlesBefore.length - 1]);
    assert.ok(await installAppDialog.isDialogDisplayed(), 'The dialog should still be open');
    assert.deepEqual(await installAppDialog.getMarketAppDisplayNames(), [APP.displayName]);
    await installAppDialog.clickOnCloseButton();
    await installAppDialog.waitForDialogClosed();
  });

  it("GIVEN 'Chuck Norris' is the one row left in the dialog WHEN 'Install' in the row has been clicked THEN the row should read 'Installed' AND the application should be listed in the grid, 'Started', once the dialog is closed", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    let installAppDialog = new InstallAppDialog();
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
    await installAppDialog.waitForMarketAppDisplayNames([APP.displayName]);
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
    // Check that the application is not a system or a local application, so no badge is shown on its row.
    assert.equal(await applicationsPage.getApplicationBadge(APP.key), undefined);
    // 6. Its details: the header reads the application, 'Started', with a link to the market.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
    assert.equal(await applicationDetails.getKey(), APP.key);
    assert.equal(await applicationDetails.getVersionInstalled(), version);
    await applicationDetails.waitForMarketLinkDisplayed();
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

  it("GIVEN the list is narrowed to 'Chuck Norris' AND 'Select all' has been ticked WHEN the filter has been cleared THEN 'Select all' should be indeterminate AND only 'Chuck Norris' should stay checked", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    const listed = (await applicationsPage.getApplicationDisplayNames()).length;
    // 1. Narrow the list by text: the one application is listed.
    await applicationsPage.typeTextInSearchInput(APP.searchText);
    await applicationsPage.pressEnterKey();
    await applicationsPage.waitForFilterTerm(undefined, APP.searchText);
    await applicationsPage.closeFilterPopup();
    await applicationsPage.waitForApplicationDisplayNames([APP.displayName]);
    // 2. Tick 'Select all': the one listed row is checked, and 'Select all' with it.
    await applicationsPage.clickOnSelectAllCheckbox();
    assert.ok(await applicationsPage.isRowChecked(APP.key), 'The listed row should be checked');
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should be checked while every listed row is",
    );
    await applicationsPage.waitForUninstallButtonEnabled();
    // 3. Clear the filter: every application is listed again.
    await applicationsPage.clickOnClearFilterButton();
    assert.deepEqual(await applicationsPage.getFilterTerms(), [], 'No term should be left');
    await applicationsPage
      .getBrowser()
      .waitUntil(
        async () => (await applicationsPage.getApplicationDisplayNames()).length === listed,
        { timeout: appConst.TIMEOUT.MEDIUM, timeoutMsg: 'The whole list should be back' },
      );
    // 4. The selection survived the filter but no longer covers the list: 'Select all' is
    //    indeterminate, neither checked nor clear.
    assert.equal(
      await applicationsPage.getAttribute(applicationsPage.selectAllCheckbox, 'aria-checked'),
      'mixed',
      "'Select all' should be indeterminate while only some rows are checked",
    );
    // 5. The one row checked is still the one that was selected.
    const checked = [];
    for (const name of await applicationsPage.getApplicationDisplayNames()) {
      const key = await applicationsPage.getApplicationKeyByDisplayName(name);
      if (await applicationsPage.isRowChecked(key)) {
        checked.push(key);
      }
    }
    assert.deepEqual(
      checked,
      [APP.key],
      'Only the application selected under the filter is checked',
    );
    await applicationsPage.waitForUninstallButtonEnabled();
  });

  // The row menu is the toolbar over the row that was right-clicked: Install, Uninstall, Start and
  // Stop, each enabled the way its toolbar button is for that row.
  it("GIVEN 'Chuck Norris' has been stopped from the toolbar WHEN its context menu has been opened THEN Install, Uninstall and Start should be enabled AND 'Uninstall' picked and confirmed should take the application out of the grid", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    let uninstallAppDialog = new UninstallAppDialog();
    // 1. Click on the row: the details open, the application is started.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED);
    // 2. Click on 'Stop' in the toolbar: the details and the row read 'Stopped'.
    await applicationsPage.clickOnStopButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STOPPED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STOPPED);
    // 3. Right-click on the row: Install, Uninstall and Start are enabled, Stop is not.
    await applicationsPage.openContextMenuOnRow(APP.key);
    assert.deepEqual(await applicationsPage.getContextMenuItems(), [
      appConst.TOOLBAR.INSTALL,
      appConst.TOOLBAR.UNINSTALL,
      appConst.TOOLBAR.START,
      appConst.TOOLBAR.STOP,
    ]);
    for (const item of [
      appConst.TOOLBAR.INSTALL,
      appConst.TOOLBAR.UNINSTALL,
      appConst.TOOLBAR.START,
    ]) {
      assert.ok(
        await applicationsPage.isContextMenuItemEnabled(item),
        `'${item}' should be enabled for a stopped application`,
      );
    }
    assert.ok(
      !(await applicationsPage.isContextMenuItemEnabled(appConst.TOOLBAR.STOP)),
      "'Stop' should be disabled for a stopped application",
    );
    // 4. Pick 'Uninstall': the confirmation names the application; confirm it.
    await applicationsPage.clickOnContextMenuItem(appConst.TOOLBAR.UNINSTALL);
    await uninstallAppDialog.waitForDialogOpened();
    assert.equal(await uninstallAppDialog.getTitle(), appConst.UNINSTALL_DIALOG.TITLE);
    assert.equal(await uninstallAppDialog.getQuestion(), appConst.UNINSTALL_DIALOG.QUESTION);
    assert.deepEqual(await uninstallAppDialog.getTargetDisplayNames(), [APP.displayName]);
    assert.ok(
      !(await uninstallAppDialog.isConfirmInputDisplayed()),
      'One application is a click away: no count to type back',
    );
    await uninstallAppDialog.clickOnUninstallButton();
    await uninstallAppDialog.waitForDialogClosed();
    // 5. The toast says so, the row is gone, and the details move on to the first application
    //    listed in place of the one that is no longer there.
    await applicationsPage.waitForExpectedNotificationMessage(
      appConst.applicationUninstalledMessage(APP.displayName),
    );
    await applicationsPage.waitForRowNotDisplayed(APP.key, appConst.TIMEOUT.LONG);
    const [first] = await applicationsPage.getApplicationDisplayNames();
    assert.notEqual(first, APP.displayName, 'The uninstalled application should not be listed');
    await applicationDetails.waitForTitle(first);
  });

  // Leaves the XP as it was found: the application is uninstalled through the section itself
  // whenever a failure left its row there, so the spec can run again. An application `before` found
  // installed is not this run's and is left alone.
  after(async () => {
    if (foundInstalled) {
      return;
    }
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
    // The application must not be on the XP before the run: a failed `before` skips every test,
    // the two that would uninstall it included, where a failed test would not.
    await settingsUtils.navigateToSettingsApp();
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    if (await applicationsPage.isRowDisplayed(APP.key)) {
      foundInstalled = true;
      throw new Error(
        `'${APP.displayName}' is installed on this XP already: uninstall it before running the suite`,
      );
    }
    await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
    return console.log('specification starting: ' + this.title);
  });
});
