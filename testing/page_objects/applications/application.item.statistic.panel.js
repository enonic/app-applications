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
            await this.handleError('Tried to get application-data-headers', 'err_get_app_data_headers', err);
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
            await this.handleError('App Statistic Panel - app name is not displayed in the panel', 'err_app_name_not_displayed', err);
        }
    }

    waitForSiteItemDataGroupDisplayed() {
        return this.waitForElementDisplayed(xpath.dataContainer + xpath.siteItemDataGroup, appConst.mediumTimeout);
    }

    async waitForAppNameNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(xpath.title, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('App Statistic Panel - app name should not be displayed in the panel', 'err_app_name_displayed', err);
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
            await this.saveScreenshotUniqueName('err_content_types_list');
            return [];
        }
    }

    async waitForContentTypesHeaderNotDisplayed() {
        try {
            let locator = xpath.main + "//ul[@class='data-list' and descendant::li[text()='Content Types']]";
            await this.waitForElementNotDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Content Types header should not be displayed in the statistics panel', 'err_content_types_header', err);
        }
    }

    async waitForContentTypesHeaderDisplayed() {
        try {
            let locator = xpath.main + "//ul[@class='data-list' and descendant::li[text()='Content Types']]";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Content Types header should be displayed in the statistics panel', 'err_content_types_header', err);
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
            await this.handleError('Parts header should not be displayed in the statistics panel', 'err_part_header', err);
        }
    }

    async waitForPartHeaderDisplayed() {
        try {
            let locator = xpath.main + "//ul[@class='data-list' and descendant::li[text()='Part']]";
            await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Parts header should be displayed in the statistics panel', 'err_part_header', err);
        }
    }

    getProviderDataHeaders() {
        return this.getTextInDisplayedElements(xpath.idProviderApplicationsHeaders);
    }

    async waitForProviderDataDisplayed() {
        try {
            return await this.waitForElementDisplayed(xpath.idProviderApplicationsHeaders, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Provider data should be displayed in the statistics panel', 'err_provider_data', err);
        }
    }

    // Expected list of headers: Content Types, Page, Part, Layout,Relationship Types
    async getSiteDataHeaders() {
        try {
            return await this.getTextInDisplayedElements(xpath.siteDataHeaders);
        } catch (err) {
            await this.handleError('Statistics panel - Site data headers', 'err_site_data_info', err);
        }
    }

    async waitForSiteDataDisplayed() {
        try {
            return await this.waitForElementDisplayed(xpath.siteDataHeaders, appConst.mediumTimeout);
        } catch (err) {
            await this.handleError('Site data should be displayed in the statistics panel', 'err_site_data', err);
        }
    }

    async clickOnStopActionMenuItem() {
        try {
            await this.waitForElementDisplayed(xpath.stopActionMenuItem, appConst.mediumTimeout);
            return await this.clickOnElement(xpath.stopActionMenuItem);
        } catch (err) {
            await this.handleError('Clicked on Stop menu item', 'err_click_stop_menu_item', err);
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
            await this.handleError('Tried to get the text from the drop-down button', 'err_get_text_dropdown', err);
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
            await this.handleError('Clicked on action drop-down menu', 'err_click_action_dropdown', err);
        }
    }

    async waitForStopMenuItemVisible() {
        try {
            return await this.waitForElementDisplayed(xpath.stopActionMenuItem, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Stop menu item should be displayed', 'stop_menu_item_not_visible', err);
        }
    }

    async waitForStopMenuItemNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(xpath.stopActionMenuItem, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Stop menu item should not be displayed', 'stop_menu_item_visible', err);
        }
    }

    async waitForStartMenuItemVisible() {
        try {
            return await this.waitForElementDisplayed(xpath.startActionMenuItem, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Start menu item should be displayed', 'start_menu_item_not_visible', err);
        }
    }
}

module.exports = ApplicationItemStatisticsPanel;
