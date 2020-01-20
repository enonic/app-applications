/**
 * Created on 8.12.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'InstallAppDialog')]`,
    grid: `//div[contains(@id,'MarketAppsTreeGrid')]`,
    filterInput: `//div[contains(@id,'ApplicationInput')]/input`,
    appByDisplayName: function (displayName) {
        return `//div[contains(@id,'InstallAppDialog')]//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name')]]//a[contains(.,'${displayName}')]`
    },
    installLinkByName: function (displayName) {
        return `${lib.slickRowByDisplayName(XPATH.container, displayName)}//a[@class='install']`
    },
    installedStatusByName: function (displayName) {
        return `${lib.slickRowByDisplayName(XPATH.container, displayName)}//a[@class='installed']`;
    }
};
class InstallAppDialog extends Page {

    get searchInput() {
        return XPATH.container + XPATH.filterInput;
    }

    get grid() {
        return XPATH.container + XPATH.grid;
    }

    get cancelButton() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    waitForAppInstalled(appName) {
        return this.waitForElementDisplayed(XPATH.installedStatusByName(appName), 25000).catch(err => {
            this.saveScreenshot('err_installed_status');
            return false;
        })
    }

    waitForOpened() {
        return this.waitForElementDisplayed(this.searchInput, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_load_install_dialog');
            throw new Error('Install App dialog was not loaded! ' + err);
        });
    }

    waitForClosed(ms) {
        return this.waitForElementNotDisplayed(XPATH.container, ms).catch(err => {
            this.saveScreenshot('err_install_dialog_close');
            throw new Error('Install Dialog was not closed! ' + err);
        });
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButton).catch(err => {
            this.saveScreenshot('err_install_dialog_cancel_button');
            throw new Error('Error when clicking on cancel button ' + err);
        })
    }

    waitForGridLoaded() {
        return this.waitForElementDisplayed(this.grid + lib.H6_DISPLAY_NAME, appConst.TIMEOUT_7).catch(err => {
            this.saveScreenshot('err_install_dialog_grid');
            throw new Error('Install App dialog, grid was not loaded! ' + err);
        });
    }

    waitForInstallLink(appName) {
        const selector = XPATH.installLinkByName(appName);
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_install_link_load');
            throw new Error('Install link was not loaded! ' + err);
        }).then(()=>{
            return this.pause(300);
        });
    }

    clickOnInstallAppLink(appName) {
        const selector = XPATH.installLinkByName(appName);
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3).then(() => {
            return this.clickOnElement(selector);
        }).catch(err => {
            throw new Error(`Couldn't find install link for app ${appName}` + " " + err);
        });
    }

    //checks that 'installed' status appeared
    isApplicationInstalled(appName) {
        const selector = lib.slickRowByDisplayName(XPATH.container, appName) + "//a[@class='installed']";
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3).catch(err => {
            this.saveScreenshot('err_find_installed_status');
            throw new Error(`Couldn't find installed label for the app ${appName}` + " " + err);
        });
    }

    isCancelButtonTopDisplayed() {
        return this.isElementDisplayed(this.cancelButton).catch(err => {
            throw new Error('error- Cancel button top is not displayed ' + err);
        })
    }

    getErrorValidationMessage() {
        let selector = XPATH.container + `//div[contains(@class,'status-message') and contains(@class,'failed')]`;
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3).then(() => {
            return this.getText(selector);
        }).catch(err => {
            this.saveScreenshot('err_wait_for_validation_message');
            throw new Error('Validation message is not visible after the interval  ' + err);
        })
    }

    applicationNotFoundMessage() {
        let selector = XPATH.container + `//div[@class='status-message']`;
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3).then(() => {
            return this.getTextInDisplayedElements(selector);
        }).catch(err => {
            this.saveScreenshot('err_app_not_found_message');
            throw new Error("'Application not found' message is not visible  " + err);
        })
    }

    getPlaceholderMessage() {
        return this.getAttribute(this.searchInput, 'placeholder');
    }

    getApplicationNames() {
        let items = XPATH.grid + lib.H6_DISPLAY_NAME;
        return this.getTextInDisplayedElements(items);
    }

    typeSearchText(text) {
        return this.typeTextInInput(this.searchInput, text);
    }

    typeSearchTextAndEnter(text) {
        return this.typeTextInInput(this.searchInput, text).then(()=>{
            return this.pause(1000);
        }).then(() => {
            return this.keys('Enter');
        }).then(() => {
            return this.pause(1000);
        })
    }

    isApplicationPresent(appName) {
        let selector = XPATH.appByDisplayName(appName);
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_3);
    }

    clickOnInstallLink(appName) {
        let selector = XPATH.appByDisplayName(appName);
        return this.waitForElementDisplayed(selector, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(selector);
        })
    }

    isDefaultFocused() {
        return this.isFocused(XPATH.filterInput);
    }
};
module.exports = InstallAppDialog;

