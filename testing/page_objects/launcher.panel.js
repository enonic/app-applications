/**
 * Created by on 6/26/2017.
 */
const Page = require('./page');
const appConst = require('../libs/app_const');
const XPATH = {
    container: `//div[contains(@class,'launcher-main-container')]`
};

class LauncherPanel extends Page {

    get homeLink() {
        return XPATH.container + `//a[contains(@data-id,'home')]`;
    }

    get applicationsLink() {
        return XPATH.container + `//a[contains(@data-id,'app.applications')]//p[@class='app-name']`;
    }

    get usersLink() {
        return XPATH.container + `//a[contains(@data-id,'app.users')]`;
    }

    get logoutLink() {
        return XPATH.container + `//div[@class='user-logout']`;
    }

    async clickOnApplicationsLink() {
        await this.waitForElementDisplayed(this.applicationsLink, appConst.mediumTimeout);
        await this.pause(300);
        return await this.clickOnElement(this.applicationsLink);
    }

    clickOnLogoutLink() {
        return this.clickOnElement(this.logoutLink);
    }

    waitForPanelDisplayed(ms) {
        return this.waitForElementDisplayed(XPATH.container, ms).catch(err => {
            return false;
        })
    }

    isApplicationsLinkDisplayed() {
        return this.waitForElementDisplayed(this.applicationsLink, appConst.shortTimeout).catch(err => {
            return false;
        })
    }

    isUsersLinkDisplayed() {
        return this.waitForElementDisplayed(this.usersLink, appConst.shortTimeout).catch(err => {
            return false;
        })
    }
}

module.exports = LauncherPanel;
