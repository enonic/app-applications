const Page = require('./page');
const appConst = require('../libs/app_const');

// What the shell renders around the sections, all light DOM: the app bar with the active section's
// title, and, when no section is on offer, the SectionsEmpty screen in place of the section mounts.
const XPATH = {
  appBarTitle: "//header[@data-component='AppBar']//h2",
  sectionsEmpty: "//main//div[@data-component='SectionsEmpty']",
  sectionsEmptyLines: "//main//div[@data-component='SectionsEmpty']//p",
};

class AppShell extends Page {
  // The title in the app bar: the active section's.
  async getAppBarTitle() {
    const title = await this.findElement(XPATH.appBarTitle);
    return (await title.getText()).trim();
  }

  async waitForAppBarTitle(expected, ms = appConst.TIMEOUT.MEDIUM) {
    await this.getBrowser().waitUntil(async () => (await this.getAppBarTitle()) === expected, {
      timeout: ms,
      timeoutMsg: `The app bar should be titled '${expected}'`,
    });
  }

  async waitForSectionsEmptyDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(XPATH.sectionsEmpty, ms);
    } catch (err) {
      await this.handleError(
        'The shell should show that no section is on offer',
        'err_sections_empty',
        err,
      );
    }
  }

  isSectionsEmptyDisplayed() {
    return this.isElementDisplayed(XPATH.sectionsEmpty);
  }

  // The lines of the SectionsEmpty screen, in order: the message, then the hint when it is shown.
  getSectionsEmptyLines() {
    return this.getTextInElements(XPATH.sectionsEmptyLines);
  }
}

module.exports = AppShell;
