const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');

describe("applications.toolbar.initial.state.spec - the section opened by its rail item and by its direct link offers its toolbar with 'Install' enabled and the actions on a selection disabled until there is one", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  const BUTTON = appConst.TOOLBAR;

  async function assertToolbarOfferedWithNothingSelected(applicationsPage) {
    assert.deepEqual(await applicationsPage.getToolbarButtonLabels(), Object.values(BUTTON));
    await applicationsPage.waitForToolbarButtonEnabled(BUTTON.INSTALL);
    for (const label of [BUTTON.UNINSTALL, BUTTON.START, BUTTON.STOP]) {
      await applicationsPage.waitForToolbarButtonDisabled(label);
    }
  }

  it("GIVEN SU is logged in WHEN 'Applications' item has been clicked in the rail THEN the four buttons should be in the toolbar AND 'Install' should be enabled AND 'Uninstall', 'Start' and 'Stop' should be disabled", async () => {
    let applicationsPage = new ApplicationsPage();
    // 1. Open the section by its rail item: the url follows.
    await settingsUtils.navigateToSettingsApp();
    await settingsUtils.navigateToApplicationsSection();
    await settingsUtils.waitForUrl(settingsUtils.getSectionUrl(APPLICATIONS));
    await settingsUtils.waitForSectionScreenLoaded(APPLICATIONS);
    await applicationsPage.waitForLoaded();
    await settingsUtils.saveScreenshot('applications_toolbar_by_rail');
    // 2. Verify the toolbar.
    await assertToolbarOfferedWithNothingSelected(applicationsPage);
  });

  it("GIVEN SU is logged in WHEN 'Applications' has been opened by its direct link THEN the section should be active in the rail AND the toolbar should be in the same state", async () => {
    let applicationsPage = new ApplicationsPage();
    // 1. Load the app at '.../com.enonic.xp.app.settings/main#/applications'.
    const menuSectionsRail = await settingsUtils.openSectionByUrl(APPLICATIONS);
    await menuSectionsRail.waitForSectionActive(APPLICATIONS);
    await settingsUtils.waitForSectionScreenLoaded(APPLICATIONS);
    await applicationsPage.waitForLoaded();
    await settingsUtils.saveScreenshot('applications_toolbar_by_url');
    // 2. Verify the toolbar.
    await assertToolbarOfferedWithNothingSelected(applicationsPage);
  });
});
