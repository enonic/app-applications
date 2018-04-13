var page = require('../page');
var elements = require('../../libs/elements');
var dialog = {
    container: `//div[contains(@id,'NewContentDialog')]`,
};

const xpath = {
    main: `//div[contains(@id,'ApplicationItemStatisticsPanel')]`,
    title: `//div[contains(@id,'ItemStatisticsHeader')]/h1[contains(@class,'title')]`,
    dropDownButton: `//div[contains(@id,'ActionMenu')]//div[contains(@class,'drop-down-button')]`,
    dataContainer: `//div[contains(@class,'application-data-container')]`,
    contentTypes: `//ul[@class='data-list' and descendant::li[text()='Content Types']]//span`,
    applicationDataHeaders: `//div[contains(@class,'application')]//li[@class='list-header']`,
    providerDataHeaders: `//div[contains(@class,'providers')]//li[@class='list-header']`,
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
            return this.getText(selector).catch(err=> {
                throw new Error('Error while getting application-data-headers: ' + err);
            })
        }
    },
    getDropDownButtonText: {
        value: function () {
            let selector = `${xpath.main}${xpath.dropDownButton}`;
            return this.getText(selector).catch(err=> {
                throw new Error('error while getting text from the button: ' + err);
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
            return this.getText(xpath.providerDataHeaders);
        }
    },
    getContentTypes: {
        value: function () {
            return this.getText(this.contentTypes).catch(err=> {
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
