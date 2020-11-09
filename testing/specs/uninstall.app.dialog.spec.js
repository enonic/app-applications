const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const UninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const InstallAppDialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const AppStatisticPanel = require('../page_objects/applications/application.item.statistic.panel');

describe('Uninstall Application dialog specification', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();

    it("WHEN uninstall dialog is opened THEN expected title and buttons should be present",
        async () => {
            let uninstallAppDialog = new UninstallAppDialog();
            //1. Select 'Chuck Norris' app and click on 'Uninstall' button:
            await openUninstallDialog();
            let dialogMessage = await uninstallAppDialog.getHeader();
            assert.equal(dialogMessage, 'Are you sure you want to uninstall selected application(s)?',
                'Expected message should be in the dialog message');
            //"Yes button should be visible"
            await uninstallAppDialog.isYesButtonDisplayed();
            // "No button should be visible"
            await uninstallAppDialog.isNoButtonDisplayed();
        });

    it("GIVEN uninstall dialog is opened WHEN 'Cancel-top' button has been pressed THEN modal dialog closes",
        async () => {
            let uninstallAppDialog = new UninstallAppDialog();
            //1. Select 'Chuck Norris' app and click on 'Uninstall' button:
            await openUninstallDialog();
            await uninstallAppDialog.clickOnCancelButtonTop();
            await uninstallAppDialog.waitForClosed();
        });

    it("GIVEN uninstall dialog is opened WHEN 'Esc' key has been pressed THEN dialog closes",
        async () => {
            let uninstallAppDialog = new UninstallAppDialog();
            let appBrowsePanel = new AppBrowsePanel();
            //1. Select 'Chuck Norris' app and click on 'Uninstall' button:
            await openUninstallDialog();
            //2. Press 'Esc' key
            await appBrowsePanel.pressEscKey();
            //3. Verify that the modal dialog is closed:
            await uninstallAppDialog.waitForClosed();
        });

    it("GIVEN Uninstall dialog is opened WHEN 'Yes' button has been pressed THEN app should be uninstalled",
        async () => {
            let uninstallAppDialog = new UninstallAppDialog();
            let appBrowsePanel = new AppBrowsePanel();
            let appStatisticPanel = new AppStatisticPanel();
            //1. Select 'Chuck Norris' app and click on 'Uninstall' button:
            await openUninstallDialog();
            //2. Click on Yes button in Uninstall dialog:
            await uninstallAppDialog.clickOnYesButton();
            //3. Verify the notification message:
            let result = await appBrowsePanel.waitForNotificationMessage();
            studioUtils.saveScreenshot("chuck_norris_uninstalled_message");
            const text = result instanceof Array ? result[result.length - 1] : result;
            assert.equal(text, 'Application \'Chuck Norris\' uninstalled successfully', `Incorrect notification message [${text}]`);
            //4. Verify that Statistics Panel is cleared:
            let title = await appStatisticPanel.getApplicationName();
            assert.equal(title, "", "Statistics panel should be cleared");
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    })
});

function openUninstallDialog() {
    const chuckName = 'A Chuck Norris fact widget';
    const chuckDisplayName = 'Chuck Norris';
    let appBrowsePanel = new AppBrowsePanel();
    let uninstallAppDialog = new UninstallAppDialog();
    return appBrowsePanel.isAppByDescriptionDisplayed(chuckDisplayName).then(result => {
        if (!result) {
            return installApp(chuckDisplayName);
        }
    }).then(() => {
        return appBrowsePanel.clickOnRowByDescription(chuckName);
    }).then(() => {
        return appBrowsePanel.clickOnUninstallButton();
    }).then(() => {
        return uninstallAppDialog.waitForOpened();
    });
}

function installApp(displayName) {
    let appBrowsePanel = new AppBrowsePanel();
    let installAppDialog = new InstallAppDialog();
    return appBrowsePanel.clickOnInstallButton().then(() => {
        return installAppDialog.waitForOpened();
    }).then(() => {
        return installAppDialog.typeSearchText(displayName);
    }).then(() => {
        return installAppDialog.pause(1000);
    }).then(() => {
        return installAppDialog.isApplicationPresent(displayName);
    }).then(() => {
        return installAppDialog.clickOnInstallAppLink(displayName);
    }).then(() => {
        return installAppDialog.waitForAppInstalled(displayName);
    }).then(() => {
        return installAppDialog.clickOnCancelButtonTop();
    });
}
