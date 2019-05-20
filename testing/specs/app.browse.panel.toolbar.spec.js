const chai = require('chai');
const expect = chai.expect;
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

    it('WHEN app browse panel is loaded  AND no selections THEN only `Install` button should be enabled', () => {
        let appBrowsePanel = new AppBrowsePanel();
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
            let appBrowsePanel = new AppBrowsePanel();
            let installAppDialog = new InstallAppDialog();
            return appBrowsePanel.clickOnInstallButton()
                .then(() => installAppDialog.waitForInstallLink(appDisplayName1))
                .then(() => installAppDialog.clickOnInstallAppLink(appDisplayName1))
                .then(() => installAppDialog.waitForAppInstalled(appDisplayName1))
                .then(() => installAppDialog.waitForInstallLink(appDisplayName2))
                .then(() => installAppDialog.clickOnInstallAppLink(appDisplayName2))
                .then(() => installAppDialog.waitForAppInstalled(appDisplayName2))
                .then(() => installAppDialog.clickOnCancelButtonTop())
                .then(() => installAppDialog.waitForClosed(2000))
                .then(() => {
                    return assert.eventually.isTrue(appBrowsePanel.isItemDisplayed(appDescription1),
                        appDescription1 + "  application should be present");

                }).then(() => {
                    return assert.eventually.isTrue(appBrowsePanel.isItemDisplayed(appDescription2),
                        appDescription2 + "  application should be present");
                })
        });

    it('WHEN An installed application is selected or unselected THEN the toolbar buttons must be updated', () => {
        let appBrowsePanel = new AppBrowsePanel();
        //select the application:
        return appBrowsePanel.clickOnRowByName(appDescription1).then(() => {
            return assert.eventually.isTrue(appBrowsePanel.waitForUninstallButtonEnabled(), "Uninstall button gets enabled")
        }).then(() => {
            return appBrowsePanel.waitForStopButtonEnabled();
        }).then(() => {
            return appBrowsePanel.waitForStartButtonDisabled();
        }).then(() => {
            //click on the row again and unselect it
            return appBrowsePanel.clickOnRowByName(appDescription1)
        }).then(() => {
            return appBrowsePanel.waitForUninstallButtonDisabled()
        }).then(() => {
            return appBrowsePanel.waitForStopButtonDisabled();
        }).then(() => {
            return appBrowsePanel.waitForStartButtonDisabled()
        });
    });

    it('WHEN The select all checkbox is selected/unselected THEN the rows should be selected/unselected', () => {
        let appBrowsePanel = new AppBrowsePanel();
        return appBrowsePanel.clickOnSelectAll().then(() => {
            return assert.eventually.isTrue(appBrowsePanel.isRowByIndexSelected(0), "First row should be selected(blue)");
        }).then(()=>{
            return assert.eventually.isTrue(appBrowsePanel.isRowByIndexSelected(1), "Second row should be selected(blue)");
        }).then(() => {
            //click on 'Select all/Unselect all' checkbox
            return appBrowsePanel.clickOnSelectAll();
        }).then(() => {
            return assert.eventually.isFalse(appBrowsePanel.isRowByIndexSelected(0), "First row should be unselected");
        }).then(()=>{
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






