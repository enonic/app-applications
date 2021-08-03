const webDriverHelper = require('../libs/WebDriverHelper');
const appConst = require('../libs/app_const');
const fs = require('fs');
const path = require('path');

class Page {
    constructor() {
        this.browser = webDriverHelper.browser;
    }

    getBrowser() {
        return this.browser;
    }

    // value: string | string[]
    keys(value) {
        return this.browser.keys(value);
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
        let pr = elements.map(el => el.isDisplayed());
        return Promise.all(pr).then(result => {
            return elements.filter((el, i) => result[i]);
        });
    }

    pause(ms) {
        return this.browser.pause(ms);
    }

    async clickOnElement(selector) {
        let element = await this.findElement(selector);
        await element.waitForDisplayed({timeout: 2000});
        return await element.click();
    }

    async getText(selector) {
        let element = await this.findElement(selector);
        return await element.getText();
    }

    async getTextInElements(selector) {
        let strings = [];
        let elements = await this.findElements(selector);
        elements.forEach(el => {
            strings.push(el.getText());
        });
        return Promise.all(strings);
    }

    async getTextInDisplayedElements(selector) {
        let strings = [];
        let elements = await this.getDisplayedElements(selector);
        elements.forEach(el => {
            strings.push(el.getText());
        });
        return Promise.all(strings);
    }

    async typeTextInInput(selector, text) {
        let inputElement = await this.findElement(selector);

        await inputElement.setValue(text);
        await this.pause(300);
        let value = await inputElement.getValue();
        //workaround for issue in WebdriverIO
        if (value !== text) {
            await inputElement.setValue(text);
            await this.pause(300);
        }
        return await this.pause(300);
    }

    async getTextInInput(selector) {
        let inputElement = await this.findElement(selector);
        return await inputElement.getValue(selector);
    }

    async clearInputText(selector) {
        let inputElement = await this.findElement(selector);
        await inputElement.waitForDisplayed({timeout: 1500});
        await inputElement.clearValue();
        return await inputElement.pause(300);
    }

    saveScreenshot(name) {
        let screenshotsDir = path.join(__dirname, '/../build/mochawesome-report/screenshots/');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        return this.browser.saveScreenshot(screenshotsDir + name + '.png').then(() => {
            console.log('screenshot is saved ' + name);
        }).catch(err => {
            console.log('screenshot was not saved ' + screenshotsDir + ' ' + err);
        })
    }

    async isElementDisplayed(selector) {
        let element = await this.findElement(selector);
        return element.isDisplayed();
    }

    async isElementEnabled(selector) {
        let element = await this.findElement(selector);
        return await element.isEnabled();
    }

    async waitForElementEnabled(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForEnabled({timeout: ms});
    }

    async waitForElementDisabled(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForEnabled({timeout: ms, reverse: true});
    }

    async waitForElementNotDisplayed(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForDisplayed({timeout: ms, reverse: true});
    }

    async waitForElementDisplayed(selector, ms) {
        let element = await this.findElement(selector);
        return await element.waitForDisplayed({timeout: ms});
    }

    async waitForSpinnerNotVisible(ms) {
        let timeout;
        timeout = ms === undefined ? appConst.longTimeout : ms;
        let message = "Spinner still displayed! timeout is " + timeout;
        await this.browser.waitUntil(async () => {
            return await this.isElementNotDisplayed("//div[@class='spinner']");
        }, {timeout: timeout, timeoutMsg: message});
    }

    waitUntilElementNotVisible(selector, timeout) {
        let message = "Element still displayed! timeout is " + timeout + "  " + selector;
        return this.browser.waitUntil(() => {
            return this.isElementNotDisplayed(selector);
        }, {timeout: timeout, timeoutMsg: message});
    }

    isElementNotDisplayed(selector) {
        return this.getDisplayedElements(selector).then(result => {
            return result.length == 0;
        })
    }

    async getAttribute(selector, attributeName) {
        let element = await this.findElement(selector);
        return element.getAttribute(attributeName);
    }

    async waitForNotificationMessage() {
        try {
            let notificationXpath = "//div[contains(@id,'NotificationContainer')]//div[@class='notification-content']";
            await this.getBrowser().waitUntil(async () => {
                return await this.isElementDisplayed(notificationXpath);
            }, {timeout: appConst.mediumTimeout});
            await this.pause(300);
            let result = await this.getTextInElements(notificationXpath);
            return result[0];
        } catch (err) {
            throw new Error('Error when wait for notification message: ' + err);
        }
    }

    waitForExpectedNotificationMessage(expectedMessage) {
        let selector = `//div[contains(@id,'NotificationMessage')]//div[contains(@class,'notification-content') and contains(.,'${expectedMessage}')]`;
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout).catch(err => {
            this.saveScreenshot('err_notification_mess');
            throw new Error('expected notification message was not shown! ' + err);
        })
    }

    waitForErrorNotificationMessage() {
        let selector = `//div[contains(@id,'NotificationMessage') and @class='notification error']//div[contains(@class,'notification-content')]`;
        return this.waitForElementDisplayed(selector, appConst.mediumTimeout).then(() => {
            return this.getText(selector);
        })
    }

    async doRightClick(selector) {
        let el = await this.findElement(selector);
        await el.moveTo();
        let x = await el.getLocation('x');
        let y = await el.getLocation('y');
        console.log("X:" + x + "Y: " + y);
        return await this.browser.performActions([{
            type: 'pointer',
            id: 'pointer1',
            parameters: {
                pointerType: 'mouse'
            },
            actions: [
                {type: "pointerMove", origin: "pointer", "x": Math.floor(x), "y": Math.floor(y)},
                {
                    type: 'pointerDown',
                    button: 2
                }, {
                    type: 'pointerUp',
                    button: 2
                }]
        }]);
    }

    async isFocused(selector) {
        let el = await this.findElement(selector);
        return await el.isFocused();
    }

    //is checkbox selected...
    async isSelected(selector) {
        let elems = await this.findElements(selector);
        return await elems[0].isSelected();
    }
}

module.exports = Page;
