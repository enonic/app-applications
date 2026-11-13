/**
 * Created on 12.11.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe("applications.grid.filter.spec - narrowing the grid: by the free text of the filter (a key, a description), by the 'Upgrade available' field, and with the system applications shown - and ordering it with them shown", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Deployed into home/deploy by ui-tests/build.gradle: local, started, and three of them share the
  // one description the text search is run on.
  const ADFS_ID_PROVIDER = appConst.TEST_APPS.ADFS_ID_PROVIDER;
  const AUTH0_ID_PROVIDER = appConst.TEST_APPS.AUTH0_ID_PROVIDER;
  const TEST_SELENIUM = appConst.TEST_APPS.TEST_SELENIUM;
  const SIMPLE_SITE = appConst.TEST_APPS.SIMPLE_SITE;
  // The one XP ships that the third test opens.
  const SYSTEM_APP = appConst.SYSTEM_APPS.MAIN;

  const sortedByDisplayName = (names) =>
    [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

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

  it("WHEN the description shared by three test applications has been typed in the filter THEN the three should be listed AND 'Upgrade available: No' should count them AND picked it should keep the three listed", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    // The description is what the Info field of the details shows; three test applications share it.
    const description = TEST_SELENIUM.description;
    const expected = [
      ADFS_ID_PROVIDER.displayName,
      AUTH0_ID_PROVIDER.displayName,
      TEST_SELENIUM.displayName,
    ];
    // 1. Type the description and press Enter: the three applications are listed, nothing else.
    await applicationsPage.searchByText(description);
    await applicationsPage.waitForRowDisplayed(TEST_SELENIUM.key);
    assert.deepEqual(await applicationsPage.getApplicationDisplayNames(), expected);
    // 2. Open the 'Upgrade available' field: none of the three is known to the market, so 'No'
    //    counts the three and 'Yes' counts nothing - and is withheld.
    await applicationsPage.clickOnFilterButton();
    await applicationsPage.clickOnFilterField(appConst.FILTER_FIELD.UPGRADE);
    await settingsUtils.saveScreenshot('grid_filter_by_description_upgrade_field');
    assert.equal(await applicationsPage.getFilterValueCount(appConst.FILTER_VALUE.NO), 3);
    assert.equal(await applicationsPage.getFilterValueCount(appConst.FILTER_VALUE.YES), 0);
    const values = await applicationsPage.getFilterValues();
    assert.ok(
      values.find((value) => value.label === appConst.FILTER_VALUE.YES).disabled,
      "'Yes' should be withheld while it counts nothing",
    );
    // 3. Pick 'No': the term joins the text as a tag, and the three applications stay listed.
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
          timeoutMsg: 'More than the three filtered applications should be listed again',
        },
      );
  });

  // The applications XP ships are not the operator's to act on: their rows open like any other,
  // but cannot be ticked, stopped or uninstalled, and show no state.
  it("WHEN 'Show system applications' has been clicked THEN the system applications should be listed with their checkboxes disabled AND 'Select all' should leave them unchecked AND a clicked one should offer Install only", async () => {
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
    // 3. Tick 'Select all': the test applications are checked, the system ones are left out - and
    //    'Select all' still reads as checked, since it covers every row that can be ticked.
    await applicationsPage.clickOnSelectAllCheckbox();
    assert.ok(
      await applicationsPage.isRowChecked(SIMPLE_SITE.key),
      'A test application should be checked',
    );
    for (const key of appConst.SYSTEM_APPS.KEYS) {
      assert.ok(
        !(await applicationsPage.isRowChecked(key)),
        `The system application '${key}' should not be checked`,
      );
    }
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should be checked while every row that can be ticked is",
    );
    // 4. Untick 'Select all', then click on a system application: its details open.
    await applicationsPage.clickOnSelectAllCheckbox();
    assert.ok(
      !(await applicationsPage.isRowChecked(SIMPLE_SITE.key)),
      'Nothing should stay checked',
    );
    await applicationsPage.clickOnRowByKey(SYSTEM_APP.key);
    await applicationDetails.waitForTitle(SYSTEM_APP.displayName);
    assert.equal(await applicationDetails.getHeaderBadge(), appConst.APP_BADGE.SYSTEM);
    // 5. The toolbar offers Install only: the row is not one to uninstall, stop or start.
    await applicationsPage.waitForInstallButtonEnabled();
    await applicationsPage.waitForUninstallButtonDisabled();
    await applicationsPage.waitForStartButtonDisabled();
    await applicationsPage.waitForStopButtonDisabled();
    // 6. The details show the state as a plain label, not a dropdown: nothing to switch it to.
    assert.ok(
      !(await applicationDetails.isStateMenuButtonDisplayed()),
      'The state should not be a dropdown for a system application',
    );
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
    // 7. The row shows the version the details call installed, but no state. An empty string is
    //    what the row's empty state cell reads as once the version is missing, so the row is held to
    //    the panel's value rather than to being defined.
    const version = await applicationDetails.getVersionInstalled();
    assert.ok(version, 'The details should show the installed version');
    assert.equal(
      await applicationsPage.getApplicationVersion(SYSTEM_APP.key),
      version,
      'The row should show the installed version',
    );
    // TODO: uncomment when the row of a system application shows the state, too.
    // assert.equal(
    //   await applicationsPage.getApplicationState(SYSTEM_APP.key),
    //   'Started',
    //   'Started state should be displayed in the row of a system application',
    // );
    // 8. The context menu says the same as the toolbar: Install enabled, the rest withheld.
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
    // 9. Click on the toggle again: the system applications leave the list.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForSystemApplicationsShown(false);
    await applicationsPage.waitForRowNotDisplayed(SYSTEM_APP.key);
    assert.deepEqual(await applicationsPage.getSystemApplicationKeys(), []);
  });

  // The list orders every row by display name, the system applications in among the rest rather
  // than grouped at either end, and 'Display name (Z–A)' turns the whole order around.
  it("WHEN 'Show system applications' has been clicked THEN the list should be in 'Display name (A–Z)' order with the system applications in among the rest AND 'Display name (Z–A)' should reverse the whole list", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    // 1. Click on the toggle: the system applications join the list.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForSystemApplicationsShown(true);
    await applicationsPage.waitForRowDisplayed(SYSTEM_APP.key);
    // 2. The order is still the default one, 'Display name (A–Z)', and the Sort by button is not lit.
    assert.equal(
      await applicationsPage.getSelectedSortOrder(),
      appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC,
    );
    assert.ok(
      !(await applicationsPage.isSortButtonActive()),
      'The Sort by button should not be lit while the default order holds',
    );
    // 3. The rows are in A–Z order, a system application and a test one both among them.
    const ascending = await applicationsPage.getApplicationDisplayNames();
    await settingsUtils.saveScreenshot('grid_system_applications_sorted_asc');
    assert.ok(ascending.includes(SYSTEM_APP.displayName), 'A system application should be listed');
    assert.ok(ascending.includes(SIMPLE_SITE.displayName), 'A test application should be listed');
    assert.deepEqual(
      ascending,
      sortedByDisplayName(ascending),
      'The rows should be in A–Z order, the system applications in among the rest',
    );
    // 4. Pick 'Display name (Z–A)': the Sort by button lights, and the list is the same rows reversed.
    await applicationsPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    await applicationsPage.waitForSelectedSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_DESC);
    assert.ok(
      await applicationsPage.isSortButtonActive(),
      'The Sort by button should be lit while the order is not the default one',
    );
    await applicationsPage.waitForRowDisplayed(SYSTEM_APP.key);
    await settingsUtils.saveScreenshot('grid_system_applications_sorted_desc');
    assert.deepEqual(
      await applicationsPage.getApplicationDisplayNames(),
      [...ascending].reverse(),
      'The rows should be in Z–A order, the system applications in among the rest',
    );
    // 5. Pick 'Display name (A–Z)' again: the list is back as it was, the button no longer lit.
    await applicationsPage.selectSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC);
    await applicationsPage.waitForSelectedSortOrder(appConst.SORT_MENU_ITEM.DISPLAY_NAME_ASC);
    assert.ok(
      !(await applicationsPage.isSortButtonActive()),
      'The Sort by button should not be lit once the default order holds again',
    );
    assert.deepEqual(await applicationsPage.getApplicationDisplayNames(), ascending);
    // 6. Click on the toggle again: the system applications leave the list.
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
