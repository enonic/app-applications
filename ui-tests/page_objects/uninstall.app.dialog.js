/**
 * Created on 10.11.2026
 *
 * The 'Confirm uninstall' dialog (features/uninstall-applications/ui/UninstallApplicationsDialog),
 * opened by 'Uninstall' in the toolbar or the row menu: the question, the display names of the
 * applications about to go, and a red 'Uninstall' button. One application is a click away; for
 * several the count has to be typed back into the gate first ('Enter 3 in the field and click
 * Uninstall'). The dialog closes as the uninstall starts; the outcome is a toast per application.
 *
 * A modal portalled inside the section's shadow root, so every locator is CSS resolved through
 * SectionPage.
 */
const SectionPage = require('./section.page');
const appConst = require('../libs/app_const');

const DIALOG = "[data-component='UninstallApplicationsDialog'][data-state='open']";
const FOOTER = `${DIALOG} [data-component='ActionDialog.Footer']`;
const GATE = `${DIALOG} [data-component='Gate.Root']`;

const CSS = {
  container: DIALOG,
  title: `${DIALOG} [data-component='Dialog.Title']`,
  closeButton: `${DIALOG} [data-component='Dialog.DefaultClose']`,
  // The body: the question, then one `li` per application
  question: `${DIALOG} [data-component='ActionDialog.Body'] > div > div`,
  targets: `${DIALOG} [data-component='ActionDialog.Body'] li`,
  gate: GATE,
  gateHint: `${GATE} [data-component='Gate.Hint']`,
  expectedValue: `${GATE} [data-component='Gate.Hint'] strong`,
  confirmInput: `${GATE} input`,
  uninstallButton: `${FOOTER} button[aria-label='${appConst.TOOLBAR.UNINSTALL}']`,
  cancelButton: `${FOOTER} button[aria-label='Cancel']`,
};

class UninstallAppDialog extends SectionPage {
  constructor() {
    super(appConst.SECTION_ID.APPLICATIONS);
    this.css = CSS;
    this.dialogName = 'Uninstall dialog';
  }

  get container() {
    return this.css.container;
  }

  get uninstallButton() {
    return this.css.uninstallButton;
  }

  get cancelButton() {
    return this.css.cancelButton;
  }

  // Dialog

  async waitForDialogOpened(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementDisplayed(this.css.container, ms);
      await this.waitForElementDisplayed(this.css.uninstallButton, ms);
    } catch (err) {
      await this.handleError(`${this.dialogName} was not opened`, 'err_uninstall_dialog', err);
    }
  }

  async waitForDialogClosed(ms = appConst.TIMEOUT.MEDIUM) {
    try {
      await this.waitForElementNotDisplayed(this.css.container, ms);
    } catch (err) {
      await this.handleError(`${this.dialogName} should be closed`, 'err_uninstall_dialog', err);
    }
  }

  isDialogDisplayed() {
    return this.isElementDisplayed(this.css.container);
  }

  // 'Confirm uninstall'
  async getTitle() {
    await this.waitForElementDisplayed(this.css.title);
    return await this.getText(this.css.title);
  }

  // 'Are you sure you want to uninstall this application?' or 'You are about to uninstall 3
  // applications.'
  async getQuestion() {
    await this.waitForElementDisplayed(this.css.question);
    return await this.getText(this.css.question);
  }

  // Display names of the applications about to be uninstalled, in display order.
  async getTargetDisplayNames() {
    await this.waitForElementDisplayed(this.css.container);
    return await this.getTextInElements(this.css.targets);
  }

  // Gate (several applications)

  isConfirmInputDisplayed() {
    return this.isElementDisplayed(this.css.confirmInput);
  }

  // The count to type back, as text ('3').
  async getExpectedValue() {
    await this.waitForElementDisplayed(this.css.expectedValue);
    return await this.getText(this.css.expectedValue);
  }

  async typeInConfirmInput(value) {
    try {
      await this.waitForElementDisplayed(this.css.confirmInput);
      await this.typeTextInInput(this.css.confirmInput, String(value));
    } catch (err) {
      await this.handleError(`${this.dialogName} - the gate input`, 'err_uninstall_input', err);
    }
  }

  // Buttons

  async clickOnUninstallButton() {
    try {
      await this.waitForElementEnabled(this.css.uninstallButton);
      await this.clickOnElement(this.css.uninstallButton);
    } catch (err) {
      await this.handleError(`${this.dialogName} - Uninstall button`, 'err_uninstall_btn', err);
    }
  }

  waitForUninstallButtonEnabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForElementEnabled(this.css.uninstallButton, ms);
  }

  waitForUninstallButtonDisabled(ms = appConst.TIMEOUT.MEDIUM) {
    return this.waitForElementDisabled(this.css.uninstallButton, ms);
  }

  isUninstallButtonEnabled() {
    return this.isElementEnabled(this.css.uninstallButton);
  }

  async clickOnCancelButton() {
    try {
      await this.waitForElementDisplayed(this.css.cancelButton);
      await this.clickOnElement(this.css.cancelButton);
    } catch (err) {
      await this.handleError(`${this.dialogName} - Cancel button`, 'err_uninstall_cancel', err);
    }
  }

  async clickOnCloseButton() {
    try {
      await this.waitForElementDisplayed(this.css.closeButton);
      await this.clickOnElement(this.css.closeButton);
    } catch (err) {
      await this.handleError(`${this.dialogName} - Close button`, 'err_uninstall_close', err);
    }
  }

  // Flows

  // Confirms the uninstall: types the count back when the gate asks for it, then 'Uninstall'; the
  // dialog goes away.
  async confirmUninstall() {
    await this.waitForDialogOpened();
    if (await this.isConfirmInputDisplayed()) {
      await this.typeInConfirmInput(await this.getExpectedValue());
    }
    await this.clickOnUninstallButton();
    await this.waitForDialogClosed();
  }
}

module.exports = UninstallAppDialog;
