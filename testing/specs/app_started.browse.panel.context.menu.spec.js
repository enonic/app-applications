const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe(`Applications Grid context menu`, function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it("Context menu should initially not be visible", () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.waitForContextMenuNotDisplayed().then(result => {
            assert.isTrue(result, 'context menu should initially not be visible');
        })
    });
    //verifies the https://github.com/enonic/lib-admin-ui/issues/478
    //BrowsePanel - context menu does not appear when right click on selected row
    it(`GIVEN one row is selected WHEN right click on the row THEN context menu should appear`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
            return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
        }).then(() => {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(result => {
            studioUtils.saveScreenshot("app_context_menu_blue");
            assert.isTrue(result, 'context menu should be visible');
        })
    });

    it(`WHEN right click an an application THEN context menu should appear`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(result => {
            studioUtils.saveScreenshot("app_context_menu1");
            assert.isTrue(result, 'context menu should be visible');
        })
    });

    it(`WHEN right click on a started application THEN 'Start' menu item should be disabled, because the application is started`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.THIRD_APP).then(state => {
            if (state == 'stopped') {
                return appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                    return appBrowsePanel.clickOnStartButton();
                }).then(() => {
                    return appBrowsePanel.pause(2000);
                })
            }
        }).then(() => {
            return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.waitForContextMenuDisplayed();
            }).then(() => {
                studioUtils.saveScreenshot("app_context_menu2");
                return appBrowsePanel.waitForContextMenuItemDisabled('Start');
            }).then(() => {
                //'Stop menu item should be enabled'
                return appBrowsePanel.waitForContextMenuItemEnabled('Stop');
            }).then(() => {
                //Uninstall menu item should be disabled, because the application is local.
                return appBrowsePanel.waitForContextMenuItemDisabled('Uninstall');
            })
        });
    });

    it(`should close the context menu after clicking on the same row`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
            return appBrowsePanel.waitForContextMenuDisplayed();
        }).then(() => {
            return appBrowsePanel.clickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
        }).then(() => {
            return appBrowsePanel.waitForContextMenuNotDisplayed()
        });
    });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});

