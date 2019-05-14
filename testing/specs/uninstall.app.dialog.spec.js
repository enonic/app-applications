const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const UninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const InstallAppDialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');

describe('Uninstall Application Dialog specification', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();

    it(`should display Uninstall Dialog with right content when Uninstall Button has been clicked`, () => {
        let uninstallAppDialog = new UninstallAppDialog();
        return openUninstallDialog().then(() => {
            return uninstallAppDialog.getHeader();
        }).then(dialogMessage => {
            assert.isTrue(dialogMessage == 'Are you sure you want to uninstall selected application(s)?',
                'Expected message should be in the dialog message');
        });
    });

    it(`'Yes' and 'No' and Cancel-top buttons should be visible`, () => {
        let uninstallAppDialog = new UninstallAppDialog();
        return openUninstallDialog().then(() => {
            return uninstallAppDialog.isYesButtonDisplayed();
        }).then(result => {
            assert.isTrue(result, "Yes button should be visible");
        }).then(() => {
            return uninstallAppDialog.isNoButtonDisplayed();
        }).then(result => {
            assert.isTrue(result, "No button should be visible");
        });
    });

    it(`'GIVEN uninstall dialog is opened WHEN Cancel-top button has been pressed THEN modal dialog closes`, () => {
        let uninstallAppDialog = new UninstallAppDialog();
        return openUninstallDialog().then(() => {
            return uninstallAppDialog.clickOnCancelButtonTop();
        }).then(() => {
            return uninstallAppDialog.waitForClosed();
        });
    });

    it(`should display correct notification message`, () => {
        let uninstallAppDialog = new UninstallAppDialog();
        let appBrowsePanel = new AppBrowsePanel();
        return openUninstallDialog().then(() => {
            return uninstallAppDialog.clickOnYesButton();
        }).then(() => {
            return appBrowsePanel.waitForNotificationMessage();
        }).then(result => {
            const text = result instanceof Array ? result[result.length - 1] : result;
            assert.equal(text, 'Application \'Chuck Norris\' uninstalled successfully', `Incorrect notification message [${text}]`)
        });
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
    return appBrowsePanel.isItemDisplayed(chuckDisplayName).then(result => {
        if (!result) {
            return installApp(chuckDisplayName);
        }
    }).then(() => {
        return appBrowsePanel.clickOnRowByName(chuckName);
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
