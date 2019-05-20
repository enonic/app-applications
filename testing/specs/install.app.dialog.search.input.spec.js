const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const InstallDialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');


describe('Install app dialog, search input spec.', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    const not_existing = 'http://test.com';
    const correct_url = 'https://repo.enonic.com/public/com/enonic/app/contentviewer/1.4.0/contentviewer-1.4.0.jar';

    const local_file = "file:c:/";

    it(`GIVEN 'install app' dialog is opened WHEN not existing URL has been typed THEN correct validation message should appear`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return installDialog.waitForOpened();
            }).then(() => {
                return installDialog.typeSearchTextAndEnter(not_existing);
            }).then(() => {
                return installDialog.getErrorValidationMessage();
            }).then(message => {
                studioUtils.saveScreenshot("url_not_exist");
                assert.isTrue(message.includes('Failed to process application from'), 'expected notification message should appear');
            });
        });

    it(`GIVEN 'install app' dialog is opened WHEN path to local file has been typed THEN correct search-status message should appear`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return installDialog.waitForOpened();
            }).then(() => {
                return installDialog.typeSearchTextAndEnter(local_file);
            }).then(() => {
                return installDialog.applicationNotFoundMessage();
            }).then(message => {
                studioUtils.saveScreenshot("app_not_found");
                assert.isTrue(message.includes('No applications found'), 'correct search-status message should appear');
            });
        });
    it(`GIVEN 'install app' dialog is opened WHEN actual URL has been typed and 'Enter' key pressed THEN application should be installed`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return installDialog.waitForOpened();
            }).then(() => {
                return installDialog.typeSearchTextAndEnter(correct_url);
            }).then(() => {
                return installDialog.waitForClosed(35000);
            }).then(() => {
                return installDialog.waitForNotificationMessage();
            }).then(message => {
                studioUtils.saveScreenshot("app_url_installed");
                assert.isTrue(message.includes('Application \'Content Viewer App\' installed successfully'),
                    'expected notification message should appear');
            });
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});
