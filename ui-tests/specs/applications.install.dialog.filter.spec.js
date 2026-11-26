const webDriverHelper = require('../libs/WebDriverHelper');
const settingsUtils = require('../libs/settings.utils');
const appConst = require('../libs/app_const');
const assert = require('node:assert');
const ApplicationsPage = require('../page_objects/applications.page');
const InstallAppDialog = require('../page_objects/install.app.dialog');

describe("applications.install.dialog.filter.spec - the 'License' and 'Upgrade available' fields of the market filter: the counts their values carry add up to the list, and a value picked narrows the list to its count", function () {
  this.timeout(appConst.SUITE_TIMEOUT);
  if (typeof browser === 'undefined') {
    webDriverHelper.setupBrowser();
  }

  const FIELD = appConst.INSTALL_DIALOG.FILTER_FIELD;
  const YES = appConst.FILTER_VALUE.YES;
  const NO = appConst.FILTER_VALUE.NO;
  // How many applications the market lists for this XP, read once the dialog has loaded.
  let TOTAL;

  async function waitForRowCount(expected) {
    const installAppDialog = new InstallAppDialog();
    let actual;
    await settingsUtils.getBrowser().waitUntil(
      async () => {
        actual = (await installAppDialog.getMarketAppDisplayNames()).length;
        return actual === expected;
      },
      {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: () => `The market list should hold ${expected} rows, got ${actual}`,
      },
    );
  }

  it("GIVEN the market list is loaded WHEN 'License' has been opened in the filter dropdown THEN its values should count every application once AND WHEN the first value has been picked THEN the list should be narrowed to its count", async () => {
    let installAppDialog = new InstallAppDialog();
    // 1. Open the field: one value per license the market lists, each with its count.
    await installAppDialog.clickOnFilterButton();
    await installAppDialog.clickOnFilterField(FIELD.LICENSE);
    const values = await installAppDialog.getFilterValues();
    assert.ok(values.length > 0, 'The License field should offer values');
    // 2. Every application has one license, so the counts add up to the list.
    const counted = values.reduce((sum, value) => sum + value.count, 0);
    assert.equal(counted, TOTAL, `The License counts should add up to the ${TOTAL} rows`);
    // 3. Pick the first value: a tag, and the list narrowed to its count.
    const picked = values[0];
    await installAppDialog.clickOnFilterValue(picked.label);
    await installAppDialog.waitForFilterTerm(FIELD.LICENSE, picked.label);
    await waitForRowCount(picked.count);
    await settingsUtils.saveScreenshot('market_filter_license');
    // 4. Remove the tag: the whole list again.
    await installAppDialog.removeFilterTerm(FIELD.LICENSE, picked.label);
    await waitForRowCount(TOTAL);
  });

  it("GIVEN the market list is loaded WHEN 'Upgrade available' has been opened in the filter dropdown THEN 'Yes' and 'No' should count every application between them AND WHEN 'No' has been picked THEN the list should be narrowed to its count", async () => {
    let installAppDialog = new InstallAppDialog();
    // 1. Open the field: 'Yes' and 'No', with their counts.
    await installAppDialog.clickOnFilterButton();
    await installAppDialog.clickOnFilterField(FIELD.UPGRADE);
    const values = await installAppDialog.getFilterValues();
    const yes = values.find((value) => value.label === YES);
    const no = values.find((value) => value.label === NO);
    assert.ok(
      yes !== undefined && no !== undefined,
      `'Yes' and 'No' expected, got ${JSON.stringify(values)}`,
    );
    assert.equal(yes.count + no.count, TOTAL, `'Yes' and 'No' should add up to the ${TOTAL} rows`);
    // 2. Pick 'No': the applications with nothing newer on the market, which on a fresh XP with
    //    nothing installed from the market is every one of them.
    await installAppDialog.clickOnFilterValue(NO);
    await installAppDialog.waitForFilterTerm(FIELD.UPGRADE, NO);
    await waitForRowCount(no.count);
    await settingsUtils.saveScreenshot('market_filter_upgrade_no');
    await installAppDialog.removeFilterTerm(FIELD.UPGRADE, NO);
    await waitForRowCount(TOTAL);
    // 3. 'Yes' is offered only while something counts under it: a value with a count of zero is
    //    withheld. Picked, the list is narrowed to the upgradable applications.
    await installAppDialog.clickOnFilterButton();
    await installAppDialog.clickOnFilterField(FIELD.UPGRADE);
    const yesAgain = (await installAppDialog.getFilterValues()).find(
      (value) => value.label === YES,
    );
    if (yes.count === 0) {
      assert.ok(yesAgain.disabled, "'Yes' should be withheld while nothing can be upgraded");
      await installAppDialog.closeFilterPopup();
      return;
    }
    await installAppDialog.clickOnFilterValue(YES);
    await installAppDialog.waitForFilterTerm(FIELD.UPGRADE, YES);
    await waitForRowCount(yes.count);
    await installAppDialog.removeFilterTerm(FIELD.UPGRADE, YES);
    await waitForRowCount(TOTAL);
  });

  // The dialog is opened once for the spec: the market is fetched when it opens, and both tests
  // read the same list.
  before(async () => {
    let applicationsPage = new ApplicationsPage();
    let installAppDialog = new InstallAppDialog();
    await settingsUtils.navigateToSettingsApp('su', 'password');
    await settingsUtils.navigateToApplicationsSection();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.clickOnInstallButton();
    await installAppDialog.waitForDialogOpened();
    await installAppDialog.waitForMarketListLoaded(appConst.TIMEOUT.LONG);
    TOTAL = (await installAppDialog.getMarketAppDisplayNames()).length;
    assert.ok(TOTAL > 0, 'The market should list applications');
  });

  after(async () => {
    let installAppDialog = new InstallAppDialog();
    if (await installAppDialog.isDialogDisplayed()) {
      await installAppDialog.clickOnCloseButton();
    }
  });
});
