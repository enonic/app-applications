/**
 * Created on 09.11.2026
 *
 * Base class of the details panel shown on the right of a browse screen when an item is selected
 * (widgets/details-panel/DetailsPanel). The layout:
 *
 *   header            - icon, the display name (h3), an optional line under it, an optional action
 *   section*          - a Separator with the section's label, e.g. 'Roles (2)' (the count in
 *                       brackets), then fields, subsections and lists
 *     field           - a label ('Key') over its value
 *     subsection      - an h4 with its own label and count ('Content types (3)') over its items
 *     list            - role='list' of ListItem rows: display name, name under it, a meta column on
 *                       the right; a '+N more' button after it when there is more to load
 *
 * A section is found by its label text (the Separator's span), a field by its label span, and
 * everything else is read from the element found. The panel is inside the section's shadow root:
 * every locator is CSS resolved through SectionPage.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');

const IN_SECTION = {
  separatorLabel: "[data-component='Separator'] span:first-child",
  fields: "[data-component='DetailsPanel.Field']",
  fieldLabel: 'span.font-semibold',
  fieldValue: 'span.font-semibold + span',
  subsections: "[data-component='DetailsPanel.Subsection']",
  subsectionLabel: 'h4',
  subsectionItems: ':scope > span, :scope > a, :scope > div > span, :scope > div > a',
  listItems: "[role='list'] [data-component='ListItem']",
  itemTitle: "[data-component='ItemLabel'] span.font-semibold",
  itemSubtitle: "[data-component='ItemLabel'] small",
  itemMeta: "[data-component='ListItem.Right'] span",
  moreButton: "[data-component='MoreButton']",
  button: (label) => `button[aria-label='${label}']`,
  checkbox: "[data-component='Checkbox'] input",
  checkboxLabel: "[data-component='Checkbox'] label",
  errorNotice: 'p.text-error',
};

// A section's label is rendered in upper case (the Separator's 'uppercase' class), and WebDriver
// reads text as rendered, so labels are compared without regard to case.
function sameLabel(a, b) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// 'Roles (2)' → { label: 'Roles', count: 2 }; 'User' → { label: 'User', count: undefined }
function splitCount(text) {
  const match = text.match(/^(.*?)\s*\((\d+)\)$/);
  return match === null
    ? { label: text.trim(), count: undefined }
    : { label: match[1].trim(), count: Number(match[2]) };
}

class DetailsPanel extends SectionPage {
  constructor({ sectionId, panelComponent, itemPageComponent, panelName }) {
    super(sectionId);
    this.panelName = panelName;
    const PANEL = `[data-component='${panelComponent}']`;
    this.css = {
      container: PANEL,
      header: `${PANEL} > div:first-child`,
      title: `${PANEL} h3`,
      subtitle: `${PANEL} > div:first-child p`,
      sections: `${PANEL} > section`,
      sectionLabels: `${PANEL} > section ${IN_SECTION.separatorLabel}`,
      // The layout's own message while no item is on show: 'Select an item to see its details'.
      emptyMessage: "p[data-component='DetailsEmpty']",
      // The item page's message in place of the panel: the item is gone, or could not be loaded.
      itemMessage: `p[data-component='${itemPageComponent}']`,
      skeleton: `[data-component='${itemPageComponent}'] [aria-busy='true']`,
    };
  }

  get container() {
    return this.css.container;
  }

  // Panel

  async waitForLoaded(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
      await this.waitForElementDisplayed(this.css.title, ms);
    } catch (err) {
      await this.handleError(`${this.panelName} was not loaded`, 'err_details_panel', err);
    }
  }

  async waitForNotDisplayed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.container, ms);
    } catch (err) {
      await this.handleError(`${this.panelName} should not be displayed`, 'err_details_panel', err);
    }
  }

  isDisplayed() {
    return this.isElementDisplayed(this.css.container);
  }

  // 'Select an item to see its details' (appConst.DETAILS_MESSAGE.SELECT_AN_ITEM) - shown in the
  // details column while no item is on show - or undefined while the panel itself is shown.
  async getEmptyMessage() {
    const messages = await this.getDisplayedElements(this.css.emptyMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  async waitForEmptyMessage(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.emptyMessage, ms);
      return await this.getText(this.css.emptyMessage);
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the empty message should be displayed`,
        'err_details_empty',
        err,
      );
    }
  }

  async getItemMessage() {
    const messages = await this.getDisplayedElements(this.css.itemMessage);
    return messages.length === 0 ? undefined : await messages[0].getText();
  }

  async waitForItemMessage(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.itemMessage, ms);
      return await this.getText(this.css.itemMessage);
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the item message should be displayed`,
        'err_details_item_message',
        err,
      );
    }
  }

  // Header

  // The display name
  async getTitle() {
    await this.waitForElementDisplayed(this.css.title);
    return await this.getText(this.css.title);
  }

  async getSubtitle() {
    const subtitles = await this.getDisplayedElements(this.css.subtitle);
    return subtitles.length === 0 ? undefined : await subtitles[0].getText();
  }

  // Waits until the panel shows the item with the display name.
  async waitForTitle(displayName, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(async () => (await this.getTitle()) === displayName, {
        timeout: ms,
        timeoutMsg: `the panel should show '${displayName}'`,
      });
    } catch (err) {
      await this.handleError(
        `${this.panelName} - '${displayName}' should be shown`,
        'err_details_title',
        err,
      );
    }
  }

  // Sections

  // Labels of the sections, in display order, without their counts and as rendered, i.e. in upper
  // case: ['DETAILS', 'SCHEMAS', ...]. Compare with DetailsPanel.sameLabel.
  async getSectionLabels() {
    const texts = await this.getTextInDisplayedElements(this.css.sectionLabels);
    return texts.map((text) => splitCount(text).label);
  }

  // The section element with the label (its count ignored) - or undefined.
  async findSection(label) {
    const sections = await this.getDisplayedElements(this.css.sections);
    for (const section of sections) {
      const text = await section.$(IN_SECTION.separatorLabel).getText();
      if (sameLabel(splitCount(text).label, label)) {
        return section;
      }
    }
    return undefined;
  }

  async getSection(label) {
    const section = await this.findSection(label);
    if (section === undefined) {
      throw new Error(`${this.panelName} - no '${label}' section`);
    }
    return section;
  }

  async isSectionDisplayed(label) {
    return (await this.findSection(label)) !== undefined;
  }

  async waitForSectionDisplayed(label, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(async () => (await this.findSection(label)) !== undefined, {
        timeout: ms,
        timeoutMsg: `no '${label}' section`,
      });
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the '${label}' section should be displayed`,
        'err_details_section',
        err,
      );
    }
  }

  async waitForSectionNotDisplayed(label, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(async () => (await this.findSection(label)) === undefined, {
        timeout: ms,
        timeoutMsg: `the '${label}' section is still displayed`,
      });
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the '${label}' section should not be displayed`,
        'err_details_section',
        err,
      );
    }
  }

  // The count in the section's label ('Roles (2)' → 2) - or undefined when it carries none.
  async getSectionCount(label) {
    const section = await this.getSection(label);
    const text = await section.$(IN_SECTION.separatorLabel).getText();
    return splitCount(text).count;
  }

  // Fields

  // The fields of the section as { label: value }, e.g. { Key: 'com.enonic.app.superhero' }.
  async getFields(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    const fields = await section.$$(IN_SECTION.fields);
    const result = {};
    for (const field of fields) {
      const labels = await field.$$(IN_SECTION.fieldLabel);
      const values = await field.$$(IN_SECTION.fieldValue);
      if (labels.length > 0 && values.length > 0) {
        result[await labels[0].getText()] = await values[0].getText();
      }
    }
    return result;
  }

  // Labels of the fields of the section, in display order.
  async getFieldLabels(sectionLabel) {
    return Object.keys(await this.getFields(sectionLabel));
  }

  // The value of the field with the label in the section - or undefined when the field is absent.
  async getFieldValue(sectionLabel, fieldLabel) {
    const fields = await this.getFields(sectionLabel);
    return fields[fieldLabel];
  }

  async isFieldDisplayed(sectionLabel, fieldLabel) {
    return (await this.getFieldValue(sectionLabel, fieldLabel)) !== undefined;
  }

  // The field element with the label in the section - or undefined. For what a field holds beyond
  // its text: a link, a button.
  async findField(sectionLabel, fieldLabel) {
    const section = await this.getSection(sectionLabel);
    const fields = await section.$$(IN_SECTION.fields);
    for (const field of fields) {
      const labels = await field.$$(IN_SECTION.fieldLabel);
      if (labels.length > 0 && (await labels[0].getText()) === fieldLabel) {
        return field;
      }
    }
    return undefined;
  }

  // Waits for the field to read as expected - the panel re-reads the item after a change, so a
  // check right after one has to wait.
  async waitForFieldValue(sectionLabel, fieldLabel, expected, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getFieldValue(sectionLabel, fieldLabel)) === expected,
        { timeout: ms, timeoutMsg: `the ${fieldLabel} field should read '${expected}'` },
      );
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the ${fieldLabel} field should read '${expected}'`,
        'err_details_field',
        err,
      );
    }
  }

  // Subsections (an h4 with its label inside the section)

  // The subsection element with the label (its count ignored) - or undefined.
  async findSubsection(sectionLabel, subsectionLabel) {
    const section = await this.getSection(sectionLabel);
    const subsections = await section.$$(IN_SECTION.subsections);
    for (const subsection of subsections) {
      const text = await subsection.$(IN_SECTION.subsectionLabel).getText();
      if (sameLabel(splitCount(text).label, subsectionLabel)) {
        return subsection;
      }
    }
    return undefined;
  }

  async getSubsection(sectionLabel, subsectionLabel) {
    const subsection = await this.findSubsection(sectionLabel, subsectionLabel);
    if (subsection === undefined) {
      throw new Error(
        `${this.panelName} - no '${subsectionLabel}' in the '${sectionLabel}' section`,
      );
    }
    return subsection;
  }

  async isSubsectionDisplayed(sectionLabel, subsectionLabel) {
    return (await this.findSubsection(sectionLabel, subsectionLabel)) !== undefined;
  }

  // Labels of the subsections of the section, in display order, without their counts.
  async getSubsectionLabels(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    const subsections = await section.$$(IN_SECTION.subsections);
    const labels = [];
    for (const subsection of subsections) {
      const text = await subsection.$(IN_SECTION.subsectionLabel).getText();
      labels.push(splitCount(text).label);
    }
    return labels;
  }

  // The plain items of the subsection (a schema name per line), in display order.
  async getSubsectionItems(sectionLabel, subsectionLabel) {
    const subsection = await this.getSubsection(sectionLabel, subsectionLabel);
    const items = await subsection.$$(IN_SECTION.subsectionItems);
    const texts = [];
    for (const item of items) {
      texts.push(await item.getText());
    }
    return texts;
  }

  // The count in the subsection's label ('Public keys (1)' → 1) - or undefined.
  async getSubsectionCount(sectionLabel, subsectionLabel) {
    const subsection = await this.findSubsection(sectionLabel, subsectionLabel);
    if (subsection === undefined) {
      return undefined;
    }
    const text = await subsection.$(IN_SECTION.subsectionLabel).getText();
    return splitCount(text).count;
  }

  // Lists

  async getListItems(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    const items = await section.$$(IN_SECTION.listItems);
    const result = [];
    for (const item of items) {
      const metas = await item.$$(IN_SECTION.itemMeta);
      result.push({
        title: await item.$(IN_SECTION.itemTitle).getText(),
        subtitle: await item.$(IN_SECTION.itemSubtitle).getText(),
        meta: metas.length === 0 ? undefined : await metas[0].getText(),
      });
    }
    return result;
  }

  // Display names of the rows of the section's list, in display order.
  async getListItemTitles(sectionLabel) {
    return (await this.getListItems(sectionLabel)).map(({ title }) => title);
  }

  async waitForListItem(sectionLabel, title, ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.getBrowser().waitUntil(
        async () => (await this.getListItemTitles(sectionLabel)).includes(title),
        { timeout: ms, timeoutMsg: `'${title}' is not listed under '${sectionLabel}'` },
      );
    } catch (err) {
      await this.handleError(
        `${this.panelName} - '${title}' should be listed under '${sectionLabel}'`,
        'err_details_list',
        err,
      );
    }
  }

  // The rows of the subsection's list, the same shape.
  async getSubsectionListItems(sectionLabel, subsectionLabel) {
    const subsection = await this.getSubsection(sectionLabel, subsectionLabel);
    const items = await subsection.$$(IN_SECTION.listItems);
    const result = [];
    for (const item of items) {
      result.push({
        title: await item.$(IN_SECTION.itemTitle).getText(),
        subtitle: await item.$(IN_SECTION.itemSubtitle).getText(),
      });
    }
    return result;
  }

  // '+N more' under a list that holds more than it shows.

  async isMoreButtonDisplayed(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    const buttons = await section.$$(IN_SECTION.moreButton);
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  // The button's label, '+3 more' - or undefined when every row is shown.
  async getMoreButtonLabel(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    const buttons = await section.$$(IN_SECTION.moreButton);
    return buttons.length === 0 ? undefined : await buttons[0].getText();
  }

  async clickOnMoreButton(sectionLabel) {
    try {
      const section = await this.getSection(sectionLabel);
      const button = await section.$(IN_SECTION.moreButton);
      await button.waitForClickable({ timeout: appConst.TIMEOUT.MEDIUM });
      const before = await button.getText();
      await button.click();
      return await this.getBrowser().waitUntil(
        async () => (await this.getMoreButtonLabel(sectionLabel)) !== before,
        { timeout: appConst.TIMEOUT.MEDIUM, timeoutMsg: `'${before}' did not load more` },
      );
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the '+N more' button of '${sectionLabel}'`,
        'err_details_more_btn',
        err,
      );
    }
  }

  // Buttons of a section, by their aria-label: 'Edit', 'Update', ...

  async clickOnSectionButton(label, sectionLabel) {
    try {
      const section = await this.getSection(sectionLabel);
      const button = await section.$(IN_SECTION.button(label));
      await button.waitForClickable({ timeout: appConst.TIMEOUT.MEDIUM });
      return await button.click();
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the '${label}' button of '${sectionLabel}'`,
        'err_details_section_btn',
        err,
      );
    }
  }

  async isSectionButtonDisplayed(label, sectionLabel) {
    const section = await this.findSection(sectionLabel);
    if (section === undefined) {
      return false;
    }
    const buttons = await section.$$(IN_SECTION.button(label));
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  async isSectionButtonEnabled(label, sectionLabel) {
    const section = await this.getSection(sectionLabel);
    return await section.$(IN_SECTION.button(label)).isEnabled();
  }

  // The checkbox of a section

  async clickOnCheckbox(sectionLabel) {
    try {
      const section = await this.getSection(sectionLabel);
      const checkbox = await section.$(IN_SECTION.checkbox);
      const before = await checkbox.getAttribute('aria-checked');
      await section.$(IN_SECTION.checkboxLabel).click();
      return await checkbox.waitUntil(
        async () => (await checkbox.getAttribute('aria-checked')) !== before,
        {
          timeout: appConst.TIMEOUT.MEDIUM,
          timeoutMsg: `the checkbox of '${sectionLabel}' was not ticked`,
        },
      );
    } catch (err) {
      await this.handleError(
        `${this.panelName} - the checkbox of '${sectionLabel}'`,
        'err_details_checkbox',
        err,
      );
    }
  }

  async isCheckboxChecked(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    const checked = await section.$(IN_SECTION.checkbox).getAttribute('aria-checked');
    return checked === 'true';
  }

  async getCheckboxLabel(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    return await section.$(IN_SECTION.checkboxLabel).getText();
  }

  // The red notice of a section - or undefined.
  async getErrorNotice(sectionLabel) {
    const section = await this.getSection(sectionLabel);
    const notices = await section.$$(IN_SECTION.errorNotice);
    return notices.length === 0 ? undefined : await notices[0].getText();
  }

  // The red notice of the panel itself, between its sections ('The details could not be loaded') -
  // or undefined.
  async getPanelErrorNotice() {
    const notices = await this.getDisplayedElements(
      `${this.css.container} > ${IN_SECTION.errorNotice}`,
    );
    return notices.length === 0 ? undefined : await notices[0].getText();
  }
}

module.exports = DetailsPanel;
module.exports.splitCount = splitCount;
module.exports.sameLabel = sameLabel;
