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

  // Waits until the section link's `href` is `expected`: the shell rewrites it when the section
  // is left, after the url has already changed, so a read right after the click can be early.
  async waitForSectionHref(label, expected, ms = appConst.TIMEOUT.MEDIUM) {
    await this.getBrowser().waitUntil(async () => (await this.getSectionHref(label)) === expected, {
      timeout: ms,
      timeoutMsg: `Section '${label}' - the href should be '${expected}'`,
    });
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
}

module.exports = MenuSectionsRail;
