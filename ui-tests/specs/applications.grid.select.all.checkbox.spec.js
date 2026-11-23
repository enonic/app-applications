/**
 * Created on 17.11.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe("applications.grid.select.all.checkbox.spec - 'Select all': the toolbar it enables, the row it puts on show, and the system applications", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Deployed into home/deploy by ui-tests/build.gradle: local, started, and the operator's to tick.
  const SIMPLE_SITE = appConst.TEST_APPS.SIMPLE_SITE;
  const MY_FIRST_APP = appConst.TEST_APPS.MY_FIRST_APP;
  // The one XP ships that the test waits for.
  const SYSTEM_APP = appConst.SYSTEM_APPS.MAIN;

  // The row the details column shows once 'Select all' is ticked: the browse framework puts the row
  // ticked last on show (Content Studio's currentItem - shownRowKey in widgets/browse-list), and
  // 'Select all' ticks the rows in list order, so that is the last row listed - and the one before
  // it once the last is unticked. Read off the list rather than pinned to an application: which
  // row is last depends on what the XP has installed. `fromEnd` 0 is the last row, 1 the one before.
  async function listedFromEnd(applicationsPage, fromEnd = 0) {
    const names = await applicationsPage.getApplicationDisplayNames();
    const displayName = names[names.length - 1 - fromEnd];
    return { displayName, key: await applicationsPage.getApplicationKeyByDisplayName(displayName) };
  }

  // Uninstall needs every selected row to be uninstallable, and a local application is not; Stop
  // needs one started row; Install is on offer whatever is selected.
  it("WHEN 'Select all' has been ticked THEN Install and Stop should be enabled AND Uninstall should be disabled, since the test applications are local", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    // 1. Tick 'Select all': the test applications are checked.
    await applicationsPage.clickOnSelectAllCheckbox();
    await settingsUtils.saveScreenshot('grid_select_all_toolbar');
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should be checked",
    );
    assert.ok(
      await applicationsPage.isRowChecked(SIMPLE_SITE.key),
      'A test application should be checked',
    );
    // 2. The toolbar: Stop is enabled, Uninstall is not - a local application is in the selection.
    //    Install is on offer whatever the selection; it is checked only to pin that rule.
    await applicationsPage.waitForInstallButtonEnabled();
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForUninstallButtonDisabled();
  });

  it("GIVEN 'Select all' has been ticked WHEN the row on show has been unticked THEN 'Select all' should be indeterminate AND the details should move to the row ticked before it", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    const lastApp = await listedFromEnd(applicationsPage);
    const beforeLastApp = await listedFromEnd(applicationsPage, 1);
    // 1. Tick 'Select all': the details column shows the row ticked last. The row is not the active
    //    one - that is the keyboard's cursor, which the header's checkbox does not move.
    await applicationsPage.clickOnSelectAllCheckbox();
    await applicationDetails.waitForTitle(lastApp.displayName);
    // 2. Untick the row on show: it is the only one left out, and the details move to the row
    //    ticked before it - the rule is that the row ticked last is on show, so unticking the one
    //    on show has to move them.
    await applicationsPage.clickOnCheckboxByKey(lastApp.key);
    await applicationDetails.waitForTitle(beforeLastApp.displayName);
    await settingsUtils.saveScreenshot('grid_select_all_last_unticked');
    assert.ok(
      !(await applicationsPage.isRowChecked(lastApp.key)),
      'The unticked row should not be checked',
    );
    assert.ok(
      await applicationsPage.isRowChecked(beforeLastApp.key),
      'The row before it should stay checked',
    );
    assert.ok(
      await applicationsPage.isRowChecked(SIMPLE_SITE.key),
      'The other rows should stay checked',
    );
    // 3. 'Select all' is neither checked nor unchecked while only some of the rows are.
    assert.ok(
      await applicationsPage.isSelectAllCheckboxIndeterminate(),
      "'Select all' should be indeterminate once a row has been unticked",
    );
    assert.ok(
      !(await applicationsPage.isSelectAllCheckboxSelected()),
      "'Select all' should not read as checked",
    );
    // 4. The details are the row ticked before the unticked one: a local application, started.
    assert.equal(await applicationDetails.getHeaderBadge(), appConst.APP_BADGE.LOCAL);
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
  });

  // The system applications cannot be ticked, so showing them changes neither the selection nor
  // what 'Select all' covers.
  it("GIVEN 'Select all' has been ticked WHEN 'Show system applications' has been clicked THEN 'Select all' should stay checked AND Install and Stop should stay enabled", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    // 1. Tick 'Select all': the toolbar follows the selection.
    await applicationsPage.clickOnSelectAllCheckbox();
    // 2. Click on the toggle: the system applications join the list, unchecked.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForRowDisplayed(SYSTEM_APP.key);
    await settingsUtils.saveScreenshot('grid_select_all_then_system_applications_shown');
    for (const key of appConst.SYSTEM_APPS.KEYS) {
      assert.ok(
        !(await applicationsPage.isRowChecked(key)),
        `The system application '${key}' should not be checked`,
      );
    }
    // 3. The selection is as it was: the test applications are checked, 'Select all' still reads
    //    as checked, and the toolbar has not moved (Install is checked only to pin that it never
    //    depends on the selection).
    assert.ok(
      await applicationsPage.isRowChecked(SIMPLE_SITE.key),
      'A test application should stay checked',
    );
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should stay checked: the system rows are not ones it covers",
    );
    assert.ok(
      !(await applicationsPage.isSelectAllCheckboxIndeterminate()),
      "'Select all' should not turn indeterminate",
    );
    await applicationsPage.waitForInstallButtonEnabled();
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForUninstallButtonDisabled();
    // 4. Click on the toggle again: the system applications leave the list, the selection stays.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForSystemApplicationsShown(false);
    await applicationsPage.waitForRowNotDisplayed(SYSTEM_APP.key);
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should stay checked once the system applications are hidden again",
    );
  });

  // The click leaves the focus on the header's checkbox, so the keyboard reaches it too.
  it("GIVEN 'Select all' has been ticked WHEN the Space key has been pressed THEN 'Select all' should be unticked AND nothing should stay checked", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    // 1. Tick 'Select all': the test applications are checked.
    await applicationsPage.clickOnSelectAllCheckbox();
    assert.ok(
      await applicationsPage.isRowChecked(SIMPLE_SITE.key),
      'A test application should be checked',
    );
    // 2. Press Space: the focused checkbox is toggled, the selection is emptied.
    await applicationsPage.pressSpaceOnSelectAllCheckbox();
    await settingsUtils.saveScreenshot('grid_select_all_space_key');
    assert.ok(
      !(await applicationsPage.isSelectAllCheckboxSelected()),
      "'Select all' should be unticked by the Space key",
    );
    assert.ok(
      !(await applicationsPage.isSelectAllCheckboxIndeterminate()),
      "'Select all' should not be indeterminate once nothing is checked",
    );
    assert.ok(
      !(await applicationsPage.isRowChecked(SIMPLE_SITE.key)),
      'Nothing should stay checked',
    );
    assert.ok(
      !(await applicationsPage.isRowChecked(MY_FIRST_APP.key)),
      'No other row should stay checked either',
    );
  });

  // 'Select all' covers the rows listed, not the rows a filter hides: it ticks the listed ones only,
  // and reads as indeterminate once the hidden ones are listed again, unticked.
  it("GIVEN the list is narrowed by text WHEN 'Select all' has been ticked THEN only the listed row should be checked AND once the filter has been cleared 'Select all' should be indeterminate AND the other rows unchecked", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    const lastApp = await listedFromEnd(applicationsPage);
    // 1. Narrow the list by the key of one application: it is the one row listed.
    await applicationsPage.searchByText(SIMPLE_SITE.key);
    await applicationsPage.waitForApplicationDisplayNames([SIMPLE_SITE.displayName]);
    // 2. Tick 'Select all': the one listed row is checked, and 'Select all' with it.
    await applicationsPage.clickOnSelectAllCheckbox();
    assert.ok(
      await applicationsPage.isRowChecked(SIMPLE_SITE.key),
      'The listed row should be checked',
    );
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should be checked while every listed row is",
    );
    // 3. Clear the filter: the hidden rows are listed again, unticked, and the selection no longer
    //    covers the list.
    await applicationsPage.clickOnClearFilterButton();
    assert.deepEqual(await applicationsPage.getFilterTerms(), [], 'No term should be left');
    await applicationsPage.waitForRowDisplayed(lastApp.key);
    await settingsUtils.saveScreenshot('grid_select_all_under_filter_cleared');
    assert.ok(
      await applicationsPage.isSelectAllCheckboxIndeterminate(),
      "'Select all' should be indeterminate while only the row ticked under the filter is checked",
    );
    assert.ok(
      await applicationsPage.isRowChecked(SIMPLE_SITE.key),
      'The row ticked under the filter should stay checked',
    );
    for (const key of [MY_FIRST_APP.key, lastApp.key]) {
      assert.ok(
        !(await applicationsPage.isRowChecked(key)),
        `The row '${key}', hidden while 'Select all' was ticked, should not be checked`,
      );
    }
  });

  // https://github.com/enonic/app-applications/issues/2501
  // TODO: enable once a hidden row keeps its tick. Today the tick is dropped as soon as the filter
  it.skip("GIVEN two rows are ticked WHEN a text filter hides one of them AND 'Stop' has been clicked THEN only the listed row should be stopped AND the hidden one should stay started and ticked", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    // 1. Tick two rows: Stop is enabled.
    await applicationsPage.clickOnCheckboxByKey(SIMPLE_SITE.key);
    await applicationsPage.clickOnCheckboxByKey(MY_FIRST_APP.key);
    await applicationsPage.waitForStopButtonEnabled();
    // 2. Narrow the list to one of them: the other is hidden, still ticked, and 'Select all'
    //    reads as checked - every listed row is.
    await applicationsPage.searchByText(MY_FIRST_APP.key);
    await applicationsPage.waitForApplicationDisplayNames([MY_FIRST_APP.displayName]);
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should be checked while the one listed row is",
    );
    // 3. Click on 'Stop': the listed row is stopped, Stop is off - nothing listed is left to stop.
    await applicationsPage.clickOnStopButton();
    await applicationsPage.waitForApplicationState(
      MY_FIRST_APP.key,
      appConst.APP_STATE.STOPPED,
      appConst.TIMEOUT.LONG,
    );
    await applicationsPage.waitForStopButtonDisabled(appConst.TIMEOUT.LONG);
    // 4. Clear the filter: the hidden row is listed again, started and still ticked, and Stop is
    //    back on for it.
    await applicationsPage.clickOnClearFilterButton();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    await settingsUtils.saveScreenshot('grid_stop_under_filter_cleared');
    assert.equal(
      await applicationsPage.getApplicationState(SIMPLE_SITE.key),
      appConst.APP_STATE.STARTED,
      'The hidden row should not have been stopped',
    );
    assert.ok(
      await applicationsPage.waitForRowChecked(SIMPLE_SITE.key),
      'The hidden row should still be checked',
    );
    assert.equal(
      await applicationsPage.getApplicationState(MY_FIRST_APP.key),
      appConst.APP_STATE.STOPPED,
    );
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonEnabled();
    // 5. Click on 'Start': the stopped row is started again, so the application is left as found.
    await applicationsPage.clickOnStartButton();
    await applicationsPage.waitForApplicationState(
      MY_FIRST_APP.key,
      appConst.APP_STATE.STARTED,
      appConst.TIMEOUT.LONG,
    );
    await applicationsPage.waitForStartButtonDisabled();
  });

  // Stop and Start act on every selected row they can: Stop on the started ones, Start on the
  // stopped ones. The applications are started again at the end, so they are left as found - and
  // by `after` whatever happens in between.
  it("GIVEN 'Select all' has been ticked WHEN 'Stop' has been clicked THEN every application should read 'Stopped' AND Stop should be disabled, AND once 'Start' has been clicked Stop should be enabled AND Start disabled again", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    const lastApp = await listedFromEnd(applicationsPage);
    // 1. Tick 'Select all': the details show the row ticked last, started, and Stop is enabled.
    await applicationsPage.clickOnSelectAllCheckbox();
    await applicationDetails.waitForTitle(lastApp.displayName);
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED);
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonDisabled();
    // 2. Click on 'Stop': every selected application is stopped - the details, the rows and the
    //    toolbar follow.
    await applicationsPage.clickOnStopButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STOPPED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(
      MY_FIRST_APP.key,
      appConst.APP_STATE.STOPPED,
      appConst.TIMEOUT.LONG,
    );
    await applicationsPage.waitForApplicationState(
      SIMPLE_SITE.key,
      appConst.APP_STATE.STOPPED,
      appConst.TIMEOUT.LONG,
    );
    await applicationsPage.waitForStopButtonDisabled(appConst.TIMEOUT.LONG);
    await applicationsPage.waitForStartButtonEnabled();
    await settingsUtils.saveScreenshot('grid_select_all_stopped');
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should stay checked across the stop",
    );
    assert.equal(await applicationDetails.getTitle(), lastApp.displayName);
    assert.equal(await applicationDetails.getKey(), lastApp.key);
    // 3. Click on 'Start': every selected application is started again, and the toolbar is back
    //    to Stop enabled, Start disabled.
    await applicationsPage.clickOnStartButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(
      MY_FIRST_APP.key,
      appConst.APP_STATE.STARTED,
      appConst.TIMEOUT.LONG,
    );
    await applicationsPage.waitForApplicationState(
      SIMPLE_SITE.key,
      appConst.APP_STATE.STARTED,
      appConst.TIMEOUT.LONG,
    );
    await applicationsPage.waitForStopButtonEnabled(appConst.TIMEOUT.LONG);
    await applicationsPage.waitForStartButtonDisabled();
    await settingsUtils.saveScreenshot('grid_select_all_started_again');
    assert.ok(
      await applicationsPage.isSelectAllCheckboxSelected(),
      "'Select all' should stay checked across the start",
    );
  });

  // The applications XP ships are not the operator's to act on: 'Select all' covers every row that
  // can be ticked and leaves them out. The toggle comes before the tick here, the other way round
  // from the test above: 'Select all' is computed over a list that already holds rows it cannot
  // tick, rather than keeping a selection made before they were listed.
  it("WHEN 'Show system applications' has been clicked AND 'Select all' has been ticked THEN the test applications should be checked AND the system ones should be left unchecked", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    // 1. Click on the toggle: the system applications join the list.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForRowDisplayed(SYSTEM_APP.key);
    // 2. Tick 'Select all': the test applications are checked, the system ones are left out - and
    //    'Select all' still reads as checked, since it covers every row that can be ticked.
    await applicationsPage.clickOnSelectAllCheckbox();
    await settingsUtils.saveScreenshot('grid_select_all_system_applications_shown');
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
    // 3. Untick 'Select all': nothing stays checked.
    await applicationsPage.clickOnSelectAllCheckbox();
    assert.ok(
      !(await applicationsPage.isRowChecked(SIMPLE_SITE.key)),
      'Nothing should stay checked',
    );
    assert.ok(
      !(await applicationsPage.isSelectAllCheckboxSelected()),
      "'Select all' should not be checked once unticked",
    );
    // 4. Click on the toggle again: the system applications leave the list.
    await applicationsPage.clickOnSystemApplicationsToggle();
    await applicationsPage.waitForSystemApplicationsShown(false);
    await applicationsPage.waitForRowNotDisplayed(SYSTEM_APP.key);
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  afterEach(async () => {
    return await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
  });
  // Every application is left 'Started' whatever the Stop/Start test did: a failure between Stop
  // and Start must not reach the specs that run after this one, nor a rerun. Once per spec rather
  // than after every test: only that test stops anything, and a failing `afterEach` would skip
  // the tests left in the spec.
  after(async () => {
    await settingsUtils.ensureApplicationsStarted();
    return await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
  });
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    // A run that was cut off may have left applications stopped: start them before the first test.
    await settingsUtils.ensureApplicationsStarted();
    await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
    return console.log('specification starting: ' + this.title);
  });
});
