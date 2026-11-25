/**
 * Created on 24.09.2026
 */
const Page = require('./page');
const appConst = require('../libs/app_const');

// Vertical rail on the left side of the Settings app: one link per section, labelled by the
// section's title (appConst.EXTENSIONS.*).
// Links are `<a href="#/<section>" aria-label="<Section>" data-section="<app>:<section>">`,
// the current one carries `data-status="active"` and `aria-current="page"`.
const XPATH = {
  container: "//nav[@data-component='SectionRail']",
  sectionButtons: "//nav[@data-component='SectionRail']//ul//a[@data-section]",
  sectionButtonByLabel: (label) =>
    `//nav[@data-component='SectionRail']//ul//a[@aria-label='${label}']`,
};

class MenuSectionsRail extends Page {
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
}

module.exports = MenuSectionsRail;
