const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const path = require('path');
const fs = require('fs');
const { Key } = require('webdriverio');
const { COMMON } = require('../libs/elements');

class Page {
  constructor() {
    if (typeof browser !== 'undefined') {
      this.browser = browser;
    } else {
      this.browser = webDriverHelper.browser;
    }
  }

  getBrowser() {
    return this.browser;
  }

  // value: string | string[]
  keys(value) {
    return this.browser.keys(value);
  }

  pressCtrl_A() {
    return this.browser.keys([Key.Ctrl, 'a']);
  }

  pressCtrl_C() {
    return this.browser.keys([Key.Ctrl, 'c']);
  }

  pressEndKey() {
    return this.browser.keys([Key.End]);
  }

  pressCtrl_V() {
    return this.browser.keys([Key.Ctrl, 'v']);
  }

  findElement(selector) {
    return this.browser.$(selector);
  }

  findElements(selector) {
    return this.browser.$$(selector);
  }

  getTitle() {
    return this.browser.getTitle();
  }

  async getDisplayedElements(selector) {
    let elements = await this.findElements(selector);
    if (elements.length === 0) {
      return [];
    }
    return await this.doFilterDisplayedElements(elements);
  }

  pause(ms) {
    return this.browser.pause(ms);
  }

  async doFilterDisplayedElements(elements) {
    let pr = await elements.map(async (el) => await el.isDisplayed());
    let result = await Promise.all(pr);
    return elements.filter((el, i) => result[i]);
  }

  async scrollAndClickOnElement(selector) {
    let element = await this.findElement(selector);
    await element.scrollIntoView();
    return await element.click();
  }

  async clickOnElement(selector) {
    let element = await this.findElement(selector);
    return await element.click();
  }

  async getText(selector) {
    let element = await this.findElement(selector);
    return await element.getText();
  }

  async getTextInElements(selector) {
    let results = [];
    let elements = await this.findElements(selector);
    if (elements.length === 0) {
      return [];
    }
    for (const item of elements) {
      results.push(await item.getText());
    }
    return results;
  }

  async getTextInDisplayedElements(selector) {
    let results = [];
    let elements = await this.getDisplayedElements(selector);
    if (elements.length === 0) {
      return [];
    }
    for (const item of elements) {
      results.push(await item.getText());
    }
    return results;
  }

  async typeChars(selector, text) {
    let inputElement = await this.findElement(selector);
    for (const ch of text) {
      await inputElement.addValue(ch);
      await this.pause(40);
    }
  }

  async typeTextInInput(selector, text) {
    try {
      let inputElement = await this.findElement(selector);
      // setValue clears the input first; wait until it is interactable so a not-yet-expanded
      // panel (or in-flight animation) does not throw "element not interactable".
      await inputElement.waitForClickable({ timeout: appConst.TIMEOUT.MEDIUM });
      await inputElement.setValue(text);
      return await this.pause(200);
    } catch (err) {
      throw new Error('Tried to set the value in the input ' + err);
    }
  }

  async enterTextUsingArray(selector, text) {
    let inputElement = await this.findElement(selector);
    for (const ch of text) {
      await inputElement.addValue(ch);
    }
  }

  async addTextInInput(selector, text) {
    let inputElement = await this.findElement(selector);
    //await inputElement.clearValue();
    await inputElement.addValue(text);
    await this.pause(300);
  }

  // Wait for an element for the provided amount of milliseconds to be present within the DOM. Returns true if the selector matches at least one
  // element that exists in the DOM, otherwise throws an error.
  async waitForExist(selector, ms) {
    let element = await this.findElement(selector);
    return await element.waitForExist({ timeout: ms });
  }

  async isClickable(selector) {
    let element = await this.findElement(selector);
    return await element.isClickable();
  }

  async getTextInInput(selector) {
    let inputElement = await this.findElement(selector);
    return await inputElement.getValue();
  }

  // clearValue() does not trigger React synthetic events (onChange/onInput), so the component
  // state is not updated. Simulating Ctrl+A → Delete fires the full keyboard event chain
  // that React listens to, reliably clearing both the DOM value and the component state.
  async clearInputText(selector) {
    try {
      let inputElement = await this.findElement(selector);
      await inputElement.waitForDisplayed({ timeout: 2000 });
      await inputElement.click();
      await this.browser.keys([Key.Ctrl, 'a']);
      await this.browser.keys('Delete');
    } catch (err) {
      throw new Error('Tried to clear the value in the input: ' + err);
    }
  }

