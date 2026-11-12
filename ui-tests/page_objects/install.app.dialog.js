/**
 * Created on 10.11.2026
 *
 * The 'Install applications' dialog (features/install-applications/ui/InstallApplicationsDialog),
 * opened by 'Install' in the toolbar or the row menu. Two tabs: 'Enonic Market' - a filter input
 * over the market catalogue (free text, and the fields License, Vendor, Upgrade available,
 * Installed, each with its hit counts) above one row per market application: its icon, display name
 * and description, the latest version (a link to the market page) and, on the right, 'Install',
 * 'Update' or the text 'Installed' - and 'Upload', a drop zone for jar files.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');

const DIALOG = "[data-component='InstallApplicationsDialog'][data-state='open']";
const FILTER = `${DIALOG} [data-component='FilterInput']`;
const ROW = `${DIALOG} li[data-component='MarketApplicationRow']`;

const CSS = {
  container: DIALOG,
  title: `${DIALOG} [data-component='Dialog.Title']`,
  closeButton: `${DIALOG} [data-component='Dialog.DefaultClose']`,
  // Tabs: 'Enonic Market' and 'Upload' (appConst.INSTALL_DIALOG.TAB.*). CSS cannot match text, so
  // the triggers are scanned.
  tabs: `${DIALOG} [data-component='Tab.Trigger'][role='tab']`,
  activeTab: `${DIALOG} [data-component='Tab.Trigger'][role='tab'][aria-selected='true']`,
  dropZone: `${DIALOG} [data-component='DropZone']`,
  // Filter (the same markup as the browse screen's, see browse.page.js)
  filterInput: FILTER,
  filterButton: `${FILTER} button[aria-label='Filter']`,
  searchInput: `${FILTER} input[data-component='Combobox.Input']`,
  filterClearButton: `${FILTER} button[aria-label='Clear the filter']`,
  filterTags: `${FILTER} [data-component='Tag']`,
  filterTagPrefix: "[data-component='Tag.Prefix']",
  filterTagLabel: "[data-component='Tag.Label']",
  filterTagRemove: "[data-component='Tag.Remove']",
  filterPopup: "[data-component='Combobox.Popup']",
  filterFieldOptions:
    "[data-component='Combobox.Popup'] [data-component='Listbox.Item'][data-value^='field:']",
  filterValueOptions:
    "[data-component='Combobox.Popup'] [data-component='Listbox.Item'][data-value^='value:']",
  filterValueOptionCount: 'span.tabular-nums',
  // The market list: a `ul` of rows once loaded, a `div[aria-busy]` of skeletons while loading, a
  // `p` when nothing matches, a `div` with 'Try again' when the market is empty or unreachable.
  list: `${DIALOG} ul[data-component='MarketApplicationList']`,
  listLoading: `${DIALOG} div[data-component='MarketApplicationList'][aria-busy='true']`,
  listMessage: `${DIALOG} p[data-component='MarketApplicationList']`,
  listError: `${DIALOG} div[data-component='MarketApplicationList'] p[role='alert']`,
  retryButton: `${DIALOG} div[data-component='MarketApplicationList'] button[aria-label='Try again']`,
  rows: ROW,
  // Inside a row: the ItemLabel (display name in bold, description under it), then the version cell
  // (a `span`, direct child of the row) and the action cell (the last `div`): a ProgressButton
  // ('Install' / 'Update', filling with the download while it runs) or the text 'Installed'.
  rowDisplayName: "[data-component='ItemLabel'] span.font-semibold",
  rowDescription: "[data-component='ItemLabel'] small",
  rowVersion: ':scope > span',
  rowMarketLink: ':scope > span a',
  rowAction: ':scope > div:last-child',
  rowActionButton: "button[data-component='ProgressButton']",
};

class InstallAppDialog extends SectionPage {
  constructor() {
    super(appConst.SECTION_ID.APPLICATIONS);
    this.css = CSS;
    this.dialogName = 'Install applications dialog';
  }

  get container() {
    return this.css.container;
  }

  get searchInput() {
    return this.css.searchInput;
  }

  get closeButton() {
    return this.css.closeButton;
  }

  // Dialog

  async waitForDialogOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
      await this.waitForElementDisplayed(this.css.tabs, ms);
    } catch (err) {
      await this.handleError(`${this.dialogName} was not opened`, 'err_install_dialog', err);
    }
  }

  async waitForDialogClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.container, ms);
    } catch (err) {
      await this.handleError(`${this.dialogName} should be closed`, 'err_install_dialog', err);
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(this.css.container);
  }

  // 'Install applications'
  async getTitle() {
    await this.waitForElementDisplayed(this.css.title);
    return await this.getText(this.css.title);
  }

  async clickOnCloseButton() {
    try {
      await this.waitForElementDisplayed(this.css.closeButton);
      await this.clickOnElement(this.css.closeButton);
    } catch (err) {
      await this.handleError(`${this.dialogName} - Close button`, 'err_install_close_btn', err);
    }
  }

  // Tabs

  // Labels of the tabs, in display order (appConst.INSTALL_DIALOG.TAB.*).
  async getTabs() {
    await this.waitForElementDisplayed(this.css.tabs);
    return await this.getTextInElements(this.css.tabs);
  }

  async getActiveTab() {
    await this.waitForElementDisplayed(this.css.activeTab);
    return await this.getText(this.css.activeTab);
  }

  async clickOnTab(label) {
    try {
      await this.waitForElementDisplayed(this.css.tabs);
      const tabs = await this.findElements(this.css.tabs);
      for (const tab of tabs) {
        if ((await tab.getText()).trim() === label) {
          await tab.click();
          return await tab.waitUntil(
            async () => (await tab.getAttribute('aria-selected')) === 'true',
            {
              timeout: appConst.TIMEOUT.MEDIUM,
              timeoutMsg: `the '${label}' tab should be active`,
            },
          );
        }
      }
      throw new Error(`tab '${label}' was not found`);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clicking on the '${label}' tab`,
        'err_install_tab',
        err,
      );
    }
  }

  isDropZoneDisplayed() {
    return this.isElementDisplayed(this.css.dropZone);
  }

  // Search (the free text of the filter input)

  // Types the text and commits it with Enter: the FilterInput narrows the list by committed terms
  // only, and typed text becomes a term (a tag without a prefix) on Enter. The dropdown of fields
  // stays open after it, so it is dismissed here.
  async typeTextInSearchInput(text) {
    try {
      await this.waitForElementDisplayed(this.css.searchInput);
      await this.typeTextInInput(this.css.searchInput, text);
      await this.pressEnterKey();
      await this.waitForFilterTerm(undefined, text);
      await this.closeFilterPopup();
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after typing in the search input`,
        'err_install_search',
        err,
      );
    }
  }

  async clearSearchInput() {
    try {
      await this.clearInputText(this.css.searchInput);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clearing the search input`,
        'err_install_search',
        err,
      );
    }
  }

  getTextInSearchInput() {
    return this.getTextInInput(this.css.searchInput);
  }

  // Filter by field (the 'Filter' button and the dropdown it opens)

  // Opens the dropdown of fields. The button toggles the dropdown, so an open one is left as it is.
  async clickOnFilterButton() {
    try {
      await this.waitForElementEnabled(this.css.filterButton);
      if (!(await this.isFilterPopupDisplayed())) {
        await this.clickOnElement(this.css.filterButton);
      }
      await this.waitForElementDisplayed(this.css.filterPopup);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clicking on the Filter button`,
        'err_install_filter_btn',
        err,
      );
    }
  }

  async waitForFilterPopupClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.filterPopup, ms);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - the filter dropdown should be closed`,
        'err_install_filter_popup',
        err,
      );
    }
  }

  isFilterPopupDisplayed() {
    return this.isElementDisplayed(this.css.filterPopup);
  }

  // Dismisses the dropdown with a click on the dialog's title - outside the dropdown, inside the
  // dialog. Not Escape: with no field entered, the FilterInput lets Escape through to the dialog.
  async closeFilterPopup() {
    if (await this.isFilterPopupDisplayed()) {
      await this.clickOnElement(this.css.title);
      await this.waitForFilterPopupClosed();
    }
  }

  // Labels of the fields the open dropdown offers (appConst.INSTALL_DIALOG.FILTER_FIELD.*).
  async getFilterFields() {
    await this.waitForElementDisplayed(this.css.filterPopup);
    return await this.getTextInElements(this.css.filterFieldOptions);
  }

  // Clicks the field in the open dropdown: its values open.
  async clickOnFilterField(label) {
    try {
      await this.waitForElementDisplayed(this.css.filterPopup);
      const options = await this.findElements(this.css.filterFieldOptions);
      for (const option of options) {
        if ((await option.getText()).trim() === label) {
          await option.click();
          return await this.waitUntilDisplayed(this.css.filterValueOptions);
        }
      }
      throw new Error(`field '${label}' was not found in the filter dropdown`);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clicking on the filter field '${label}'`,
        'err_install_filter_field',
        err,
      );
    }
  }

  async getFilterValues() {
    await this.waitForElementDisplayed(this.css.filterPopup);
    const options = await this.findElements(this.css.filterValueOptions);
    const values = [];
    for (const option of options) {
      const counts = await option.$$(this.css.filterValueOptionCount);
      const count =
        counts.length === 0 ? undefined : Number((await counts[0].getText()).replace(/[()]/g, ''));
      const disabled = await option.getAttribute('aria-disabled');
      const text = await option.getText();
      const label = counts.length === 0 ? text.trim() : text.replace(/\(\d+\)\s*$/, '').trim();
      values.push({ label, count, disabled: disabled === 'true' });
    }
    return values;
  }

  async getFilterValueCount(label) {
    const value = (await this.getFilterValues()).find((option) => option.label === label);
    if (value === undefined) {
      throw new Error(`${this.dialogName} - no '${label}' value in the filter dropdown`);
    }
    return value.count;
  }

  // Clicks the value in the open dropdown: the term is added as a tag, the list is narrowed and the
  // dropdown closes.
  async clickOnFilterValue(label) {
    try {
      await this.waitForElementDisplayed(this.css.filterPopup);
      const options = await this.findElements(this.css.filterValueOptions);
      for (const option of options) {
        const text = await option.getText();
        if (text.replace(/\(\d+\)\s*$/, '').trim() === label) {
          await option.click();
          return await this.waitForFilterPopupClosed();
        }
      }
      throw new Error(`value '${label}' was not found in the filter dropdown`);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clicking on the filter value '${label}'`,
        'err_install_filter_value',
        err,
      );
    }
  }

  // Opens the dropdown, picks the field, then the value: one term added.
  async filterByFieldValue(field, value) {
    await this.clickOnFilterButton();
    await this.clickOnFilterField(field);
    return await this.clickOnFilterValue(value);
  }

  // The terms in force as [{ field, value }], in the order they were added: the tag's prefix without
  // its colon ('Vendor') and its label ('Enonic'); `field` is undefined for a free-text term.
  async getFilterTerms() {
    const tags = await this.getDisplayedElements(this.css.filterTags);
    const terms = [];
    for (const tag of tags) {
      const prefixes = await tag.$$(this.css.filterTagPrefix);
      const field =
        prefixes.length === 0 ? undefined : (await prefixes[0].getText()).replace(/:\s*$/, '');
      terms.push({ field, value: await tag.$(this.css.filterTagLabel).getText() });
    }
    return terms;
  }

  async waitForFilterTerm(field, value, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () =>
          (await this.getFilterTerms()).some(
            (term) => term.field === field && term.value === value,
          ),
        { timeout: ms, timeoutMsg: `no '${field}: ${value}' tag in the filter` },
      );
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - the filter should hold '${field}: ${value}'`,
        'err_install_filter_term',
        err,
      );
    }
  }

  // Clicks the cross of the tag: the term is taken out, the list widens again.
  async removeFilterTerm(field, value) {
    try {
      const tags = await this.getDisplayedElements(this.css.filterTags);
      for (const tag of tags) {
        const prefixes = await tag.$$(this.css.filterTagPrefix);
        const tagField =
          prefixes.length === 0 ? undefined : (await prefixes[0].getText()).replace(/:\s*$/, '');
        const tagValue = await tag.$(this.css.filterTagLabel).getText();
        if (tagField === field && tagValue === value) {
          await tag.$(this.css.filterTagRemove).click();
          return await this.getBrowser().waitUntil(
            async () =>
              !(await this.getFilterTerms()).some(
                (term) => term.field === field && term.value === value,
              ),
            { timeout: appConst.TIMEOUT.MEDIUM, timeoutMsg: 'the tag is still in the filter' },
          );
        }
      }
      throw new Error(`no '${field}: ${value}' tag in the filter`);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after removing the filter term '${field}: ${value}'`,
        'err_install_filter_term',
        err,
      );
    }
  }

  isClearFilterButtonDisplayed() {
    return this.isElementDisplayed(this.css.filterClearButton);
  }

  async clickOnClearFilterButton() {
    try {
      await this.waitForElementDisplayed(this.css.filterClearButton);
      await this.clickOnElement(this.css.filterClearButton);
      await this.waitForElementNotDisplayed(this.css.filterClearButton);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clicking on the 'Clear the filter' button`,
        'err_install_filter_clear',
        err,
      );
    }
  }

  // Market list

  // The catalogue is fetched from Enonic Market when the dialog opens: skeletons first, then the rows.
  async waitForMarketListLoaded(ms = appConst.TIMEOUT.LONG) {
    try {
      await this.waitForElementNotDisplayed(this.css.listLoading, ms);
      await this.waitForElementDisplayed(this.css.list, ms);
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - the market list was not loaded`,
        'err_install_market_list',
        err,
      );
    }
  }

  // 'No applications matching the specified criteria' - shown instead of the rows - or undefined.
  async getListMessage() {
    const messages = await this.getDisplayedElements(this.css.listMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // 'Enonic market could not be reached' - or undefined.
  async getListError() {
    const errors = await this.getDisplayedElements(this.css.listError);
    return errors.length === 0 ? undefined : await errors[0].getText();
  }

  // Display names of the market applications listed, in display order.
  async getMarketAppDisplayNames() {
    const rows = await this.getDisplayedElements(this.css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(this.css.rowDisplayName).getText());
    }
    return names;
  }

  async waitForMarketAppDisplayNames(expected, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => {
          const names = await this.getMarketAppDisplayNames();
          return names.length === expected.length && names.every((name, i) => name === expected[i]);
        },
        { timeout: ms, timeoutMsg: `the market list should be [${expected.join(', ')}]` },
      );
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - the market list should hold exactly [${expected.join(', ')}]`,
        'err_install_market_rows',
        err,
      );
    }
  }

  // Rows by display name. CSS cannot match text, so the rows are scanned.

  async findRowByDisplayName(displayName) {
    const rows = await this.getDisplayedElements(this.css.rows);
    for (const row of rows) {
      if ((await row.$(this.css.rowDisplayName).getText()) === displayName) {
        return row;
      }
    }
    return undefined;
  }

  async waitForRowDisplayed(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    let row;
    try {
      await this.getBrowser().waitUntil(
        async () => {
          row = await this.findRowByDisplayName(displayName);
          return row !== undefined;
        },
        { timeout: ms, timeoutMsg: `no market row with the display name '${displayName}'` },
      );
      return row;
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - the row '${displayName}' should be displayed`,
        'err_install_market_row',
        err,
      );
    }
  }

  async waitForRowNotDisplayed(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.findRowByDisplayName(displayName)) === undefined,
        { timeout: ms, timeoutMsg: `the market row '${displayName}' is still displayed` },
      );
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - the row '${displayName}' should not be displayed`,
        'err_install_market_row',
        err,
      );
    }
  }

  async isRowDisplayed(displayName) {
    return (await this.findRowByDisplayName(displayName)) !== undefined;
  }

  // The description under the display name.
  async getMarketAppDescription(displayName) {
    const row = await this.waitForRowDisplayed(displayName);
    return await row.$(this.css.rowDescription).getText();
  }

  // The latest version the market offers, e.g. '3.1.0'. Read from inside the link when there is one:
  // the cell's own text carries the link's tooltip ('Open on the Enonic Market') as well.
  async getMarketAppVersion(displayName) {
    const row = await this.waitForRowDisplayed(displayName);
    const links = await row.$$(this.css.rowMarketLink);
    const cell = links.length === 0 ? await row.$(this.css.rowVersion) : links[0];
    return (await cell.getText()).trim();
  }

  // The href of the version link: the application's page on the market - or undefined.
  async getMarketAppPageUrl(displayName) {
    const row = await this.waitForRowDisplayed(displayName);
    const links = await row.$$(this.css.rowMarketLink);
    return links.length === 0 ? undefined : await links[0].getAttribute('href');
  }

  // Clicks the version link ('Open on the Enonic Market'): the market page opens in a new tab.
  async clickOnMarketAppPageLink(displayName) {
    try {
      const row = await this.waitForRowDisplayed(displayName);
      const link = await row.$(this.css.rowMarketLink);
      await link.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
      await link.click();
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clicking on the market link of '${displayName}'`,
        'err_install_market_link',
        err,
      );
    }
  }

  // What the action cell of the row reads: 'Install', 'Update', 'Installed'
  // (appConst.INSTALL_DIALOG.ACTION.*) - or '' for an application ahead of the market.
  async getMarketAppAction(displayName) {
    const row = await this.waitForRowDisplayed(displayName);
    return (await row.$(this.css.rowAction).getText()).trim();
  }

  async waitForMarketAppAction(displayName, expected, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getMarketAppAction(displayName)) === expected,
        { timeout: ms, timeoutMsg: `the row '${displayName}' should read '${expected}'` },
      );
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - the row '${displayName}' should read '${expected}'`,
        'err_install_market_action',
        err,
      );
    }
  }

  // Whether the row has a button at all: an installed application on the latest version has none.
  async isInstallButtonDisplayed(displayName) {
    const row = await this.waitForRowDisplayed(displayName);
    const buttons = await row.$$(this.css.rowActionButton);
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  // The button is disabled and 'aria-busy' while the download runs.
  async isInstallInProgress(displayName) {
    const row = await this.waitForRowDisplayed(displayName);
    const buttons = await row.$$(this.css.rowActionButton);
    return buttons.length > 0 && (await buttons[0].getAttribute('aria-busy')) === 'true';
  }

  // Clicks 'Install' (or 'Update') in the row: the download starts, the button fills with its
  // progress, and the row reads 'Installed' once the market catalogue has caught up.
  async clickOnInstallButton(displayName) {
    try {
      const row = await this.waitForRowDisplayed(displayName);
      const button = await row.$(this.css.rowActionButton);
      await button.waitForEnabled({ timeout: appConst.TIMEOUT.MEDIUM });
      await button.click();
    } catch (err) {
      await this.handleError(
        `${this.dialogName} - error after clicking on 'Install' in the row '${displayName}'`,
        'err_install_market_btn',
        err,
      );
    }
  }
}

module.exports = InstallAppDialog;
