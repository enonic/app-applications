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
    secondApp: 'Second Selenium App'
};

describe('Item Statistics Panel', function () {
    this.timeout(appConstants.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it('WHEN existing started application is selected THEN should display app-info for the running selected application',
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel()
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp)
                .then(() => appStatisticPanel.getApplicationName())
                .then(title => assert.strictEqual(title, Apps.firstApp, `Application should be "${Apps.firstApp}".`))
                .then(() => studioUtils.startSelectedApp(Apps.firstApp))
                .then(() => appStatisticPanel.getApplicationDataHeaders())
                .then(appHeaders => {
                    assert.strictEqual(appHeaders[0], 'Installed');
                    assert.strictEqual(appHeaders[1], 'Version');
                    assert.strictEqual(appHeaders[2], 'Key');
                    assert.strictEqual(appHeaders[3], 'System Required');
                })
        });

    it(`WHEN existing started application is selected THEN should display site-info for the running selected application`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            let headers = await appStatisticPanel.getSiteDataHeaders()

            assert.strictEqual(headers[0], 'Content Types');
            assert.strictEqual(headers[1], 'Page');
            assert.strictEqual(headers[2], 'Part');
            assert.strictEqual(headers[3], 'Layout');
            assert.strictEqual(headers[4], 'Relationship Types');
        });

    it(`WHEN existing application is selected THEN should display providers-info for the running selected application`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            let header = await appStatisticPanel.getProviderDataHeaders()
            assert.strictEqual(header, 'Mode');
        });

    it(`WHEN existing started application is selected THEN content types list should not be empty and items should be sorted by a name`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            let contentTypes = await appStatisticPanel.getContentTypes();
            assert.equal(contentTypes.length, 3, 'Content Types list should not be empty');
            assert.strictEqual(contentTypes[0], 'article',
                'article type should be first in the list, because the list is sorted by a name');
        });

    it(`WHEN existing stopped application is selected THEN should display info for the stopped selected application`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            //the application has been stopped:
            await studioUtils.stopSelectedApp(Apps.firstApp);
            let headers = await appStatisticPanel.getSiteDataHeaders();
            studioUtils.saveScreenshot("application_stopped");
            assert.strictEqual(headers.length, 0, 'Stopped application should not have site data');
        });

    it(`WHEN application has been stopped THEN 'Stopped' label should be displayed on the drop-down button`,
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
            let contentTypes = await appStatisticPanel.getContentTypes();
            assert.equal(contentTypes.length, 0, 'Content Types list should be empty');
        });

    it(`WHEN two applications have been selected THEN should display info of the last selected application`, async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let appStatisticPanel = new AppStatisticPanel();
        await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(Apps.secondApp);
        await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(Apps.firstApp);
        let title = await appStatisticPanel.getApplicationName();
        assert.strictEqual(title, Apps.firstApp, `Selected application should be "${Apps.firstApp}".`);
    });

    it(`GIVEN stopped application is selected WHEN 'Start' button has been pressed THEN content types list should not be empty`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            await appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp);
            await appBrowsePanel.clickOnStartButton();

            let contentTypes = await appStatisticPanel.getContentTypes();
            studioUtils.saveScreenshot("application_started_again");
            assert.isTrue(contentTypes.length > 0, 'Content Types list should not be empty');
        });
    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
