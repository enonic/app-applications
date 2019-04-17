const page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const dialog = {
    container: `//div[contains(@id,'UninstallApplicationDialog')]`,
    content: `//div[contains(@id,'ModalDialogContentPanel')]/h6`,
    yesButton: `//button[contains(@id,'DialogButton')]/span[text()='Yes']`,
    noButton: `//button[contains(@id,'DialogButton')]/span[text()='No']`,
};
const uninstallAppDialog = Object.create(page, {

    cancelButtonTop: {
        get: function () {
            return `${dialog.container}${elements.CANCEL_BUTTON_TOP}`;
        }
    },
    yesButton: {
        get: function () {
            return `${dialog.container}${dialog.yesButton}`;
        }
    },
    noButton: {
        get: function () {
            return `${dialog.container}${dialog.noButton}`;
        }
    },
    getDialogMessage: {
        value: function () {
            return this.getText(`${dialog.content}`);
        }
    },
    clickOnYesButton: {
        value: function () {
            return this.doClick(this.yesButton).catch(err => {
                throw new Error('Error when try click on no button ' + err);
            })
        }
    },
    clickOnCancelButtonTop: {
        value: function () {
            return this.doClick(this.cancelButtonTop).catch(err => {
                this.saveScreenshot('err_uninstall_dialog_cancel');
                throw new Error('Error when try click on cancel button ' + err);
            })
        }
    },
    clickOnYesButton: {
        value: function () {
            return this.doClick(this.yesButton).catch(err => {
                throw new Error('Error when try click on no button ' + err);
            })
        }
    },
    waitForOpened: {
        value: function () {
            return this.waitForVisible(`${dialog.container}`, 3000).catch(err => {
                this.saveScreenshot('err_uninstall_dialog_load');
                throw new Error('Uninstall was not loaded! ' + err);
            });
        }
    },
    waitForClosed: {
        value: function () {
            return this.waitForNotVisible(`${dialog.container}`, 3000).catch(error => {
                this.saveScreenshot('err_uninstall_dialog_close');
                throw new Error('Uninstall Dialog was not closed');
            });
        }
    },
    isYesButtonDisplayed: {
        value: function () {
            return this.isVisible(this.yesButton, appConst.TIMEOUT_2).catch(err => {
                this.saveScreenshot('err_uninstall_dialog_yes_button');
                throw new Error('Uninstall Dialog Yes button is not visible ' + err);
            });
        }
    },
    isNoButtonDisplayed: {
        value: function () {
            return this.isVisible(this.noButton, appConst.TIMEOUT_2).catch(err => {
                this.saveScreenshot('err_uninstall_dialog_no_button');
                throw new Error('Uninstall Dialog No button is not visible ' + err);
            });
        }
    },

});
module.exports = uninstallAppDialog;
