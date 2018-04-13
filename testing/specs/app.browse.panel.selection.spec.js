const chai = require('chai');
chai.use(require('chai-as-promised'));
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const studioUtils = require('../libs/studio.utils.js');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');

// Define the test suite: a test script block or suite
describe('Open Apllications app and verify that grid is loaded and correct title should be displayed', function () {
    //Suite-level timeouts may be applied to entire test “suites”, or disabled via this.timeout(0)
    this.timeout(appConst.SUITE_TIMEOUT);
    //start the browse
    webDriverHelper.setupBrowser();

    // a test spec - "specification". put code of the ui-test here, for example, verify the title of the page
    it(`GIVEN applications grid is loaded THEN correct page-title should be displayed`, () => {
        //block of code to execute
        return appBrowsePanel.waitForPanelVisible(2000).then(()=> {
            return appBrowsePanel.getTitle();
        }).then(title=> {
            studioUtils.saveScreenshot(webDriverHelper.browser, "app_browse_title");
            expect(title).to.equal(appConst.APPLICATION_TITLE);
        })
    });

    // hook to run before each tests. Login and open the Applications-app should be done before each test
    beforeEach(() => studioUtils.navigateToApplicationsApp(webDriverHelper.browser));
    //a "hook" to run after each tests in this block. Applications browser-tab should be closed.
    afterEach(() => studioUtils.doCloseCurrentBrowserTab(webDriverHelper.browser));
});
