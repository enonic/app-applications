/**
 * Created on 09.11.2026
 *
 * The Applications section (pages/applications/ApplicationsPage): a browse screen with a toolbar
 * (Install, Uninstall, Start, Stop), the filter input, the list header (Select all, Sort by, the
 * 'Show system applications' toggle, Refresh) and the list of applications, one row per application
 * with its icon (a corner badge for a system or a local one), its display name, its description
 * under it and, on the right, the installed version and the state ('Started' / 'Stopped'). The
 * browse screen itself is BrowsePage (browse.page.js); this class names the toolbar buttons, the
 * toggle and what a row shows.
 *
 * A row's id ends with '-item-<application key>', e.g. '-item-com.enonic.uitest.simple_page'.
 */
const BrowsePage = require('./browse.page');
const appConst = require('../libs/app_const');

const IN_ROW = {
  // The corner badge on the icon: role 'img', named by appConst.APP_BADGE.*
  badge: "[data-component='ItemLabel'] span[role='img']",
  // The bell beside the version while the market offers a newer one
  updateIcon: "[data-component='TreeList.RowRight'] span[role='img']",
};

class ApplicationsPage extends BrowsePage {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.APPLICATIONS,
      pageComponent: 'ApplicationsPage',
      pageName: 'Applications page',
    });
    this.css.systemToggle = `${this.css.container} button[data-component='SystemApplicationsToggle']`;
  }

  get installButton() {
    return this.css.toolbarButton(appConst.TOOLBAR.INSTALL);
  }

  get uninstallButton() {
    return this.css.toolbarButton(appConst.TOOLBAR.UNINSTALL);
  }

  get startButton() {
    return this.css.toolbarButton(appConst.TOOLBAR.START);
  }

  get stopButton() {
    return this.css.toolbarButton(appConst.TOOLBAR.STOP);
  }

  get systemToggle() {
    return this.css.systemToggle;
  }

  // Install

  clickOnInstallButton() {
    return this.clickOnToolbarButton(appConst.TOOLBAR.INSTALL);
  }

  waitForInstallButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonEnabled(appConst.TOOLBAR.INSTALL, ms);
  }

  waitForInstallButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonDisabled(appConst.TOOLBAR.INSTALL, ms);
  }

  isInstallButtonEnabled() {
    return this.isToolbarButtonEnabled(appConst.TOOLBAR.INSTALL);
  }

  // Uninstall

  clickOnUninstallButton() {
    return this.clickOnToolbarButton(appConst.TOOLBAR.UNINSTALL);
  }

  waitForUninstallButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonEnabled(appConst.TOOLBAR.UNINSTALL, ms);
  }

  waitForUninstallButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonDisabled(appConst.TOOLBAR.UNINSTALL, ms);
  }

  isUninstallButtonEnabled() {
    return this.isToolbarButtonEnabled(appConst.TOOLBAR.UNINSTALL);
  }

  // Start

  clickOnStartButton() {
    return this.clickOnToolbarButton(appConst.TOOLBAR.START);
  }

  waitForStartButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonEnabled(appConst.TOOLBAR.START, ms);
  }

  waitForStartButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonDisabled(appConst.TOOLBAR.START, ms);
  }

  isStartButtonEnabled() {
    return this.isToolbarButtonEnabled(appConst.TOOLBAR.START);
  }

  // Stop

  clickOnStopButton() {
    return this.clickOnToolbarButton(appConst.TOOLBAR.STOP);
  }

  waitForStopButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonEnabled(appConst.TOOLBAR.STOP, ms);
  }

  waitForStopButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForToolbarButtonDisabled(appConst.TOOLBAR.STOP, ms);
  }

  isStopButtonEnabled() {
    return this.isToolbarButtonEnabled(appConst.TOOLBAR.STOP);
  }

  // 'Show system applications' - a toggle in the list header; the applications XP ships are listed
  // while it is pressed.

  async clickOnSystemApplicationsToggle() {
    try {
      await this.waitForElementDisplayed(this.systemToggle);
      const before = await this.getAttribute(this.systemToggle, 'aria-pressed');
      await this.clickOnElement(this.systemToggle);
      return await this.waitForAttributeChanged(this.systemToggle, 'aria-pressed', before);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the 'Show system applications' toggle`,
        'err_system_toggle',
        err,
      );
    }
  }

  async isSystemApplicationsShown() {
    const pressed = await this.getAttribute(this.systemToggle, 'aria-pressed');
    return pressed === 'true';
  }

  async waitForSystemApplicationsShown(shown, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(this.systemToggle, 'aria-pressed', String(shown), ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the 'Show system applications' toggle should be ${shown ? 'on' : 'off'}`,
        'err_system_toggle',
        err,
      );
    }
  }

  isSystemApplicationsToggleDisplayed() {
    return this.isElementDisplayed(this.systemToggle);
  }

  // List

  waitForApplicationsListLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForListLoaded(ms);
  }

  // Display names of the applications listed, in display order.
  getApplicationDisplayNames() {
    return this.getRowDisplayNames();
  }

  waitForApplicationDisplayNames(expected, ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForRowDisplayNames(expected, ms);
  }

  // Descriptions (the line under the display name) of the applications listed, in display order.
  getApplicationDescriptions() {
    return this.getRowNames();
  }

  // Rows by key (the application key)

  // The installed version shown on the right of the row, e.g. '2.0.0.SNAPSHOT' - or undefined.
  async getApplicationVersion(key) {
    const [version] = await this.getRowMetaCells(key);
    return version;
  }

  // 'Started' / 'Stopped' (appConst.APP_STATE.*) - the last cell of the row; a system application
  // shows none: its cell is there, empty.
  async getApplicationState(key) {
    const cells = await this.getRowMetaCells(key);
    return cells.length < 2 || cells[1] === '' ? undefined : cells[1];
  }

  async waitForApplicationState(key, expected, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getApplicationState(key)) === expected,
        { timeout: ms, timeoutMsg: `the row '${key}' should read '${expected}'` },
      );
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should read '${expected}'`,
        'err_app_state',
        err,
      );
    }
  }

  // The aria-label of the corner badge on the row's icon (appConst.APP_BADGE.*) - or undefined.
  async getApplicationBadge(key) {
    await this.waitForRowDisplayed(key);
    const row = await this.findElement(this.css.rowByKey(key));
    const badges = await row.$$(IN_ROW.badge);
    return badges.length === 0 ? undefined : await badges[0].getAttribute('aria-label');
  }

  // The keys of the listed rows that carry the 'System application' badge, in display order - the
  // applications XP ships, listed while the 'Show system applications' toggle is on.
  async getSystemApplicationKeys() {
    const rows = await this.getDisplayedElements(this.css.rows);
    const keys = [];
    for (const row of rows) {
      const badges = await row.$$(IN_ROW.badge);
      if (
          badges.length > 0 &&
          (await badges[0].getAttribute('aria-label')) === appConst.APP_BADGE.SYSTEM
      ) {
        keys.push((await row.getAttribute('id')).replace(/^.*-item-/, ''));
      }
    }
    return keys;
  }

  // The bell beside the version: the market offers a newer one.
  async isUpdateAvailable(key) {
    await this.waitForRowDisplayed(key);
    const row = await this.findElement(this.css.rowByKey(key));
    const icons = await row.$$(IN_ROW.updateIcon);
    return icons.length > 0 && (await icons[0].isDisplayed());
  }

  // Rows by display name

  async getApplicationVersionByDisplayName(displayName) {
    const [version] = await this.getRowMetaCellsByDisplayName(displayName);
    return version;
  }

  async getApplicationStateByDisplayName(displayName) {
    const cells = await this.getRowMetaCellsByDisplayName(displayName);
    return cells.length < 2 ? undefined : cells[1];
  }

  async getApplicationBadgeByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    const badges = await row.$$(IN_ROW.badge);
    return badges.length === 0 ? undefined : await badges[0].getAttribute('aria-label');
  }

  getApplicationDescriptionByDisplayName(displayName) {
    return this.getRowNameByDisplayName(displayName);
  }

  // The application key the row is keyed by, read off its id ('...-item-<key>').
  async getApplicationKeyByDisplayName(displayName) {
    const id = await this.getRowIdByDisplayName(displayName);
    return id.replace(/^.*-item-/, '');
  }
}

module.exports = ApplicationsPage;
