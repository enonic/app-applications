const chai = require('chai');
const assert = chai.assert;
chai.use(require('chai-as-promised'));
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const InstallAppDialog = require('../page_objects/applications/install.app.dialog');
const UninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const studioUtils = require('../libs/studio.utils.js');

describe('Application Browse Panel, check buttons on the toolbar', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();

    const appDisplayName1 = 'Content viewer';
    const appDisplayName2 = 'Chuck Norris';
    const appDescription1 = 'Inspect your content object JSON';
    const appDescription2 = 'A Chuck Norris fact widget';

    it('WHEN app browse panel is loaded  AND no selections THEN only `Install` button should be enabled', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        //'Install' button should be enabled:
        await appBrowsePanel.waitForInstallButtonEnabled()
        // `Start` button should be disabled
        await appBrowsePanel.isStartButtonEnabled();
        //`Stop` button should be disabled
        await appBrowsePanel.isStopButtonEnabled();
        //Uninstall` button should be disabled
        await appBrowsePanel.isUninstallButtonEnabled();
    });

    it('GIVEN Install App dialog is opened WHEN Install button has been clicked for two applications THEN two new applications should be present in the grid',
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            let installAppDialog = new InstallAppDialog();
            await appBrowsePanel.clickOnInstallButton();
            await installAppDialog.waitForGridLoaded();
            await installAppDialog.waitForInstallLink(appDisplayName1);
            //Install two applications and close the modal dialog:
            await installAppDialog.pause(500);
            await installAppDialog.clickOnInstallAppLink(appDisplayName1);
            await installAppDialog.waitForAppInstalled(appDisplayName1);
            await installAppDialog.waitForInstallLink(appDisplayName2);
            await installAppDialog.clickOnInstallAppLink(appDisplayName2);
            await installAppDialog.waitForAppInstalled(appDisplayName2);
            await installAppDialog.clickOnCancelButtonTop();
            await installAppDialog.waitForClosed(2000);

            studioUtils.saveScreenshot("chuck_norris_installed");
            let result = await appBrowsePanel.isItemDisplayed(appDescription1);
            assert.isTrue(result, appDescription1 + "  application should be present");
            result = await appBrowsePanel.isItemDisplayed(appDescription2);
            assert.isTrue(result, appDescription2 + "  application should be present");
        });

    it('WHEN An installed application is selected or unselected THEN the toolbar buttons must be updated', async () => {
        let appBrowsePanel = new AppBrowsePanel();
        //1. select the application:
        await appBrowsePanel.clickOnRowByName(appDescription1);
        studioUtils.saveScreenshot("chuck_norris_selected");
        //"Uninstall" button gets enabled:
        await appBrowsePanel.waitForUninstallButtonEnabled();
        await appBrowsePanel.waitForStopButtonEnabled();
        await appBrowsePanel.waitForStartButtonDisabled();
        //2. click on the row again and unselect it:
        await appBrowsePanel.clickOnRowByName(appDescription1)
        await appBrowsePanel.waitForUninstallButtonDisabled()
        await appBrowsePanel.waitForStopButtonDisabled();
        await appBrowsePanel.waitForStartButtonDisabled()
    });

    it('WHEN The select all checkbox is selected/unselected THEN the rows should be selected/unselected', () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.clickOnSelectAll().then(() => {
            return assert.eventually.isTrue(appBrowsePanel.isRowByIndexSelected(0), "First row should be selected(blue)");
        }).then(() => {
            return assert.eventually.isTrue(appBrowsePanel.isRowByIndexSelected(1), "Second row should be selected(blue)");
        }).then(() => {
            //click on 'Select all/Unselect all' checkbox
            return appBrowsePanel.clickOnSelectAll();
        }).then(() => {
            return assert.eventually.isFalse(appBrowsePanel.isRowByIndexSelected(0), "First row should be unselected");
        }).then(() => {
            return assert.eventually.isFalse(appBrowsePanel.isRowByIndexSelected(1), "Second row should be unselected");
        });
    });

    it('Uninstall installed applications', () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.isItemDisplayed(appDescription1).then(result => {
            if (result) {
                return uninstallIfPresent(appDescription1);
            }
        }).then(() => {
            return appBrowsePanel.isItemDisplayed(appDescription2)
        }).then(result => {
            if (result) {
                return uninstallIfPresent(appDescription2);
            }
        })
    });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});

function uninstallIfPresent(appDescription) {
    let uninstallAppDialog = new UninstallAppDialog();
    let appBrowsePanel = new AppBrowsePanel();
    return appBrowsePanel.clickOnRowByName(appDescription)
        .then(() => appBrowsePanel.waitForUninstallButtonEnabled())
        .then(() => appBrowsePanel.clickOnUninstallButton())
        .then(() => uninstallAppDialog.waitForOpened())
        .then(() => uninstallAppDialog.clickOnYesButton())
        .then(() => appBrowsePanel.waitForNotificationMessage());
}
