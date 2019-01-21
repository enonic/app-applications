const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe(`Applications Grid context menu, application is stopped`, function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN existing an application is selected WHEN 'Stop' button has been clicked THEN the application should be stopped`, () => {
        //this.bail(1);
        return appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP).then(() => {
            return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.SECOND_APP);
        }).then(state => {
            if (state == 'started') {
                return appBrowsePanel.clickOnStopButton();
            }
        }).then(() => {
            return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.SECOND_APP);
        }).then(state => {
            assert.isTrue(state == 'stopped', 'state should be `stopped`');
        })
    });

    it(`WHEN right click an an application THEN 'Start' menu item should be enabled, because the application is stopped`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP).then(() => {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(() => {
            return appBrowsePanel.waitForContextButtonEnabled('Start');
        }).then(result => {
            studioUtils.saveScreenshot("start_menu_item2");
            assert.isTrue(result, 'Start menu item should be enabled');
        })
    });

    it(`WHEN right click an an application THEN 'Stop' menu item should be disabled, because the application is stopped`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP).then(() => {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(() => {
            return appBrowsePanel.waitForContextButtonVisible('Stop', 'disabled');
        }).then(result => {
            studioUtils.saveScreenshot("stop_menu_item");
            assert.isTrue(result, 'Stop menu item should be disabled');
        })
    });

    it(`WHEN right click an an application THEN 'Uninstall' menu item should be disabled, because the application is local`, () => {
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP).then(() => {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(() => {
            return appBrowsePanel.waitForContextButtonVisible('Uninstall', 'disabled');
        }).then(result => {
            studioUtils.saveScreenshot("uninstall_menu_item");
            assert.isTrue(result, 'Uninstall menu item should be disabled');
        })
    });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});

