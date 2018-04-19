const chai = require('chai');
const assert = chai.assert;
chai.use(require('chai-as-promised'));
const webDriverHelper = require('../libs/WebDriverHelper');
const studioUtils = require('../libs/studio.utils');
const appConstants = require('../libs/app_const');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const appStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

const Apps = {
    firstApp: 'First Selenium App',
    secondApp: 'Second Selenium App'
};

const startSelectedApp = () => appBrowsePanel.isStartButtonEnabled()
    .then(enabled => (enabled ? appBrowsePanel.clickOnStartButton().pause(1000) : true));
const stopSelectedApp = () => appBrowsePanel.isStopButtonEnabled()
    .then(enabled => (enabled ? appBrowsePanel.clickOnStopButton().pause(1000) : true));

describe('Item Statistics Panel', function () {
    this.timeout(appConstants.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`should display app-info for the running selected application`,
        () => appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp)
            .then(appStatisticPanel.getApplicationName)
            .then(title => assert.strictEqual(title, Apps.firstApp, `Application should be "${Apps.firstApp}".`))
            .then(startSelectedApp)
            .then(appStatisticPanel.getApplicationDataHeaders)
            .then(appHeaders => {
                assert.strictEqual(appHeaders[0], 'Installed');
                assert.strictEqual(appHeaders[1], 'Version');
                assert.strictEqual(appHeaders[2], 'Key');
                assert.strictEqual(appHeaders[3], 'System Required');
            })
    );
    it(`should display site-info for the running selected application`,
        () => appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(()=> {
            return appStatisticPanel.getSiteDataHeaders()
        }).then(headers => {
            assert.strictEqual(headers[0], 'Content Types');
            assert.strictEqual(headers[1], 'Page');
            assert.strictEqual(headers[2], 'Part');
            assert.strictEqual(headers[3], 'Layout');
            assert.strictEqual(headers[4], 'Relationship Types');
        })
    );
    it(`should display providers-info for the running selected application`,
        () => appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(()=> {
            return appStatisticPanel.getProviderDataHeaders()
        }).then(header => {
            assert.strictEqual(header, 'Mode');
        })
    );
    it(`WHEN application is started THEN correct label should be displayed on the drop-down button`,
        () => appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(()=> {
            return appStatisticPanel.getDropDownButtonText();
        }).then(result=> {
            assert.strictEqual(result, 'Started', 'correct label should be displayed on the drop-down button');
        })
    );
    it(`WHEN application is selected THEN content types list should not be empty and items should be sorted by a name`,
        () => appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(()=> {
            return appStatisticPanel.getContentTypes();
        }).then(contentTypes => {
            assert.isTrue(contentTypes.length == 3, 'Content Types list should not be empty');
            assert.strictEqual(contentTypes[0], 'article',
                'article type should be first in the list, because the list is sorted by a name');
        })
    );

    it(`should display info for the stopped selected application`,
        () => appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp)
            .then(stopSelectedApp)
            .then(()=> {
                return appStatisticPanel.getSiteDataHeaders();
            }).then(result => {
                assert.strictEqual(result.length, 0, 'Stopped application should not have site data');
            })
    );

    it(`WHEN application is stopped THEN correct label should be displayed on the drop-down button`,
        () => appBrowsePanel.clickOnRowByDisplayName(Apps.firstApp).then(()=> {
            return appStatisticPanel.getDropDownButtonText();
        }).then(result=> {
            assert.strictEqual(result, 'Stopped', 'correct label should be displayed on the drop-down button');
        })
    );

    it(`should display info of the last selected application`, () =>
        appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(Apps.secondApp)
            .then(() => appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(Apps.firstApp).pause(1000))
            .then(appStatisticPanel.getApplicationName)
            .then(title => assert.strictEqual(title, Apps.firstApp, `Selected application should be "${Apps.firstApp}".`))
    );
    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(()=> {
        return console.log('specification is starting: ' + this.title);
    });
});
