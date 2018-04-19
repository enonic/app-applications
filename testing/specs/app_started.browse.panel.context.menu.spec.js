const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const installAppDialog = require('../page_objects/applications/install.app.dialog');
const uninstallDialog = require('../page_objects/applications/uninstall.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe(`Applications Grid context menu`, function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`context menu should initially not be visible`, () => {
        return appBrowsePanel.waitForContextMenuNotDisplayed().then((result)=> {
            assert.isTrue(result, 'context menu should initially not be visible');
        })
    });

    it(`WHEN right click an an application THEN context menu should appear`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(()=> {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(result=> {
            studioUtils.saveScreenshot(webDriverHelper.browser, "app_context_menu");
            assert.isTrue(result, 'context menu should be visible');
        })
    });
    it(`WHEN right click an an application THEN 'Start' menu item should be disabled, because the application is started`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(()=> {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(()=> {
            return appBrowsePanel.waitForContextButtonVisible('Start', 'disabled');
        }).then(result=> {
            studioUtils.saveScreenshot(webDriverHelper.browser, "start_menu_item");
            assert.isTrue(result, 'Start menu item should be disabled');
        })
    });

    it(`WHEN right click an an application THEN 'Stop' menu item should be enabled, because the application is started`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(()=> {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(()=> {
            return appBrowsePanel.waitForContextButtonEnabled('Stop');
        }).then(result=> {
            studioUtils.saveScreenshot(webDriverHelper.browser, "stop_menu_item");
            assert.isTrue(result, 'Stop menu item should be enabled');
        })
    });

    it(`WHEN right click an an application THEN 'Uninstall' menu item should be disabled, because the application is local`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(()=> {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(()=> {
            return appBrowsePanel.waitForContextButtonVisible('Uninstall', 'disabled');
        }).then(result=> {
            studioUtils.saveScreenshot(webDriverHelper.browser, "uninstall_menu_item");
            assert.isTrue(result, 'Uninstall menu item should be disabled');
        })
    });

    it(`should close the context menu after clicking on the same row`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(()=> {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(() => {
            appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP)
        }).then(() => appBrowsePanel.waitForContextMenuNotDisplayed());
    });


    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(()=> {
        return console.log('specification is starting: ' + this.title);
    });

});