  saveScreenshot(name) {
    let screenshotsDir = path.join(__dirname, '/../build/reports/screenshots/');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    return this.getBrowser()
      .saveScreenshot(screenshotsDir + name + '.png')
      .then(() => {
        console.log('screenshot is saved ' + name);
      })
      .catch((err) => {
        console.log('screenshot was not saved ' + screenshotsDir + ' ' + err);
      });
  }

  async saveScreenshotUniqueName(namePart) {
    let screenshotName = appConst.generateRandomName(namePart);
    await this.saveScreenshot(screenshotName);
    return screenshotName;
  }

  async isElementDisplayed(selector) {
    let elems = await this.getDisplayedElements(selector);
    return elems.length > 0;
  }

  async isElementEnabled(selector) {
    let element = await this.findElement(selector);
    return await element.isEnabled();
  }

  async waitForElementEnabled(selector, ms = appConst.TIMEOUT.MEDIUM) {
    let el = await this.findElements(selector);
    if (el.length > 1) {
      throw new Error('More than one element were found with the selector ' + selector);
    }
    if (el.length === 0) {
      throw new Error('Element was not found:' + selector);
    }
    return await el[0].waitForEnabled({ timeout: ms });
  }

  async waitForDisplayedElementEnabled(selector, ms) {
    let el = await this.getDisplayedElements(selector);
    if (el.length > 1) {
      throw new Error('More than one element were found with the selector ' + selector);
    }
    if (el.length === 0) {
      throw new Error('Element was not found:' + selector);
    }
    return await el[0].waitForEnabled({ timeout: ms });
  }

  async waitForElementDisabled(selector, ms = appConst.TIMEOUT.MEDIUM) {
    let element = await this.findElements(selector);
    if (element.length > 1) {
      throw new Error('More than one element were found with the selector ' + selector);
    }
    if (element.length === 0) {
      throw new Error('Element was not found:' + selector);
    }
    return await element[0].waitForEnabled({ timeout: ms, reverse: true });
  }

  /**
   *  Return true if the selected DOM-element:
   *
   *     - exists
   *     - is visible
   *     - is within viewport (if not try scroll to it)
   *     - its center is not overlapped with another element
   *     - is not disabled
   *     otherwise exception will be thrown.
   */
  async waitForElementClickable(selector, ms = appConst.TIMEOUT.MEDIUM) {
    let element = await this.findElements(selector);
    if (element.length > 1) {
      throw new Error('More than one element were found with the selector ' + selector);
    }
    if (element.length === 0) {
      throw new Error('Element was not found:' + selector);
    }
    return await element[0].waitForClickable({ timeout: ms });
  }

  async waitForElementNotClickable(selector, ms) {
    let element = await this.findElements(selector);
    if (element.length > 1) {
      throw new Error('More than one element were found with the selector ' + selector);
    }
    if (element.length === 0) {
      throw new Error('Element was not found:' + selector);
    }
    return await element[0].waitForClickable({ timeout: ms, reverse: true });
  }

  async waitForDisplayedElementDisabled(selector, ms) {
    let element = await this.getDisplayedElements(selector);
    if (element.length > 1) {
      throw new Error('More than one element were found with the selector ' + selector);
    }
    if (element.length === 0) {
      throw new Error('Element was not found:' + selector);
    }

    return await element[0].waitForEnabled({ timeout: ms, reverse: true });
  }

  waitForElementNotDisplayed(selector, ms = appConst.TIMEOUT.MEDIUM) {
    return this.getBrowser().waitUntil(
      () => {
        return this.getDisplayedElements(selector).then((result) => {
          return result.length === 0;
        });
      },
      { timeout: ms, timeoutMsg: `Timeout exception. Element ${selector} still visible in: ${ms}` },
    );
  }

  waitUntilDisplayed(selector, ms = appConst.TIMEOUT.MEDIUM) {
    return this.getBrowser().waitUntil(
      () => {
        return this.getDisplayedElements(selector).then((result) => {
          return result.length > 0;
        });
      },
      {
        timeout: ms,
        timeoutMsg: `Timeout exception. Element ${selector} still not visible in: ${ms}`,
      },
    );
  }

  async waitForElementDisplayed(selector, ms = appConst.TIMEOUT.MEDIUM) {
    let element = await this.findElement(selector);
    return await element.waitForDisplayed({ timeout: ms });
  }

  async waitForSpinnerNotVisible(
    ms = appConst.TIMEOUT.MEDIUM,
    spinnerSelector = "//div[@class='spinner']",
  ) {
    try {
      const timeoutMsg = `Spinner still displayed! Timeout is ${ms}`;
      await this.browser.waitUntil(
        async () => {
          const isNotDisplayed = await this.isElementNotDisplayed(spinnerSelector);
          return isNotDisplayed;
        },
        { timeout: ms, timeoutMsg: timeoutMsg },
      );
    } catch (err) {
      await this.handleError('Spinner should not be visible!', 'err_spinner', err);
    }
  }

