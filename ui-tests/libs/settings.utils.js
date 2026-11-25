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
const ApplicationsPage = require('../page_objects/applications.page');
const userItemsBuilder = require('./users.items.builder');
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
const LOGIN_FORM = "input[id^='username-input']";
const XP_MENU = 'xp-menu';

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
    await el.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
    return await el.click();
  },
  async getText(selector) {
    let el = await this.getBrowser().$(selector);
    await el.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
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
    await this.navigateToHomePage();
    if (await loginPage.isLoaded()) {
      return;
    }
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
  // Waits for a tab to open on top of `handlesBefore` (getWindowHandles() taken before the click)
  // and switches to it; returns its handle.
  async switchToNewTab(handlesBefore, ms = appConst.TIMEOUT.LONG) {
    let handle;
    await this.getBrowser().waitUntil(
      async () => {
        const handles = await this.getBrowser().getWindowHandles();
        handle = handles.find((candidate) => !handlesBefore.includes(candidate));
        return handle !== undefined;
      },
      { timeout: ms, timeoutMsg: 'No new browser tab was opened' },
    );
    await this.getBrowser().switchToWindow(handle);
    return handle;
  },
  // Waits until the current tab's document has finished loading.
  async waitForPageLoaded(ms = appConst.TIMEOUT.LONG) {
    await this.getBrowser().waitUntil(
      async () => (await this.getBrowser().execute(() => document.readyState)) === 'complete',
      { timeout: ms, timeoutMsg: 'The page is still loading' },
    );
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
  // doLogin reads whether the login form is shown, so the page has to settle on one of the two.
  async navigateToHomePage() {
    await this.getBrowser().url(this.getBaseUrl());
    await this.getBrowser().waitUntil(
      async () =>
        (await this.isElementDisplayed(LOGIN_FORM)) ||
        (await this.getBrowser().$(XP_MENU).isExisting()),
      {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'Neither the login form nor the home page was shown',
      },
    );
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
  // The direct link to a section, e.g. 'http://localhost:8080/admin/com.enonic.xp.app.settings/main#/applications'.
  getSectionUrl(section) {
    const path = appConst.SECTION_PATH[this.getSectionName(section)];
    return `${this.getBaseUrl()}${appConst.SETTINGS_TOOL_PATH}#/${path}`;
  },
  async openSectionByUrl(section) {
    await this.getBrowser().url('about:blank');
    await this.getBrowser().url(this.getSectionUrl(section));
    let menuSectionsRail = new MenuSectionsRail();
    await menuSectionsRail.waitForLoaded();
    return menuSectionsRail;
  },
  // The Settings tool's own url, no section named: 'http://localhost:8080/admin/com.enonic.xp.app.settings/main'.
  getSettingsUrl() {
    return `${this.getBaseUrl()}${appConst.SETTINGS_TOOL_PATH}`;
  },
  // Loads the Settings app anew at `hash` ('#/applications/<key>?foo=bar') and waits for the rail.
  async openSettingsByHash(hash) {
    await this.getBrowser().url('about:blank');
    await this.getBrowser().url(this.getSettingsUrl() + hash);
    let menuSectionsRail = new MenuSectionsRail();
    await menuSectionsRail.waitForLoaded();
    return menuSectionsRail;
  },
  async waitForUrl(expected, ms = appConst.TIMEOUT.MEDIUM) {
    await this.getBrowser().waitUntil(async () => (await this.getBrowser().getUrl()) === expected, {
      timeout: ms,
      timeoutMsg: `The url should be '${expected}'`,
    });
  },
  // Opens the Applications section: the one this app adds, so the one most specs start in.
  //
  // Precondition: the Settings app is open (navigateToSettingsApp).
  navigateToApplicationsSection() {
    return this.navigateToExtension(appConst.EXTENSIONS.APPLICATIONS);
  },
  // Returns an application the specs stop to 'Started' when a failed test left it stopped, so the
  // next test finds the state it expects. Starts from the home page: a failed test may have left a
  // filter, a menu or a dialog behind, and a fresh mount of the section is what the row is read from.
  async ensureApplicationStarted(key) {
    await this.doCloseAllWindowTabsAndNavigateToHome();
    await this.navigateToSettingsApp();
    await this.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.waitForRowDisplayed(key);
    if ((await applicationsPage.getApplicationState(key)) === appConst.APP_STATE.STARTED) {
      return;
    }
    await applicationsPage.clickOnRowByKey(key);
    await applicationsPage.clickOnStartButton();
    await applicationsPage.waitForApplicationState(
      key,
      appConst.APP_STATE.STARTED,
      appConst.TIMEOUT.LONG,
    );
  },
  // Returns every application the specs may have stopped to 'Started', through 'Select all' and
  // Start: a spec that stops the whole selection cannot name the rows, and a failed test may have
  // left any of them stopped. Starts from the home page, like ensureApplicationStarted.
  async ensureApplicationsStarted() {
    await this.doCloseAllWindowTabsAndNavigateToHome();
    await this.navigateToSettingsApp();
    await this.navigateToApplicationsSection();
    let applicationsPage = new ApplicationsPage();
    await applicationsPage.waitForApplicationsListLoaded();
    await applicationsPage.clickOnSelectAllCheckbox();
    // Start is enabled only while a selected application is stopped.
    if (await applicationsPage.isStartButtonEnabled()) {
      await applicationsPage.clickOnStartButton();
      await applicationsPage.waitForStartButtonDisabled(appConst.TIMEOUT.LONG);
    }
    await applicationsPage.clickOnSelectAllCheckbox();
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
  // (appConst.EXTENSIONS.*, what the rail's links and the app bar show).
  getSectionId(section) {
    return appConst.SECTION_ID[this.getSectionName(section)];
  },
  // What the browser has logged since the last call, as [{ level, message, source }]: the console,
  // failed requests and the security messages, a Content-Security-Policy violation among them.
  // Reading empties the log.
  getBrowserLogs() {
    return this.getBrowser().getLogs('browser');
  },
  // The name a section goes by in appConst ('ID_PROVIDERS') from its title ('ID Providers').
  getSectionName(section) {
    const key = Object.keys(appConst.EXTENSIONS).find(
      (name) => appConst.EXTENSIONS[name] === section,
    );
    if (key === undefined) {
      throw new Error(`Unknown section '${section}': not one of appConst.EXTENSIONS`);
    }
    return key;
  },

  // GraphQL API - the endpoint of app-users' sections, called from the page the browser is on with
  // its session cookie: the accounts a spec logs in as are made there. The browser must be logged
  // in (doLogin) and stay on the XP admin origin.

  // Posts a GraphQL request from the current page and returns { status, text } without interpreting it.
  // An async function under execute(): webdriverio awaits its promise (executeAsync is gone in v10).
  async postGraphQl(url, query, variables) {
    return await this.getBrowser().execute(
      async function (url, query, variables) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ query: query, variables: variables }),
          });
          return { status: response.status, text: await response.text() };
        } catch (err) {
          return { status: 0, text: String(err) };
        }
      },
      url,
      query,
      variables,
    );
  },

  // Sends a GraphQL request to the API and returns its 'data'. Throws on HTTP or GraphQL errors.
  async sendGraphQlRequest(query, variables, url = appConst.GRAPHQL_API.USERS) {
    const result = await this.postGraphQl(url, query, variables);
    let body;
    try {
      body = JSON.parse(result.text);
    } catch {
      throw new Error(`GraphQL: unexpected response (${result.status}): ${result.text}`);
    }
    if (result.status !== 200 || body.errors || body.error) {
      throw new Error(`GraphQL request failed (${result.status}): ${result.text}`);
    }
    return body.data;
  },

  // The keys of roles from their display names ('Users App') - a principal key ('role:...') is
  // taken as is. Read once for the whole list.
  async resolveRoleKeys(roles) {
    const names = roles.filter((role) => !role.startsWith('role:'));
    if (names.length === 0) {
      return [...roles];
    }
    const data = await this.sendGraphQlRequest('{ roles { key displayName } }', {});
    return roles.map((role) => {
      if (role.startsWith('role:')) {
        return role;
      }
      const found = data.roles.find((item) => item.displayName === role);
      if (found === undefined) {
        throw new Error(
          `Unknown role '${role}': use a display name from appConst.SYSTEM_ROLES or a key 'role:...'. ` +
            'Existing: ' +
            data.roles.map((item) => `${item.displayName} (${item.key})`).join(', '),
        );
      }
      return found.key;
    });
  },

  // Creates a service account - a user of the system ID provider - through the GraphQL API.
  // `serviceAccount` is what users.items.builder.buildServiceAccount() returns: { displayName, id,
  // email?, password?, roles?, groups? }. `roles` are display names or 'role:' keys; `groups` are
  // group keys ('group:system:editors'). An empty or missing `password` leaves the account without
  // one. Returns the service account with its 'key'.
  createServiceAccountViaApi(serviceAccount) {
    return this.createUserViaApi(
      Object.assign({}, serviceAccount, { idProvider: userItemsBuilder.SYSTEM_ID_PROVIDER }),
    );
  },

  // Creates a user through the GraphQL API. `user` is what users.items.builder.buildUser() returns:
  // { idProvider, displayName, id, email?, password?, roles?, groups? }. `idProvider` is the key of
  // the provider the user lives in ('system' makes it a service account); `roles` are display names
  // or 'role:' keys; `groups` are group keys. Returns the user with its 'key'.
  async createUserViaApi(user) {
    if (!user.idProvider) {
      throw new Error(`createUserViaApi: '${user.displayName}' names no ID provider`);
    }
    const query = `mutation ($idProvider: String!, $name: String!, $displayName: String!, $email: String, $password: String, $roles: [String!], $groups: [String!]) {
      createUser(idProvider: $idProvider, name: $name, displayName: $displayName, email: $email, password: $password, roles: $roles, groups: $groups) {
        key displayName
      }
    }`;
    const data = await this.sendGraphQlRequest(query, {
      idProvider: user.idProvider,
      name: user.id ?? user.name ?? user.displayName,
      displayName: user.displayName,
      email: user.email,
      password: user.password || undefined,
      roles: await this.resolveRoleKeys(user.roles ?? []),
      groups: user.groups ?? [],
    });
    console.log('User created via API: ' + data.createUser.key);
    return Object.assign({}, user, { key: data.createUser.key });
  },

  // Deletes principals (users, groups, roles) through the GraphQL API. `keys` is a principal key, a
  // list of them, or what a create*ViaApi() returned (its 'key' is taken). Throws when any was not
  // deleted.
  async deletePrincipalsViaApi(keys) {
    const list = [].concat(keys).map((item) => (typeof item === 'string' ? item : item.key));
    const query = `mutation ($keys: [String!]!) {
      deletePrincipals(keys: $keys) { key deleted reason }
    }`;
    const data = await this.sendGraphQlRequest(query, { keys: list });
    const failed = data.deletePrincipals.filter((item) => !item.deleted);
    if (failed.length > 0) {
      throw new Error('Principals were not deleted: ' + JSON.stringify(failed));
    }
    console.log('Principals deleted via API: ' + list.join(', '));
    return data.deletePrincipals;
  },
};
