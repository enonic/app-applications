/**
 * Created on 18.11.2026
 */
const fs = require('node:fs');
const path = require('node:path');
const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');
const InstallAppDialog = require('../page_objects/install.app.dialog');
const UninstallAppDialog = require('../page_objects/uninstall.app.dialog');

describe("applications.install.upload.spec - the 'Upload' tab of the 'Install applications' dialog: a jar uploaded from disk, the grid and the details once it is installed, and its uninstall", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // Downloaded into ui-tests/build/upload-apps by `:ui-tests:downloadUploadApps` (run it before a
  // local run) rather than into home/deploy: this spec uploads it through the dialog and uninstalls
  // it again, so the XP is left as found. Installed that way it is neither local nor a system
  // application: no badge on its row, and Uninstall is offered.
  //
  // ! The tests run in order and share that install: the ones after the upload expect the
  // ! application on the XP, so a failed upload fails each of them too - read the first failure.
  const APP = appConst.TEST_APPS.TEST_SELENIUM;
  const JAR = path.join(__dirname, '..', 'build', 'upload-apps', APP.jarName);
  // Set once this run has uploaded the jar: Mocha runs `after` even when `before` throws, and
  // `after` must uninstall only what this run installed - never an application that was on the XP
  // already, whether `before` found it or failed before it could look.
  let uploaded = false;

  it("GIVEN 'Install applications' dialog is opened WHEN the 'Upload' tab has been clicked THEN the drop zone should be shown in place of the market list", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await applicationsPage.waitForApplicationsListLoaded();
    // 1. Open the dialog: 'Enonic Market' is the active tab.
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    assert.equal(await installAppDialog.getActiveTab(), appConst.INSTALL_DIALOG.TAB.MARKET);
    assert.ok(
      !(await installAppDialog.isDropZoneDisplayed()),
      'The drop zone should not be shown on the market tab',
    );
    // 2. Click on 'Upload': the drop zone takes the place of the list.
    await installAppDialog.clickOnTab(appConst.INSTALL_DIALOG.TAB.UPLOAD);
    await settingsUtils.saveScreenshot('install_app_dialog_upload_tab');
    assert.equal(await installAppDialog.getActiveTab(), appConst.INSTALL_DIALOG.TAB.UPLOAD);
    assert.ok(await installAppDialog.isDropZoneDisplayed(), 'The drop zone should be shown');
    // 3. Close the dialog with its cross.
    await installAppDialog.clickOnCloseButton();
    await installAppDialog.waitForDialogClosed();
  });

  it("GIVEN the 'Upload' tab is opened WHEN the jar of 'Test Selenium App' has been uploaded THEN the dialog should close AND the toast should say the application was installed AND the row should be listed, 'Started', with no badge", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    let installAppDialog = new InstallAppDialog();
    await applicationsPage.waitForApplicationsListLoaded();
    assert.ok(fs.existsSync(JAR), `${JAR} should exist: run ':ui-tests:downloadUploadApps'`);
    // 1. Open the dialog on the 'Upload' tab.
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.clickOnTab(appConst.INSTALL_DIALOG.TAB.UPLOAD);
    // 2. Upload the jar: the dialog closes on its own, the browse list is where the upload shows.
    await installAppDialog.uploadJar(JAR);
    uploaded = true;
    // 3. The toast says the application was installed.
    await applicationsPage.waitForExpectedNotificationMessage(
      appConst.applicationInstalledMessage(APP.displayName),
    );
    await settingsUtils.saveScreenshot('install_app_uploaded');
    // 4. The grid lists it, started, with the version the jar carries and no badge: neither a
    //    system nor a local application.
    await applicationsPage.waitForRowDisplayed(APP.key);
    await applicationsPage.waitForApplicationState(APP.key, appConst.APP_STATE.STARTED);
    assert.equal(
      await applicationsPage.getApplicationDescriptionByDisplayName(APP.displayName),
      APP.description,
    );
    assert.equal(await applicationsPage.getApplicationBadge(APP.key), undefined);
    assert.ok(
      await applicationsPage.isRowCheckboxEnabled(APP.key),
      'The checkbox of an uploaded application should be enabled',
    );
    // 5. Click on the row: the toolbar offers Uninstall and Stop - the application is not local.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    await applicationsPage.waitForUninstallButtonEnabled();
    await applicationsPage.waitForStopButtonEnabled();
    await applicationsPage.waitForStartButtonDisabled();
    // 6. The details: no badge in the header, the state as a dropdown reading 'Started', no link
    //    to the market - the market does not carry it - and the Details section.
    assert.equal(await applicationDetails.getHeaderBadge(), undefined);
    assert.equal(await applicationDetails.getState(), appConst.APP_STATE.STARTED);
    assert.ok(
      await applicationDetails.isStateMenuButtonDisplayed(),
      'The state should be a dropdown: an uploaded application can be stopped',
    );
    assert.ok(
      !(await applicationDetails.isMarketLinkDisplayed()),
      'A test application has no page on the Enonic Market',
    );
    assert.equal(await applicationDetails.getInfo(), APP.description);
    assert.equal(await applicationDetails.getKey(), APP.key);
    assert.equal(
      await applicationDetails.getVersionInstalled(),
      await applicationsPage.getApplicationVersion(APP.key),
      'The version installed should be the one the row shows',
    );
    // 7. Its schemas and its admin extension, in the sections the jar fills.
    await applicationDetails.waitForSectionDisplayed(ApplicationDetails.SECTION.ADMIN);
    assert.deepEqual(await applicationDetails.getSectionLabels(), [
      ApplicationDetails.SECTION.DETAILS.toUpperCase(),
      ApplicationDetails.SECTION.SCHEMAS.toUpperCase(),
      ApplicationDetails.SECTION.ADMIN.toUpperCase(),
    ]);
    assert.deepEqual(await applicationDetails.getSchemaKinds(), [
      ApplicationDetails.SUBSECTION.CONTENT_TYPES,
      ApplicationDetails.SUBSECTION.LAYOUTS,
      ApplicationDetails.SUBSECTION.MIXINS,
      ApplicationDetails.SUBSECTION.FORM_FRAGMENTS,
    ]);
    assert.deepEqual(await applicationDetails.getContentTypes(), APP.contentTypes);
    assert.deepEqual(await applicationDetails.getLayouts(), APP.layouts);
    assert.deepEqual(await applicationDetails.getMixins(), APP.mixins);
    assert.deepEqual(await applicationDetails.getFormFragments(), APP.formFragments);
    assert.deepEqual(await applicationDetails.getAdminExtensions(), APP.adminExtensions);
  });

  // The uploaded application is the one row that can be uninstalled: with every row ticked,
  // Uninstall stays off, since the test applications deployed into home/deploy are local.
  it("GIVEN 'Test Selenium App' has been uploaded WHEN 'Select all' has been ticked THEN Uninstall should be disabled, AND with the uploaded application ticked alone it should be enabled", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(APP.key);
    // 1. Tick 'Select all': a local application is in the selection, Uninstall is withheld.
    await applicationsPage.clickOnSelectAllCheckbox();
    await applicationsPage.waitForUninstallButtonDisabled();
    // 2. Untick 'Select all', tick the uploaded application alone: Uninstall is offered.
    await applicationsPage.clickOnSelectAllCheckbox();
    await applicationsPage.clickOnCheckboxByKey(APP.key);
    await settingsUtils.saveScreenshot('install_app_uploaded_checked');
    await applicationsPage.waitForUninstallButtonEnabled();
    await applicationsPage.waitForStopButtonEnabled();
  });

  it("GIVEN 'Test Selenium App' row has been clicked WHEN 'Uninstall' in the toolbar has been clicked and confirmed THEN the toast should say so AND the row should be gone", async () => {
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    let applicationDetails = new ApplicationDetails();
    let uninstallAppDialog = new UninstallAppDialog();
    // 1. Click on the row: the details open, Uninstall is enabled.
    await applicationsPage.clickOnRowByKey(APP.key);
    await applicationDetails.waitForTitle(APP.displayName);
    await applicationsPage.waitForUninstallButtonEnabled();
    // 2. Click on 'Uninstall': the confirmation names the application; confirm it.
    await applicationsPage.clickOnUninstallButton();
    await uninstallAppDialog.waitForDialogOpened();
    assert.equal(await uninstallAppDialog.getTitle(), appConst.UNINSTALL_DIALOG.TITLE);
    assert.deepEqual(await uninstallAppDialog.getTargetDisplayNames(), [APP.displayName]);
    await settingsUtils.saveScreenshot('install_app_uploaded_uninstall_dialog');
    await uninstallAppDialog.clickOnUninstallButton();
    await uninstallAppDialog.waitForDialogClosed();
    // 3. The toast says so, and the row is gone.
    await applicationsPage.waitForExpectedNotificationMessage(
      appConst.applicationUninstalledMessage(APP.displayName),
    );
    await applicationsPage.waitForRowNotDisplayed(APP.key, appConst.TIMEOUT.LONG);
  });

  // Leaves the XP as it was found: the application is uninstalled through the section itself
  // whenever a failure left its row there, so the spec can run again. An application this run did
  // not upload is not its to uninstall and is left alone.
  after(async () => {
    if (!uploaded) {
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
    // the ones that would uninstall it included, where a failed test would not.
    await settingsUtils.navigateToSettingsApp();
    await settingsUtils.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    if (await applicationsPage.isRowDisplayed(APP.key)) {
      throw new Error(
        `'${APP.displayName}' is installed on this XP already: uninstall it before running the suite`,
      );
    }
    await settingsUtils.doCloseAllWindowTabsAndNavigateToHome();
    return console.log('specification starting: ' + this.title);
  });
});
