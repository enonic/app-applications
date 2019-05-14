const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');

describe('Applications Browse panel - `Selection Toggler` spec', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`WHEN applications grid is loaded THEN 'selection toogler' should not be displayed`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.waitForSelectionTogglerVisible().then(result => {
            assert.isFalse(result, `'selection toogler' should not be displayed`);
        })
    });

    it(`WHEN existing application is checked THEN 'selection toogler' should appears`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(() => {
            return appBrowsePanel.waitForSelectionTogglerVisible();
        }).then(result => {
            assert.isTrue(result, `'selection toogler' should be displayed`);
        })
    });

    it(`WHEN two application are checked THEN correct number should be present on 'selection toogler'`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(() => {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
        }).then(() => {
            return appBrowsePanel.waitForSelectionTogglerVisible();
        }).then(() => {
            return appBrowsePanel.pause(500);
        }).then(() => {
            return appBrowsePanel.getNumberInSelectionToggler();
        }).then(result => {
            studioUtils.saveScreenshot("2_app_selected");
            assert.equal(result, 2, ' 2 should be present on the button');
        })
    });

    it(`GIVEN two application are checked WHEN 'show selection' has been clicked THEN two applications should be filtered`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(() => {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
        }).then(() => {
            return appBrowsePanel.waitForSelectionTogglerVisible();
        }).then(() => {
            return appBrowsePanel.clickOnSelectionToggler();
        }).then(() => {
            return appBrowsePanel.pause(1000);
        }).then(() => {
            return appBrowsePanel.getApplicationDisplayNames();
        }).then(result => {
            studioUtils.saveScreenshot("show_selection");
            assert.equal(result.length, 2, ' only 2 applications should be displayed in the grid');
        })
    });

    it(`GIVEN 'show selection' is clicked WHEN 'hide selection' has been clicked THEN original grid should be restored`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(() => {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
        }).then(() => {
            return appBrowsePanel.waitForSelectionTogglerVisible();
        }).then(() => {
            return appBrowsePanel.clickOnSelectionToggler();
        }).then(()=>{
            return appBrowsePanel.pause(1000);
        }).then(() => {
            return appBrowsePanel.clickOnSelectionToggler();
        }).then(()=>{
            return appBrowsePanel.pause(1000);
        }).then(() => {
            return appBrowsePanel.getApplicationDisplayNames();
        }).then(result => {
            studioUtils.saveScreenshot("hide_selection");
            assert.isTrue(result.length > 2, 'original grid should be restored');
        })
    });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
