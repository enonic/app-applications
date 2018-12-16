const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const dialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');


describe('Install app dialog, search input spec.', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    const not_existing = 'http://test.com';
    const correct_url = 'http://repo.enonic.com/public/com/enonic/app/contentviewer/1.4.0/contentviewer-1.4.0.jar';

    const local_file = "file:c:/";

    it(`GIVEN 'install app' dialog is opened WHEN not existing URL has been typed THEN correct validation message should appear`,
        () => {
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return dialog.waitForOpened();
            }).then(() => {
                return dialog.typeSearchTextAndEnter(not_existing);
            }).then(() => {
                return dialog.getErrorValidationMessage();
            }).then(message => {
                console.log("Install app Dialog########### notification message :" + message)
                studioUtils.saveScreenshot("url_not_exist");
                assert.isTrue(message.includes('Failed to process application from'), 'correct notification message should appear');
            });
        });

    it(`GIVEN 'install app' dialog is opened WHEN path to local file has been typed THEN correct search-status message should appear`,
        () => {
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return dialog.waitForOpened();
            }).then(() => {
                return dialog.typeSearchTextAndEnter(local_file);
            }).then(() => {
                return dialog.applicationNotFoundMessage();
            }).then(message => {
                studioUtils.saveScreenshot("app_not_found");
                assert.isTrue(message.includes('No applications found'), 'correct search-status message should appear');
            });
        });
    it(`GIVEN 'install app' dialog is opened WHEN actual URL has been typed and 'Enter' key pressed THEN application should be installed`,
        () => {
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return dialog.waitForOpened();
            }).then(() => {
                return dialog.typeSearchTextAndEnter(correct_url);
            }).pause(7000).then(()=>{
               return appBrowsePanel.waitForSpinnerNotVisible(7000);
            }).then(() => {
                return dialog.waitForNotificationMessage();
            }).then(message => {
                studioUtils.saveScreenshot("app_url_installed");
                assert.isTrue(message.includes('Application \'Content Viewer App\' installed successfully'),
                    'correct notification message should appear');
            });
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});
