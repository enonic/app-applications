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
  // The last test application in the list order (display name A–Z, the default), so the row
  // 'Select all' ticks last: the one the details column shows.
  const LAST_APP = appConst.TEST_APPS.AUTH0_ID_PROVIDER;
  // The one XP ships that the test waits for.
  const SYSTEM_APP = appConst.SYSTEM_APPS.MAIN;

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
    // 2. The toolbar: Install and Stop are enabled, Uninstall is not - a local application is in
    //    the selection.
    await applicationsPage.waitForInstallButtonEnabled();
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForUninstallButtonDisabled();
  });

  it("GIVEN 'Select all' has been ticked WHEN one application has been unticked THEN 'Select all' should be indeterminate AND the details should keep showing the row ticked last", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    // 1. Tick 'Select all': the details column shows the row ticked last. The row is not the active
    //    one - that is the keyboard's cursor, which the header's checkbox does not move.
    await applicationsPage.clickOnSelectAllCheckbox();
    await applicationDetails.waitForTitle(LAST_APP.displayName);
    // 2. Untick one row: it is the only one left out.
    await applicationsPage.clickOnCheckboxByKey(SIMPLE_SITE.key);
    await settingsUtils.saveScreenshot('grid_select_all_one_unticked');
    assert.ok(
      !(await applicationsPage.isRowChecked(SIMPLE_SITE.key)),
      'The unticked row should not be checked',
    );
    assert.ok(
      await applicationsPage.isRowChecked(LAST_APP.key),
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
    // 4. The details stay on the row ticked last: a local application, started, with its key and
    //    info in the Details section.
    assert.equal(await applicationDetails.getTitle(), LAST_APP.displayName);
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
    //    as checked, and the toolbar has not moved.
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
    await applicationsPage.keys('Space');
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
      !(await applicationsPage.isRowChecked(LAST_APP.key)),
      'The row ticked last should not stay checked either',
    );
  });

  // Stop and Start act on every selected row they can: Stop on the started ones, Start on the
  // stopped ones. The applications are started again at the end, so they are left as found.
  it("GIVEN 'Select all' has been ticked WHEN 'Stop' has been clicked THEN every application should read 'Stopped' AND Stop should be disabled, AND once 'Start' has been clicked Stop should be enabled AND Start disabled again", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    // 1. Tick 'Select all': the details show the row ticked last, started, and Stop is enabled.
    await applicationsPage.clickOnSelectAllCheckbox();
    await applicationDetails.waitForTitle(LAST_APP.displayName);
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED);
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonDisabled();
    // 2. Click on 'Stop': every selected application is stopped - the details, the rows and the
    //    toolbar follow.
    await applicationsPage.clickOnStopButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STOPPED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(
      LAST_APP.key,
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
    assert.equal(await applicationDetails.getTitle(), LAST_APP.displayName);
    assert.equal(await applicationDetails.getKey(), LAST_APP.key);
    // 3. Click on 'Start': every selected application is started again, and the toolbar is back
    //    to Stop enabled, Start disabled.
    await applicationsPage.clickOnStartButton();
    await applicationDetails.waitForState(appConst.APP_STATE.STARTED, appConst.TIMEOUT.LONG);
    await applicationsPage.waitForApplicationState(
      LAST_APP.key,
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
  // can be ticked and leaves them out.
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
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    return console.log('specification starting: ' + this.title);
  });
});
