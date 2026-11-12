/**
 * Created on 10.11.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe('applications.stop.start.spec - stopping an application from the toolbar and starting it again from the details header: what the details, the row, the toolbar and the State filter say in each state', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // A test application deployed into home/deploy by ui-tests/build.gradle: local, started, and the
  // section may stop it.
  const APP = appConst.TEST_APPS.SIMPLE_SITE;

  it("GIVEN 'Simple Site App' row has been clicked WHEN 'Stop' in the toolbar has been clicked THEN the details should keep the application's data AND the state button should read 'Stopped' AND the row should read 'Stopped'", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    // 1. Click on the row: the details open, the toolbar offers Stop for the started application.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED);
    await applicationsPage.waitForStopButtonEnabled();
    // 2. Click on 'Stop' in the toolbar: the state button in the details reads 'Stopped'.
    await applicationsPage.clickOnStopButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STOPPED, appConst.TIMEOUT.LONG);
    // 3. The details are still the same application's: the header and the Details section.
    assert.equal(await applicationDetails.getTitle(), APP.displayName);
    assert.equal(await applicationDetails.getHeaderBadge(), appConst.APP_BADGE.LOCAL);
    assert.equal(await applicationDetails.getInfo(), APP.description);
    assert.equal(await applicationDetails.getKey(), APP.key);
    assert.equal(
      await applicationDetails.getVersionInstalled(),
      await applicationsPage.getApplicationVersion(APP.key),
      'The version installed should be the one the row shows',
    );
    // 4. 'Stopped' is a dropdown too: the application can be started from here.
    assert.ok(
      await applicationDetails.isStateMenuButtonDisplayed(),
      'The state should stay a dropdown while the application is stopped',
    );
    // 5. A stopped application declares no schemas: the Schemas section is gone.
    await applicationDetails.waitForSectionNotDisplayed(ApplicationDetails.SECTION.SCHEMAS);
    // 6. The row reads 'Stopped' as well, and the toolbar offers Start in place of Stop.
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STOPPED);
    await applicationsPage.waitForStartButtonEnabled();
    await applicationsPage.waitForStopButtonDisabled();
    // 7. Start it again from the toolbar, so the application is left as it was found.
    await applicationsPage.clickOnStartButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STARTED);
  });

  it("GIVEN 'Simple Site App' has been stopped from the toolbar WHEN 'Start' has been picked in the state menu THEN the application should be started again AND the State filter should count it on each side of the change", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    // The State filter counts the data, so the totals come from it rather than from the rows.
    await applicationsPage.clickOnFilterButton();
    await applicationsPage.clickOnFilterField(appConst.FILTER_FIELD.STATE);
    const started = await applicationsPage.getFilterValueCount(appConst.APP_STATE.STARTED);
    assert.equal(await applicationsPage.getFilterValueCount(appConst.APP_STATE.STOPPED), 0);
    await applicationsPage.closeFilterPopup();
    // 1. Click on the row and stop the application from the toolbar.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    await applicationsPage.clickOnStopButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STOPPED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STOPPED);
    // 2. The State filter counts the stopped application: 'Stopped (1)', one 'Started' less.
    await applicationsPage.clickOnFilterButton();
    await applicationsPage.clickOnFilterField(appConst.FILTER_FIELD.STATE);
    assert.equal(await applicationsPage.getFilterValueCount(appConst.APP_STATE.STOPPED), 1);
    assert.equal(
      await applicationsPage.getFilterValueCount(appConst.APP_STATE.STARTED),
      started - 1,
      'Every other application should still count as started',
    );
    // 3. Pick 'Stopped': the term shows as a tag and the list narrows to the one application.
    await applicationsPage.clickOnFilterValue(appConst.APP_STATE.STOPPED);
    await applicationsPage.waitForFilterTerm(
      appConst.FILTER_FIELD.STATE,
      appConst.APP_STATE.STOPPED,
    );
    await applicationsPage.waitForApplicationDisplayNames([APP.displayName]);
    assert.ok(
      await applicationsPage.isClearFilterButtonDisplayed(),
      "'Clear the filter' should be shown while a term is in force",
    );
    // 4. Clear the filter: every application is listed again.
    await applicationsPage.clickOnClearFilterButton();
    assert.deepEqual(await applicationsPage.getFilterTerms(), [], 'No term should be left');
    await applicationsPage.waitForRowCountGreaterThan(1);
    // 5. Once the state button reads 'Stopped', pick 'Start' in its menu.
    await applicationDetails.clickOnStateMenuButton();
    assert.deepEqual(await applicationDetails.getStateMenuItems(), [appConst.TOOLBAR.START]);
    await applicationDetails.clickOnStateMenuItem(appConst.TOOLBAR.START);
    // 6. Back to the initial state: the details, the row and the toolbar.
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STARTED);
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonDisabled();
    await applicationDetails.waitForSectionDisplayed(ApplicationDetails.SECTION.SCHEMAS);
    // 7. The State filter follows: nothing is stopped any more, the 'Started' count is back.
    await applicationsPage.clickOnFilterButton();
    await applicationsPage.clickOnFilterField(appConst.FILTER_FIELD.STATE);
    assert.equal(await applicationsPage.getFilterValueCount(appConst.APP_STATE.STOPPED), 0);
    assert.equal(await applicationsPage.getFilterValueCount(appConst.APP_STATE.STARTED), started);
    await settingsUtils.saveScreenshot('app_details_panel_state_filter');
    // 8. Pick 'Started': the application passes, the tag says so.
    await applicationsPage.clickOnFilterValue(appConst.APP_STATE.STARTED);
    await applicationsPage.waitForFilterTerm(
      appConst.FILTER_FIELD.STATE,
      appConst.APP_STATE.STARTED,
    );
    await applicationsPage.waitForRowDisplayed(APP.key);
    await applicationsPage.removeFilterTerm(
      appConst.FILTER_FIELD.STATE,
      appConst.APP_STATE.STARTED,
    );
    assert.deepEqual(await applicationsPage.getFilterTerms(), []);
  });

  // The row menu is the toolbar over the row that was right-clicked: Install, Uninstall, Start and
  // Stop, each enabled the way its toolbar button is for that row.
  it("GIVEN 'Simple Site App' has been stopped from its context menu AND the list is filtered by 'State: Stopped' WHEN 'Start' has been picked in the context menu THEN the application should be started AND the filtered list should be empty until the filter is cleared", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    // 1. Click on the row: the details open.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED);
    // 2. Right-click on the row: the menu offers Stop for the started application, not Start.
    await applicationsPage.openContextMenuOnRow(APP.key);
    assert.deepEqual(await applicationsPage.getContextMenuItems(), [
      appConst.TOOLBAR.INSTALL,
      appConst.TOOLBAR.UNINSTALL,
      appConst.TOOLBAR.START,
      appConst.TOOLBAR.STOP,
    ]);
    assert.ok(
      await applicationsPage.isContextMenuItemEnabled(appConst.TOOLBAR.STOP),
      "'Stop' should be enabled for a started application",
    );
    assert.ok(
      !(await applicationsPage.isContextMenuItemEnabled(appConst.TOOLBAR.START)),
      "'Start' should be disabled for a started application",
    );
    // 3. Pick 'Stop': the details and the row read 'Stopped'.
    await applicationsPage.clickOnContextMenuItem(appConst.TOOLBAR.STOP);
    await applicationDetails.waitForState(appConst.APP_STATE.STOPPED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STOPPED);
    // 4. Filter by 'State: Stopped': the one stopped application is listed.
    await applicationsPage.filterByFieldValue(
      appConst.FILTER_FIELD.STATE,
      appConst.APP_STATE.STOPPED,
    );
    await applicationsPage.waitForFilterTerm(
      appConst.FILTER_FIELD.STATE,
      appConst.APP_STATE.STOPPED,
    );
    await applicationsPage.waitForApplicationDisplayNames([APP.displayName]);
    // 5. Right-click on the filtered row: now the menu offers Start, not Stop. Pick 'Start'.
    await applicationsPage.openContextMenuOnRow(APP.key);
    assert.ok(
      await applicationsPage.isContextMenuItemEnabled(appConst.TOOLBAR.START),
      "'Start' should be enabled for a stopped application",
    );
    assert.ok(
      !(await applicationsPage.isContextMenuItemEnabled(appConst.TOOLBAR.STOP)),
      "'Stop' should be disabled for a stopped application",
    );
    await applicationsPage.clickOnContextMenuItem(appConst.TOOLBAR.START);
    // 6. Back to the initial state: the details read 'Started', the toolbar offers Stop again.
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonDisabled();
    // 7. The filter is still 'State: Stopped' and nothing is stopped any more: the list is empty and
    //    says so, while the details stay on the application.
    await applicationsPage.waitForApplicationDisplayNames([]);
    assert.equal(
      await applicationsPage.getListMessage(),
      appConst.LIST_MESSAGE.NOTHING_MATCHES,
      'The empty filtered list should say that nothing matches',
    );
    assert.equal(await applicationDetails.getTitle(), APP.displayName);
    // 8. Clear the filter: the application is listed again, 'Started'.
    await applicationsPage.clickOnClearFilterButton();
    assert.deepEqual(await applicationsPage.getFilterTerms(), [], 'No term should be left');
    await applicationsPage.waitForRowDisplayed(APP.key);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STARTED);
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  // The application is left 'Started' whatever the test did: a failure between Stop and Start
  // must not reach the next test, which expects it started.
  afterEach(async () => {
    await settingsUtils.ensureApplicationStarted(APP.key);
    return await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
  });
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    // A run that was cut off may have left the application stopped: start it before the first test.
    await settingsUtils.ensureApplicationStarted(APP.key);
    await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
    return console.log('specification starting: ' + this.title);
  });
});
