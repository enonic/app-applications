/**
 * Verifies:
 * app-applications#8
 * Install Applications Dialog - incorrect state of application, when the dialog has been opened after the 'Log in'
 */
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const dialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe('Install Application Dialog specification', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    const appName = 'Chuck Norris';

    it('SHOULD show install app dialog WHEN Install button has been clicked', () => {
        return appBrowsePanel.clickOnInstallButton().pause(2000).then(() => {
            return dialog.waitForOpened();
        }).then(() => {
            return dialog.waitForSpinnerNotVisible(3000);
        }).then(() => {
            return dialog.getPlaceholderMessage();
        }).then(placeholder => {
            assert.isTrue(placeholder == 'Search Enonic Market, paste url or upload directly',
                'Correct message should be in the placeholder');
        }).then(() => {
            studioUtils.saveScreenshot("install_dialog_default_focus");
            return dialog.hasDefaultFocus();
        }).then(result => {
            //assert.isTrue(result, 'Focus should be in the `filter input` by default');
        })
    });

    it('SHOULD contain all controls WHEN opened', () => {
        return appBrowsePanel.clickOnInstallButton().then(() => {
            return dialog.waitForOpened();
        }).then(() => {
            return dialog.waitForVisible(dialog.searchInput, 1000);
        }).then(visible => {
            assert.isTrue(visible, 'Filter input should be present in dialog');
        }).then(() => {
            return dialog.isCancelButtonTopVisible();
        }).then(result => {
            assert.isTrue(result, 'Cancel button top should be present');
        })
    });

    it('WHEN dialog is opened THEN applications should be present in the grid AND applications are sorted by a name', () => {
        return appBrowsePanel.clickOnInstallButton().then(() => {
            return dialog.waitForOpened();
        }).pause(5000).then(() => {
            return dialog.getApplicationNames();
        }).then(names => {
            studioUtils.saveScreenshot("install_dlg_sorted");
            assert.isAbove(names.length, 0, 'There should be apps in the grid');
            //TODO uncomment it
            //assert.isTrue(names[1] == 'Auth0 ID Provider', 'Auth0 ID Provider this application should be second');
        });
    });

    it('GIVEN dialog is opened WHEN search text has been typed THEN apps should be filtered ', () => {
        return appBrowsePanel.clickOnInstallButton().then(() => {
            return dialog.waitForOpened();
        }).then(() => {
            return dialog.typeSearchText('Chuck Norris');
        }).pause(1500).then(() => {
            return dialog.getApplicationNames();
        }).then(names => {
            assert.isTrue(names.length == 1, 'only one application should be displayed');
            assert.isTrue(names[0] == appName, 'application should be with the expected display name');
        })
    });

    it('GIVEN dialog is opened WHEN install link has been clicked THEN the app should be installed', () => {
        return appBrowsePanel.clickOnInstallButton().then(() => {
            return dialog.waitForOpened();
        }).then(() => {
            return dialog.clickOnInstallAppLink(appName);
        }).then(() => {
            return dialog.waitForAppInstalled(appName);
        }).then(visible => {
            assert.isTrue(visible, `'${appName}' should've been installed by now`);
            return dialog.clickOnCancelButtonTop();
        }).then(() => {
            return dialog.waitForClosed();
        }).then(() => {
            return appBrowsePanel.isItemDisplayed(appName);
        }).then(visible => {
            assert.isTrue(visible, `'${appName}' application should've been present in the grid`);
            return appBrowsePanel.waitForNotificationMessage();
        }).then(text => {
            assert.equal(text, 'Application \'Chuck Norris\' installed successfully', `Incorrect notification message [${text}]`)
        });
    });

    //verifies   https://github.com/enonic/app-applications/issues/8
    it('GIVEN existing installed application WHEN install dialog has been opened THEN `Installed` status should be displayed near the application',
        () => {
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return dialog.waitForOpened();
            }).then(() => {
                return dialog.isApplicationInstalled(appName);
            }).then(result => {
                assert.isTrue(result, `'${appName}' should be with Installed status`);
            });
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => {
        return studioUtils.doCloseCurrentBrowserTab();
    });
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
