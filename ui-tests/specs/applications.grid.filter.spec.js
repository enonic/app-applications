/**
 * Created on 12.11.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe("applications.grid.filter.spec - narrowing the grid: by the free text of the filter (a key, a description), by the 'Upgrade available' field, and with the system applications shown", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Deployed into home/deploy by ui-tests/build.gradle: local, started, and the two ID provider
  // ones share the description the text search is run on.
  const ADFS_ID_PROVIDER = appConst.TEST_APPS.ADFS_ID_PROVIDER;
  const AUTH0_ID_PROVIDER = appConst.TEST_APPS.AUTH0_ID_PROVIDER;
  const SIMPLE_SITE = appConst.TEST_APPS.SIMPLE_SITE;
  // The one XP ships that the third test opens.
  const SYSTEM_APP = appConst.SYSTEM_APPS.MAIN;

  it("WHEN the key of 'Test ADFS ID Provider' has been typed in the filter THEN only that application should be listed AND the State field should count it alone", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    // 1. Type the key and press Enter: the text is a tag, the list is the one application.
    await applicationsPage.searchByText(ADFS_ID_PROVIDER.key);
    await applicationsPage.waitForRowDisplayed(ADFS_ID_PROVIDER.key);
    assert.deepEqual(await applicationsPage.getApplicationDisplayNames(), [
      ADFS_ID_PROVIDER.displayName,
    ]);
    assert.deepEqual(await applicationsPage.getFilterTerms(), [
      { field: undefined, value: ADFS_ID_PROVIDER.key },
    ]);
    // 2. Open the State field: 'Started' counts the one application the text left, 'Stopped' none.
    await applicationsPage.clickOnFilterButton();
    await applicationsPage.clickOnFilterField(appConst.FILTER_FIELD.STATE);
    await settingsUtils.saveScreenshot('grid_filter_by_key_state_field');
    assert.equal(await applicationsPage.getFilterValueCount(appConst.APP_STATE.STARTED), 1);
    assert.equal(await applicationsPage.getFilterValueCount(appConst.APP_STATE.STOPPED), 0);
    await applicationsPage.closeFilterPopup();
    // 3. Clear the filter: the whole list is back.
    await applicationsPage.clickOnClearFilterButton();
    assert.deepEqual(await applicationsPage.getFilterTerms(), [], 'No term should be left');
    await applicationsPage
      .getBrowser()
      .waitUntil(async () => (await applicationsPage.getApplicationDisplayNames()).length > 1, {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'More than the one filtered application should be listed again',
      });
  });

  it("WHEN the description shared by two test applications has been typed in the filter THEN the two should be listed AND 'Upgrade available: No' should count them AND picked it should keep the two listed", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    // The description is what the Info field of the details shows; two test applications share it.
    const description = AUTH0_ID_PROVIDER.description;
    const expected = [ADFS_ID_PROVIDER.displayName, AUTH0_ID_PROVIDER.displayName];
    // 1. Type the description and press Enter: the two applications are listed, nothing else.
    await applicationsPage.searchByText(description);
    await applicationsPage.waitForRowDisplayed(AUTH0_ID_PROVIDER.key);
    assert.deepEqual(await applicationsPage.getApplicationDisplayNames(), expected);
    // 2. Open the 'Upgrade available' field: neither is known to the market, so 'No' counts the
    //    two and 'Yes' counts nothing - and is withheld.
    await applicationsPage.clickOnFilterButton();
    await applicationsPage.clickOnFilterField(appConst.FILTER_FIELD.UPGRADE);
    await settingsUtils.saveScreenshot('grid_filter_by_description_upgrade_field');
    assert.equal(await applicationsPage.getFilterValueCount(appConst.FILTER_VALUE.NO), 2);
    assert.equal(await applicationsPage.getFilterValueCount(appConst.FILTER_VALUE.YES), 0);
    const values = await applicationsPage.getFilterValues();
    assert.ok(
      values.find((value) => value.label === appConst.FILTER_VALUE.YES).disabled,
      "'Yes' should be withheld while it counts nothing",
    );
    // 3. Pick 'No': the term joins the text as a tag, and the two applications stay listed.
    await applicationsPage.clickOnFilterValue(appConst.FILTER_VALUE.NO);
    await applicationsPage.waitForFilterTerm(
      appConst.FILTER_FIELD.UPGRADE,
      appConst.FILTER_VALUE.NO,
    );
    assert.deepEqual(await applicationsPage.getFilterTerms(), [
      { field: undefined, value: description },
      { field: appConst.FILTER_FIELD.UPGRADE, value: appConst.FILTER_VALUE.NO },
    ]);
    assert.deepEqual(await applicationsPage.getApplicationDisplayNames(), expected);
    // 4. Clear the filter: the whole list is back.
    await applicationsPage.clickOnClearFilterButton();
    assert.deepEqual(await applicationsPage.getFilterTerms(), [], 'No term should be left');
    await applicationsPage
      .getBrowser()
      .waitUntil(
        async () => (await applicationsPage.getApplicationDisplayNames()).length > expected.length,
        {
          timeout: appConst.TIMEOUT.MEDIUM,
          timeoutMsg: 'More than the two filtered applications should be listed again',
        },
      );
  });

  it("WHEN 'Show system applications' has been clicked THEN the system applications should be listed with their checkboxes disabled AND a clicked one should offer Install only", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.waitForApplicationsListLoaded();
    // Nothing XP ships is listed before the toggle.
    assert.ok(!(await applicationsPage.isSystemApplicationsShown()), 'The toggle should be off');
    assert.deepEqual(await applicationsPage.getSystemApplicationKeys(), []);
    // 1. Click on the toggle: the system applications join the list, each with the badge.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForSystemApplicationsShown(true);
    await applicationsPage.waitForRowDisplayed(SYSTEM_APP.key);
    await settingsUtils.saveScreenshot('grid_system_applications_shown');
    assert.deepEqual(
      (await applicationsPage.getSystemApplicationKeys()).sort(),
      appConst.SYSTEM_APPS.KEYS,
      'The applications XP ships should be listed, each with the badge',
    );
    // 2. Their checkboxes are greyed; a test application's is not.
    for (const key of appConst.SYSTEM_APPS.KEYS) {
      assert.ok(
        !(await applicationsPage.isRowCheckboxEnabled(key)),
        `The checkbox of the system application '${key}' should be disabled`,
      );
    }
    assert.ok(
      await applicationsPage.isRowCheckboxEnabled(SIMPLE_SITE.key),
      'The checkbox of a test application should be enabled',
    );
    // 3. Click on a system application: its details open.
    await applicationsPage.clickOnRowByKey(SYSTEM_APP.key);
    await applicationDetails.waitForTitle(SYSTEM_APP.displayName);
    assert.equal(await applicationDetails.getHeaderBadge(), appConst.APP_BADGE.SYSTEM);
    // 4. The toolbar offers Install only: the row is not one to uninstall, stop or start.
    await applicationsPage.waitForInstallButtonEnabled();
    await applicationsPage.waitForUninstallButtonDisabled();
    await applicationsPage.waitForStartButtonDisabled();
    await applicationsPage.waitForStopButtonDisabled();
    // 5. The details show the state as a plain label, not a dropdown: nothing to switch it to.
    assert.ok(
      !(await applicationDetails.isStateMenuButtonDisplayed()),
      'The state should not be a dropdown for a system application',
    );
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
    // 6. The row shows the same version the details call installed, and no state: an application XP
    //    ships cannot be stopped, so its state cell is left empty by design.
    const version = await applicationDetails.getVersionInstalled();
    assert.ok(version, 'The details should show the installed version');
    assert.equal(
      await applicationsPage.getApplicationVersion(SYSTEM_APP.key),
      version,
      'The row should show the installed version',
    );
    assert.equal(
      await applicationsPage.getApplicationState(SYSTEM_APP.key),
      undefined,
      'The row of a system application should show no state',
    );
    // 7. The context menu says the same as the toolbar: Install enabled, the rest withheld.
    await applicationsPage.openContextMenuOnRow(SYSTEM_APP.key);
    await settingsUtils.saveScreenshot('grid_system_application_context_menu');
    assert.deepEqual(await applicationsPage.getContextMenuItems(), [
      appConst.TOOLBAR.INSTALL,
      appConst.TOOLBAR.UNINSTALL,
      appConst.TOOLBAR.START,
      appConst.TOOLBAR.STOP,
    ]);
    assert.ok(
      await applicationsPage.isContextMenuItemEnabled(appConst.TOOLBAR.INSTALL),
      "'Install' should be enabled",
    );
    for (const label of [
      appConst.TOOLBAR.UNINSTALL,
      appConst.TOOLBAR.START,
      appConst.TOOLBAR.STOP,
    ]) {
      assert.ok(
        !(await applicationsPage.isContextMenuItemEnabled(label)),
        `'${label}' should be disabled for a system application`,
      );
    }
    await applicationsPage.closeContextMenu();
    // 8. Click on the toggle again: the system applications leave the list.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForSystemApplicationsShown(false);
    await applicationsPage.waitForRowNotDisplayed(SYSTEM_APP.key);
    assert.deepEqual(await applicationsPage.getSystemApplicationKeys(), []);
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  afterEach(async () => {
    return await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
  });
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    return console.log('specification starting: ' + this.title);
  });
});
