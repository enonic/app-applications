/**
 * Created on 20.11.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');

describe('applications.grid.sort.spec - ordering the grid by display name, with the system applications shown', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Deployed into home/deploy by ui-tests/build.gradle: a test application the list orders in among
  // the ones XP ships.
  const SIMPLE_SITE = appConst.TEST_APPS.SIMPLE_SITE;
  // The one XP ships that the test waits for.
  const SYSTEM_APP = appConst.SYSTEM_APPS.MAIN;

  const sortedByDisplayName = (names) =>
    [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

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