  waitUntilElementNotVisible(selector, ms) {
    let message = `Element still displayed! ${ms}  ` + selector;
    return this.browser.waitUntil(
      () => {
        return this.isElementNotDisplayed(selector);
      },
      { timeout: ms, timeoutMsg: message },
    );
  }

  async isElementNotDisplayed(selector) {
    let result = await this.getDisplayedElements(selector);
    return result.length === 0;
  }

  async getAttribute(selector, attributeName) {
    let element = await this.findElement(selector);
    return await element.getAttribute(attributeName);
  }

  async waitForAttributeIsPresent(elementLocator, attribute) {
    await this.getBrowser().waitUntil(
      async () => {
        let text = await this.getAttribute(elementLocator, attribute);
        return text != null;
      },
      {
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: `Expected attribute ${attribute}  is not set in the element ${elementLocator}`,
      },
    );
  }

  // Waits for a notification message and returns its text.
  async waitForNotificationMessage() {
    try {
      const message = await this.getBrowser().$(COMMON.NOTIFICATION_TEXT);
      await message.waitForDisplayed({
        timeout: appConst.TIMEOUT.MEDIUM,
        timeoutMsg: 'The notification message was not shown',
      });
      await this.pause(100);
      return await message.getText();
    } catch (err) {
      await this.handleError('Waited for the notification message', 'err_notif_msg', err);
    }
  }

  // Texts of every notification message currently shown.
  async getNotificationMessages() {
    const messages = await this.getBrowser().$$(COMMON.NOTIFICATION_TEXT);
    const texts = [];
    for (const message of messages) {
      if (await message.isDisplayed()) {
        texts.push(await message.getText());
      }
    }
    return texts;
  }

  async waitForExpectedNotificationMessage(expectedMessage) {
    try {
      const selector = `${COMMON.NOTIFICATION_TEXT}[contains(.,'${expectedMessage}')]`;
      const message = await this.getBrowser().$(selector);
      await message.waitForDisplayed({ timeout: appConst.TIMEOUT.MEDIUM });
    } catch (err) {
      await this.handleError(
        `Wait for expected notification message: ${expectedMessage} - `,
        'err_exp_notification_message',
        err,
      );
    }
  }

  async doRightClickOnElement(element) {
    await element.moveTo();
    let x = await element.getLocation('x');
    let y = await element.getLocation('y');
    return await this.browser.performActions([
      {
        type: 'pointer',
        id: 'pointer1',
        parameters: { pointerType: 'mouse' },
        actions: [
          { type: 'pointerMove', origin: 'pointer', x: Math.floor(x), y: Math.floor(y) },
          { type: 'pointerDown', button: 2 },
          { type: 'pointerUp', button: 2 },
        ],
      },
    ]);
  }

  async doRightClick(selector) {
    let el = await this.findElement(selector);
    await el.moveTo();
    let x = await el.getLocation('x');
    let y = await el.getLocation('y');
    console.log('X:' + x + 'Y ' + y);
    return await this.browser.performActions([
      {
        type: 'pointer',
        id: 'pointer1',
        parameters: {
          pointerType: 'mouse',
        },
        actions: [
          { type: 'pointerMove', origin: 'pointer', x: Math.floor(x), y: Math.floor(y) },
          {
            type: 'pointerDown',
            button: 2,
          },
          {
            type: 'pointerUp',
            button: 2,
          },
        ],
      },
    ]);
  }

