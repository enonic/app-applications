const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const appStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

describe('Open Applications app and verify that grid is loaded and correct title should be displayed', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN applications grid is loaded THEN correct page-title should be displayed`, () => {
        return appBrowsePanel.getTitle().then((title)=> {
            studioUtils.saveScreenshot("app_browse_title");
            expect(title).to.equal(appConst.APPLICATION_TITLE);
        })
    });

    it(`WHEN applications grid is loaded THEN rows with applications should be present in the grid`, () => {
        return appBrowsePanel.getApplicationDisplayNames().then(result=> {
            studioUtils.saveScreenshot("app_browse_application");
            assert.isTrue(result.length > 0, 'rows with applications should be present in the grid')
        })
    });

    it(`GIVEN existing application is selected WHEN Arrow Down key has been pressed THEN the next application should be selected`,
        () => {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).pause(1000).then(()=> {
                return appBrowsePanel.pressArrowDownKey();
            }).then(()=> {
                return appStatisticPanel.getApplicationName();
            }).then(result=> {
                assert.isTrue(result == appConst.TEST_APPLICATIONS.FOURTH_APP,
                    'the next application should be selected');
            })
        });

    it(`GIVEN existing application is selected WHEN Arrow Down key has been pressed THEN the next application should be selected`,
        () => {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FOURTH_APP).pause(1000).then(()=> {
                return appBrowsePanel.pressArrowUpKey();
            }).then(()=> {
                return appStatisticPanel.getApplicationName();
            }).then(result=> {
                assert.isTrue(result == appConst.TEST_APPLICATIONS.FIRST_APP,
                    'previous application should be selected');
            })
        });


    it(`GIVEN existing application is selected WHEN selecting one more THEN last selected application should be displayed on the Selection Panel`,
        () => {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(()=> {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
            }).pause(1000).then(()=> {
                return appStatisticPanel.getApplicationName();
            }).then(result=> {
                assert.isTrue(result == appConst.TEST_APPLICATIONS.SECOND_APP,
                    'last selected application should be displayed on the Selection Panel');
            })
        });

    it(`GIVEN three application are selected WHEN deselecting one THEN second application should be displayed on the Statistic Panel`,
        () => {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(()=> {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.SECOND_APP);
            }).pause(1000).then(()=> {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            }).then(()=> {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP);
            }).pause(1000).then(()=> {
                return appStatisticPanel.getApplicationName();
            }).then(result=> {
                assert.isTrue(result == appConst.TEST_APPLICATIONS.SECOND_APP,
                    'last selected application should be displayed on the Selection Panel');
            })
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(()=> {
        return console.log('specification is starting: ' + this.title);
    });
});
