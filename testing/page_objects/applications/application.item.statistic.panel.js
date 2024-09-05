const Page = require('../page');
const appConst = require('../../libs/app_const');

const xpath = {
    main: "//div[contains(@id,'ApplicationItemStatisticsPanel')]",
    title: "//div[contains(@id,'ApplicationItemStatisticsHeader')]//h1[contains(@class,'title')]",
    dropDownButton: "//div[contains(@id,'ActionMenu')]//div[contains(@class,'drop-down-button')]",
    dataContainer: "//div[contains(@class,'application-data-container')]",
    siteItemDataGroup: "//div[contains(@id,'ItemDataGroup') and child::h2[contains(.,'Site')]]",
    applicationItemDataGroup: "//div[contains(@id,'ItemDataGroup') and child::h2[text()='Application']]",
    contentTypes: "//ul[@class='data-list' and descendant::li[text()='Content Types']]//span",
    parts: "//ul[@class='data-list' and descendant::li[text()='Part']]//span",
    applicationDataHeaders: "//li[@class='list-header']",
    idProviderApplicationsHeaders: `//div[contains(@id,'ItemDataGroup') and descendant::h2[text()='ID Provider Applications']]//li[@class='list-header']`,
    stopActionMenuItem: `//div[contains(@id,'ActionMenu')]//li[contains(@id,'MenuItem') and text()='Stop']`,
    startActionMenuItem: `//div[contains(@id,'ActionMenu')]//li[contains(@id,'MenuItem') and text()='Start']`,
    siteDataHeaders: "//div[contains(@id,'ApplicationItemStatisticsPanel')]/div[contains(@class,'application-data-container')]/div[contains(@class,'site')]//li[contains(@class,'list-header')]",
};

class ApplicationItemStatisticsPanel extends Page {

    //Site data-group, content types list
    get contentTypes() {
        return xpath.main + xpath.dataContainer + xpath.siteItemDataGroup + xpath.contentTypes;
    }

    get parts() {
        return xpath.main + xpath.dataContainer + xpath.siteItemDataGroup + xpath.parts;
    }

    // Application data-group(Installed,Version,Key,System Required)
    async getApplicationDataHeaders() {
        try {
            let selector = xpath.main + xpath.dataContainer + xpath.applicationItemDataGroup + xpath.applicationDataHeaders;
            return await this.getTextInElements(selector);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('stat_panel');
            throw new Error('Error while getting application-data-headers, screenshot: ' + screenshot + '  ' + err);
        }
    }

    //return the application's name
    async getApplicationName() {
        await this.waitForAppNameDisplayed();
        return await this.getText(xpath.title);
    }

    async waitForAppNameDisplayed() {
        try {
            return await this.waitForElementDisplayed(xpath.title, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('stat_panel');
            throw  new Error("App Statistic Panel - app name is not displayed in the panel, screenshot: " + screenshot + ' ' + err);
        }
    }

    waitForSiteItemDataGroupDisplayed() {
        return this.waitForElementDisplayed(xpath.dataContainer + xpath.siteItemDataGroup, appConst.mediumTimeout);
    }

    async waitForAppNameNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(xpath.title, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('stat_panel');
            throw  new Error("App Statistic Panel - app name should not be displayed in the panel, screenshot: " + screenshot + ' ' + err);
        }
    }

    // return list of names of content types
    async getContentTypes() {
        try {
            // Wait for list of content types is displayed
            await this.waitForElementDisplayed(this.contentTypes, appConst.mediumTimeout);
            return await this.getTextInElements(this.contentTypes);
        } catch (err) {
            // otherwise returns empty list:
            let screenshot = await this.saveScreenshotUniqueName('content_types_list');
            return [];
        }
    }

    async waitForContentTypesHeaderNotDisplayed() {
        try {
            let locator = xpath.main + "//ul[@class='data-list' and descendant::li[text()='Content Types']]";
            await this.waitForElementNotDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('content_types_header');
            throw new Error('Content Types header should not be displayed in the statistics panel, screenshot:' + screenshot + ' ' + err);
        }
    }

    async waitForContentTypesHeaderDisplayed() {
        try {
            let locator = xpath.main + "//ul[@class='data-list' and descendant::li[text()='Content Types']]";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('content_types_header');
            throw new Error('Content Types header should  be displayed in the statistics panel, screenshot:' + screenshot + ' ' + err);
        }
    }

