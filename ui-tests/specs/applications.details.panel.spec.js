/**
 * Created on 09.11.2026
 */
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe('applications.details.panel.spec - the details panel of an application: what it shows for a selected row, and the state it can be switched to from its header', function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Deployed into home/deploy by ui-tests/build.gradle, like every test application: local, and
  // known to the market by nothing.
  const SIMPLE_SITE = appConst.TEST_APPS.SIMPLE_SITE;
  const MY_FIRST_APP = appConst.TEST_APPS.MY_FIRST_APP;

  it("WHEN the Applications section is opened THEN 'Select an item to see its details' should be shown in place of the details AND no row should be active", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    // 1. The list is loaded and the test applications are in it.
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(SIMPLE_SITE.key);
    // 2. Nothing is selected: the details column says so, no panel is shown.
    let message = await applicationDetails.waitForEmptyMessage();
    assert.equal(message, appConst.DETAILS_MESSAGE.SELECT_AN_ITEM);
    assert.ok(!(await applicationDetails.isDisplayed()), 'No details panel should be shown');
    assert.ok(
      !(await applicationsPage.isRowActive(SIMPLE_SITE.key)),
      'No row should be active before a click',
    );
  });

  it("WHEN 'Simple Site App' row has been clicked THEN the details header should show the application AND the Details section should show what the row shows", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    // 1. Click on the row: it becomes the active one and the details open on the right.
    await applicationsPage.clickOnRowByKey(SIMPLE_SITE.key);
    await applicationsPage.waitForRowActive(SIMPLE_SITE.key);
    await applicationDetails.waitForLoaded();
    await applicationDetails.waitForTitle(SIMPLE_SITE.displayName);
    await settingsUtils.saveScreenshot('app_details_panel_1');
    // 2. The empty message is gone.
    assert.equal(await applicationDetails.getEmptyMessage(), undefined);
    // 3. The header: a local application (deployed from home/deploy) with its badge, the state as a
    //    dropdown reading 'Started', no link to the market - the market does not carry it.
    assert.equal(await applicationDetails.getHeaderBadge(), appConst.APP_BADGE.LOCAL);
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
    assert.ok(
      await applicationDetails.isStateMenuButtonDisplayed(),
      'The state should be a dropdown: a test application can be stopped',
    );
    assert.ok(
      !(await applicationDetails.isMarketLinkDisplayed()),
      'A test application has no page on the Enonic Market',
    );
    // 4. The Details section reads what the row shows: the description, the version, the key.
    assert.equal(await applicationDetails.getInfo(), SIMPLE_SITE.description);
    assert.equal(
      await applicationDetails.getVersionInstalled(),
      await applicationsPage.getApplicationVersion(SIMPLE_SITE.key),
      'The version installed should be the one the row shows',
    );
    assert.equal(await applicationDetails.getKey(), SIMPLE_SITE.key);
    // 5. No vendor is named, no update is offered: the fields are left out.
    assert.equal(await applicationDetails.getVendor(), undefined);
    assert.equal(await applicationDetails.getUpdateAvailable(), undefined);
    // 6. The lowest platform version the application accepts is shown as '≥ <version>'.
    let systemRequired = await applicationDetails.getSystemRequired();
    assert.ok(
      systemRequired !== undefined && systemRequired.startsWith('≥'),
      `'System required' should read '≥ <version>', but was '${systemRequired}'`,
    );
  });

  it("WHEN 'Simple Site App' row has been clicked THEN the Schemas section should list its content types, pages, layouts, mixins and form fragments by name", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.clickOnRowByKey(SIMPLE_SITE.key);
    await applicationDetails.waitForTitle(SIMPLE_SITE.displayName);
    // 1. The Schemas section is shown once the application's info is loaded.
    await applicationDetails.waitForSectionDisplayed(ApplicationDetails.SECTION.SCHEMAS);
    await settingsUtils.saveScreenshot('app_details_panel_2');
    // 2. One subsection per kind the application has, none for a kind it has not (no parts, no macros).
    assert.deepEqual(await applicationDetails.getSchemaKinds(), [
      ApplicationDetails.SUBSECTION.CONTENT_TYPES,
      ApplicationDetails.SUBSECTION.PAGES,
      ApplicationDetails.SUBSECTION.LAYOUTS,
      ApplicationDetails.SUBSECTION.MIXINS,
      ApplicationDetails.SUBSECTION.FORM_FRAGMENTS,
    ]);
    // 3. The names, sorted.
    assert.deepEqual(await applicationDetails.getContentTypes(), SIMPLE_SITE.contentTypes);
    assert.deepEqual(await applicationDetails.getPages(), SIMPLE_SITE.pages);
    assert.deepEqual(await applicationDetails.getLayouts(), SIMPLE_SITE.layouts);
    assert.deepEqual(await applicationDetails.getMixins(), SIMPLE_SITE.mixins);
    assert.deepEqual(await applicationDetails.getFormFragments(), SIMPLE_SITE.formFragments);
    // 4. Details and Schemas sections should be displayed.
    assert.deepEqual(await applicationDetails.getSectionLabels(), [
      ApplicationDetails.SECTION.DETAILS.toUpperCase(),
      ApplicationDetails.SECTION.SCHEMAS.toUpperCase(),
    ]);
  });
  it("GIVEN 'Simple Site App' is selected WHEN 'My First App' row has been clicked THEN the details should switch to it AND the Vendor should be shown with a link to the vendor site", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.clickOnRowByKey(SIMPLE_SITE.key);
    await applicationDetails.waitForTitle(SIMPLE_SITE.displayName);
    // 1. Click on another row: the panel follows the active row.
    await applicationsPage.clickOnRowByKey(MY_FIRST_APP.key);
    await applicationsPage.waitForRowActive(MY_FIRST_APP.key);
    await applicationDetails.waitForTitle(MY_FIRST_APP.displayName);
    assert.ok(
      !(await applicationsPage.isRowActive(SIMPLE_SITE.key)),
      'The row clicked first should not be active any more',
    );
    // 2. The Details section is the new application's.
    assert.equal(await applicationDetails.getKey(), MY_FIRST_APP.key);
    assert.equal(await applicationDetails.getInfo(), MY_FIRST_APP.description);
    // 3. Its schemas: content types and parts. The pages are the skipped test below.
    await applicationDetails.waitForSectionDisplayed(ApplicationDetails.SECTION.SCHEMAS);
    assert.deepEqual(await applicationDetails.getContentTypes(), MY_FIRST_APP.contentTypes);
    assert.deepEqual(await applicationDetails.getParts(), MY_FIRST_APP.parts);
  });

  // TODO: enable once https://github.com/enonic/app-applications/issues/2453 is fixed - the
  // details omit the pages and parts that have no yaml descriptor, and 'My First App' lists none
  // of its pages until then.
  it.skip("GIVEN 'My First App' row has been clicked THEN the Schemas section should list its pages (#2453)", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.clickOnRowByKey(MY_FIRST_APP.key);
    await applicationDetails.waitForTitle(MY_FIRST_APP.displayName);
    await applicationDetails.waitForSectionDisplayed(ApplicationDetails.SECTION.SCHEMAS);
    assert.deepEqual(await applicationDetails.getPages(), MY_FIRST_APP.pages);
  });

  it("GIVEN 'Simple Site App' is selected WHEN the state button has been clicked THEN the menu should offer 'Stop' only AND WHEN Escape has been pressed THEN the menu should close AND the state should stay 'Started'", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.clickOnRowByKey(SIMPLE_SITE.key);
    await applicationDetails.waitForTitle(SIMPLE_SITE.displayName);
    // 1. A started application: the toolbar offers Stop, not Start, for the active row.
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonDisabled();
    // 2. Open the state menu: the one item is the opposite state.
    await applicationDetails.clickOnStateMenuButton();
    assert.deepEqual(await applicationDetails.getStateMenuItems(), [appConst.TOOLBAR.STOP]);
    // 3. Escape closes it without picking: nothing changes.
    await applicationDetails.closeStateMenu();
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
    assert.equal(
      await applicationsPage.getApplicationState(SIMPLE_SITE.key),
      appConst.APP_STATE.STARTED,
    );
  });

  it("GIVEN 'Simple Site App' is selected WHEN 'Stop' has been picked in the state menu THEN the state should read 'Stopped' in the details and in the row AND WHEN 'Start' has been picked THEN both should read 'Started' again", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    await applicationsPage.clickOnRowByKey(SIMPLE_SITE.key);
    await applicationDetails.waitForTitle(SIMPLE_SITE.displayName);
    // 1. Stop it from the header: the details and the row follow, the toolbar offers Start.
    await applicationDetails.stopApplication();
    await settingsUtils.saveScreenshot('app_details_panel_3');
    await applicationsPage.waitForApplicationState(SIMPLE_SITE.key, appConst.APP_STATE.STOPPED);
    await applicationsPage.waitForStartButtonEnabled();
    await applicationsPage.waitForStopButtonDisabled();
    // 2. The panel is still the same application's.
    assert.equal(await applicationDetails.getTitle(), SIMPLE_SITE.displayName);
    assert.equal(await applicationDetails.getKey(), SIMPLE_SITE.key);
    // 3. Start it again, the same way: back to 'Started' everywhere.
    await applicationDetails.startApplication();
    await applicationsPage.waitForApplicationState(SIMPLE_SITE.key, appConst.APP_STATE.STARTED);
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonDisabled();
    // 4. Started again, the schemas are read again.
    await applicationDetails.waitForSectionDisplayed(ApplicationDetails.SECTION.SCHEMAS);
    assert.deepEqual(await applicationDetails.getContentTypes(), SIMPLE_SITE.contentTypes);
  });

  beforeEach(async () => {
    await settingsUtils.navigateToSettingsApp();
  });
  // The application is left 'Started' whatever the test did: a failure between Stop and Start
  // must not reach the next test, which expects it started.
  afterEach(async () => {
    await settingsUtils.ensureApplicationStarted(SIMPLE_SITE.key);
    return await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
  });
  before(async () => {
    if (typeof browser !== 'undefined') {
      await settingsUtils
        .getBrowser()
        .setWindowSize(appConst.BROWSER_WIDTH, appConst.BROWSER_HEIGHT);
    }
    // A run that was cut off may have left the application stopped: start it before the first test.
    await settingsUtils.ensureApplicationStarted(SIMPLE_SITE.key);
    await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
    return console.log('specification starting: ' + this.title);
  });
});
