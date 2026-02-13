const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const InstallDialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe('Install app dialog, search input spec.', function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }
    const not_existing = 'https://repo.enonic.com/public/com/enonic/app/not-existing/0.0.0/not-existing-0.0.0.jar';
    const LOG_BROWSER_APP_URL = 'https://repo.enonic.com/public/com/enonic/app/logbrowser/2.0.0/logbrowser-2.0.0.jar';

    const LOCAL_FILE = "file:c:/";
    const VALIDATION_MESSAGE = 'Failed to upload application from';

    it(`GIVEN 'install app' dialog is opened WHEN Enter a non-existing URL into the search field THEN expected validation message should appear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            // 1. Open Install Dialog
            await appBrowsePanel.clickOnInstallButton();
            await installDialog.waitForOpened();
            // 2. Wait for the spinner disappears:
            await installDialog.waitForSpinnerNotVisible();
            await installDialog.pause(1000);
            // 3. Type a URL of not existing app:
            await installDialog.typeSearchTextAndEnter(not_existing);
            // 4. Verify that validation message appears:
            let message = await installDialog.getErrorValidationMessage();
            await studioUtils.saveScreenshot('url_not_exist');
            assert.ok(message.includes(VALIDATION_MESSAGE), 'expected validation message should appear');
        });

    it(`GIVEN 'install app' dialog is opened WHEN path to local file has been typed THEN expected warning message should appear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            // 1. Open Install Dialog
            await appBrowsePanel.clickOnInstallButton();
            await installDialog.waitForOpened();
            // 2. Wait for the spinner disappears:
            await installDialog.waitForSpinnerNotVisible();
            await installDialog.pause(500);
            // 3.Type a path to the local file:
            await installDialog.typeSearchTextAndEnter(LOCAL_FILE);
            await installDialog.waitForSpinnerNotVisible();
            // 4. Verify the expected warning:
            await installDialog.waitForApplicationNotFoundMessage();
            let message = await installDialog.getApplicationNotFoundMessage();
            await studioUtils.saveScreenshot('app_not_found_message');
            assert.ok(message.includes('No applications found'), "'No applications found' - message should appear");
        });

    it.skip(
        `GIVEN 'install app' dialog is opened WHEN actual URL has been typed and 'Enter' key pressed THEN application should be installed`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installDialog = new InstallDialog();
            await appBrowsePanel.clickOnInstallButton();
            await installDialog.waitForSpinnerNotVisible();
            await installDialog.waitForOpened();
            // Type a correct URL for the app:
            await installDialog.typeSearchTextAndEnter(LOG_BROWSER_APP_URL);
            await installDialog.waitForClosed(40000);

            let message = await installDialog.waitForNotificationMessage();
            await studioUtils.saveScreenshot('app_url_installed');
            assert.ok(message.includes("Application 'Log Browser' installed successfully"),
                'expected notification message should appear');
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});
