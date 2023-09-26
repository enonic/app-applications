const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe("Tests for Applications Grid context menu", function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it("Context menu should not be visible initially", async () => {
        let appBrowsePanel = new AppBrowsePanel();
        await appBrowsePanel.waitForContextMenuNotDisplayed();
    });

    // verifies the https://github.com/enonic/lib-admin-ui/issues/478
    // BrowsePanel - context menu does not appear when right click on selected row
    it(`GIVEN one row is selected WHEN right click on the row THEN context menu should appear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            // 'context menu' gets opened:
            await appBrowsePanel.waitForContextMenuDisplayed();
            await studioUtils.saveScreenshot('app_context_menu_blue');
        });

    it(`WHEN right click on an application THEN context menu should appear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. do right-click:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            // 'context menu' gets opened:
            await appBrowsePanel.waitForContextMenuDisplayed();
            await studioUtils.saveScreenshot("app_context_menu1");
        });

    it(`WHEN right click on a started application THEN 'Start' menu item should be disabled, because the application is started`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let state = await appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.THIRD_APP);
            if (state == 'stopped') {
                await appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
                await appBrowsePanel.clickOnStartButton();
                await appBrowsePanel.pause(2000);
            }
            // 1. Open application's Context Menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            await studioUtils.saveScreenshot('app_context_menu2');
            // 2. Verify state of all menu items:
            await appBrowsePanel.waitForContextMenuItemDisabled('Start');
            // 'Stop' menu item should be enabled'
            await appBrowsePanel.waitForContextMenuItemEnabled('Stop');
            // 'Uninstall' menu item should be disabled, because the application is local.
            await appBrowsePanel.waitForContextMenuItemDisabled('Uninstall');
        });

    it(`should close the context menu after clicking on the same row`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Open the context menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            // 2. Click outside the menu:
            await appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.waitForContextMenuNotDisplayed();
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
})
;

