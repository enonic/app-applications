const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const userItemsBuilder = require('../libs/users.items.builder');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const AppShell = require('../page_objects/app.shell');

describe("service.account.cm.expert.role.spec - an account that may log into XP admin but is admitted by no section's access rules gets the Settings app with no section: 'No administration applications' in place of the sections, by the direct link to 'Applications' as much as from the XP menu", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  // 'Administration Console Login' lets the account into XP admin and so into the Settings tool;
  // 'Content Manager Expert' is Content Studio's and admits it to no section here: 'Applications'
  // takes 'Administrator', the sections of Users take their own roles.
  const ROLES = [appConst.SYSTEM_ROLES.ADMIN_CONSOLE, appConst.SYSTEM_ROLES.CM_EXPERT];
  const NEW_ACCOUNT = userItemsBuilder.buildServiceAccount({
    displayName: userItemsBuilder.generateRandomName('account'),
    password: appConst.PASSWORD.MEDIUM,
    roles: ROLES,
  });
  const APPLICATIONS = appConst.EXTENSIONS.APPLICATIONS;
  const EXPECTED_LINES = [appConst.SECTIONS_EMPTY.MESSAGE, appConst.SECTIONS_EMPTY.HINT];
  // The account the API returned, once it has: from then on it is this run's to delete. Mocha runs
  // `after` even when `before` throws, and `after` must delete nothing it did not see created.
  let ACCOUNT;

  async function assertNoSectionIsOffered() {
    const appShell = new AppShell();
    const menuSectionsRail = new MenuSectionsRail();
    await appShell.waitForSectionsEmptyDisplayed();
    assert.deepEqual(await appShell.getSectionsEmptyLines(), EXPECTED_LINES);
    await menuSectionsRail.waitForSectionButtonNotDisplayed(APPLICATIONS);
    assert.deepEqual(
      await menuSectionsRail.getSectionNames(),
      [],
      'The rail should list no section',
    );
  }

  it("GIVEN the account is logged in WHEN the direct link to 'Applications' has been opened THEN 'No administration applications' should be shown in place of the section AND the rail should be empty AND the url should be kept", async () => {
    // 1. Log in as the account made in `before`, on the XP home page.
    await settingsUtils.navigateToHomePage();
    await settingsUtils.doLogin(ACCOUNT.id, ACCOUNT.password);
    // 2. Load the Settings app at '.../com.enonic.xp.app.settings/main#/applications'.
    await settingsUtils.openSectionByUrl(APPLICATIONS);
    await settingsUtils.saveScreenshot('applications_link_cm_expert');
    // 3. Verify the message, the hint and the empty rail.
    await assertNoSectionIsOffered();
    // 4. The url is left as typed: a path no section answers to is sent to the first section, and
    //    there is none to send it to.
    await settingsUtils.waitForUrl(settingsUtils.getSectionUrl(APPLICATIONS));
  });

  it("GIVEN the account is logged in WHEN the Settings app has been opened from the XP menu THEN 'No administration applications' should be shown AND the rail should be empty", async () => {
    // 1. Back to the XP home page, still logged in as the account, and open the Settings app the
    //    ordinary way: the XP menu offers it, since the tool itself admits everyone who may log
    //    into XP admin.
    await settingsUtils.navigateToHomePage();
    await settingsUtils.navigateToSettingsApp(ACCOUNT.id, ACCOUNT.password);
    await settingsUtils.saveScreenshot('settings_menu_cm_expert');
    // 2. Verify the message, the hint and the empty rail.
    await assertNoSectionIsOffered();
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

  after(async () => {
    if (ACCOUNT === undefined) {
      return;
    }
    await settingsUtils.doLogout();
    await settingsUtils.doLogin('su', 'password');
    await settingsUtils.deletePrincipalsViaApi(ACCOUNT);
  });
});
