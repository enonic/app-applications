/**
 * Created on 09.11.2026
 *
 * The flows the specs share: log in, open the Settings app, open a section. The Applications section
 * is the one this app adds; the other sections are app-users', listed so a spec can leave and
 * return to this one.
 */
const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const appConst = require('./app_const');
const webDriverHelper = require('./WebDriverHelper');
const MenuSectionsRail = require('../page_objects/menu.sections.rail');
const fs = require('fs');
const path = require('path');

// 'base.url' from browser.properties, the address the runner opens the browser at.
const propertiesReaderModule = require('properties-reader');
const propertiesReader =
  propertiesReaderModule.propertiesReader ||
  propertiesReaderModule.default ||
  propertiesReaderModule;
const properties = propertiesReader({ sourceFile: path.join(__dirname, '../browser.properties') });
const BASE_URL = String(properties.get('base.url')).replace(/[/]+$/, '') + '/';

module.exports = {
  getBrowser() {
    if (typeof browser !== 'undefined') {
      return browser;
    } else {
      return webDriverHelper.browser;
    }
  },
  async waitForElementDisplayed(selector, ms) {
    let element = await this.getBrowser().$(selector);
    return await element.waitForDisplayed(ms);
  },
  async clickOnElement(selector) {
    let el = await this.getBrowser().$(selector);
    await el.waitForDisplayed({ timeout: 2000 });
    return await el.click();
  },
  async getText(selector) {
    let el = await this.getBrowser().$(selector);
    await el.waitForDisplayed({ timeout: 2000 });
    return await el.getText();
  },

  async isElementDisplayed(selector) {
    let el = await this.getBrowser().$(selector);
    return await el.isDisplayed();
  },

  getTitle() {
    return this.getBrowser().getTitle();
  },
  async saveScreenshotUniqueName(namePart) {
    let screenshotName = appConst.generateRandomName(namePart);
    await this.saveScreenshot(screenshotName);
    return screenshotName;
  },

  async doLogout() {
    let loginPage = new LoginPage();
    let homePage = new HomePage();
    await homePage.clickOnAvatarButton();
    await homePage.clickOnLogoutDropdownMenuItem();
    return await loginPage.waitForPageLoaded();
  },
  // Logs in, opens the Settings app and, when a section is given, switches to it via the rail.
  // `section` is one of appConst.EXTENSIONS.* ('Applications', 'Users', ...).
  async navigateToSettingsApp(userName, password, section) {
    try {
      await this.doLogin(userName, password);
      let homePage = new HomePage();
      await homePage.clickOnSettingsLink();
      let menuSectionsRail = new MenuSectionsRail();
      await menuSectionsRail.waitForLoaded();
      if (section) {
        await this.navigateToExtension(section);
      }
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_navigate_settings');
      throw new Error(
        `Error occurred after clicking on Settings link ,  screenshot:${screenshot}  ` + err,
      );
    }
  },
  async doLogin(userName, password) {
    let loginPage = new LoginPage();
    let result = await loginPage.isLoaded();
    if (result) {
      await loginPage.doLogin(userName, password);
    }
    let homePage = new HomePage();
    await homePage.waitForSettingsLinkDisplayed();
  },
  async switchToTab(title) {
    let handles = await this.getBrowser().getWindowHandles();
    for (const handle of handles) {
      await this.getBrowser().switchToWindow(handle);
      let currentTitle = await this.getBrowser().getTitle();
      if (currentTitle === title) {
        return handle;
      }
    }
    throw new Error('Browser tab with title ' + title + ' was not found');
  },
  doPressTabKey() {
    return this.getBrowser().keys('Tab');
  },

  async doCloseAllWindowTabsAndNavigateToHome() {
    await this.doCloseAllWindowTabs();
    await this.navigateToHomePage();
  },
  // 'base.url' from browser.properties, with a trailing slash, e.g. 'http://localhost:8080/admin/'.
  getBaseUrl() {
    return BASE_URL;
  },
  async navigateToHomePage() {
    await this.getBrowser().url(this.getBaseUrl());
    await this.getBrowser().pause(500);
  },
  async doCloseAllWindowTabs(keepTitle1 = 'Enonic XP Admin', keepTitle2 = 'Settings') {
    const handles = await this.getBrowser().getWindowHandles();
    const keepTitles = [keepTitle1, keepTitle2].filter(Boolean);

    for (const handle of handles) {
      await this.getBrowser().switchToWindow(handle);
      const title = await this.getBrowser().getTitle();

      const shouldKeep = keepTitles.some((keepTitle) => title.includes(keepTitle));
      if (!shouldKeep) {
        // Closing the last remaining window would terminate the WebDriver session,
        // so keep it open - the caller navigates it to the home page afterwards:
        const remaining = await this.getBrowser().getWindowHandles();
        if (remaining.length === 1) {
          break;
        }
        await this.getBrowser().closeWindow();
        await this.getBrowser().pause(100);
      }
    }
    // After closeWindow() the driver still points to the closed window - switch to a live one:
    const remainingHandles = await this.getBrowser().getWindowHandles();
    await this.getBrowser().switchToWindow(remainingHandles[remainingHandles.length - 1]);
  },
  async saveScreenshot(name) {
    try {
      let screenshotsDir = path.join(__dirname, '/../build/reports/screenshots/');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      await this.getBrowser().saveScreenshot(screenshotsDir + name + '.png');
      console.log('screenshot is saved ' + name);
    } catch (err) {
      return console.log('screenshot was not saved ' + err);
    }
  },
  generateRandomName(part) {
    return part + Math.round(Math.random() * 1000000);
  },
  async getDisplayedElements(selector) {
    let elements = await this.getBrowser().$$(selector);
    if (elements.length === 0) {
      return [];
    }
    let pr = elements.map((el) => el.isDisplayed());
    return await Promise.all(pr).then((result) => {
      return elements.filter((el, i) => result[i]);
    });
  },
  // Opens a section (extension) of the Settings app through the sections rail and waits until its
  // browse screen is shown: the rail link is active, the app bar shows the section title and the
  // 'Actions' toolbar is displayed. `section` is one of appConst.EXTENSIONS.*
  async navigateToExtension(section) {
    try {
      let menuSectionsRail = new MenuSectionsRail();
      await menuSectionsRail.waitForLoaded();
      await menuSectionsRail.clickOnSectionButton(section);
      await this.waitForSectionScreenLoaded(section);
      return menuSectionsRail;
    } catch (err) {
      let screenshot = await this.saveScreenshotUniqueName('err_navigate_extension');
      throw new Error(`'${section}' section was not opened, screenshot: ${screenshot} ` + err);
    }
  },
  // Opens the Applications section: the one this app adds, so the one most specs start in.
  //
  // Precondition: the Settings app is open (navigateToSettingsApp).
  navigateToApplicationsSection() {
    return this.navigateToExtension(appConst.EXTENSIONS.APPLICATIONS);
  },
  // The section's screen renders inside a shadow root, where Chrome cannot evaluate XPath
  // ("#document-fragment is not a valid context node type"), so it is located with CSS through
  // webdriverio's deep selector from the section's shadow host - the same way SectionPage scopes
  // every lookup (see page_objects/section.page.js).
  async waitForSectionScreenLoaded(section, ms = appConst.TIMEOUT.MEDIUM) {
    const appBarTitle = `//header//h2[text()='${section}']`;
    await this.waitForElementDisplayed(appBarTitle, ms);

    // Light DOM: the shadow host of the section's mount, the SectionMount element itself. Inactive
    // sections stay mounted too, hence the scoping by section id and by the status only the visible
    // one carries.
    const shadowHost = `div[data-component='SectionMount'][data-section='${this.getSectionId(section)}'][data-status='active']`;
    // One selector: a deep selector must not be a comma-separated list, webdriverio splits it on
    // the commas when it re-matches the element.
    const toolbar = ">>> [data-component='BrowseToolbar'][aria-label='Actions']";
    await this.getBrowser().waitUntil(
      async () => {
        const host = await this.getBrowser().$(shadowHost);
        if (!(await host.isExisting())) {
          return false;
        }
        return await host.$(toolbar).isDisplayed();
      },
      {
        timeout: ms,
        timeoutMsg: `'${section}' section - the 'Actions' toolbar is still not displayed in: ${ms}`,
      },
    );
  },
  // The 'data-section' of a section's mount (appConst.SECTION_ID.*) from its title
  // (appConst.EXTENSIONS.*, what MenuSectionsRail.SECTION.* and the app bar show).
  getSectionId(section) {
    const key = Object.keys(appConst.EXTENSIONS).find(
      (name) => appConst.EXTENSIONS[name] === section,
    );
    if (key === undefined) {
      throw new Error(`Unknown section '${section}': not one of appConst.EXTENSIONS`);
    }
    return appConst.SECTION_ID[key];
  },
};
