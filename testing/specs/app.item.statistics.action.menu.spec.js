const chai = require('chai');
const assert = chai.assert;
chai.use(require('chai-as-promised'));
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils');
const appConstants = require('../libs/app_const');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const AppStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

const Apps = {
    firstApp: 'First Selenium App',
};

describe('Item Statistics Panel `Action Menu` spec', function () {
    this.timeout(appConstants.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();


    it(`WHEN application is started THEN expected label should be displayed on the drop-down button AND 'Stop' menu item should be hidden`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.getDropDownButtonText();
            }).then(result => {
                studioUtils.saveScreenshot("application_action_menu_collapsed");
                assert.strictEqual(result, 'Started', 'correct label should be displayed on the drop-down button');
            }).then(() => {
                return appStatisticPanel.waitForStopMenuItemVisible();
            }).then(result => {
                assert.isFalse(result, '`Stop` menu item should not be visible, because the menu is collapsed');
            })
        });

    it(`GIVEN existing application is started WHEN action-menu has been clicked THEN the menu should be expanded AND 'Stop' menu item should appear`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.clickOnActionDropDownMenu();
            }).then(() => {
                return appStatisticPanel.waitForStopMenuItemVisible();
            }).then(result => {
                studioUtils.saveScreenshot("action_menu_is_expanded");
                assert.isTrue(result, '`Stop` menu item should appear');
            })
        });

    it(`GIVEN existing application is started WHEN Stop menu-item has been clicked THEN application is getting 'stopped'`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.clickOnActionDropDownMenu();
            }).then(() => {
                return appStatisticPanel.waitForStopMenuItemVisible();
            }).then(() => {
                return appStatisticPanel.clickOnStopActionMenuItem();
            }).then(()=>{
                return appBrowsePanel.pause(2000);
            }).then(() => {
                return appBrowsePanel.getApplicationState(Apps.firstApp);
            }).then(result => {
                studioUtils.saveScreenshot("action_menu_app_stopped");
                assert.strictEqual(result, 'stopped', 'The application should be `stopped`');
            })
        });

    it(`GIVEN existing application is stopped WHEN Start menu-item has been clicked THEN application is getting 'started'`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel()
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.clickOnActionDropDownMenu();
            }).then(() => {
                return appStatisticPanel.waitForStartMenuItemVisible();
            }).then(() => {
                appStatisticPanel.clickOnStartActionMenuItem();
            }).then(()=>{
                return appBrowsePanel.pause(2000);
            }).then(() => {
                return appBrowsePanel.getApplicationState(Apps.firstApp);
            }).then(result => {
                studioUtils.saveScreenshot("action_menu_app_started");
                assert.strictEqual(result, 'started', 'The application should be `started`');
            })
        }
    );

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
