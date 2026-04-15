
const Page = require('./page');
const appConst = require('../libs/app_const');

const xpTourDialog = {
    container: `//div[contains(@id,'ModalDialog') and descendant::h2[contains(.,'Welcome Tour')]]`
};
const home = {
    container: "div[class*='home-main-container']",
    avatarButton: 'button#avatar-button',
};

const selectors = {
    usersLink: 'a[id="com.enonic.xp.app.users"] span.app-tile-name',
    applicationsLink: 'a[id="com.enonic.xp.app.applications"] span.app-tile-name',
    dashboardLink: 'a.home-app span.app-tile-name',
    avatarButton:'button#avatar-button',
    logoutMenuItem: 'a.avatar-dropdown-item',
};

class HomePage extends Page {

    get closeXpTourButton() {
        return xpTourDialog.container + "//div[@class='cancel-button-top']";
    }

    waitForLoaded() {
        return this.waitForElementDisplayed(`${home.container}`, appConst.mediumTimeout);
    }

    async waitForUsersLinkDisplayed(){
        const host = await this.getXpMenuShadowHost();
        const span = await host.shadow$(selectors.usersLink);
        await span.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async waitForApplicationsLinkDisplayed(){
        const host = await this.getXpMenuShadowHost();
        const span = await host.shadow$(selectors.applicationsLink);
        await span.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async waitForApplicationsLinkNotDisplayed(){
        const host = await this.getXpMenuShadowHost();
        const span = await host.shadow$(selectors.applicationsLink);
        await span.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }

    async waitForUsersLinkNotDisplayed(){
        const host = await this.getXpMenuShadowHost();
        const span = await host.shadow$(selectors.usersLink);
        await span.waitForDisplayed({timeout: appConst.mediumTimeout, reverse: true});
    }

    async waitForDashboardLinkDisplayed(){
        const host = await this.getXpMenuShadowHost();
        const span = await host.shadow$(selectors.dashboardLink);
        await span.waitForDisplayed({timeout: appConst.mediumTimeout});
    }

    async clickOnApplicationsLink() {
        try {
            const host = await this.getXpMenuShadowHost();
            const span = await host.shadow$(selectors.applicationsLink);
            await span.waitForDisplayed({timeout: appConst.mediumTimeout});
            await span.click();
        } catch (err) {
            await this.handleError('Applications link was not found', 'err_applications_link', err);
        }
    }

    async clickOnDashboardLink() {
        try {
            const host = await this.getXpMenuShadowHost();
            const span = await host.shadow$(selectors.dashboardLink);
            await span.waitForDisplayed({timeout: appConst.mediumTimeout});
            await span.click();
        } catch (err) {
            await this.handleError('Dashboard link was not found', 'err_dashboard_link', err);
        }
    }

    async clickOnUsersLink() {
        try {
            const host = await this.getXpMenuShadowHost();
            const span = await host.shadow$(selectors.usersLink);
            await span.waitForDisplayed({timeout: appConst.mediumTimeout});
            await span.click();
        } catch (err) {
            await this.handleError('Users link was not found', 'err_users_link', err);
        }
    }

    async isAvatarButtonDisplayed() {
        try {
            let host = await this.getXpMenuShadowHost();
            const avatarButton = await host.shadow$(selectors.avatarButton);
            return await avatarButton.isDisplayed();
        } catch (err) {
            return false;
        }
    }

    async clickOnAvatarButton() {
        try {
            let host = await this.getXpMenuShadowHost();
            const avatarButton = await host.shadow$(selectors.avatarButton);
            await avatarButton.waitForDisplayed({timeout: appConst.mediumTimeout});
            await avatarButton.click();
        } catch (err) {
            await this.handleError('Avatar button was not found', 'err_avatar_button', err);
        }
    }

    async clickOnLogoutDropdownMenuItem(){
        try {
            let host = await this.getXpMenuShadowHost();
            const logoutLink = await host.shadow$(selectors.logoutMenuItem);
            await logoutLink.waitForDisplayed({timeout: appConst.mediumTimeout});
            await logoutLink.click();
        } catch (err) {
            await this.handleError('Logout menu item was not found', 'err_logout_menu_item', err);
        }
    }
}
module.exports = HomePage;
