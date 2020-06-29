const chai = require('chai');
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const UninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const InstallAppDialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');

describe('Uninstall Application dialog specification', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();

    it(`should display Uninstall Dialog with right content when Uninstall Button has been clicked`,
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

    it(`'GIVEN uninstall dialog is opened WHEN Cancel-top button has been pressed THEN modal dialog closes`,
        async () => {
            let uninstallAppDialog = new UninstallAppDialog();
            //1. Select 'Chuck Norris' app and click on 'Uninstall' button:
            await openUninstallDialog();
            await uninstallAppDialog.clickOnCancelButtonTop();
            await uninstallAppDialog.waitForClosed();
        });

    it(`should display expected notification message`,
        async () => {
            let uninstallAppDialog = new UninstallAppDialog();
            let appBrowsePanel = new AppBrowsePanel();
            //1. Select 'Chuck Norris' app and click on 'Uninstall' button:
            await openUninstallDialog();
            await uninstallAppDialog.clickOnYesButton();
            let result = await appBrowsePanel.waitForNotificationMessage();
            studioUtils.saveScreenshot("chuck_norris_uninstalled_message");
            const text = result instanceof Array ? result[result.length - 1] : result;
            assert.equal(text, 'Application \'Chuck Norris\' uninstalled successfully', `Incorrect notification message [${text}]`);
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
