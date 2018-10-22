const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
chai.use(require('chai-as-promised'));
var webDriverHelper = require('../libs/WebDriverHelper');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const installAppDialog = require('../page_objects/applications/install.app.dialog');
const uninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const studioUtils = require('../libs/studio.utils.js');

describe('Application Browse Panel, check buttons on the toolbar', function () {
    this.timeout(70000);
    webDriverHelper.setupBrowser();

    const appDisplayName1 = 'Auth0 ID Provider';
    const appDisplayName2 = 'Chatrify app';
    const appDescription1 = 'Add Auth0 authentication';
    const appDescription2 = 'Add full-featured chat';

    it('WHEN app browse panel is loaded  AND no selections THEN only `Install` button should be enabled', () => {
        return appBrowsePanel.waitForInstallButtonEnabled().then(result => {
            assert.isTrue(result, 'Install button should be enabled');
        }).then(() => {
            return assert.eventually.isFalse(appBrowsePanel.isStartButtonEnabled(),
                "`Start` button should be disabled");
        }).then(() => {
            return assert.eventually.isFalse(appBrowsePanel.isStopButtonEnabled(),
                "`Stop` button should be disabled");
        }).then(() => {
            return assert.eventually.isFalse(appBrowsePanel.isUninstallButtonEnabled(),
                "`Uninstall` button should be disabled");
        })
    });

    it('GIVEN Install App dialog is opened WHEN Install button has been clicked for two applications THEN two new applications should be present in the grid',
        () => {
            this.bail(1);
            return appBrowsePanel.clickOnInstallButton()
                .then(() => installAppDialog.waitForInstallLink(appDisplayName1))
                .then(() => installAppDialog.clickOnInstallAppLink(appDisplayName1))
                .then(() => installAppDialog.waitForAppInstalled(appDisplayName1))
                .then(() => installAppDialog.waitForInstallLink(appDisplayName2))
                .then(() => installAppDialog.clickOnInstallAppLink(appDisplayName2))
                .then(() => installAppDialog.waitForAppInstalled(appDisplayName2))
                .then(() => installAppDialog.clickOnCancelButtonTop())
                .then(() => installAppDialog.waitForClosed).pause(1000)
                .then(
                    () => Promise.all([appBrowsePanel.isItemDisplayed(appDescription1), appBrowsePanel.isItemDisplayed(appDescription2)]));
        });

    it('WHEN An installed application is selected or unselected THEN the toolbar buttons must be updated', () => {
        return appBrowsePanel.clickOnRowByName(appDescription1)
            .then(() => Promise.all([appBrowsePanel.waitForUninstallButtonEnabled(), appBrowsePanel.waitForStopButtonEnabled(),
                appBrowsePanel.waitForStartButtonDisabled()]))
            .then(() => appBrowsePanel.clickOnRowByName(appDescription1))
            .then(() => Promise.all([appBrowsePanel.waitForUninstallButtonDisabled(), appBrowsePanel.waitForStopButtonDisabled(),
                appBrowsePanel.waitForStartButtonDisabled()]));
    });

    it('WHEN The select all checkbox is selected/unselected THEN the rows should be selected/unselected', () => {
        return appBrowsePanel.clickOnSelectAll()
            .then(() => Promise.all([appBrowsePanel.waitForRowByIndexSelected(0), appBrowsePanel.waitForRowByIndexSelected(1)]))
            .then(() => appBrowsePanel.clickOnSelectAll())
            .then(() => Promise.all([appBrowsePanel.waitForRowByIndexSelected(0, true), appBrowsePanel.waitForRowByIndexSelected(1, true)]))
    });

    it('Uninstall installed applications', () => {
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
    return appBrowsePanel.clickOnRowByName(appDescription)
        .then(() => appBrowsePanel.waitForUninstallButtonEnabled())
        .then(() => appBrowsePanel.clickOnUninstallButton())
        .then(() => uninstallAppDialog.waitForOpened())
        .then(() => uninstallAppDialog.clickOnYesButton())
        .then(() => appBrowsePanel.waitForNotificationMessage())
        .catch(() => {
        });
}






