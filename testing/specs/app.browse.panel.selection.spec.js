const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const AppStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

describe('Applications Browse panel - selection of items spec', function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    // Content Studio should not be installed!
    const EXPECTED_NUMBER_OF_APPLICATIONS = 5;

    it(`GIVEN applications grid is loaded THEN expected page-title should be displayed`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let title = await appBrowsePanel.getTitle();
            assert.equal(title, appConst.APPLICATION_TITLE, "expected page-title should be loaded");
        });

    it(`WHEN 'selection controller'-checkbox has been clicked THEN all rows in grid should be selected`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickOnSelectionControllerCheckbox();
            await studioUtils.saveScreenshot('selection_controller_checked');
            let number = await appBrowsePanel.getNumberOfCheckedRows();
            assert.ok(number >= EXPECTED_NUMBER_OF_APPLICATIONS, 'all applications should be selected');
        });

    it(`GIVEN all apps are selected WHEN 'selection controller'-checkbox has been clicked THEN all rows in grid get white`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Click on the checkbox and select all apps:
            await appBrowsePanel.clickOnSelectionControllerCheckbox();
            // 2. Click on the checkbox and unselect all apps:
            await appBrowsePanel.clickOnSelectionControllerCheckbox();
            await studioUtils.saveScreenshot('selection_controller_unchecked');
            let number = await appBrowsePanel.getNumberOfCheckedRows();
            assert.equal(number, 0, 'all applications should be unselected');
        });

    it(`WHEN applications grid is loaded THEN rows with applications should be present in the grid`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let result = await appBrowsePanel.getApplicationDisplayNames();
            await studioUtils.saveScreenshot('app_browse_application');
            assert.ok(result.length > 0, 'rows with applications should be present in the grid');
        });

    it(`GIVEN an existing app is checked WHEN 'Arrow Down' key has been pressed THEN the app gets unchecked AND the app below gets highlighted`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Check the app:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            let isChecked = await appBrowsePanel.isRowChecked(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            assert.ok(isChecked, 'the row with the application should be checked');
            // 2. Press 'Arrow Down' key:
            await appBrowsePanel.pressArrowDownKey();
            await studioUtils.saveScreenshot('arrow_down_key');
            // 3. Verify that another application is shown in the Statistic Panel
            let appName = await appStatisticPanel.getApplicationName();
            assert.equal(appName, appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP,
                'the application which is below should be shown in the Statistic Panel');
            isChecked = await appBrowsePanel.isRowChecked(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            assert.ok(isChecked === false, 'the application should not be checked');
            let isHighlighted = await appBrowsePanel.isRowHighlighted(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            assert.ok(isHighlighted, 'but the app which is below gets highlighted');
        });

    it(`GIVEN existing app is checked WHEN 'Arrow Up' key has been pressed THEN the app above should become selected`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Select the app:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            // 2. Press 'Arrow Up' key:
            await appBrowsePanel.pressArrowUpKey();
            await studioUtils.saveScreenshot('arrow_up_key');
            // 3. Verify the application which is above should be shown in the Statistic Panel
            let result = await appStatisticPanel.getApplicationName();
            assert.equal(result, appConst.TEST_APPS_NAME.SIMPLE_SITE_APP,
                'the application which is above should be shown in the Statistic Panel');
            // 4. Verify that the gets unchecked:
            let isChecked = await appBrowsePanel.isRowChecked(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            assert.ok(isChecked === false, 'the application should not be checked');
            // 5. Verify that the application which is above gets highlighted:
            let isHighlighted = await appBrowsePanel.isRowHighlighted(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            assert.ok(isHighlighted, 'but the app which is above above gets highlighted');
        });

    it(`GIVEN existing app is selected WHEN selecting one more THEN last selected app should be displayed in the 'Selection Panel'`,
        async () => {
            let appStatisticPanel = new AppStatisticPanel();
            let appBrowsePanel = new AppBrowsePanel();
            // 1. Select 2 checkboxes:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            // 2. Verify the app-name in Statistics Panel
            let result = await appStatisticPanel.getApplicationName();
            assert.equal(result, appConst.TEST_APPS_NAME.SIMPLE_SITE_APP, 'The last checked app should be shown in the Selection Panel');
        });

    it(`GIVEN three apps are checked WHEN one app has been unchecked THEN the second-checked app should be displayed in the 'Statistic Panel'`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Select three applications:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.TEST_ADFS_PROVIDER_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.SIMPLE_SITE_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.MY_FIRST_APP);
            // 2. Unselect one application:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPS_NAME.MY_FIRST_APP);
            await appBrowsePanel.pause(1000);
            await studioUtils.saveScreenshot('last_app_in_stat_panel');
            let appName = await appStatisticPanel.getApplicationName();
            assert.equal(appName, appConst.TEST_APPS_NAME.SIMPLE_SITE_APP, 'The last selected app should be shown in the Selection Panel');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
