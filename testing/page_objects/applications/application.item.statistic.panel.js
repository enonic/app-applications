const page = require('../page');
const elements = require('../../libs/elements');
const dialog = {
    container: `//div[contains(@id,'NewContentDialog')]`,
};

const xpath = {
    main: `//div[contains(@id,'ApplicationItemStatisticsPanel')]`,
    title: `//div[contains(@id,'ItemStatisticsHeader')]/h1[contains(@class,'title')]`,
    dropDownButton: `//div[contains(@id,'ActionMenu')]//div[contains(@class,'drop-down-button')]`,
    dataContainer: `//div[contains(@class,'application-data-container')]`,
    contentTypes: `//ul[@class='data-list' and descendant::li[text()='Content Types']]//span`,
    applicationDataHeaders: `//div[contains(@class,'application')]//li[@class='list-header']`,
    idProviderApplicationsHeaders: `//div[contains(@id,'ItemDataGroup') and descendant::h2[text()='ID Provider Applications']]//li[@class='list-header']`,
    stopActionMenuItem: `//div[contains(@id,'ActionMenu')]//li[contains(@id,'ActionMenuItem') and text()='Stop']`,
    startActionMenuItem: `//div[contains(@id,'ActionMenu')]//li[contains(@id,'ActionMenuItem') and text()='Start']`,
    siteDataHeaders: `//div[contains(@id,'ApplicationItemStatisticsPanel')]/div[contains(@class,'application-data-container')]/div[contains(@class,'site')]//li[contains(@class,'list-header')]`,
};

var applicationItemStatisticsPanel = Object.create(page, {

    contentTypes: {
        get: function () {
            return `${xpath.main}${xpath.dataContainer}${xpath.contentTypes}`;
        }
    },
    getApplicationDataHeaders: {
        value: function () {
            let selector = `${xpath.main}${xpath.dataContainer}${xpath.applicationDataHeaders}`;
            return this.getText(selector).catch(err => {
                throw new Error('Error while getting application-data-headers: ' + err);
            })
        }
    },
    getDropDownButtonText: {
        value: function () {
            let selector = `${xpath.main}${xpath.dropDownButton}`;
            return this.getText(selector).catch(err => {
                throw new Error('error while getting text from the button: ' + err);
            })
        }
    },
    clickOnActionDropDownMenu: {
        value: function () {
            let selector = `${xpath.main}${xpath.dropDownButton}`;
            return this.doClick(selector).catch(err => {
                throw new Error('error when clicking on action menu: ' + err);
            })
        }
    },
    waitForStopMenuItemVisible: {
        value: function () {
            return this.waitForVisible(xpath.stopActionMenuItem).catch(err => {
                console.log(err);
                this.saveScreenshot("stop_menu_item_not_visible");
                return false;
            })
        }
    },
    waitForStartMenuItemVisible: {
        value: function () {
            return this.waitForVisible(xpath.startActionMenuItem).catch(err => {
                console.log(err);
                this.saveScreenshot("stop_menu_item_not_visible");
                return false;
            })
        }
    },
    clickOnStopActionMenuItem: {
        value: function () {
            this.doClick(xpath.stopActionMenuItem).catch(err => {
                console.log(err);
                throw new Error("Error when clicking on Stop menu item");

            })
        }
    },
    clickOnStartActionMenuItem: {
        value: function () {
            this.doClick(xpath.startActionMenuItem).catch(err => {
                console.log(err);
                throw new Error("Error when clicking on Start menu item");

            })
        }
    },
    getSiteDataHeaders: {
        value: function () {
            return this.getTextFromElements(xpath.siteDataHeaders);
        }
    },
    getProviderDataHeaders: {
        value: function () {
            return this.getText(xpath.idProviderApplicationsHeaders);
        }
    },
    getContentTypes: {
        value: function () {
            return this.isVisible(this.contentTypes).then(result => {
                if (result) {
                    return this.getText(this.contentTypes);
                } else {
                    return [];
                }

            }).catch(err => {
                throw new Error('error while getting names of Content Types: ' + err);
            })
        }
    },
    getApplicationName: {
        value: function () {
            return this.getText(xpath.title);
        }
    },
});

module.exports = applicationItemStatisticsPanel;
