const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils');
const appConstants = require('../libs/app_const');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const AppStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

describe("Item Statistics Panel 'Action Menu' spec", function () {
    this.timeout(appConstants.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    const APP_DISPLAY_NAME = 'First Selenium App';
    const APP_DISPLAY_NAME2 = 'Second Selenium App';

    it(`WHEN started application is selected THEN expected label should be displayed in the drop-down button AND 'Stop' menu item should be hidden`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select the application:
            await appBrowsePanel.clickOnRowByDisplayName(APP_DISPLAY_NAME);
            //2. Verify the info in Statistics Panel:
            let result = await appStatisticPanel.getDropDownButtonText();
            studioUtils.saveScreenshot("application_action_menu_collapsed");
            assert.strictEqual(result, 'Started', 'correct label should be displayed on the drop-down button');

            let isVisible = await appStatisticPanel.waitForStopMenuItemVisible();
            assert.isFalse(isVisible, '`Stop` menu item should not be visible, because the menu is collapsed');
        });

    it(`GIVEN started application is selected WHEN Click on dropdown handle, expand the menu THEN 'Stop' menu item gets visible`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select the application
            await appBrowsePanel.clickOnRowByDisplayName(APP_DISPLAY_NAME);
            //2. Click on dropdown handle and expand the menu in Statistics Panel:
            await appStatisticPanel.clickOnActionDropDownMenu();
            let isVisible = await appStatisticPanel.waitForStopMenuItemVisible();
            studioUtils.saveScreenshot("action_menu_is_expanded");
            assert.isTrue(isVisible, "'Stop' menu item should appear");
        });

    it(`GIVEN existing application is started WHEN Stop menu-item has been clicked THEN the application gets 'stopped'`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select the app and expand he menu:
            await appBrowsePanel.clickOnRowByDisplayName(APP_DISPLAY_NAME);
            await appStatisticPanel.clickOnActionDropDownMenu();
            await appStatisticPanel.waitForStopMenuItemVisible();
            //2. Stop the app:
            await appStatisticPanel.clickOnStopActionMenuItem();
            await appBrowsePanel.pause(2000);
            let state = await appBrowsePanel.getApplicationState(APP_DISPLAY_NAME);
            studioUtils.saveScreenshot("action_menu_app_stopped");
            assert.strictEqual(state, 'stopped', 'The application should be `stopped`');
        });

    it(`GIVEN existing application is stopped WHEN Start menu-item has been clicked THEN the application gets 'started'`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select the app and expand he menu:
            await appBrowsePanel.clickOnRowByDisplayName(APP_DISPLAY_NAME);
            //2. Start the app:
            await appStatisticPanel.clickOnActionDropDownMenu();
            await appStatisticPanel.waitForStartMenuItemVisible();
            await appStatisticPanel.clickOnStartActionMenuItem();
            await appBrowsePanel.pause(2000);
            let state = await appBrowsePanel.getApplicationState(APP_DISPLAY_NAME);
            studioUtils.saveScreenshot("action_menu_app_started");
            assert.strictEqual(state, 'started', 'The application should be `started`');
        });

    //Verifies issue https://github.com/enonic/app-applications/issues/336
    //Start/Stop action in Application Statistics Panel starts/stops all selected applications #336
    it(`GIVEN two started applications are selected WHEN Stop menu-item has been clicked THEN last selected application should be stopped`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select two applications and expand the menu in Statistics Panel:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(APP_DISPLAY_NAME);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(APP_DISPLAY_NAME2);
            //2. Click on 'Stop' menu button in action menu:
            await appStatisticPanel.clickOnActionDropDownMenu();
            await appStatisticPanel.pause(200);
            await appStatisticPanel.clickOnStopActionMenuItem();
            await appBrowsePanel.pause(2000);
            //3. Verify applications state:
            let state1 = await appBrowsePanel.getApplicationState(APP_DISPLAY_NAME);
            studioUtils.saveScreenshot("action_menu_multiselect");
            assert.strictEqual(state1, 'started', "The application should be 'started'");
            let state2 = await appBrowsePanel.getApplicationState(APP_DISPLAY_NAME2);
            assert.strictEqual(state2, 'stopped', "The application should be 'stopped'");

        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
