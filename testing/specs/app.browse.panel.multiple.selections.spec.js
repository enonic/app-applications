const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const appConst = require('../libs/app_const');
const StatisticPanel = require('../page_objects/applications/application.item.statistic.panel');
const studioUtils = require('../libs/studio.utils.js');

describe('Application Browse Panel, multiple selection in grid', function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it(`GIVEN two started applications are checked WHEN Stop button has been pressed THEN Stop gets disabled AND Start gets enabled`,
        async () => {
            //preconditions:
            //await restartApps();
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Select 2 apps (started)
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            // 2. Click on 'Stop' button:
            await appBrowsePanel.clickOnStopButton();
            // 3. Verify that Start button gets enabled:
            await appBrowsePanel.waitForStartButtonEnabled();
            // 4. 'Stop' button should be disabled:
            let isEnabled = await appBrowsePanel.isStopButtonEnabled();
            assert.ok(isEnabled === false, "'Stop' button should be disabled");
            let statisticPanel = new StatisticPanel();
            // 5. 'Stopped' status should be displayed in Statistic Panel
            await statisticPanel.waitForApplicationStatus('Stopped');
        });

    it(`GIVEN two stopped applications are checked WHEN right click on selected apps THEN Start menu item should be enabled in the opened context menu`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Two applications have been selected:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            // 2. Open the context menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            // 'Start' menu item should be enabled
            await appBrowsePanel.waitForContextMenuItemEnabled('Start');
            // 'Stop' menu item should be disabled
            await appBrowsePanel.waitForContextMenuItemDisabled('Stop');
            await studioUtils.saveScreenshot('2_apps_context_menu_1');
            let statisticPanel = new StatisticPanel();
            // 'Stopped' status should be displayed in Statistic Panel:
            await statisticPanel.waitForApplicationStatus('Stopped');
        });

    it('GIVEN two stopped applications are checked WHEN Start button has been pressed THEN Start button gets disabled AND Stop gets enabled',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Select and stop two applications:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnStartButton();
            //`Start` button gets disabled:
            await appBrowsePanel.waitForStartButtonDisabled();
            // 'Stop' button is enabled:
            let isEnabled = await appBrowsePanel.isStopButtonEnabled();
            assert.ok(isEnabled, "'Stop' button in browse toolbar should be enabled");
            let statisticPanel = new StatisticPanel();
            //'Started' status should be displayed in Statistic Panel:
            await statisticPanel.waitForApplicationStatus('Started');
        });

    it(`GIVEN one stopped and one started applications are checked WHEN right click on selected apps THEN Start and Stop menu item should be enabled in the opened context menu`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Select and stop the app:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            await appBrowsePanel.clickOnStopButton();
            // 2. Select the second app(stated):
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            // 3. Open the context menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            await studioUtils.saveScreenshot('2_apps_context_menu');
            await appBrowsePanel.waitForContextMenuItemEnabled('Start');
            // 'Stop menu item should be enabled'
            await appBrowsePanel.waitForContextMenuItemEnabled('Stop');
        });

    it('GIVEN at least one app is stopped AND `select all` checkbox is checked WHEN right click on selected apps THEN Start and Stop menu item should be enabled in the opened context menu',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Select all applications(one app is stopped):
            await appBrowsePanel.clickOnSelectAllCheckbox();
            // 2. Open the context menu:
            await appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.waitForContextMenuDisplayed();
            await studioUtils.saveScreenshot('all_apps_context_menu');
            // 3. Verify that Start and Stop menu items are enabled:
            await appBrowsePanel.waitForContextMenuItemEnabled('Start');
            // 'Stop' menu item should be enabled'
            await appBrowsePanel.waitForContextMenuItemEnabled('Stop');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});

function restartApps() {
    let appBrowsePanel = new AppBrowsePanel();
    return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.THIRD_APP).then(result => {
        if (result === 'stopped') {
            return appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.clickOnStartButton();
            })
        }
    }).then(() => {
        return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.FIRST_APP).then(result => {
            if (result === 'stopped') {
                return appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(() => {
                    return appBrowsePanel.clickOnStartButton();
                })
            }
        });
    });
}
