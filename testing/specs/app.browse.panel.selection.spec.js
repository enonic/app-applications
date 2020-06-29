const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const AppStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

describe('Applications Browse panel - selection of items spec', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    //Content Studio should not be installed!
    const TOTAL_NUMBER_OF_APPLICATIONS = 5;

    it(`GIVEN applications grid is loaded THEN expected page-title should be displayed`, async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let title = await appBrowsePanel.getTitle();
        assert.equal(title, appConst.APPLICATION_TITLE, "expected page-title should be loaded");
    });

    it(`WHEN 'selection controller'-checkbox has been clicked THEN all rows in grid should be selected`, async () => {
        let appBrowsePanel = new AppBrowsePanel();
        await appBrowsePanel.clickOnSelectionControllerCheckbox();
        studioUtils.saveScreenshot("selection_controller_checked");
        let result = await appBrowsePanel.getNumberOfSelectedRows();
        assert.equal(result, TOTAL_NUMBER_OF_APPLICATIONS, 'all applications should be selected');
    });

    it(`GIVEN all applications are selected WHEN 'selection controller'-checkbox has been clicked THEN all rows in grid get white`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            //1. Click on he checkbox and select all apps:
            await appBrowsePanel.clickOnSelectionControllerCheckbox();
            //2. Click on he checkbox and unselect all apps:
            await appBrowsePanel.clickOnSelectionControllerCheckbox();
            studioUtils.saveScreenshot("selection_controller_unchecked");
            let numb = await appBrowsePanel.getNumberOfSelectedRows();
            assert.equal(numb, 0, 'all applications should be unselected');
        });

    it(`WHEN applications grid is loaded THEN rows with applications should be present in the grid`, async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let result = await appBrowsePanel.getApplicationDisplayNames();
        studioUtils.saveScreenshot("app_browse_application");
        assert.isTrue(result.length > 0, 'rows with applications should be present in the grid');
    });

    it(`GIVEN existing application is selected WHEN Arrow Down key has been pressed THEN the next application should be selected`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select the app:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            //2. Press Arrow Down key:
            await appBrowsePanel.pressArrowDownKey();
            let appName = await appStatisticPanel.getApplicationName();
            assert.equal(appName, appConst.TEST_APPLICATIONS.FOURTH_APP, 'the next application should be selected');
        });

    it(`GIVEN existing application is selected WHEN Arrow Down key has been pressed THEN the next application should be selected`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select the app:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FOURTH_APP);
            //2. Press Arrow Up key:
            await appBrowsePanel.pressArrowUpKey();
            let result = await appStatisticPanel.getApplicationName();
            assert.equal(result, appConst.TEST_APPLICATIONS.FIRST_APP, 'previous application should be selected');
        });

    it(`GIVEN existing application is selected WHEN selecting one more THEN last selected application should be displayed in the Selection Panel`,
        async () => {
            let appStatisticPanel = new AppStatisticPanel();
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
            let result = await appStatisticPanel.getApplicationName();
            assert.equal(result, appConst.TEST_APPLICATIONS.SECOND_APP,
                'last selected application should be displayed in the Selection Panel');
        });

    it(`GIVEN three application are selected WHEN deselecting one THEN second application should be displayed on the Statistic Panel`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1.Select three applications:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            //2. Unselect one application:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            let appName = await appStatisticPanel.getApplicationName();
            assert.equal(appName, appConst.TEST_APPLICATIONS.SECOND_APP,
                'last selected application should be displayed on the Selection Panel');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
