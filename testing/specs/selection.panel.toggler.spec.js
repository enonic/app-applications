const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');

describe('Applications Browse panel - `Selection Toggler` spec', function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === "undefined") {
        webDriverHelper.setupBrowser();
    }

    it(`WHEN applications grid is loaded(no selections) THEN 'selection toggler' should not be displayed`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let isVisible = await appBrowsePanel.waitForSelectionTogglerVisible();
            assert.isFalse(isVisible, "'selection toogler' should not be displayed");
        });

    it(`WHEN existing application is checked THEN 'selection toggler' gets visible`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            let isVisible = await appBrowsePanel.waitForSelectionTogglerVisible();
            assert.isTrue(isVisible, "'selection toogler' should be displayed");
        });

    it("WHEN two application are checked THEN '2' should appear in 'selection toggler'",
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Check two applications:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
            //2. Selection ogler ges visible:
            await appBrowsePanel.waitForSelectionTogglerVisible();
            await appBrowsePanel.pause(500);
            let result = await appBrowsePanel.getNumberInSelectionToggler();
            studioUtils.saveScreenshot("2_app_selected");
            assert.equal(result, 2, ' 2 should be present on the button');
        });

    it(`GIVEN two application are checked WHEN 'show selection' has been clicked THEN two applications should be in the filtered grid`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1.Check two apps:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
            await appBrowsePanel.waitForSelectionTogglerVisible();
            //2. Click on Selection Togler:
            await appBrowsePanel.clickOnSelectionToggler();
            await appBrowsePanel.pause(1000);
            let names = await appBrowsePanel.getApplicationDisplayNames();
            studioUtils.saveScreenshot("show_selection");
            assert.equal(names.length, 2, 'two applications should be in the filtered grid');
        });

    it(`GIVEN 'show selection' is clicked WHEN 'hide selection' has been clicked THEN original grid should be restored`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Two apps are checked:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
            await appBrowsePanel.waitForSelectionTogglerVisible();
            //2. Click on 'Show selection' (toggler)
            await appBrowsePanel.clickOnSelectionToggler();
            await appBrowsePanel.pause(1000);
            //3. Click on 'Hide selection' (toggler)
            await appBrowsePanel.clickOnSelectionToggler();
            await appBrowsePanel.pause(1000);
            let names = await appBrowsePanel.getApplicationDisplayNames();
            studioUtils.saveScreenshot("hide_selection");
            assert.isTrue(names.length > 2, 'original grid should be restored');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
