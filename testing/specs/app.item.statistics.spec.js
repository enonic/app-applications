const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils');
const appConstants = require('../libs/app_const');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const AppStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

const Apps = {
    firstApp: 'First Selenium App',
    secondApp: 'Second Selenium App'
};

describe('Tests for Applications Item Statistics Panel', function () {
    this.timeout(appConstants.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    // Verifies : https://github.com/enonic/app-applications/issues/259
    // Toolbar and Statistics panel is not correctly updated after stopping/starting an application #259
    it('WHEN existing stopped application is selected THEN should display app-info for the stopped selected application',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Stop the existing started app:
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            await studioUtils.stopSelectedApp(Apps.firstApp);
            // 2. Verify that expected appName should be displayed in Statistics Panel:
            let actualName = await appStatisticPanel.getApplicationName();
            assert.strictEqual(actualName, Apps.firstApp, `Application should be "${Apps.firstApp}".`);

            let actualHeaders = await appStatisticPanel.getApplicationDataHeaders();
            // 3. Verify that expected application's item-data should be displayed in Statistics Panel:
            assert.strictEqual(actualHeaders[0], 'Installed');
            assert.strictEqual(actualHeaders[1], 'Version');
            assert.strictEqual(actualHeaders[2], 'Key');
            assert.strictEqual(actualHeaders[3], 'System Required');
        });

    // Verifies: Toolbar and Statistics panel is not correctly updated after stopping/starting an application #259
    it('GIVEN existing stopped application is selected WHEN the application has been started THEN should display app-info for the running selected application',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Start the existing stopped app:
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            await studioUtils.startSelectedApp(Apps.firstApp);
            // 2. Verify that expected appName should be displayed in Statistics Panel:
            let actualName = await appStatisticPanel.getApplicationName();
            assert.strictEqual(actualName, Apps.firstApp, `Application should be "${Apps.firstApp}".`);

            let actualHeaders = await appStatisticPanel.getApplicationDataHeaders();
            assert.ok(actualHeaders.length > 0, "app-info should be displayed in the statistics panel");
            // 3. Verify that expected application's item-data should be displayed in Statistics Panel:
            assert.strictEqual(actualHeaders[0], 'Installed');
            assert.strictEqual(actualHeaders[1], 'Version');
            assert.strictEqual(actualHeaders[2], 'Key');
            assert.strictEqual(actualHeaders[3], 'System Required');
        });

    it(`WHEN existing started application is selected THEN should display site-info for the running selected application`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Select existing started app:
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            await appStatisticPanel.waitForSiteDataDisplayed();
            let headers = await appStatisticPanel.getSiteDataHeaders();
            assert.ok(headers.length > 0, "Site info should be displayed in the statistics panel");
            // 3. Verify that expected application's site-info should be displayed in Statistics Panel:
            assert.strictEqual(headers[0], 'Content Types', "Expected header should be present in statistics panel");
            assert.strictEqual(headers[1], 'Page', "Expected header should be present in statistics panel");
            assert.strictEqual(headers[2], 'Part', "Expected header should be present in statistics panel");
            assert.strictEqual(headers[3], 'Layout', "Expected header should be present in statistics panel");
            assert.strictEqual(headers[4], 'Relationship Types', "Expected header should be present in statistics panel");
        });

    it(`WHEN existing application is selected THEN should display providers-info for the running selected application`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Click on the application:
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            // 2. Verify that Provider data is displayed:
            await appStatisticPanel.waitForProviderDataDisplayed();
            let headers = await appStatisticPanel.getProviderDataHeaders();
            assert.strictEqual(headers[0], 'Mode');
        });

    it(`WHEN existing started application is selected THEN content types list should not be empty and items should be sorted by name`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Select the application:
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            await studioUtils.saveScreenshot('application_content_types_parts');
            // 2. Verify that Site data group is displayed:
            await appStatisticPanel.waitForSiteItemDataGroupDisplayed();
            let contentTypes = await appStatisticPanel.getContentTypes();
            assert.equal(contentTypes.length, 3, 'Content Types list should not be empty');
            assert.strictEqual(contentTypes[0], 'article',
                'article type should be first in the list, because the list is sorted by a name');

            let parts = await appStatisticPanel.getParts();
            assert.equal(parts.length, 3, 'Part list should not be empty');
        });

    it(`WHEN existing stopped application is selected THEN site-info gets not visible in stopped application`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            // 1. The application has been stopped:
            await studioUtils.stopSelectedApp(Apps.firstApp);
            // 2. Verify that Start button gets enabled
            await appBrowsePanel.waitForStartButtonEnabled();
            let appName = await appStatisticPanel.getApplicationName();
            assert.strictEqual(appName, Apps.firstApp, 'Application name should be displayed for stopped application');
            // 3. Verify that site-info  gets not visible in stopped application:
            let headers = await appStatisticPanel.getSiteDataHeaders();
            await studioUtils.saveScreenshot('application_stopped');
            assert.strictEqual(headers.length, 0, 'Stopped application should not have site data');
        });

    it(`WHEN application has been stopped THEN 'Stopped' label should be displayed in the drop-down button`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            let label = await appStatisticPanel.getDropDownButtonText();
            assert.strictEqual(label, 'Stopped', 'expected label should be displayed on the drop-down button');
        });

    it(`WHEN stopped application is selected THEN content types list should be empty`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            // 'Content Types' header should not be displayed:
            await appStatisticPanel.waitForContentTypesHeaderNotDisplayed();
            // 'Part' header should not be displayed:
            await appStatisticPanel.waitForPartHeaderNotDisplayed();
        });

    it(`WHEN two applications have been selected THEN should display info of the last selected application`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(Apps.secondApp);
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(Apps.firstApp);
            let title = await appStatisticPanel.getApplicationName();
            assert.strictEqual(title, Apps.firstApp, `Selected application should be "${Apps.firstApp}".`);
        });

    it(`GIVEN stopped application is selected WHEN 'Start' button has been pressed THEN content types list should not be empty`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            // 1. Select the application and press Start button:
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            await appBrowsePanel.clickOnStartButton();
            // 2. Verify that Content types list is not empty:
            let contentTypes = await appStatisticPanel.getContentTypes();
            await studioUtils.saveScreenshot('application_started_again');
            assert.ok(contentTypes.length > 0, 'Content Types list should not be empty');
        });
    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