  // Clicks outside a modal dialog. The centre of 'Dialog.Overlay' is covered by the dialog content,
  // so a regular click() fails with 'element click intercepted'. W3C Actions API dispatches the click
  // at viewport coordinates near the left edge, where only the overlay is present.
  async clickOutsideDialog() {
    await this.waitForElementDisplayed(`//div[@data-component='Dialog.Overlay']`);
    await this.getBrowser().performActions([
      {
        type: 'pointer',
        id: 'pointer1',
        parameters: { pointerType: 'mouse' },
        actions: [
          { type: 'pointerMove', origin: 'viewport', x: 15, y: 400 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ]);
    await this.getBrowser().releaseActions();
  }

  async holdDownShiftAndPressArrowDown(count) {
    // holding down the Shift key
    await this.getBrowser().performActions([
      {
        type: 'key',
        id: 'keyboard',
        actions: [{ type: 'keyDown', value: Key.Shift }],
      },
    ]);

    // press ArrowDown key 'count' times
    for (let i = 1; i < count; i++) {
      await this.getBrowser().performActions([
        {
          type: 'key',
          id: 'keyboard',
          actions: [
            { type: 'keyDown', value: Key.ArrowDown },
            { type: 'keyUp', value: Key.ArrowDown },
          ],
        },
      ]);
      await this.getBrowser().pause(400);
    }

    await this.getBrowser().performActions([
      {
        type: 'key',
        id: 'keyboard',
        actions: [
          { type: 'keyUp', value: Key.Shift }, // Shift
        ],
      },
    ]);
  }

  alertAccept() {
    return this.getBrowser().acceptAlert();
  }

  async pressEscKey() {
    await this.keys('Escape');
  }

  async pressEnterKey() {
    await this.keys('Enter');
  }

  async pressArrowDown() {
    await this.keys('ArrowDown');
  }

  async pressArrowUp() {
    await this.keys('ArrowUp');
  }

  async pressBackspace() {
    await this.keys('\uE003');
  }

  async pressWhiteSpace() {
    await this.keys('\ue00D');
  }

  async pressArrowLeft() {
    await this.keys('\ue012');
  }

  async pressArrowRight() {
    await this.keys('\ue014');
  }

  async switchToFrame(selector) {
    try {
      await this.waitUntilDisplayed(selector, appConst.TIMEOUT.MEDIUM);
      let el = await this.findElement(selector);
      return await this.getBrowser().switchFrame(el);
    } catch (err) {
      await this.handleError('Tried to switch to the frame', 'err_switch_frame', err);
    }
  }

  async navigateBack() {
    return this.getBrowser().back();
  }

  async clickOnCloseBrowserTab() {
    return this.getBrowser().execute('window.close();');
  }

  execute(script) {
    return this.getBrowser().execute(script);
  }

  async doDoubleClick(selector) {
    try {
      let el = await this.findElement(selector);
      return await el.doubleClick();
    } catch (err) {
      throw Error('Error when doubleClick on the element' + err);
    }
  }

  //is checkbox selected...
  async isSelected(selector) {
    let elems = await this.findElements(selector);
    return await elems[0].isSelected();
  }

  refresh() {
    return this.getBrowser().refresh();
  }

  async isAlertOpen() {
    try {
      return await this.getBrowser().isAlertOpen();
    } catch (err) {
      console.log(err);
      await this.saveScreenshot('err_alert');
      return false;
    }
  }

  dismissAlert() {
    return this.getBrowser().dismissAlert();
  }

  acceptAlert() {
    return this.getBrowser().acceptAlert();
  }

  // checks the attribute value (actual value === expected value)
  async waitForAttributeValue(locator, attrName, expectedValue, ms = appConst.TIMEOUT.MEDIUM) {
    await this.getBrowser().waitUntil(
      async () => {
        let text = await this.getAttribute(locator, attrName);
        return text === expectedValue;
      },
      {
        timeout: ms,
        timeoutMsg: `Expected attribute ${attrName} is not set in the element ${locator}`,
      },
    );
  }

  async getBrowserStatus() {
    return await this.getBrowser().status();
  }

  async performScrollWithWheelActions(element, deltaY) {
    await this.browser.performActions([
      {
        type: 'wheel',
        id: 'wheel1',
        actions: [
          {
            type: 'scroll',
            origin: element,
            x: 0,
            y: 0,
            deltaX: 0, // horizontal scroll
            deltaY: deltaY,
          },
        ],
      },
    ]);
  }

  // Utility method for error handling
  async handleError(errorMessage, screenshotName, error) {
    const wrappedMessage = `${errorMessage}: ${error?.message ?? 'Unknown error'} `;

    if (Error.prototype.hasOwnProperty('cause')) {
      throw new Error(`${wrappedMessage}[screenshot]: ${screenshotName}`, { cause: error });
    }
    const wrapped = new Error(wrappedMessage);
    wrapped.cause = error;
    wrapped.screenshotTaken = error?.screenshotTaken;
    wrapped.screenshotName = error?.screenshotName;

    if (!wrapped.screenshotTaken) {
      wrapped.screenshotName = screenshotName;
      wrapped.screenshotTaken = true;
      wrapped.message += `[Screenshot]: ${screenshotName}`;
      await this.saveScreenshotUniqueName(wrapped.screenshotName);
    }
    throw wrapped;
  }

  async isMacOS() {
    const status = await this.getBrowserStatus();
    return status.os.name.includes('Mac');
  }

  async getXpMenuShadowHost() {
    try {
      const host = await this.findElement('xp-menu');
      await host.waitForExist({ timeout: appConst.TIMEOUT.MEDIUM });
      return host;
    } catch (err) {
      await this.handleError(
        'Home page, xp menu - failed to get shadow root',
        'err_home_page_shadow',
        err,
      );
    }
  }
}

module.exports = Page;
