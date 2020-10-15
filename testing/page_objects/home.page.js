/**
 * Created on 12/12/2017.
 */
const Page = require('./page');
const appConst = require('../libs/app_const');

const xpTourDialog = {
    container: "//div[contains(@id,'ModalDialog') and descendant::h2[contains(.,'Welcome Tour')]]",
};
const XPATH = {
    container: `div[class*='home-main-container']`
};

class HomePage extends Page {

    get closeXpTourButton() {
        return XPATH.container + "//div[@class='cancel-button-top']";
    }

    waitForLoaded() {
        return this.waitForElementDisplayed(XPATH.container, appConst.mediumTimeout);
    }
}

module.exports = HomePage;
