/**
 * Created on 09.11.2026
 *
 * Base class of a browse screen (widgets/browse-screen/BrowseScreen): the 'Actions' toolbar, the
 * filter input, the list header (Select all, Sort by, Refresh) and the list of rows, differing only
 * in the page's data-component, the section the shadow root belongs to and what a row shows on its
 * right. A section's page object passes those in and names what is its own (the toolbar buttons, the
 * key format of its rows, the meta cells).
 *
 * Locators are CSS, resolved inside the section's shadow root (see SectionPage). A row's id ends with
 * '-item-<key>', the key being the item's own key (an application key here); rows are also found by
 * what they show, since CSS cannot match text.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');

// The browse toolbar carries its own name in place of the library's 'Toolbar.Container'; the buttons
// keep 'Toolbar.Item', which Slot puts on the button element itself.
function buildCss(pageComponent) {
  const PAGE = `[data-component='${pageComponent}']`;
  const TOOLBAR = `${PAGE} [data-component='BrowseToolbar'][aria-label='Actions']`;
  const HEADER = `${PAGE} [data-component='BrowseListHeader']`;
  const LIST = `${PAGE} [data-component='BrowseList']`;
  const ROW = `${LIST} [data-component='BrowseListRow']`;
  return {
    container: PAGE,
    toolbar: TOOLBAR,
    toolbarButtons: `${TOOLBAR} button[data-component='Toolbar.Item']`,
    toolbarButton: (label) =>
      `${TOOLBAR} button[data-component='Toolbar.Item'][aria-label='${label}']`,
    filterInput: `${PAGE} [data-component='FilterInput']`,
    filterButton: `${PAGE} [data-component='FilterInput'] button[aria-label='Filter']`,
    searchInput: `${PAGE} [data-component='FilterInput'] input[data-component='Combobox.Input']`,
    filterClearButton: `${PAGE} [data-component='FilterInput'] button[aria-label='Clear the filter']`,
    filterTags: `${PAGE} [data-component='FilterInput'] [data-component='Tag']`,
    filterTagPrefix: "[data-component='Tag.Prefix']",
    filterTagLabel: "[data-component='Tag.Label']",
    filterTagRemove: "[data-component='Tag.Remove']",
    filterPopup: "[data-component='Combobox.Popup']",
    filterOptions: "[data-component='Combobox.Popup'] [data-component='Listbox.Item']",
    // A field option carries 'field:<id>', a value option 'value:<id>'
    filterFieldOptions:
      "[data-component='Combobox.Popup'] [data-component='Listbox.Item'][data-value^='field:']",
    filterValueOptions:
      "[data-component='Combobox.Popup'] [data-component='Listbox.Item'][data-value^='value:']",
    filterValueOptionCount: 'span.tabular-nums',
    // List header (BrowseListHeader)
    listHeader: HEADER,
    selectAllCheckbox: `${HEADER} [data-component='Checkbox'] input`,
    selectAllCheckboxLabel: `${HEADER} [data-component='Checkbox'] label`,
    refreshButton: `${HEADER} button[aria-label='Refresh']`,
    // The sort trigger shows the field ('Display name') and says the order in its tooltip, so it is
    // located by its component name; the open menu is rendered in the portal layer, still inside the
    // section's shadow root.
    sortButton: `${PAGE} button[data-component='BrowseSort']`,
    sortMenu: "[data-component='BrowseSort.Menu'][role='menu']",
    sortMenuItems: "[data-component='BrowseSort.Menu'][role='menu'] [role='menuitemradio']",
    // The row menu (BrowseListContextMenu): the toolbar's actions over the row that was right-clicked,
    // portalled into the section's portal layer, still inside its shadow root.
    contextMenu: "[data-component='BrowseListContextMenu'][role='menu']",
    contextMenuItems:
      "[data-component='BrowseListContextMenu'][role='menu'] [data-component='ContextMenu.Item']",
    // List: the rows live in a TreeList (role 'tree')
    list: `${LIST} [role='tree']`,
    listMessage: `${PAGE} [data-component='BrowseListMessage']`,
    rows: ROW,
    rowByKey: (key) => `${ROW}[id$='-item-${key}']`,
    rowCheckbox: (key) => `${ROW}[id$='-item-${key}'] [data-component='Checkbox'] input`,
    rowCheckboxLabel: (key) => `${ROW}[id$='-item-${key}'] [data-component='Checkbox'] label`,
    // Inside a row: the bold display name, the name under it, the right-hand cells (meta)
    rowDisplayName: "[data-component='ItemLabel'] span.font-semibold",
    rowName: "[data-component='ItemLabel'] small",
    rowMeta: "[data-component='TreeList.RowRight'] > span",
    rowCheckboxLabelInRow: "[data-component='Checkbox'] label",
  };
}

class BrowsePage extends SectionPage {
  // `pageName` prefixes the error messages, e.g. 'Applications page'.
  constructor({ sectionId, pageComponent, pageName }) {
    super(sectionId);
    this.pageName = pageName;
    this.css = buildCss(pageComponent);
  }

  get container() {
    return this.css.container;
  }

  get toolbar() {
    return this.css.toolbar;
  }

  get searchInput() {
    return this.css.searchInput;
  }

  get selectAllCheckbox() {
    return this.css.selectAllCheckbox;
  }

  get refreshButton() {
    return this.css.refreshButton;
  }

  get sortButton() {
    return this.css.sortButton;
  }

  get sortMenu() {
    return this.css.sortMenu;
  }

  get list() {
    return this.css.list;
  }

  // Page

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
      await this.waitForElementDisplayed(this.css.toolbar, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} was not loaded`, 'err_browse_page', err);
    }
  }

  async waitForToolbarLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.toolbar, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - toolbar was not loaded`,
        'err_browse_toolbar',
        err,
      );
    }
  }

  // Returns aria-labels of the buttons currently rendered in the toolbar, in display order.
  async getToolbarButtonLabels() {
    const buttons = await this.findElements(this.css.toolbarButtons);
    return await Promise.all(buttons.map((el) => el.getAttribute('aria-label')));
  }

  // Waits for the toolbar's 'role' attribute (accessibility check).
  async waitForBrowseToolbarRoleAttribute(expectedRole) {
    await this.waitForAttributeValue(this.css.toolbar, 'role', expectedRole);
  }

  // Buttons - the same methods for each: a section names its toolbar buttons on top of these.

  async clickOnButton(selector, label, screenshot) {
    try {
      await this.waitForElementEnabled(selector);
      await this.clickOnElement(selector);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on ${label} button`,
        screenshot,
        err,
      );
    }
  }

  async waitForButtonDisplayed(selector, label, screenshot, ms) {
    try {
      await this.waitForElementDisplayed(selector, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - ${label} button should be displayed`,
        screenshot,
        err,
      );
    }
  }

  async waitForButtonEnabled(selector, label, screenshot, ms) {
    try {
      await this.waitForElementEnabled(selector, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - ${label} button should be enabled`,
        screenshot,
        err,
      );
    }
  }

  async waitForButtonDisabled(selector, label, screenshot, ms) {
    try {
      await this.waitForElementDisabled(selector, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - ${label} button should be disabled`,
        screenshot,
        err,
      );
    }
  }

  // Toolbar buttons by label (appConst.TOOLBAR.*)

  clickOnToolbarButton(label) {
    return this.clickOnButton(this.css.toolbarButton(label), label, 'err_toolbar_btn');
  }

  waitForToolbarButtonDisplayed(label, ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisplayed(this.css.toolbarButton(label), label, 'err_toolbar_btn', ms);
  }

  waitForToolbarButtonEnabled(label, ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(this.css.toolbarButton(label), label, 'err_toolbar_btn', ms);
  }

  waitForToolbarButtonDisabled(label, ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisabled(this.css.toolbarButton(label), label, 'err_toolbar_btn', ms);
  }

  isToolbarButtonEnabled(label) {
    return this.isElementEnabled(this.css.toolbarButton(label));
  }

  isToolbarButtonDisplayed(label) {
    return this.isElementDisplayed(this.css.toolbarButton(label));
  }

  // Refresh

  clickOnRefreshButton() {
    return this.clickOnButton(this.refreshButton, 'Refresh', 'err_refresh_btn');
  }

  waitForRefreshButtonDisplayed(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonDisplayed(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  waitForRefreshButtonEnabled(ms = appConst.TIMEOUT.SHORT) {
    return this.waitForButtonEnabled(this.refreshButton, 'Refresh', 'err_refresh_btn', ms);
  }

  isRefreshButtonEnabled() {
    return this.isElementEnabled(this.refreshButton);
  }

  isRefreshButtonDisplayed() {
    return this.isElementDisplayed(this.refreshButton);
  }

  // Search (the free text of the filter input)

  async typeTextInSearchInput(text) {
    try {
      await this.waitForElementDisplayed(this.css.searchInput);
      await this.typeTextInInput(this.css.searchInput, text);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after typing in the search input`,
        'err_search_input',
        err,
      );
    }
  }

  async clearSearchInput() {
    try {
      await this.clearInputText(this.css.searchInput);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clearing the search input`,
        'err_search_input',
        err,
      );
    }
  }

  getTextInSearchInput() {
    return this.getTextInInput(this.css.searchInput);
  }

  isSearchInputDisplayed() {
    return this.isElementDisplayed(this.css.searchInput);
  }

  // Filter by field (the 'Filter' button and the dropdown it opens)

  // Opens the dropdown of fields.
  async clickOnFilterButton() {
    try {
      await this.waitForElementEnabled(this.css.filterButton);
      await this.clickOnElement(this.css.filterButton);
      await this.waitForElementDisplayed(this.css.filterPopup);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the Filter button`,
        'err_filter_btn',
        err,
      );
    }
  }

  async waitForFilterPopupOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.filterPopup, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the filter dropdown should be opened`,
        'err_filter_popup',
        err,
      );
    }
  }

  async waitForFilterPopupClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.filterPopup, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the filter dropdown should be closed`,
        'err_filter_popup',
        err,
      );
    }
  }

  isFilterPopupDisplayed() {
    return this.isElementDisplayed(this.css.filterPopup);
  }

  // Labels of the fields the open dropdown offers (appConst.FILTER_FIELD.*), in display order.
  async getFilterFields() {
    await this.waitForElementDisplayed(this.css.filterPopup);
    return await this.getTextInElements(this.css.filterFieldOptions);
  }

  // Clicks the field in the open dropdown: its values open, the input shows the field's prefix.
  async clickOnFilterField(label) {
    try {
      await this.waitForElementDisplayed(this.css.filterPopup);
      const options = await this.findElements(this.css.filterFieldOptions);
      for (const option of options) {
        if ((await option.getText()).trim() === label) {
          await option.click();
          return await this.pause(300);
        }
      }
      throw new Error(`field '${label}' was not found in the filter dropdown`);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the filter field '${label}'`,
        'err_filter_field',
        err,
      );
    }
  }

  // The values of the entered field as [{ label, count, disabled }], in display order: the label
  // ('Stopped'), the hit count ('(1)' → 1, undefined when none is shown) and whether the option is
  // withheld (no hit, or disabled by the caller).
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
      // The text of the option is the label with the count after it
      const label = counts.length === 0 ? text.trim() : text.replace(/\(\d+\)\s*$/, '').trim();
      values.push({ label, count, disabled: disabled === 'true' });
    }
    return values;
  }

  // The hit count of the value in the open dropdown - or undefined when the value shows none.
  async getFilterValueCount(label) {
    const value = (await this.getFilterValues()).find((option) => option.label === label);
    if (value === undefined) {
      throw new Error(`${this.pageName} - no '${label}' value in the filter dropdown`);
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
          await this.waitForFilterPopupClosed();
          return await this.pause(300);
        }
      }
      throw new Error(`value '${label}' was not found in the filter dropdown`);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the filter value '${label}'`,
        'err_filter_value',
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
  // its colon ('State') and its label ('Stopped'); `field` is undefined for a free-text term.
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
        `${this.pageName} - the filter should hold '${field}: ${value}'`,
        'err_filter_term',
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
          return await this.pause(300);
        }
      }
      throw new Error(`no '${field}: ${value}' tag in the filter`);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after removing the filter term '${field}: ${value}'`,
        'err_filter_term',
        err,
      );
    }
  }

  // The cross at the right end of the filter: shown while a term or text is in force.
  isClearFilterButtonDisplayed() {
    return this.isElementDisplayed(this.css.filterClearButton);
  }

  // Clears every term and the text at once.
  async clickOnClearFilterButton() {
    try {
      await this.waitForElementDisplayed(this.css.filterClearButton);
      await this.clickOnElement(this.css.filterClearButton);
      await this.waitForElementNotDisplayed(this.css.filterClearButton);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the 'Clear the filter' button`,
        'err_filter_clear',
        err,
      );
    }
  }

  // Sort by

  async clickOnSortButton() {
    try {
      await this.waitForElementEnabled(this.sortButton);
      await this.clickOnElement(this.sortButton);
      await this.waitForElementDisplayed(this.css.sortMenu);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on Sort by button`,
        'err_sort_btn',
        err,
      );
    }
  }

  waitForSortButtonDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonDisplayed(this.sortButton, 'Sort by', 'err_sort_btn', ms);
  }

  waitForSortButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForButtonEnabled(this.sortButton, 'Sort by', 'err_sort_btn', ms);
  }

  isSortButtonEnabled() {
    return this.isElementEnabled(this.sortButton);
  }

  isSortButtonDisplayed() {
    return this.isElementDisplayed(this.sortButton);
  }

  // Returns the current sort order without opening the menu: the trigger's tooltip (the element its
  // 'aria-describedby' points at) holds the label of the picked item (appConst.SORT_MENU_ITEM.*), or
  // 'Sort by' while nothing matches an option.
  async getSelectedSortOrder() {
    await this.waitForElementDisplayed(this.sortButton);
    const tooltipId = await this.getAttribute(this.sortButton, 'aria-describedby');
    if (!tooltipId) {
      throw new Error(`${this.pageName} - the Sort by button has no tooltip`);
    }
    return await this.getText(`[id='${tooltipId}']`);
  }

  async waitForSelectedSortOrder(expectedItem, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getSelectedSortOrder()) === expectedItem,
        { timeout: ms, timeoutMsg: `the sort order should be '${expectedItem}'` },
      );
    } catch (err) {
      await this.handleError(
        `${this.pageName} - expected sort order '${expectedItem}' is not selected`,
        'err_sort_order',
        err,
      );
    }
  }

  // The field shown on the trigger itself, e.g. 'Display name'.
  async getSortButtonLabel() {
    await this.waitForElementDisplayed(this.sortButton);
    return await this.getText(this.sortButton);
  }

  // 'true' while the order differs from the default one (the trigger is then lit).
  async isSortButtonActive() {
    const active = await this.getAttribute(this.sortButton, 'data-active');
    return active === 'true';
  }

  async waitForSortMenuOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.sortMenu, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} - Sort menu should be opened`, 'err_sort_menu', err);
    }
  }

  async waitForSortMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.sortMenu, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} - Sort menu should be closed`, 'err_sort_menu', err);
    }
  }

  isSortMenuDisplayed() {
    return this.isElementDisplayed(this.css.sortMenu);
  }

  // Returns the labels of the items in the open Sort menu, in display order (appConst.SORT_MENU_ITEM).
  async getSortMenuItems() {
    await this.waitForElementDisplayed(this.css.sortMenu);
    return await this.getTextInElements(this.css.sortMenuItems);
  }

  // Returns the label of the checked item in the open Sort menu.
  async getSelectedSortMenuItem() {
    await this.waitForElementDisplayed(this.css.sortMenu);
    const items = await this.findElements(this.css.sortMenuItems);
    for (const item of items) {
      if ((await item.getAttribute('aria-checked')) === 'true') {
        return await item.getText();
      }
    }
    throw new Error(`${this.pageName} - no item is checked in the Sort menu`);
  }

  // Clicks the item with the given label (appConst.SORT_MENU_ITEM.*) in the open Sort menu.
  // The menu closes on pick.
  async clickOnSortMenuItem(itemName) {
    try {
      await this.waitForElementDisplayed(this.css.sortMenu);
      const items = await this.findElements(this.css.sortMenuItems);
      for (const item of items) {
        if ((await item.getText()).trim() === itemName) {
          await item.click();
          await this.waitForSortMenuClosed();
          return await this.pause(300);
        }
      }
      throw new Error(`item '${itemName}' was not found in the Sort menu`);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the Sort menu item '${itemName}'`,
        'err_sort_menu_item',
        err,
      );
    }
  }

  // Opens the Sort menu and picks the item.
  async selectSortOrder(itemName) {
    await this.clickOnSortButton();
    return await this.clickOnSortMenuItem(itemName);
  }

  // Closes the open menu without picking.
  async closeSortMenu() {
    await this.pressEscKey();
    return await this.waitForSortMenuClosed();
  }

  // Select all

  async clickOnSelectAllCheckbox() {
    try {
      await this.waitForElementDisplayed(this.css.selectAllCheckboxLabel);
      await this.clickOnElement(this.css.selectAllCheckboxLabel);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - Select all checkbox`,
        'err_select_all_checkbox',
        err,
      );
    }
  }

  async isSelectAllCheckboxSelected() {
    const checked = await this.getAttribute(this.css.selectAllCheckbox, 'aria-checked');
    return checked === 'true';
  }

  isSelectAllCheckboxDisplayed() {
    return this.isElementDisplayed(this.css.selectAllCheckboxLabel);
  }

  // List

  async waitForListLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.list, ms);
    } catch (err) {
      await this.handleError(`${this.pageName} - the list was not loaded`, 'err_browse_list', err);
    }
  }

  // 'No applications', 'Nothing matches the search' - shown instead of the rows - or undefined.
  async getListMessage() {
    const messages = await this.getDisplayedElements(this.css.listMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  // Display names of the rows, in display order.
  async getRowDisplayNames() {
    const rows = await this.getDisplayedElements(this.css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(this.css.rowDisplayName).getText());
    }
    return names;
  }

  // Names (the line under the display name) of the rows, in display order.
  async getRowNames() {
    const rows = await this.getDisplayedElements(this.css.rows);
    const names = [];
    for (const row of rows) {
      names.push(await row.$(this.css.rowName).getText());
    }
    return names;
  }

  // The right-hand cells of a row element, in display order - [] when the row has none.
  async getRowMetaCellsOf(row) {
    const cells = await row.$$(this.css.rowMeta);
    const texts = [];
    for (const cell of cells) {
      texts.push(await cell.getText());
    }
    return texts;
  }

  // The first right-hand cell of a row element - or undefined.
  async getRowMetaOf(row) {
    const cells = await this.getRowMetaCellsOf(row);
    return cells.length === 0 ? undefined : cells[0];
  }

  // Rows by key: the row's id ends with '-item-<key>'.

  async getRowMeta(key) {
    await this.waitForRowDisplayed(key);
    return await this.getRowMetaOf(await this.findElement(this.css.rowByKey(key)));
  }

  async getRowMetaCells(key) {
    await this.waitForRowDisplayed(key);
    return await this.getRowMetaCellsOf(await this.findElement(this.css.rowByKey(key)));
  }

  async waitForRowDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  async waitForRowNotDisplayed(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.rowByKey(key), ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should not be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  isRowDisplayed(key) {
    return this.isElementDisplayed(this.css.rowByKey(key));
  }

  // Clicks on the row: the item is selected and its details open on the right.
  async clickOnRowByKey(key) {
    try {
      await this.waitForRowDisplayed(key);
      await this.clickOnElement(this.css.rowByKey(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the row '${key}'`,
        'err_browse_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox: the item joins the selection, the toolbar follows.
  async clickOnCheckboxByKey(key) {
    try {
      await this.waitForElementDisplayed(this.css.rowCheckboxLabel(key));
      await this.clickOnElement(this.css.rowCheckboxLabel(key));
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - checkbox of the row '${key}'`,
        'err_browse_checkbox',
        err,
      );
    }
  }

  async isRowChecked(key) {
    const checked = await this.getAttribute(this.css.rowCheckbox(key), 'aria-checked');
    return checked === 'true';
  }

  // The row the user clicked on (aria-selected), not a ticked checkbox.
  async isRowSelected(key) {
    const selected = await this.getAttribute(this.css.rowByKey(key), 'aria-selected');
    return selected === 'true';
  }

  async waitForRowSelected(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(this.css.rowByKey(key), 'aria-selected', 'true', ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should be selected`,
        'err_browse_row',
        err,
      );
    }
  }

  // The row painted as the active one (the details on the right are its): 'data-active'.
  async isRowActive(key) {
    const active = await this.getAttribute(this.css.rowByKey(key), 'data-active');
    return active === 'true';
  }

  async waitForRowActive(key, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForAttributeValue(this.css.rowByKey(key), 'data-active', 'true', ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${key}' should be active`,
        'err_browse_row',
        err,
      );
    }
  }

  // The row's context menu: the toolbar's actions, offered over the row that was right-clicked. The
  // right click makes that row the active one, so the items are enabled the way the toolbar's are.

  async openContextMenuOnRow(key) {
    try {
      await this.waitForRowDisplayed(key);
      const row = await this.findElement(this.css.rowByKey(key));
      await this.doRightClickOnElement(row);
      await this.waitForElementDisplayed(this.css.contextMenu);
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after right-clicking on the row '${key}'`,
        'err_context_menu',
        err,
      );
    }
  }

  async waitForContextMenuOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.contextMenu, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the context menu should be opened`,
        'err_context_menu',
        err,
      );
    }
  }

  async waitForContextMenuClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.contextMenu, ms);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the context menu should be closed`,
        'err_context_menu',
        err,
      );
    }
  }

  isContextMenuDisplayed() {
    return this.isElementDisplayed(this.css.contextMenu);
  }

  // Labels of the items in the open context menu (appConst.TOOLBAR.*), in display order - the
  // toolbar's buttons, enabled or not.
  async getContextMenuItems() {
    await this.waitForElementDisplayed(this.css.contextMenu);
    return await this.getTextInElements(this.css.contextMenuItems);
  }

  async findContextMenuItem(label) {
    await this.waitForElementDisplayed(this.css.contextMenu);
    const items = await this.findElements(this.css.contextMenuItems);
    for (const item of items) {
      if ((await item.getText()).trim() === label) {
        return item;
      }
    }
    return undefined;
  }

  // A withheld item stays in the menu, greyed: 'aria-disabled'.
  async isContextMenuItemEnabled(label) {
    const item = await this.findContextMenuItem(label);
    if (item === undefined) {
      throw new Error(`${this.pageName} - no '${label}' item in the context menu`);
    }
    return (await item.getAttribute('aria-disabled')) !== 'true';
  }

  // Clicks the item with the label (appConst.TOOLBAR.*) in the open context menu; the menu closes.
  async clickOnContextMenuItem(label) {
    try {
      const item = await this.findContextMenuItem(label);
      if (item === undefined) {
        throw new Error(`item '${label}' was not found in the context menu`);
      }
      await item.click();
      await this.waitForContextMenuClosed();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the context menu item '${label}'`,
        'err_context_menu_item',
        err,
      );
    }
  }

  // Closes the open menu without picking.
  async closeContextMenu() {
    await this.pressEscKey();
    return await this.waitForContextMenuClosed();
  }

  // Rows by what they show. CSS cannot match text, so the rows are scanned: the text is compared
  // with the display name (the bold line) or the name (the small line under it).

  async findRowByText(selector, text) {
    const rows = await this.getDisplayedElements(this.css.rows);
    for (const row of rows) {
      if ((await row.$(selector).getText()) === text) {
        return row;
      }
    }
    return undefined;
  }

  findRowByDisplayName(displayName) {
    return this.findRowByText(this.css.rowDisplayName, displayName);
  }

  findRowByName(name) {
    return this.findRowByText(this.css.rowName, name);
  }

  // Waits until a row with the display name is listed and returns it.
  async waitForRowByDisplayNameDisplayed(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    let row;
    try {
      await this.getBrowser().waitUntil(
        async () => {
          row = await this.findRowByDisplayName(displayName);
          return row !== undefined;
        },
        { timeout: ms, timeoutMsg: `no row with the display name '${displayName}'` },
      );
      return row;
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${displayName}' should be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  async waitForRowByDisplayNameNotDisplayed(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.findRowByDisplayName(displayName)) === undefined,
        { timeout: ms, timeoutMsg: `the row '${displayName}' is still displayed` },
      );
    } catch (err) {
      await this.handleError(
        `${this.pageName} - the row '${displayName}' should not be displayed`,
        'err_browse_row',
        err,
      );
    }
  }

  async isRowByDisplayNameDisplayed(displayName) {
    return (await this.findRowByDisplayName(displayName)) !== undefined;
  }

  // Clicks on the row: the item is selected and its details open on the right.
  async clickOnRowByDisplayName(displayName) {
    try {
      const row = await this.waitForRowByDisplayNameDisplayed(displayName);
      await row.click();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - error after clicking on the row '${displayName}'`,
        'err_browse_row',
        err,
      );
    }
  }

  // Ticks the row's checkbox: the item joins the selection, the toolbar follows.
  async clickOnCheckboxByDisplayName(displayName) {
    try {
      const row = await this.waitForRowByDisplayNameDisplayed(displayName);
      await row.$(this.css.rowCheckboxLabelInRow).click();
      return await this.pause(300);
    } catch (err) {
      await this.handleError(
        `${this.pageName} - checkbox of the row '${displayName}'`,
        'err_browse_checkbox',
        err,
      );
    }
  }

  // The name shown under the display name.
  async getRowNameByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await row.$(this.css.rowName).getText();
  }

  // The first right-hand cell of the row - or undefined.
  async getRowMetaByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await this.getRowMetaOf(row);
  }

  // The right-hand cells of the row, in display order.
  async getRowMetaCellsByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await this.getRowMetaCellsOf(row);
  }

  // The row's id, '...-item-<key>': what the rows are keyed by.
  async getRowIdByDisplayName(displayName) {
    const row = await this.waitForRowByDisplayNameDisplayed(displayName);
    return await row.getAttribute('id');
  }
}

module.exports = BrowsePage;
