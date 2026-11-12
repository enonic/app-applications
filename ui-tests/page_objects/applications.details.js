/**
 * Created on 09.11.2026
 *
 * The details panel of an application (pages/applications/application-details/ApplicationDetails):
 * the header with the icon (a corner badge for a system or a local application), the display name,
 * a link out to the Enonic Market beside it when the market carries the application, and the state
 * ('Started' / 'Stopped') as a dropdown offering the opposite state - a plain label for an
 * application the section must not stop. Then the sections
 *
 *   Details                   - Info, Version installed, Update available (with Update), Key,
 *                               Vendor (with a link to the vendor site), System required
 *   Schemas                   - Content types, Pages, Parts, Layouts, Mixins, Form fragments, Macros
 *   Tasks                     - Key / Description per task
 *   Admin                     - Tools, Extensions
 *   APIs                      - one line per api, 'Title (name)'
 *   Web app                   - Internal path
 *   ID provider applications  - Mode, Used by
 *
 * A section is shown only when the application has something to put in it. Everything generic is in
 * DetailsPanel (details.panel.js); this class names the sections, the fields and the header's parts.
 */
const DetailsPanel = require('./details.panel');
const appConst = require('../libs/app_const');

const SECTION = Object.freeze({
  DETAILS: 'Details',
  SCHEMAS: 'Schemas',
  TASKS: 'Tasks',
  ADMIN: 'Admin',
  APIS: 'APIs',
  WEB_APP: 'Web app',
  ID_PROVIDER_APPLICATIONS: 'ID provider applications',
});

const FIELD = Object.freeze({
  INFO: 'Info',
  VERSION_INSTALLED: 'Version installed',
  UPDATE_AVAILABLE: 'Update available',
  KEY: 'Key',
  VENDOR: 'Vendor',
  SYSTEM_REQUIRED: 'System required',
});

const SUBSECTION = Object.freeze({
  CONTENT_TYPES: 'Content types',
  PAGES: 'Pages',
  PARTS: 'Parts',
  LAYOUTS: 'Layouts',
  MIXINS: 'Mixins',
  FORM_FRAGMENTS: 'Form fragments',
  MACROS: 'Macros',
  TOOLS: 'Tools',
  EXTENSIONS: 'Extensions',
  INTERNAL_PATH: 'Internal path',
  MODE: 'Mode',
  USED_BY: 'Used by',
});

const BUTTON = Object.freeze({
  UPDATE: 'Update',
});

const LINK = Object.freeze({
  MARKET: 'Open on the Enonic Market',
  VENDOR: 'Open the vendor site',
});

const STATE_MENU = "[data-component='ApplicationStateMenu']";
const STATE_MENU_BUTTON = `button${STATE_MENU}`;
const STATE_MENU_LABEL = `span${STATE_MENU}`;
const STATE_MENU_CONTENT = "[data-component='ApplicationStateMenu.Menu'][role='menu']";
const STATE_MENU_ITEMS = `${STATE_MENU_CONTENT} [role='menuitem']`;

const IN_HEADER = {
  badge: "span[role='img']",
  marketLink: `a[aria-label='${LINK.MARKET}']`,
};

const IN_FIELD = {
  vendorLink: `a[aria-label='${LINK.VENDOR}']`,
  updateButton: `button[aria-label='${BUTTON.UPDATE}']`,
};

class ApplicationDetails extends DetailsPanel {
  constructor() {
    super({
      sectionId: appConst.SECTION_ID.APPLICATIONS,
      panelComponent: 'ApplicationDetails',
      itemPageComponent: 'ApplicationsItemPage',
      panelName: 'Application details',
    });
    this.css.stateButton = `${this.css.container} ${STATE_MENU_BUTTON}`;
    this.css.stateLabel = `${this.css.container} ${STATE_MENU_LABEL}`;
    this.css.stateMenu = STATE_MENU_CONTENT;
    this.css.stateMenuItems = STATE_MENU_ITEMS;
    this.css.headerBadge = `${this.css.header} ${IN_HEADER.badge}`;
    this.css.marketLink = `${this.css.header} ${IN_HEADER.marketLink}`;
  }

  static get SECTION() {
    return SECTION;
  }

  static get FIELD() {
    return FIELD;
  }

  static get SUBSECTION() {
    return SUBSECTION;
  }

  static get BUTTON() {
    return BUTTON;
  }

  static get LINK() {
    return LINK;
  }

  // Header

  // The aria-label of the corner badge on the icon (appConst.APP_BADGE.*) - or undefined.
  async getHeaderBadge() {
    const badges = await this.getDisplayedElements(this.css.headerBadge);
    return badges.length === 0 ? undefined : await badges[0].getAttribute('aria-label');
  }

  isMarketLinkDisplayed() {
    return this.isElementDisplayed(this.css.marketLink);
  }

