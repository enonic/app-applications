/**
 * Created on 8.12.2017.
 */
const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'InstallAppDialog')]`,
    gridUL: `//ul[contains(@id,'MarketAppsTreeGrid')]`,
    filterInput: `//div[contains(@id,'ApplicationInput')]/input`,
    appByDisplayName(displayName) {
        return `//div[contains(@id,'InstallAppDialog')]//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name')]]//a[contains(.,'${displayName}')]`
    },
    installButtonByName(displayName) {
        return `${lib.MARKET_MODAL_DIALOG.rowByDisplayName(XPATH.container, displayName)}//button/span[text()='Install']`
    },
    installedStatusByName(displayName) {
        return `${lib.MARKET_MODAL_DIALOG.rowByDisplayName(XPATH.container, displayName)}//button/span[text()='Installed']`;
    }
};

class InstallAppDialog extends Page {

    get searchInput() {
        return XPATH.container + XPATH.filterInput;
    }

    get grid() {
        return XPATH.container + XPATH.gridUL;
    }

    get cancelButton() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    async waitForAppInstalled(appName) {
        try {
            return await this.waitForElementDisplayed(XPATH.installedStatusByName(appName), appConst.installAppTimeout)
        } catch (err) {
            let screenshot = appConst.generateRandomName('err_inst_status');
            await this.saveScreenshot(screenshot);
            throw new Error('Install App Dialog - Application status should be Installed: screenshot ' + screenshot + ' ' + err);
        }
    }

    waitForOpened() {
        return this.waitForElementDisplayed(this.searchInput, appConst.mediumTimeout).catch(err => {
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

    async waitForGridLoaded() {
        try {
            await this.waitForElementDisplayed(this.grid + lib.H6_DISPLAY_NAME, appConst.longTimeout)
        } catch (err) {
            await this.saveScreenshot('err_install_dialog_grid');
            throw new Error('Install App dialog, grid was not loaded! ' + err);
        }
    }

    waitForInstallLink(appName) {
        const selector = XPATH.installButtonByName(appName);
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot(appConst.generateRandomName('err_install_link'));
            throw new Error(`Install link is not displayed for!  ` + err);
        })
    }

    async clickOnInstallAppLink(appName) {
        try {
            let locator = XPATH.installButtonByName(appName);
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            await this.pause(400);
            return await this.clickOnElement(locator);
        } catch (err) {
            throw new Error(`Couldn't find install link for app ` + " " + err);
        }
    }

    //checks that 'installed' status appeared
    async waitForApplicationInstalled(appName) {
        try {
            const locator = XPATH.installedStatusByName(XPATH.container, appName);
            return await this.waitForElementDisplayed(locator, appConst.longTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_find_installed_status');
            throw new Error(`Couldn't find 'Installed' label for the app, screenshot:` + screenshot + " " + err);
        }
    }

    isCancelButtonTopDisplayed() {
        return this.isElementDisplayed(this.cancelButton).catch(err => {
            throw new Error('Error - Cancel button top is not displayed ' + err);
        })
    }

    getErrorValidationMessage() {
        let selector = XPATH.container + `//div[contains(@class,'status-message') and contains(@class,'failed')]`;
        return this.waitForElementDisplayed(selector, appConst.longTimeout).then(() => {
            return this.getText(selector);
        }).catch(err => {
            this.saveScreenshot('err_wait_for_validation_message');
            throw new Error('Validation message is not visible after the interval  ' + err);
        })
    }

    applicationNotFoundMessage() {
        let selector = XPATH.container + `//div[@class='status-message']`;
        return this.waitForElementDisplayed(selector, appConst.longTimeout).then(() => {
            return this.getTextInDisplayedElements(selector);
        }).catch(err => {
            this.saveScreenshot('err_app_not_found_message');
            throw new Error("'Application not found' message is not visible  " + err);
        })
    }

    waitForApplicationNotFoundMessage() {
        let selector = XPATH.container + `//div[contains(@class,'status-message') and contains(.,'No applications found')]`;
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_app_not_found_mess');
            throw new Error('expected notification message was not displayed! ' + err);
        })
    }

    getPlaceholderMessage() {
        return this.getAttribute(this.searchInput, 'placeholder');
    }

    getApplicationNames() {
        let items = XPATH.grid + lib.H6_DISPLAY_NAME;
        return this.getTextInDisplayedElements(items);
    }

    waitForApplicationDisplayed(appDisplayName) {
        let selector = XPATH.appByDisplayName(appDisplayName);
        return this.waitForElementDisplayed(selector, appConst.longTimeout);
    }

    typeSearchText(text) {
        return this.typeTextInInput(this.searchInput, text);
    }

    async typeSearchTextAndEnter(text) {
        await this.typeTextInInput(this.searchInput, text);
        await this.pause(700);
        return await this.keys('Enter');
    }

    async clickOnInstallLink(appName) {
        let selector = XPATH.appByDisplayName(appName);
        await this.waitForElementDisplayed(selector, appConst.shortTimeout);
        return await this.clickOnElement(selector);
    }

    isDefaultFocused() {
        return this.isFocused(XPATH.filterInput);
    }
}

module.exports = InstallAppDialog;

