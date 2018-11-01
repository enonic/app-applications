const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const uninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const installAppDialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');

describe('Uninstall Application Dialog specification', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();

    it(`should display Uninstall Dialog with right content when Uninstall Button has been clicked`, () => {
        return openUninstallDialog().then(() => {
            return uninstallAppDialog.getDialogMessage();
        }).then(dialogMessage => {
            assert.isTrue(dialogMessage == 'Are you sure you want to uninstall selected application(s)?',
                'Correct message should be in the dialog message');
        });
    });

    it(`'Yes' button should be enabled`, () => {
        return openUninstallDialog().then(() => {
            appBrowsePanel.isVisible(uninstallAppDialog.yesButton).then((result) => {
                assert.isTrue(result);
            });
        });
    });

    it(`'No' button should be enabled`, () => {
        return openUninstallDialog().then(() => {
            appBrowsePanel.isVisible(uninstallAppDialog.noButton).then((result) => {
                assert.isTrue(result);
            });
        });
    });

    it(`should display correct notification message`, () => {
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
    before(()=> {
        return console.log('specification is starting: ' + this.title);
    });

});

function openUninstallDialog() {
    const chuckName = 'A Chuck Norris fact widget';
    const chuckDisplayName = 'Chuck Norris';

    return appBrowsePanel.isItemDisplayed(chuckDisplayName)
        .then((result) => {
            if (!result) {
                return installApp(chuckDisplayName);
            }
        }).then(() => {
            return appBrowsePanel.clickOnRowByName(chuckName);
        }).pause(1000).then(() => {
            return appBrowsePanel.clickOnUninstallButton();
        }).then(() => {
            return uninstallAppDialog.waitForOpened();
        });
}

function installApp(displayName) {
    return appBrowsePanel.clickOnInstallButton().then(() => {
        return installAppDialog.waitForOpened();
    }).then(() => {
        return installAppDialog.typeSearchText(displayName);
    }).pause(1000).then(() => {
        return installAppDialog.isApplicationPresent(displayName);
    }).then(() => {
        return installAppDialog.clickOnInstallAppLink(displayName);
    }).then(() => {
        return installAppDialog.waitForAppInstalled(displayName);
    }).then(() => {
        return installAppDialog.clickOnCancelButtonTop();
    });
}
