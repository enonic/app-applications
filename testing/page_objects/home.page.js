/**
 * Created on 12/12/2017.
 */

const page = require('./page');
const xpTourDialog = {
    container: `//div[contains(@id,'ModalDialog') and descendant::h2[contains(.,'Welcome Tour - Step 1 of 5')]]`
};
const home = {
    container: `div[class*='home-main-container']`
};
const homePage = Object.create(page, {

    closeXpTourButton: {
        get: function () {
            return `${xpTourDialog.container}//div[@class='cancel-button-top']`
        }
    },
    waitForXpTourVisible: {
        value: function (ms) {
            return this.waitForVisible(`${xpTourDialog.container}`, ms).catch(err=> {
                return false;
            })
        }
    },
    isXpTourVisible: {
        value: function () {
            return this.isVisible(`${xpTourDialog.container}`);
        }
    },
    waitForXpTourClosed: {
        value: function () {
            return this.waitForNotVisible(`${xpTourDialog.container}`, 3000).catch(error=> {
                this.saveScreenshot('err_xp_tour_dialog_not_closed');
                throw new Error('Xp-tour dialog not closed');
            });
        }
    },
   
    waitForLoaded: {
        value: function (ms) {
            return this.waitForVisible(`${home.container}`, ms);
        }
    },
    doCloseXpTourDialog: {
        value: function () {
            return this.doClick(this.closeXpTourButton);
        }
    },
});
module.exports = homePage;
