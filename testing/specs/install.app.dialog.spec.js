/**
 */
const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const InstallDialog = require('../page_objects/applications/install.app.dialog');
const UninstallDialog = require('../page_objects/applications/uninstall.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe('Install Application Dialog specification', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    const CHUCK_NORRIS_APP_DISPLAY_NAME = 'Chuck Norris';

    it("SHOULD show install app dialog WHEN 'Install' button has been clicked", async () => {
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
        //1. Open Install dialog
        await appBrowsePanel.clickOnInstallButton();
        await dialog.waitForOpened();
        await dialog.waitForSpinnerNotVisible();
        studioUtils.saveScreenshot("install_esc_key_test1");
        //2. press the ESC key:
        await appBrowsePanel.pressEscKey();
        studioUtils.saveScreenshot("install_esc_key_test2");
        //3. Verify that dialog is closedL
        await dialog.waitForClosed(2000);
    });

    it('WHEN dialog is opened THEN applications should be present in the grid AND applications are sorted by a name', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let dialog = new InstallDialog();
        //1. Open Install Dialog:
        await appBrowsePanel.clickOnInstallButton();
        await dialog.waitForSpinnerNotVisible();
        await dialog.waitForGridLoaded();
        await dialog.waitForApplicationDisplayed('ADFS ID Provider');
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
        await dialog.waitForSpinnerNotVisible();
        //Type a name in the search input:
        await dialog.typeSearchText(CHUCK_NORRIS_APP_DISPLAY_NAME);
        await dialog.waitForApplicationDisplayed('Chuck Norris');
        let names = await dialog.getApplicationNames();
        assert.isTrue(names.length === 1, 'only one application should be displayed');
        assert.equal(names[0], CHUCK_NORRIS_APP_DISPLAY_NAME, 'Chuck Norris app should be filtered');
    });

    it('GIVEN dialog is opened WHEN install link has been clicked THEN the app should be installed', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        let dialog = new InstallDialog();
        await appBrowsePanel.clickOnInstallButton();
        await dialog.waitForOpened();
        await dialog.waitForSpinnerNotVisible();
        //1. Install the app:
        await dialog.clickOnInstallAppLink(CHUCK_NORRIS_APP_DISPLAY_NAME);
        let visible = await dialog.waitForAppInstalled(CHUCK_NORRIS_APP_DISPLAY_NAME);
        assert.isTrue(visible, `'${CHUCK_NORRIS_APP_DISPLAY_NAME}' should've been installed by now`);
        await dialog.clickOnCancelButtonTop();
        await dialog.waitForClosed();
        //2. Check the app in grid:
        visible = await appBrowsePanel.isAppByDescriptionDisplayed(CHUCK_NORRIS_APP_DISPLAY_NAME);
        assert.isTrue(visible, `'${CHUCK_NORRIS_APP_DISPLAY_NAME}' application should've been present in the grid`);
        let message = await appBrowsePanel.waitForNotificationMessage();
        assert.equal(message, 'Application \'Chuck Norris\' installed successfully', `Incorrect notification message [${message}]`)
    });

    //verifies  https://github.com/enonic/app-applications/issues/8
    it("GIVEN existing installed application WHEN install dialog has been opened THEN 'Installed' status should be displayed near the application",
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installAppDialog = new InstallDialog();
            await appBrowsePanel.clickOnInstallButton();
            await installAppDialog.waitForOpened();
            await installAppDialog.waitForSpinnerNotVisible();
            //'Installed' button appears in the modal dialog:
            let result = await installAppDialog.waitForApplicationInstalled(CHUCK_NORRIS_APP_DISPLAY_NAME);
            assert.isTrue(result, `'${CHUCK_NORRIS_APP_DISPLAY_NAME}' should be with Installed status`);
        });

    //Verifies issue https://github.com/enonic/app-applications/issues/241
    //Install Dialog - application's status is not updated after installing an application in filtered grid #241
    it("GIVEN an application is installed in filtered grid WHEN Install dialog has been reopened THEN the application should be with 'Installed' status",
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installAppDialog = new InstallDialog();
            let uninstallDialog = new UninstallDialog();
            //1. Precondition - uninstall the application
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(CHUCK_NORRIS_APP_DISPLAY_NAME);
            await appBrowsePanel.clickOnUninstallButton();
            await uninstallDialog.waitForOpened();
            await uninstallDialog.clickOnYesButton();
            await appBrowsePanel.waitForNotificationMessage();
            //2. Select an application and click on 'Show Selections' button:
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            await appBrowsePanel.clickOnSelectionToggler();
            //3. Install the app in Filtered grid and close the modal dialog:
            await appBrowsePanel.clickOnInstallButton();
            await installAppDialog.waitForOpened();
            await installAppDialog.waitForSpinnerNotVisible();
            await installAppDialog.clickOnInstallAppLink(CHUCK_NORRIS_APP_DISPLAY_NAME);
            await installAppDialog.waitForAppInstalled(CHUCK_NORRIS_APP_DISPLAY_NAME);
            await installAppDialog.clickOnCancelButtonTop();
            await installAppDialog.waitForClosed(1000);
            //4. Reopen 'Install App' Dialog:
            await appBrowsePanel.clickOnInstallButton();
            await installAppDialog.waitForOpened();
            await installAppDialog.waitForSpinnerNotVisible();
            //5.Verify that status of the application is 'Installed':
            await installAppDialog.waitForApplicationInstalled(CHUCK_NORRIS_APP_DISPLAY_NAME);
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => {
        return studioUtils.doCloseCurrentBrowserTab();
    });
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
