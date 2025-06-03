const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');

describe('Applications Browse panel - `Application Selection Toggle` spec', function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it(`WHEN applications grid is loaded(no selections) THEN 'selection toggler' should not be displayed`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let isVisible = await appBrowsePanel.waitForSelectionTogglerVisible();
            assert.ok(isVisible === false, `'selection toggle' should not be displayed`);
        });

    it(`WHEN existing application is checked THEN 'selection toggler' gets visible`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            let isVisible = await appBrowsePanel.waitForSelectionTogglerVisible();
            assert.ok(isVisible, "'selection toggle' should be displayed");
        });

    it("WHEN two application are checked THEN '2' should appear in 'selection toggle'",
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Check two applications:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            // 2. SelectionPanelToggle gets visible with '2' in it:
            await appBrowsePanel.waitForSelectionTogglerVisible();
            await appBrowsePanel.pause(500);
            let result = await appBrowsePanel.getNumberInSelectionToggler();
            await studioUtils.saveScreenshot('2_app_selected');
            assert.equal(result, 2, ' 2 should be present on the button');
        });

    it(`GIVEN two apps are checked WHEN 'show selection' has been clicked THEN two apps should be shown in the filtered grid`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Check two apps:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            await appBrowsePanel.waitForSelectionTogglerVisible();
            // 2. Click on Selection Toggle:
            await appBrowsePanel.clickOnSelectionToggler();
            await appBrowsePanel.pause(1000);
            // 3. Verify that only two applications are displayed in the filtered grid:
            let names = await appBrowsePanel.getApplicationDisplayNames();
            await studioUtils.saveScreenshot('show_selection');
            assert.equal(names.length, 2, 'two applications should be in the filtered grid');
        });

    it(`GIVEN 2 items are checked AND 'show selection' has been clicked WHEN 'hide selection' has been clicked THEN the original grid should be restored`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Two apps are checked:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            await appBrowsePanel.waitForSelectionTogglerVisible();
            // 2. Click on 'Show selection' (toggle)
            await appBrowsePanel.clickOnSelectionToggler();
            await appBrowsePanel.pause(1000);
            // 3. Click on 'Hide selection' (toggle)
            await appBrowsePanel.clickOnSelectionToggler();
            await appBrowsePanel.pause(1000);
            let names = await appBrowsePanel.getApplicationDisplayNames();
            await studioUtils.saveScreenshot('hide_selection');
            assert.ok(names.length > 2, 'original grid should be restored');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
