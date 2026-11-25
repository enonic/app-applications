const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../libs/users.items.builder');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const ApplicationsPage = require('../page_objects/applications.page');

describe("service.account.admin.role.spec - an account with 'Administrator' gets every section, 'Applications' among them, and its toolbar: 'Install' enabled, the actions on a selection disabled until there is one", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // 'Administration Console Login' lets the account into XP admin; 'Administrator' passes every
  // section's access rules, and 'Applications' is open to it alone.
  const ROLES = [appConst.SYSTEM_ROLES.ADMIN_CONSOLE, appConst.SYSTEM_ROLES.ADMINISTRATOR];
  const NEW_ACCOUNT = userItemsBuilder.buildServiceAccount({
    displayName: userItemsBuilder.generateRandomName('account'),
    password: appConst.PASSWORD.MEDIUM,
    roles: ROLES,
  });
  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  const BUTTON = appConst.TOOLBAR;
  // The account the API returned, once it has: from then on it is this run's to delete. Mocha runs
  // `after` even when `before` throws, and `after` must delete nothing it did not see created.
  let ACCOUNT;

  // The toolbar as the role gets it with nothing selected: Install needs no selection and is
  // enabled; Uninstall, Start and Stop act on a selection and are disabled until there is one.
  async function assertToolbarOfferedWithNothingSelected(applicationsPage) {
    await applicationsPage.waitForToolbarButtonEnabled(BUTTON.INSTALL);
    for (const label of [BUTTON.UNINSTALL, BUTTON.START, BUTTON.STOP]) {
      await applicationsPage.waitForToolbarButtonDisabled(label);
    }
  }

  it("GIVEN the new account is logged in WHEN the Settings app has been opened THEN 'Applications' item should be displayed in the rail along with the sections of Users", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    // 1. Log in as the account made in `before` and open the Settings app from the XP menu.
    await settingsUtils.navigateToSettingsApp(ACCOUNT.id, ACCOUNT.password);
    await menuSectionsRail.waitForSectionButtonDisplayed(APPLICATIONS);
    await settingsUtils.saveScreenshot('rail_administrator');
    // 2. Verify that every section is listed - whatever order their providers put them in. A test
    //    application may add sections of its own, so the rail may hold more than these.
    const actual = await menuSectionsRail.getSectionNames();
    const missing = Object.values(appConst.EXTENSIONS).filter((name) => !actual.includes(name));
    assert.deepEqual(missing, [], `Sections missing in the rail, listed: ${actual.join(', ')}`);
  });

  it("GIVEN the account is logged in WHEN 'Applications' item has been clicked THEN 'Install' button should be enabled AND 'Uninstall', 'Start' and 'Stop' should be disabled", async () => {
    let menuSectionsRail = new MenuSectionsRail();
    let applicationsPage = new ApplicationsPage();
    // 1. Open the section by its rail item: the url follows.
    await menuSectionsRail.clickOnSectionButton(APPLICATIONS);
    await settingsUtils.waitForUrl(settingsUtils.getSectionUrl(APPLICATIONS));
    await settingsUtils.waitForSectionScreenLoaded(APPLICATIONS);
    await applicationsPage.waitForLoaded();
    await settingsUtils.saveScreenshot('applications_administrator');
    // 2. Verify that the toolbar holds its four buttons, in the toolbar's order.
    assert.deepEqual(await applicationsPage.getToolbarButtonLabels(), Object.values(BUTTON));
    // 3. Verify which buttons are enabled with nothing selected.
    await assertToolbarOfferedWithNothingSelected(applicationsPage);
  });

  // The test above opens the section inside a page already loaded; a direct link loads the page
  // anew, so the section's access is decided on a cold load, with no other section mounted first.
  it("GIVEN the account is logged in WHEN 'Applications' has been opened by its direct link THEN the section should be active in the rail AND the toolbar should be in the same state", async () => {
    let applicationsPage = new ApplicationsPage();
    // 1. Load the app at '.../com.enonic.xp.app.settings/main#/applications'.
    const menuSectionsRail = await settingsUtils.openSectionByUrl(APPLICATIONS);
    await menuSectionsRail.waitForSectionActive(APPLICATIONS);
    await applicationsPage.waitForLoaded();
    // 2. Verify that the toolbar is enabled the same way as after the rail click.
    await assertToolbarOfferedWithNothingSelected(applicationsPage);
  });

  // The account is made before the first test rather than in one: a failed `before` skips every
  // test instead of letting each fail on an account that is not there.
  before(async () => {
    // 1. Log in as SU; the API is called from the XP home page with its session.
    await settingsUtils.doLogin('su', 'password');
    // 2. Create the account through the API: the editor is not what is under test here.
    ACCOUNT = await settingsUtils.createServiceAccountViaApi(NEW_ACCOUNT);
    // 3. Log out, so the first test logs in as the new account.
    await settingsUtils.doLogout();
  });

  // The account is deleted by SU - it could do so itself, but a cleanup should not depend on what
  // is under test. Once per spec: nothing else here leaves state behind.
  after(async () => {
    if (ACCOUNT === undefined) {
      return;
    }
    await settingsUtils.doLogout();
    await settingsUtils.doLogin('su', 'password');
    await settingsUtils.deletePrincipalsViaApi(ACCOUNT);
  });
});
