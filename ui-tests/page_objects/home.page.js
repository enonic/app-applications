/**
 * Created on 6.09.2026
 */

const Page = require('./page');
const appConst = require('../libs/app_const');

const selectors = {
  container: `div[class*='home-main-container visible']`,
  settingsLink: 'a[data-tool-id="com.enonic.xp.app.settings:main"] span.app-tile-name',
  usersLink: 'a[data-tool-id="com.enonic.xp.app.users:main"] span.app-tile-name',
  applicationsLink: 'a[data-tool-id="com.enonic.xp.app.applications:main"] span.app-tile-name',
  dashboardLink: 'a[data-tool-id="com.enonic.xp.app.main:dashboard"] span.app-tile-name',
  avatarButton: 'button#avatar-button',
  logoutMenuItem: 'a.avatar-dropdown-item',
};

class HomePage extends Page {
  async waitForLoaded() {
    return await this.waitForElementDisplayed(selectors.container);
  }

  async waitForUsersLinkNotDisplayed() {
    const host = await this.getXpMenuShadowHost();
    const span = await host.shadow$(selectors.usersLink);
    await span.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM, reverse: true });
  }

  async waitForDashboardLinkDisplayed() {
    const host = await this.getXpMenuShadowHost();
    const span = await host.shadow$(selectors.dashboardLink);
    await span.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
  }

  isLoaded() {
    return this.isElementDisplayed(selectors.container);
  }

  async clickOnSettingsLink() {
    try {
      const host = await this.getXpMenuShadowHost();
      const span = await host.shadow$(selectors.settingsLink);
      await span.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
      await span.click();
    } catch (err) {
      await this.handleError('Settings link was not found', 'err_settings_link', err);
    }
  }
  async waitForSettingsLinkDisplayed() {
    const host = await this.getXpMenuShadowHost();
    const span = await host.shadow$(selectors.settingsLink);
    await span.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
  }

  async clickOnApplicationsLink() {
    try {
      const host = await this.getXpMenuShadowHost();
      const span = await host.shadow$(selectors.applicationsLink);
      await span.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
      await span.click();
    } catch (err) {
      await this.handleError('Applications link was not found', 'err_applications_link', err);
    }
  }

  async clickOnDashboardLink() {
    try {
      const host = await this.getXpMenuShadowHost();
      const span = await host.shadow$(selectors.dashboardLink);
      await span.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
      await span.click();
    } catch (err) {
      await this.handleError('Dashboard link was not found', 'err_dashboard_link', err);
    }
  }

  async clickOnUsersLink() {
    try {
      const host = await this.getXpMenuShadowHost();
      const span = await host.shadow$(selectors.usersLink);
      await span.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
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
    } catch {
      return false;
    }
  }

  async clickOnAvatarButton() {
    try {
      let host = await this.getXpMenuShadowHost();
      const avatarButton = await host.shadow$(selectors.avatarButton);
      await avatarButton.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
      await avatarButton.click();
    } catch (err) {
      await this.handleError('Avatar button was not found', 'err_avatar_button', err);
    }
  }

  async clickOnLogoutDropdownMenuItem() {
    try {
      let host = await this.getXpMenuShadowHost();
      const logoutLink = await host.shadow$(selectors.logoutMenuItem);
      await logoutLink.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
      await logoutLink.click();
    } catch (err) {
      await this.handleError('Logout menu item was not found', 'err_logout_menu_item', err);
    }
  }
}
module.exports = HomePage;
