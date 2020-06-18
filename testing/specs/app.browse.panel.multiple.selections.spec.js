const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const appConst = require('../libs/app_const');
const StatisticPanel = require('../page_objects/applications/application.item.statistic.panel');
const studioUtils = require('../libs/studio.utils.js');

describe('Application Browse Panel, multiple selection in grid', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN two started applications are checked WHEN Stop button has been pressed THEN Stop gets disabled AND Start gets enabled`,
        async () => {
            //preconditions:
            //await restartApps();
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP)
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);

            await appBrowsePanel.clickOnStopButton();
            await appBrowsePanel.waitForStartButtonEnabled();
            let result = await appBrowsePanel.isStopButtonEnabled();
            assert.isFalse(result, "`Stop` button should be disabled");

            let statisticPanel = new StatisticPanel();
            //Stopped status should be displayed on  Statistic Panel
            await statisticPanel.waitForApplicationStatus("Stopped");
        });

    it(`GIVEN two stopped applications are checked WHEN right click on selected apps THEN Start menu item should be enabled in the opened context menu`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Two applications have been selected:
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            //2. Open the context menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            //'Start' menu item should be enabled
            await appBrowsePanel.waitForContextMenuItemEnabled('Start');
            //'Stop' menu item should be disabled
            await appBrowsePanel.waitForContextMenuItemDisabled('Stop');
            studioUtils.saveScreenshot("2apps_context_menu_1");
            let statisticPanel = new StatisticPanel();
            //'Stopped' status should be displayed in Statistic Panel:
            await statisticPanel.waitForApplicationStatus("Stopped");
        });

    it('GIVEN two stopped applications are checked WHEN Start button has been pressed THEN Start button gets disabled AND Stop gets enabled',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Select and stop two applications:
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnStartButton();
            //`Start` button gets disabled:
            await appBrowsePanel.waitForStartButtonDisabled();
            let result = await appBrowsePanel.isStopButtonEnabled();
            assert.isTrue(result, "'Stop' button gets enabled");
            let statisticPanel = new StatisticPanel();
            //'Started' status should be displayed in Statistic Panel:
            await statisticPanel.waitForApplicationStatus("Started");
        });

    it(`GIVEN one stopped and one started applications are checked WHEN right click on selected apps THEN Start and Stop menu item should be enabled in the opened context menu`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Select and stop the app:
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.clickOnStopButton();
            //2. Select the second app(stated):
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            //3. Open the context menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            studioUtils.saveScreenshot("2apps_context_menu");
            await appBrowsePanel.waitForContextMenuItemEnabled('Start');
            //'Stop menu item should be enabled'
            await appBrowsePanel.waitForContextMenuItemEnabled('Stop');
        });

    it('GIVEN at least one app is stopped AND `select all` checkbox is checked WHEN right click on selected apps THEN Start and Stop menu item should be enabled in the opened context menu',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Select all applications(one app is stopped):
            await appBrowsePanel.clickOnSelectAll();
            //2. Open the context menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            studioUtils.saveScreenshot("all_apps_context_menu");
            await appBrowsePanel.waitForContextMenuItemEnabled('Start');
            //'Stop menu item should be enabled'
            await appBrowsePanel.waitForContextMenuItemEnabled('Stop');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});

function restartApps() {
    let appBrowsePanel = new AppBrowsePanel();
    return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.THIRD_APP).then(result => {
        if (result === 'stopped') {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.clickOnStartButton();
            })
        }
    }).then(() => {
        return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.FIRST_APP).then(result => {
            if (result === 'stopped') {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(() => {
                    return appBrowsePanel.clickOnStartButton();
                })
            }
        });
    });
}





