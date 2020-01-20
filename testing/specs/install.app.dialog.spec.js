/**
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const InstallDialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe('Install Application Dialog specification', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    const appName = 'Chuck Norris';

    it('SHOULD show install app dialog WHEN Install button has been clicked', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let dialog = new InstallDialog();
        await appBrowsePanel.clickOnInstallButton();
        await dialog.waitForSpinnerNotVisible();
        await dialog.waitForOpened();
        let actualMessage = await dialog.getPlaceholderMessage();
        assert.equal(actualMessage, 'Search Enonic Market, paste url or upload directly',
            'expected message should be in the placeholder');
        studioUtils.saveScreenshot("install_dialog_default_focus");
        let isFocused = await dialog.isDefaultFocused();
        //assert.isTrue(result, 'Focus should be in the `filter input` by default');
    });

    it('GIVEN install dialog is opened WHEN Esc key has been pressed THEN dialog closes', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let dialog = new InstallDialog();
        await appBrowsePanel.clickOnInstallButton()
        await dialog.waitForOpened();
        studioUtils.saveScreenshot("install_esc_key_test1");
        await appBrowsePanel.pressEscKey();
        studioUtils.saveScreenshot("install_esc_key_test2");
        await dialog.waitForClosed(2000);
    });

    it('WHEN dialog is opened THEN applications should be present in the grid AND applications are sorted by a name', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let dialog = new InstallDialog();
        await appBrowsePanel.clickOnInstallButton();
        await dialog.waitForGridLoaded();

        await dialog.pause(1000);
        let names = await dialog.getApplicationNames();
        studioUtils.saveScreenshot("install_dlg_sorted");
        assert.isAbove(names.length, 0, 'There should be apps in the grid');
        assert.isTrue(names.includes('ADFS ID Provider'), 'Auth0 ID Provider this application should be second');
    });

    it('GIVEN install dialog is opened WHEN search text has been typed THEN apps should be filtered ', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let dialog = new InstallDialog();
        await appBrowsePanel.clickOnInstallButton();
        await dialog.waitForOpened();
        //Type a name in the search input:
        await dialog.typeSearchText('Chuck Norris');
        await dialog.pause(1500);
        let names = await dialog.getApplicationNames();
        assert.isTrue(names.length === 1, 'only one application should be displayed');
        assert.equal(names[0], appName, 'Chuck Norris app should be filtered');
    });

    it('GIVEN dialog is opened WHEN install link has been clicked THEN the app should be installed', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let dialog = new InstallDialog();
        await appBrowsePanel.clickOnInstallButton();
        await dialog.waitForOpened();
        //1. Install the app:
        await dialog.clickOnInstallAppLink(appName);
        let visible = await dialog.waitForAppInstalled(appName);
        assert.isTrue(visible, `'${appName}' should've been installed by now`);
        await dialog.clickOnCancelButtonTop();
        await dialog.waitForClosed();
         //2. Check the app in grid:
        visible = await appBrowsePanel.isItemDisplayed(appName);
        assert.isTrue(visible, `'${appName}' application should've been present in the grid`);
        let message = await appBrowsePanel.waitForNotificationMessage();
        assert.equal(message, 'Application \'Chuck Norris\' installed successfully', `Incorrect notification message [${message}]`)
    });

    //verifies  https://github.com/enonic/app-applications/issues/8
    it('GIVEN existing installed application WHEN install dialog has been opened THEN `Installed` status should be displayed near the application',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let dialog = new InstallDialog();
            await appBrowsePanel.clickOnInstallButton();
            await dialog.waitForOpened();
            let result = await dialog.isApplicationInstalled(appName);
            assert.isTrue(result, `'${appName}' should be with Installed status`);
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => {
        return studioUtils.doCloseCurrentBrowserTab();
    });
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
