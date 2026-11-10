/**
 * Created on 24.09.2026
 */
const Page = require('./page');
const appConst = require('../libs/app_const');

// Vertical rail on the left side of the Settings app: one link per section.
// Links are `<a href="#/<section>" aria-label="<Section>" data-section="<app>:<section>">`,
// the current one carries `data-status="active"` and `aria-current="page"`.
const SECTION = Object.freeze({
  APPLICATIONS: 'Applications',
  SERVICE_ACCOUNTS: 'Service Accounts',
  USERS: 'Users',
  GROUPS: 'Groups',
  ROLES: 'Roles',
  ID_PROVIDERS: 'ID Providers',
});

const XPATH = {
  container: "//nav[@data-component='SectionRail']",
  title: "//nav[@data-component='SectionRail']//h1",
  sectionButtons: "//nav[@data-component='SectionRail']//ul//a[@data-section]",
  activeSectionButton: "//nav[@data-component='SectionRail']//ul//a[@data-status='active']",
  sectionButtonByLabel: (label) =>
    `//nav[@data-component='SectionRail']//ul//a[@aria-label='${label}']`,
};

class MenuSectionsRail extends Page {
  static get SECTION() {
    return SECTION;
  }

  get applicationsButton() {
    return XPATH.sectionButtonByLabel(SECTION.APPLICATIONS);
  }

  get serviceAccountsButton() {
    return XPATH.sectionButtonByLabel(SECTION.SERVICE_ACCOUNTS);
  }

  get usersButton() {
    return XPATH.sectionButtonByLabel(SECTION.USERS);
  }

  get groupsButton() {
    return XPATH.sectionButtonByLabel(SECTION.GROUPS);
  }

  get rolesButton() {
    return XPATH.sectionButtonByLabel(SECTION.ROLES);
  }

  get idProvidersButton() {
    return XPATH.sectionButtonByLabel(SECTION.ID_PROVIDERS);
  }

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(XPATH.container, ms);
    } catch (err) {
      await this.handleError('Sections rail was not loaded', 'err_sections_rail', err);
    }
  }

  // Clicks on the section link and waits until that section becomes active.
  async clickOnSectionButton(label) {
    try {
      const selector = XPATH.sectionButtonByLabel(label);
      await this.waitForElementDisplayed(selector);
      await this.clickOnElement(selector);
      await this.waitForSectionActive(label);
    } catch (err) {
      await this.handleError(
        `Sections rail - failed to open the '${label}' section`,
        'err_rail_click_section',
        err,
      );
    }
  }

  clickOnApplicationsButton() {
    return this.clickOnSectionButton(SECTION.APPLICATIONS);
  }

  clickOnServiceAccountsButton() {
    return this.clickOnSectionButton(SECTION.SERVICE_ACCOUNTS);
  }

  clickOnUsersButton() {
    return this.clickOnSectionButton(SECTION.USERS);
  }

  clickOnGroupsButton() {
    return this.clickOnSectionButton(SECTION.GROUPS);
  }

  clickOnRolesButton() {
    return this.clickOnSectionButton(SECTION.ROLES);
  }

  clickOnIdProvidersButton() {
    return this.clickOnSectionButton(SECTION.ID_PROVIDERS);
  }

  // Waits until the link with the given label gets `data-status="active"`.
  async waitForSectionActive(label, ms = appConst.TIMEOUT.MEDIUM) {
    const selector = XPATH.sectionButtonByLabel(label);
    await this.getBrowser().waitUntil(
      async () => {
        const status = await this.getAttribute(selector, 'data-status');
        return status === 'active';
      },
      { timeout: ms, timeoutMsg: `Section '${label}' did not become active in ${ms} ms` },
    );
  }

  // Returns the aria-label of the currently active section, e.g. 'Users'.
  async getActiveSectionName() {
    await this.waitForElementDisplayed(XPATH.activeSectionButton);
    return await this.getAttribute(XPATH.activeSectionButton, 'aria-label');
  }

  async isSectionActive(label) {
    const status = await this.getAttribute(XPATH.sectionButtonByLabel(label), 'data-status');
    return status === 'active';
  }

  // Returns aria-labels of all section links in the rail, in display order.
  async getSectionNames() {
    const elements = await this.findElements(XPATH.sectionButtons);
    const names = [];
    for (const el of elements) {
      names.push(await el.getAttribute('aria-label'));
    }
    return names;
  }

  // Returns the `href` of the section link, e.g. '#/users'.
  getSectionHref(label) {
    return this.getAttribute(XPATH.sectionButtonByLabel(label), 'href');
  }

  isSectionButtonDisplayed(label) {
    return this.isElementDisplayed(XPATH.sectionButtonByLabel(label));
  }

  async waitForSectionButtonDisplayed(label, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(XPATH.sectionButtonByLabel(label), ms);
    } catch (err) {
      await this.handleError(
        `Sections rail - '${label}' button is not displayed`,
        'err_rail_section_button',
        err,
      );
    }
  }

  async waitForSectionButtonNotDisplayed(label, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(XPATH.sectionButtonByLabel(label), ms);
    } catch (err) {
      await this.handleError(
        `Sections rail - '${label}' button should not be displayed`,
        'err_rail_section_button_hidden',
        err,
      );
    }
  }

  // Text of the vertical heading in the rail ("Settings").
  getRailTitle() {
    return this.getText(XPATH.title);
  }
}

module.exports = MenuSectionsRail;
module.exports.SECTION = SECTION;
