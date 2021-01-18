const chai = require('chai');
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
    const CONTENT_VIEWER_APP_URL = 'https://repo.enonic.com/public/com/enonic/app/contentviewer/1.5.2/contentviewer-1.5.2.jar';

    const local_file = "file:c:/";

    it(`GIVEN 'install app' dialog is opened WHEN not existing URL has been typed THEN expected validation message should appear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            await appBrowsePanel.clickOnInstallButton();
            await installDialog.waitForOpened();
            await installDialog.waitForSpinnerNotVisible();
            await installDialog.pause(1000);
            //Type a URL of not existing app:
            await installDialog.typeSearchTextAndEnter(not_existing);
            let message = await installDialog.getErrorValidationMessage();
            studioUtils.saveScreenshot("url_not_exist");
            assert.isTrue(message.includes('Failed to process application from'), 'expected notification message should appear');
        });

    it(`GIVEN 'install app' dialog is opened WHEN path to local file has been typed THEN correct search-status message should appear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            await appBrowsePanel.clickOnInstallButton();
            await installDialog.waitForOpened();
            await installDialog.waitForSpinnerNotVisible();
            //Type a path to the local file:
            await installDialog.typeSearchTextAndEnter(local_file);
            await installDialog.waitForSpinnerNotVisible();
            let message = await installDialog.applicationNotFoundMessage();
            studioUtils.saveScreenshot("app_not_found");
            assert.isTrue(message.includes('No applications found'), "'No applications found' - message should appear");
        });

    it(`GIVEN 'install app' dialog is opened WHEN actual URL has been typed and 'Enter' key pressed THEN application should be installed`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            await appBrowsePanel.clickOnInstallButton();
            await installDialog.waitForSpinnerNotVisible();
            await installDialog.waitForOpened();
            //Type a correct URL for the app:
            await installDialog.typeSearchTextAndEnter(CONTENT_VIEWER_APP_URL);
            await installDialog.waitForClosed(45000);

            let message = await installDialog.waitForNotificationMessage();
            studioUtils.saveScreenshot("app_url_installed");
            assert.isTrue(message.includes('Application \'Content Viewer App\' installed successfully'),
                'expected notification message should appear');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});