    async getParts() {
        try {
            // Wait for list of content types is displayed
            await this.waitForElementDisplayed(this.parts, appConst.shortTimeout);
            return await this.getTextInElements(this.parts);
        } catch (err) {
            // otherwise returns empty list:
            await this.saveScreenshotUniqueName(appConst.generateRandomName('parts_list_empty'));
            return [];
        }
    }

    async waitForPartHeaderNotDisplayed() {
        try {
            let locator = xpath.main + "//ul[@class='data-list' and descendant::li[text()='Part']]";
            await this.waitForElementNotDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('content_types_header');
            throw new Error('Parts header should not be displayed in the statistics panel, screenshot:' + screenshot + ' ' + err);
        }
    }

    async waitForPartHeaderDisplayed() {
        try {
            let locator = xpath.main + "//ul[@class='data-list' and descendant::li[text()='Part']]";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('content_types_header');
            throw new Error('Parts header should  be displayed in the statistics panel, screenshot:' + screenshot + ' ' + err);
        }
    }


    getProviderDataHeaders() {
        return this.getTextInDisplayedElements(xpath.idProviderApplicationsHeaders);
    }

    async waitForProviderDataDisplayed() {
        try {
            return await this.waitForElementDisplayed(xpath.idProviderApplicationsHeaders, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_provider_data');
            throw new Error('Provider data should be displayed in the statistics panel, screenshot: ' + screenshot + ' ' + err);
        }
    }

    // Expected list of headers: Content Types, Page, Part, Layout,Relationship Types
    async getSiteDataHeaders() {
        try {
            return this.getTextInDisplayedElements(xpath.siteDataHeaders);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_site_data_info');
            throw new Error("Statistics panel - Site data headers, screenshot: " + screenshot + ' ' + err);
        }
    }

    async waitForSiteDataDisplayed() {
        try {
            return await this.waitForElementDisplayed(xpath.siteDataHeaders, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_site_data');
            throw new Error('Site data should be displayed in the statistics panel, screenshot: ' + screenshot + ' ' + err);
        }
    }

    async clickOnStopActionMenuItem() {
        try {
            await this.waitForElementDisplayed(xpath.stopActionMenuItem, appConst.mediumTimeout);
            return await this.clickOnElement(xpath.stopActionMenuItem);
        } catch (err) {
            await this.saveScreenshot('err_stop_menu_item');
            throw new Error("Error when clicking on Stop menu item" + err);
        }
    }

    clickOnStartActionMenuItem() {
        return this.clickOnElement(xpath.startActionMenuItem).catch(err => {
            throw new Error("Error when clicking on Start menu item");
        })
    }

    async getDropDownButtonText() {
        try {
            let locator = xpath.main + xpath.dropDownButton;
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
            return await this.getText(locator);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('stat_panel_dropdown_btn');
            throw new Error('error while getting text from the button,screenshot: ' + screenshot + ' ' + err);
        }
    }

    waitForApplicationStatus(state) {
        let selector = xpath.main + xpath.dropDownButton;
        return this.getBrowser().waitUntil(() => {
            return this.getText(selector).then(text => {
                return text === state;
            });
        }, {timeout: appConst.mediumTimeout, timeoutMsg: "Expected state should be " + state});
    }

    async clickOnActionDropDownMenu() {
        try {
            let selector = xpath.main + xpath.dropDownButton;
            await this.waitForElementDisplayed(selector, appConst.mediumTimeout);
            await this.clickOnElement(selector);
            return await this.pause(300);
        } catch (err) {
            await this.saveScreenshot("err_action_dropdown");
            throw new Error('error when clicking on action menu: ' + err);
        }
    }

    async waitForStopMenuItemVisible() {
        try {
            return await this.waitForElementDisplayed(xpath.stopActionMenuItem, appConst.shortTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('stop_menu_item_not_visible');
            throw new Error('Stop menu item should be displayed: screenshot' + screenshot + '  ' + err);
        }
    }

    async waitForStopMenuItemNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(xpath.stopActionMenuItem, appConst.shortTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('stop_menu_item_visible');
            throw new Error('Stop menu item should not be displayed: screenshot' + screenshot + '  ' + err);
        }
    }

    async waitForStartMenuItemVisible() {
        try {
            return await this.waitForElementDisplayed(xpath.startActionMenuItem, appConst.shortTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('start_menu_item_not_visible');
            throw new Error('Start menu item should be displayed: screenshot' + screenshot + '  ' + err);
        }
    }
}

module.exports = ApplicationItemStatisticsPanel;