  // The link waits for the market catalogue: it is absent while the catalogue loads.
  async waitForMarketLinkDisplayed(ms = appConst.TIMEOUT.LONG) {
    try {
      await this.waitUntilDisplayed(this.css.marketLink, ms);
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the link to the Enonic Market should be displayed`,
        'err_details_market_link',
        err,
      );
    }
  }

  // The href of the link out to the Enonic Market - or undefined when the market does not carry
  // the application.
  async getMarketLinkUrl() {
    const links = await this.getDisplayedElements(this.css.marketLink);
    return links.length === 0 ? undefined : await links[0].getAttribute('href');
  }

  async getState() {
    const buttons = await this.getDisplayedElements(this.css.stateButton);
    if (buttons.length > 0) {
      return await buttons[0].getText();
    }
    const labels = await this.getDisplayedElements(this.css.stateLabel);
    return labels.length === 0 ? undefined : await labels[0].getText();
  }

  async waitForState(expected, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(async () => (await this.getState()) === expected, {
        timeout: ms,
        timeoutMsg: `the state should read '${expected}'`,
      });
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the state should read '${expected}'`,
        'err_details_state',
        err,
      );
    }
  }

  // The state is a dropdown: the application can be started or stopped from here.
  isStateMenuButtonDisplayed() {
    return this.isElementDisplayed(this.css.stateButton);
  }

  // Opens the state dropdown; it offers the opposite state ('Stop' for a started application).
  async clickOnStateMenuButton() {
    try {
      await this.waitForElementEnabled(this.css.stateButton);
      await this.clickOnElement(this.css.stateButton);
      await this.waitForElementDisplayed(this.css.stateMenu);
    } catch (err) {
      await this.handleError(
        `${this.panelName} - error after clicking on the state button`,
        'err_details_state_btn',
        err,
      );
    }
  }

  async waitForStateMenuOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.stateMenu, ms);
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the state menu should be opened`,
        'err_details_state_menu',
        err,
      );
    }
  }

  async waitForStateMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.stateMenu, ms);
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the state menu should be closed`,
        'err_details_state_menu',
        err,
      );
    }
  }

  isStateMenuDisplayed() {
    return this.isElementDisplayed(this.css.stateMenu);
  }

  // Labels of the items in the open state menu (appConst.TOOLBAR.START / .STOP), in display order.
  async getStateMenuItems() {
    await this.waitForElementDisplayed(this.css.stateMenu);
    return await this.getTextInElements(this.css.stateMenuItems);
  }

  async clickOnStateMenuItem(itemName) {
    try {
      await this.waitForElementDisplayed(this.css.stateMenu);
      const items = await this.findElements(this.css.stateMenuItems);
      for (const item of items) {
        if ((await item.getText()).trim() === itemName) {
          await item.click();
          return await this.waitForStateMenuClosed();
        }
      }
      throw new Error(`item '${itemName}' was not found in the state menu`);
    } catch (err) {
      await this.handleError(
        `${this.panelName} - error after clicking on the state menu item '${itemName}'`,
        'err_details_state_menu_item',
        err,
      );
    }
  }

  // Opens the state menu and picks 'Stop'; the state reads 'Stopped' once the server has done it.
  async stopApplication() {
    await this.clickOnStateMenuButton();
    await this.clickOnStateMenuItem(appConst.TOOLBAR.STOP);
    return await this.waitForState(appConst.APP_STATE.STOPPED, appConst.TIMEOUT.LONG);
  }

  // Opens the state menu and picks 'Start'; the state reads 'Started' once the server has done it.
  async startApplication() {
    await this.clickOnStateMenuButton();
    await this.clickOnStateMenuItem(appConst.TOOLBAR.START);
    return await this.waitForState(appConst.APP_STATE.STARTED, appConst.TIMEOUT.LONG);
  }

  // Closes the open menu without picking.
  async closeStateMenu() {
    await this.pressEscKey();
    return await this.waitForStateMenuClosed();
  }

  // Details

  // The description - or undefined when the application has none.
  getInfo() {
    return this.getFieldValue(SECTION.DETAILS, FIELD.INFO);
  }

  // The installed version, e.g. '2.0.0.SNAPSHOT'
  getVersionInstalled() {
    return this.getFieldValue(SECTION.DETAILS, FIELD.VERSION_INSTALLED);
  }

  // The application key, e.g. 'com.enonic.uitest.simple_page'
  getKey() {
    return this.getFieldValue(SECTION.DETAILS, FIELD.KEY);
  }

  // The vendor's name - or undefined when the application names none.
  getVendor() {
    return this.getFieldValue(SECTION.DETAILS, FIELD.VENDOR);
  }

  // The href of the link beside the vendor's name - or undefined when the application names no
  // vendor url.
  async getVendorLinkUrl() {
    const field = await this.findField(SECTION.DETAILS, FIELD.VENDOR);
    if (field === undefined) {
      return undefined;
    }
    const links = await field.$$(IN_FIELD.vendorLink);
    return links.length === 0 ? undefined : await links[0].getAttribute('href');
  }

  // The lowest platform version the application accepts, e.g. '≥ 8.0.0' - or undefined.
  getSystemRequired() {
    return this.getFieldValue(SECTION.DETAILS, FIELD.SYSTEM_REQUIRED);
  }

  getUpdateAvailable() {
    return this.getFieldValue(SECTION.DETAILS, FIELD.UPDATE_AVAILABLE);
  }

  async isUpdateButtonDisplayed() {
    const field = await this.findField(SECTION.DETAILS, FIELD.UPDATE_AVAILABLE);
    if (field === undefined) {
      return false;
    }
    const buttons = await field.$$(IN_FIELD.updateButton);
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  // A local application cannot be updated from the market: the button is shown disabled.
  async isUpdateButtonEnabled() {
    const field = await this.findField(SECTION.DETAILS, FIELD.UPDATE_AVAILABLE);
    if (field === undefined) {
      throw new Error(`${this.panelName} - no '${FIELD.UPDATE_AVAILABLE}' field`);
    }
    return await field.$(IN_FIELD.updateButton).isEnabled();
  }

  async clickOnUpdateButton() {
    try {
      const field = await this.findField(SECTION.DETAILS, FIELD.UPDATE_AVAILABLE);
      if (field === undefined) {
        throw new Error(`no '${FIELD.UPDATE_AVAILABLE}' field`);
      }
      const button = await field.$(IN_FIELD.updateButton);
      await button.waitForClickable({ timeout: appConst.TIMEOUT.MEDIUM });
      return await button.click();
    } catch (err) {
      await this.handleError(
        `${this.panelName} - error after clicking on the Update button`,
        'err_details_update_btn',
        err,
      );
    }
  }

  // Schemas - a subsection per kind, only the kinds the application has

  isSchemasSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.SCHEMAS);
  }

  // Labels of the subsections shown under Schemas (ApplicationDetails.SUBSECTION.*), in display order.
  getSchemaKinds() {
    return this.getSubsectionLabels(SECTION.SCHEMAS);
  }

  // Names of the schemas of the kind, in display order (sorted by name).
  getSchemas(kind) {
    return this.getSubsectionItems(SECTION.SCHEMAS, kind);
  }

  getContentTypes() {
    return this.getSchemas(SUBSECTION.CONTENT_TYPES);
  }

  getPages() {
    return this.getSchemas(SUBSECTION.PAGES);
  }

  getParts() {
    return this.getSchemas(SUBSECTION.PARTS);
  }

  getLayouts() {
    return this.getSchemas(SUBSECTION.LAYOUTS);
  }

  getMixins() {
    return this.getSchemas(SUBSECTION.MIXINS);
  }

  getFormFragments() {
    return this.getSchemas(SUBSECTION.FORM_FRAGMENTS);
  }

  getMacros() {
    return this.getSchemas(SUBSECTION.MACROS);
  }

  // Tasks - a grid of Key / Description, no subsections

  isTasksSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.TASKS);
  }

  // The tasks as [{ key, description }], in display order (sorted by name).
  async getTasks() {
    const section = await this.getSection(SECTION.TASKS);
    const cells = await section.$$('div.grid > span');
    const texts = [];
    for (const cell of cells) {
      texts.push(await cell.getText());
    }
    const tasks = [];
    for (let i = 0; i + 1 < texts.length; i += 2) {
      tasks.push({ key: texts[i], description: texts[i + 1] });
    }
    return tasks;
  }

  // Admin - Tools (links), Extensions ('<title> (<interfaces>)')

  isAdminSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.ADMIN);
  }

  getAdminTools() {
    return this.getSubsectionItems(SECTION.ADMIN, SUBSECTION.TOOLS);
  }

  getAdminExtensions() {
    return this.getSubsectionItems(SECTION.ADMIN, SUBSECTION.EXTENSIONS);
  }

  // APIs - one line per api: 'Title (name)', or the name alone when the two match

  isApisSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.APIS);
  }

  async getApis() {
    const section = await this.getSection(SECTION.APIS);
    const items = await section.$$(':scope > div > span');
    const texts = [];
    for (const item of items) {
      texts.push(await item.getText());
    }
    return texts;
  }

  // Web app

  isWebAppSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.WEB_APP);
  }

  // The internal path of the web app, e.g. '/webapp/com.enonic.app.x' - the one line under
  // 'Internal path'.
  async getWebAppInternalPath() {
    const [path] = await this.getSubsectionItems(SECTION.WEB_APP, SUBSECTION.INTERNAL_PATH);
    return path;
  }

  // ID provider applications

  isIdProviderSectionDisplayed() {
    return this.isSectionDisplayed(SECTION.ID_PROVIDER_APPLICATIONS);
  }

  // 'LOCAL' / 'EXTERNAL' / 'MIXED' - or undefined
  async getIdProviderMode() {
    const [mode] = await this.getSubsectionItems(SECTION.ID_PROVIDER_APPLICATIONS, SUBSECTION.MODE);
    return mode;
  }

  // Display names of the ID providers using the application, in display order.
  getIdProviderUsedBy() {
    return this.getSubsectionItems(SECTION.ID_PROVIDER_APPLICATIONS, SUBSECTION.USED_BY);
  }

  // 'The details could not be loaded' (appConst.DETAILS_MESSAGE.INFO_ERROR) - shown under the
  // Details section when the schemas and the rest could not be read - or undefined.
  getInfoErrorNotice() {
    return this.getPanelErrorNotice();
  }
}

module.exports = ApplicationDetails;
