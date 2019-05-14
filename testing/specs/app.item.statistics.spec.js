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
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.getSiteDataHeaders()
            }).then(headers => {
                assert.strictEqual(headers[0], 'Content Types');
                assert.strictEqual(headers[1], 'Page');
                assert.strictEqual(headers[2], 'Part');
                assert.strictEqual(headers[3], 'Layout');
                assert.strictEqual(headers[4], 'Relationship Types');
            })
        });

    it(`WHEN existing application is selected THEN should display providers-info for the running selected application`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.getProviderDataHeaders()
            }).then(header => {
                assert.strictEqual(header, 'Mode');
            })
        });

    it(`WHEN existing started application is selected THEN content types list should not be empty and items should be sorted by a name`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.getContentTypes();
            }).then(contentTypes => {
                assert.isTrue(contentTypes.length == 3, 'Content Types list should not be empty');
                assert.strictEqual(contentTypes[0], 'article',
                    'article type should be first in the list, because the list is sorted by a name');
            })
        });

    it(`WHEN existing stopped application is selected THEN should display info for the stopped selected application`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp)
                .then(() => studioUtils.stopSelectedApp(Apps.firstApp))
                .then(() => {
                    return appStatisticPanel.getSiteDataHeaders();
                }).then(result => {
                    studioUtils.saveScreenshot("application_stopped");
                    assert.strictEqual(result.length, 0, 'Stopped application should not have site data');
                })
        });

    it(`WHEN application is stopped THEN correct label should be displayed on the drop-down button`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.getDropDownButtonText();
            }).then(result => {
                assert.strictEqual(result, 'Stopped', 'correct label should be displayed on the drop-down button');
            })
        });

    it(`WHEN stopped application is selected THEN content types list should be empty`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appStatisticPanel.getContentTypes();
            }).then(contentTypes => {
                assert.equal(contentTypes.length, 0, 'Content Types list should be empty');
            })

        });

    it(`WHEN two applications are selected THEN should display info of the last selected application`, () => {
        let appBrowsePanel = new AppBrowsePanel();
        let appStatisticPanel = new AppStatisticPanel();
        return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(Apps.secondApp)
            .then(() => appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(Apps.firstApp)
                .then(() => appStatisticPanel.getApplicationName()))
            .then(title => assert.strictEqual(title, Apps.firstApp, `Selected application should be "${Apps.firstApp}".`))
    });

    it(`GIVEN stopped application is selected WHEN 'Start' button has been pressed THEN content types list should not be empty`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            return appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(() => {
                return appBrowsePanel.clickOnStartButton();
            }).then(() => {
                return appStatisticPanel.getContentTypes();
            }).then(contentTypes => {
                studioUtils.saveScreenshot("application_started_again");
                assert.isTrue(contentTypes.length > 0, 'Content Types list should not be empty');
            })
        });
    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
