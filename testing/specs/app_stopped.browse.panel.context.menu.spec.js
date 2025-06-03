const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe(`Applications Grid context menu, application is stopped`, function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it(`GIVEN existing an app is highlighted WHEN 'Stop' button has been clicked THEN the application gets stopped`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPS_NAME.MY_FIRST_APP);
            let state = await appBrowsePanel.getApplicationState(appConst.TEST_APPS_NAME.MY_FIRST_APP);
            if (state === 'started') {
                await appBrowsePanel.clickOnStopButton();
            }
            state = await appBrowsePanel.getApplicationState(appConst.TEST_APPS_NAME.MY_FIRST_APP);
            assert.equal(state, 'stopped', "The app state should be 'stopped'");
        });

    it(`WHEN do right click on the stopped app THEN 'Start' menu item should be enabled`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPS_NAME.MY_FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            await studioUtils.saveScreenshot('start_menu_item2');
            // 'Start menu item should be enabled'
            await appBrowsePanel.waitForContextMenuItemEnabled('Start');
        });

    it(`WHEN do right click an the stopped app THEN 'Stop' menu item should be disabled`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPS_NAME.MY_FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            // 'Stop menu item should be disabled', otherwise exception will be thrown
            await appBrowsePanel.waitForContextMenuItemDisabled('Stop');
            // this application is local so 'Uninstall' button should be disabled:
            await appBrowsePanel.waitForContextMenuItemDisabled('Uninstall');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
