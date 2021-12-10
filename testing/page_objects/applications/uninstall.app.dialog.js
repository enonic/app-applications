const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const XPATH = {
    container: `//div[contains(@id,'UninstallApplicationDialog')]`,
    content: `//div[contains(@id,'ModalDialogContentPanel')]/h6`,
    yesButton: `//button[contains(@id,'DialogButton')]/span[text()='Yes']`,
    noButton: `//button[contains(@id,'DialogButton')]/span[text()='No']`,
};

class UninstallAppDialog extends Page {

    get cancelButtonTop() {
        return XPATH.container + lib.CANCEL_BUTTON_TOP;
    }

    get yesButton() {
        return XPATH.container + XPATH.yesButton;
    }

    get noButton() {
        return XPATH.container + XPATH.noButton;
    }

    getHeader() {
        return this.getText(XPATH.content);
    }

    async waitForOpened() {
        try {
            await this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
            return await this.pause(500);
        } catch (err) {
            this.saveScreenshot('err_load_uninstall_dialog');
            throw new Error('Uninstall dialog was not loaded! ' + err);
        }
    }

    async clickOnYesButton() {
        await this.waitForElementDisplayed(this.yesButton, appConst.mediumTimeout);
        await this.clickOnElement(this.yesButton);
        return await this.pause(300);
    }

    clickOnCancelButtonTop() {
        return this.clickOnElement(this.cancelButtonTop).catch(err => {
            this.saveScreenshot('err_uninstall_dialog_cancel');
            throw new Error("Error when click on Cancel button " + err);
        })
    }

    clickOnNoButton() {
        return this.clickOnElement(this.noButton).catch(err => {
            throw new Error("Error when click on 'No' button " + err);
        })
    }

    waitForClosed() {
        return this.waitForElementNotDisplayed(XPATH.container, appConst.mediumTimeout).catch(error => {
            this.saveScreenshot('err_close_uninstall_dialog');
            throw new Error('Uninstall Dialog was not closed');
        });
    }

    isYesButtonDisplayed() {
        return this.waitForElementDisplayed(this.yesButton, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_uninstall_dialog_yes_button');
            throw new Error('Uninstall Dialog Yes button is not visible ' + err);
        });
    }

    isNoButtonDisplayed() {
        return this.waitForElementDisplayed(this.noButton, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_uninstall_dialog_no_button');
            throw new Error('Uninstall Dialog -  No button is not visible ' + err);
        });
    }
}

module.exports = UninstallAppDialog;
