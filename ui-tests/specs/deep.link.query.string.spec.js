const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe("deep.link.query.string.spec - a deep link '#/applications/<application>?<query>' opens the section with the application selected and the query string kept verbatim", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  // Deployed into home/deploy by ui-tests/build.gradle, like every test application.
  const APP = appConst.TEST_APPS.ADFS_ID_PROVIDER;
  // A query string the section does not read: it is to be carried, not understood.
  const QUERY = '?foo=bar&x=1';
  const hashOf = (url) => url.slice(url.indexOf('#'));

  async function assertApplicationIsSelected() {
    await new ApplicationDetails().waitForTitle(APP.displayName);
    await new ApplicationsPage().waitForRowActive(APP.key);
  }

  it('GIVEN the url of a selected application with a query string added WHEN the Settings app has been loaded at that url THEN the section should be opened with the application selected AND the url should be kept as it was typed', async () => {
    let applicationsPage = new ApplicationsPage();
    // 1. Select the application to learn the sub-path the section gives it.
    await settingsUtils.navigateToSettingsApp();
    await settingsUtils.navigateToApplicationsSection();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.clickOnRowByKey(APP.key);
    await assertApplicationIsSelected();
    const itemUrl = await settingsUtils.getBrowser().getUrl();
    assert.notEqual(itemUrl, settingsUtils.getSectionUrl(APPLICATIONS));
    const itemHash = hashOf(itemUrl) + QUERY;
    // 2. Load the page anew at that sub-path with the query string.
    const menuSectionsRail = await settingsUtils.openSettingsByHash(itemHash);
    // 3. Verify the section, the application and that the url was not rewritten.
    await menuSectionsRail.waitForSectionActive(APPLICATIONS);
    await settingsUtils.waitForSectionScreenLoaded(APPLICATIONS);
    await assertApplicationIsSelected();
    await settingsUtils.waitForUrl(settingsUtils.getSettingsUrl() + itemHash);
    await settingsUtils.saveScreenshot('deep_link_query_string');
  });

  it("GIVEN SU is logged in WHEN the Settings app has been loaded at the section's root with a query string THEN the section should be opened AND the query string should be kept", async () => {
    const hash = `#/${appConst.SECTION_PATH.APPLICATIONS}${QUERY}`;
    const menuSectionsRail = await settingsUtils.openSettingsByHash(hash);
    await menuSectionsRail.waitForSectionActive(APPLICATIONS);
    await settingsUtils.waitForSectionScreenLoaded(APPLICATIONS);
    await settingsUtils.waitForUrl(settingsUtils.getSettingsUrl() + hash);
    // Verify that no application is selected: the query string is not a sub-path.
    assert.equal(
      await new ApplicationDetails().waitForEmptyMessage(),
      appConst.DETAILS_MESSAGE.SELECT_AN_ITEM,
    );
  });
});
