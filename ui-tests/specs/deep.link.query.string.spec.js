const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const ApplicationsPage = require('../page_objects/applications.page');
const ApplicationDetails = require('../page_objects/applications.details');

describe("deep.link.query.string.spec - a deep link '#/applications/<application>?<query>' opens the section with the application selected and the query string kept verbatim, and the shell remembers both when the section is left", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  const ROLES = appConst.EXTENSIONS.ROLES;
  // Deployed into home/deploy by ui-tests/build.gradle, like every test application.
  const APP = appConst.TEST_APPS.ADFS_ID_PROVIDER;
  // A query string the section does not read: it is to be carried, not understood.
  const QUERY = '?foo=bar&x=1';
  const hashOf = (url) => url.slice(url.indexOf('#'));
  // '#/applications/<the application>?foo=bar&x=1' - read off the page by the first test, which is
  // the only place the section's sub-path for the application is known.
  //
  // ! The tests run in order and share it: the second one picks up where the first left the page,
  // ! so a failed first test fails the second too - read the first failure.
  let ITEM_HASH;

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
    ITEM_HASH = hashOf(itemUrl) + QUERY;
    // 2. Load the page anew at that sub-path with the query string.
    const menuSectionsRail = await settingsUtils.openSettingsByHash(ITEM_HASH);
    // 3. Verify the section, the application and that the url was not rewritten.
    await menuSectionsRail.waitForSectionActive(APPLICATIONS);
    await settingsUtils.waitForSectionScreenLoaded(APPLICATIONS);
    await assertApplicationIsSelected();
    await settingsUtils.waitForUrl(settingsUtils.getSettingsUrl() + ITEM_HASH);
    await settingsUtils.saveScreenshot('deep_link_query_string');
  });

  it('GIVEN the section is opened at a sub-path with a query string WHEN another section has been opened and the first one returned to THEN its rail item should carry the sub-path with the query string AND lead back to the same url', async () => {
    let menuSectionsRail = new MenuSectionsRail();
    // 1. Leave the section.
    await menuSectionsRail.clickOnSectionButton(ROLES);
    await settingsUtils.waitForSectionScreenLoaded(ROLES);
    await settingsUtils.waitForUrl(settingsUtils.getSectionUrl(ROLES));
    // 2. Verify that the rail item remembers the query string along with the sub-path.
    await menuSectionsRail.waitForSectionHref(APPLICATIONS, ITEM_HASH);
    // 3. Return: the same url, the same application.
    await menuSectionsRail.clickOnSectionButton(APPLICATIONS);
    await settingsUtils.waitForUrl(settingsUtils.getSettingsUrl() + ITEM_HASH);
    await assertApplicationIsSelected();
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
