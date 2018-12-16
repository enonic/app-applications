/**
 * Created on 8.12.2017.
 */

const page = require('../page');
const elements = require('../../libs/elements');
const utils = require('../../libs/studio.utils');
const dialog = {
    container: `//div[contains(@id,'InstallAppDialog')]`,
    grid: `//div[contains(@id,'MarketAppsTreeGrid')]`,
    filterInput: `//div[contains(@id,'ApplicationInput')]/input`,
    appByDisplayName: function (displayName) {
        return `//div[contains(@id,'InstallAppDialog')]//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name')]]//a[contains(.,'${displayName}')]`
    },
    firstUninstalledAppDisplayName: function () {
        return `(${dialog.container}//div[@class='slick-viewport']//div[contains(@class,'slick-row') and descendant::a[@class='install']]//h6[contains(@class,'main-name')])[1]`;
    },
    firstInstallLink: function () {
        return `(${elements.slickRow(dialog.container)}//a[@class='install'])[1]`
    },
    installLinkByName: function (displayName) {
        return `${elements.slickRowByDisplayName(dialog.container, displayName)}//a[@class='install']`
    },
    installedStatusByName: function (displayName) {
        return `${elements.slickRowByDisplayName(dialog.container, displayName)}//a[@class='installed']`;
    }
};
const installAppDialog = Object.create(page, {

    searchInput: {
        get: function () {
            return `${dialog.container}${dialog.filterInput}`;
        }
    },
    grid: {
        get: function () {
            return `${dialog.container}${dialog.grid}`;
        }
    },
    cancelButton: {
        get: function () {
            return `${dialog.container}${elements.CANCEL_BUTTON_TOP}`;
        }
    },
    waitForAppInstalled: {
        value: function (displayName) {
            return this.waitForVisible(dialog.installedStatusByName(displayName), 25000).catch(err => {
                this.saveScreenshot('err_installed_status');
                return false;
            })
        }
    },
    clickOnCancelButtonTop: {
        value: function () {
            return this.doClick(this.cancelButton).catch((err) => {
                this.saveScreenshot('err_install_dialog_cancel');
                throw new Error('Error when try click on cancel button ' + err);
            })
        }
    },
    waitForOpened: {
        value: function () {
            return this.waitForVisible(this.searchInput, 3000).catch(err => {
                this.saveScreenshot('err_install_dialog_load');
                throw new Error('New Content dialog was not loaded! ' + err);
            });
        }
    },
    waitForGridLoaded: {
        value: function () {
            return this.waitForVisible(this.grid + elements.H6_DISPLAY_NAME, 3000).catch(err => {
                this.saveScreenshot('err_install_dialog_grid');
                throw new Error('New Content dialog, grid was not loaded! ' + err);
            });
        }
    },
    waitForClosed: {
        value: function () {
            return this.waitForNotVisible(`${dialog.container}`, 3000).catch(error => {
                this.saveScreenshot('err_install_dialog_close');
                throw new Error('Install Dialog was not closed');
            });
        }
    },
    waitForInstallLink: {
        value: function (displayName) {
            const selector = dialog.installLinkByName(displayName);
            return this.waitForVisible(selector, 3000).catch(err => {
                this.saveScreenshot('err_install_link_load');
                throw new Error('Install link was not loaded! ' + err);
            });
        }
    },
    getPlaceholderMessage: {
        value: function () {
            return this.getAttribute(this.searchInput, 'placeholder');
        }
    },
    clickOnInstallAppLink: {
        value: function (displayName) {
            const selector = dialog.installLinkByName(displayName);
            return this.waitForVisible(selector, 5000).then(() => {
                return this.doClick(selector);
            }).catch(e => {
                throw new Error(`Couldn't find install link for app ${displayName}`);
            });
        }
    },
    isApplicationInstalled: {
        value: function (displayName) {
            const selector = `${elements.slickRowByDisplayName(dialog.container, displayName)}` + "//a[@class='installed']";
            return this.waitForVisible(selector, 2000).catch(e => {
                this.saveScreenshot('err_find_installed_status');
                throw new Error(`Couldn't find installed label for the app ${displayName}`);
            });
        }
    },

    clickOnFirstInstallAppLink: {
        value: function () {
            const selector = dialog.firstInstallLink();
            return this.waitForVisible(selector, 5000).then(() => {
                return this.doClick(selector);
            }).catch(e => {
                throw new Error(`Couldn't find install link for app ${displayName}`);
            });
        }
    },
    getFirstInstallAppName: {
        value: function () {
            const selector = dialog.firstUninstalledAppDisplayName();
            return this.waitForVisible(selector, 5000).then(() => {
                return this.getText(selector);
            }).catch(e => {
                throw new Error(`Couldn't find install link for app ${displayName}`);
            });
        }
    },
    getApplicationNames: {
        value: function () {
            let items = `${dialog.grid}` + `${elements.H6_DISPLAY_NAME}`;
            return this.getTextFromDisplayedElements(items);
        }
    },
    typeSearchText: {
        value: function (text) {
            return this.typeTextInInput(this.searchInput, text);
        }
    },
    typeSearchTextAndEnter: {
        value: function (text) {
            return this.typeTextInInput(this.searchInput, text).pause(500).then(() => {
                return this.keys('Enter');
            }).pause(1000);
        }
    },
    isApplicationPresent: {
        value: function (displayName) {
            let selector = `${dialog.appByDisplayName(displayName)}`;
            return this.waitForVisible(selector, 2000);
        }
    },

    clickOnInstallLink: {
        value: function (displayName) {
            let selector = `${dialog.appByDisplayName(displayName)}`;
            return this.waitForVisible(selector, 1000).then(() => {
                return this.doClick()
            })
        }
    },
    isCancelButtonTopVisible: {
        value: function () {
            return this.isVisible(this.cancelButton).catch((err) => {
                throw new Error('error check the Cancel button on the Install dialog');
            })
        }
    },
    getErrorValidationMessage: {
        value: function () {
            let selector = dialog.container + `//div[contains(@class,'status-message') and contains(@class,'failed')]`;
            return this.waitForVisible(selector, 3000).then(() => {
                this.saveScreenshot('inst_dlg_validation');
                return this.getText(selector);
            }).catch(err => {
                this.saveScreenshot('err_wait_for_validation_message');
                throw new Error('Validation message is not visible after the interval  ' + err);
            })
        }
    },

    applicationNotFoundMessage: {
        value: function () {
            let selector = dialog.container + `//div[contains(@class,'status-message') and contains(@class,'empty')]`;
            return this.waitForVisible(selector, 3000).then(() => {
                this.saveScreenshot('inst_dlg_message');
                return this.getText(selector);
            }).catch(err => {
                this.saveScreenshot('err_wait_for_search_message');
                throw new Error('search message is not visible after the interval  ' + err);
            })
        }
    },
    hasDefaultFocus: {
        value: function () {
            return this.hasFocus(dialog.filterInput);
        }
    }
});
module.exports = installAppDialog;
