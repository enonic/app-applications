const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe(`Applications Grid context menu, application is stopped`, function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN existing an application is selected WHEN 'Stop' button has been clicked THEN the application gets stopped`, async () => {
        let appBrowsePanel = new AppBrowsePanel();
        await appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
        let state = await appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.SECOND_APP);
        if (state === 'started') {
            await appBrowsePanel.clickOnStopButton();
        }
        state = await appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.SECOND_APP);
        assert.equal(state, 'stopped', 'state should be `stopped`');
    });

    it(`WHEN right click on the stopped application THEN 'Start' menu item should be enabled`, async () => {
        let appBrowsePanel = new AppBrowsePanel();
        await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
        await appBrowsePanel.waitForContextMenuDisplayed();
        studioUtils.saveScreenshot("start_menu_item2");
        //'Start menu item should be enabled'
        await appBrowsePanel.waitForContextMenuItemEnabled('Start');
    });

    it(`WHEN right click an the stopped application THEN 'Stop' menu item should be disabled`, async () => {
        let appBrowsePanel = new AppBrowsePanel();
        await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
        await appBrowsePanel.waitForContextMenuDisplayed();
        //'Stop menu item should be disabled', otherwise exception will be thrown
        await appBrowsePanel.waitForContextMenuItemDisabled('Stop');
        //this application is local - Uninstall button should be disabled:
        await appBrowsePanel.waitForContextMenuItemDisabled('Uninstall');
    });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
