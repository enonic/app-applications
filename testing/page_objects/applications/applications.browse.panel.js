const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LauncherPanel = require('../launcher.panel');

const XPATH = {
    container: "//div[contains(@id,'ApplicationBrowsePanel')]",
    launcherButton: "//button[contains(@class,'launcher-button')]",
    applicationsGridListUL: "//ul[contains(@id,'ApplicationsGridList')]",
    GRID_LIST_ITEM: "//li[contains(@class,'item-view-wrapper')]",
    toolbar: "//div[contains(@id,'Toolbar')]",
    contextMenu: "//ul[contains(@id,'TreeGridContextMenu')]",
    treeGridToolbarDiv: `//div[contains(@id,'ListBoxToolbar')]`,
    installButton: `//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Install')]]`,
    unInstallButton: `//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Uninstall')]]`,
    stopButton: "//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Stop')]]",
    startButton: `//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Start')]]`,
    selectAllCheckbox: "//div[contains(@id,'ListSelectionController')]",
    appState: "//div[contains(@id,'StatusBlock')]/span",
    checkedRowLi: `//li[contains(@class,'checkbox-left selected checked')]`,
    highlightedRow: `//li[contains(@class,'checkbox-left selected') and not(contains(@class,'checked')) ]`,
    selectionControllerCheckBox: `//div[contains(@id,'SelectionController')]`,
    selectionPanelToggler: "//button[contains(@id,'SelectionPanelToggler')]",
    numberInToggler: "//button[contains(@id,'SelectionPanelToggler')]/span",
    appStateByName: displayName => `${lib.TREE_GRID.rowByDisplayName(displayName)}${XPATH.appState}`,
    enabledContextMenuButton: name => {
        return `${XPATH.contextMenu}/li[contains(@id,'MenuItem') and not(contains(@class,'disabled')) and contains(.,'${name}')]`;
    },
    contextMenuItemByName: (name) => {
        return `${XPATH.contextMenu}/li[contains(@id,'MenuItem') and contains(.,'${name}')]`;
    },
    rowByDescription: description => `//li[contains(@class,'item-view-wrapper') and (descendant::p[contains(@class,'sub-name') and contains(.,'${description}')])]`,
    rowByDisplayName: displayName => `//li[contains(@class,'item-view-wrapper') and (descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')])]`,
    checkboxByDisplayName: displayName => `${XPATH.rowByDisplayName(displayName)}` + lib.DIV.CHECKBOX_DIV + '/label',
};

class AppBrowsePanel extends Page {

    get selectionControllerCheckBox() {
        return XPATH.container + XPATH.selectionControllerCheckBox;
    }

    get numberInToggler() {
        return XPATH.container + XPATH.numberInToggler;
    }

    get selectionPanelToggler() {
        return XPATH.container + XPATH.selectionPanelToggler;
    }

    async waitForGridLoaded(ms) {
        try {
            let timeout = typeof ms !== 'undefined' ? ms : appConst.mediumTimeout;
            await this.waitForElementDisplayed(XPATH.applicationsGridListUL, timeout);
            await this.waitForSpinnerNotVisible(appConst.mediumTimeout);
            console.log('applications browse panel is loaded')
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_grid');
            throw new Error(`Applications browse panel was not loaded, screenshot: ${screenshot} ` + err);
        }
    }

    waitForToolbarDisplayed(ms) {
        return this.waitForElementDisplayed(XPATH.toolbar, ms).catch(() => {
            throw new Error(`Content browse panel was not loaded in  ${ms}`);
        });
    }

    async clickOnRowByDescription(description) {
        try {
            const nameXpath = XPATH.rowByDescription(description);
            await this.waitForElementDisplayed(nameXpath, appConst.shortTimeout);
            await this.clickOnElement(nameXpath);
            return await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_grid_item');
            throw new Error(`Row with the app was not found, screenshot: ${screenshot} ` + err);
        }
    }

    async clickOnRowByDisplayName(displayName) {
        try {
            let nameXpath = XPATH.rowByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath, 3000);
            await this.clickOnElement(nameXpath);
            return await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_click_on_app');
            throw new Error(`Error when clicking on the row, screenshot: ${screenshot} ` + err);
        }
    }

    async getNumberInSelectionToggler() {
        try {
            await this.waitForElementDisplayed(this.numberInToggler, appConst.shortTimeout);
            return await this.getText(this.numberInToggler);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_number_selection_toggle');
            throw new Error(`The number in 'Selection toggle' , screenshot:${screenshot} ` + err)
        }
    }

    // Click on Show Selection/Hide Selection
    clickOnSelectionToggler() {
        return this.clickOnElement(this.selectionPanelToggler).catch(err => {
            throw new Error(`Error when clicking 'Selection toggle' ` + err);
        });
    }

    async isAppByDescriptionDisplayed(description) {
        try {
            return await this.isElementDisplayed(XPATH.rowByDescription(description));
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_app_in_grid');
            throw new Error(`Error occurred in isAppByDescriptionDisplayed, screenshot: ${screenshot} ` + err);
        }
    }

    async waitForAppByDescriptionDisplayed(description) {
        try {
            return await this.waitForElementDisplayed(XPATH.rowByDescription(description), appConst.shortTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_app_in_grid');
            throw new Error(`Application should be displayed in the app-grid, screenshot: ${screenshot} ` + err);
        }
    }

    async getNumberOfCheckedRows() {
        try {
            let result = await this.findElements(XPATH.checkedRowLi);
            return result.length;
        } catch (err) {
            throw new Error(`Error when getting selected rows ` + err);
        }
    }

    async waitForAppByDisplayNameDisplayed(appName) {
        try {
            await this.waitForElementDisplayed(XPATH.rowByDisplayName(appName), 1000)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName(`err_find_app`);
            throw new Error(`Item was not found! Screenshot: ${screenshot} ` + err);
        }
    }

    waitForRowByDescriptionVisible(description) {
        const nameXpath = XPATH.rowByDescription(description);
        return this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout).catch(() => {
            throw Error(`Row with the name ${description} is not visible in 3000ms.`)
        })
    }

    async clickOnSelectionControllerCheckbox() {
        try {
            await this.waitForElementDisplayed(this.selectionControllerCheckBox, appConst.mediumTimeout);
            await this.clickOnElement(this.selectionControllerCheckBox);
            return await this.pause(700);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_selection_controller');
            throw new Error(`App Browse Panel click on Selection controller, screenshot: ${screenshot} ` + err);
        }
    }

    //Wait for application with the description is not displayed in app-grid:
    waitForAppNotDisplayed(description) {
        return this.waitForElementNotDisplayed(XPATH.rowByDescription(description), appConst.shortTimeout).catch(err => {
            console.log(`item is still displayed:${description} ` + err);
            return false;
        });
    }

    //Wait for application with the displayName is not displayed in app-grid:
    waitForAppByDisplayNameNotDisplayed(displayName) {
        return this.waitForElementNotDisplayed(XPATH.rowByDisplayName(displayName), appConst.shortTimeout).catch(err => {
            console.log('Application is still displayed:' + displayName + ' ' + err);
            return false;
        });
    }

    async clickOnInstallButton() {
        try {
            await this.waitForElementEnabled(XPATH.installButton, appConst.mediumTimeout);
            return await this.clickOnElement(XPATH.installButton);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_browsepanel_install');
            throw new Error(`Install button is not enabled! screenshot:${screenshot} ` + err);
        }
    }

    clickOnUninstallButton() {
        return this.waitForElementEnabled(XPATH.unInstallButton, appConst.mediumTimeout).then(() => {
            return this.clickOnElement(XPATH.unInstallButton);
        }).catch(err => {
            throw new Error(`Uninstall button is not enabled  ! ${err}`);
        })
    }

    async clickOnStartButton() {
        try {
            await this.waitForElementEnabled(XPATH.startButton, appConst.mediumTimeout);
            await this.clickOnElement(XPATH.startButton);
            return await this.pause(1500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_browsepanel_start');
            throw new Error(`Start button is disabled!screenshot: ${screenshot} ` + err);
        }
    }

    async clickOnStopButton() {
        try {
            await this.waitForElementEnabled(XPATH.stopButton, appConst.mediumTimeout);
            await this.clickOnElement(XPATH.stopButton);
            return await this.pause(1500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_browsepanel_stop');
            throw new Error(`Stop button is disabled! screenshot:${screenshot} ` + err);
        }
    }

    waitForInstallButtonEnabled() {
        return this.waitForElementEnabled(XPATH.installButton, appConst.mediumTimeout).catch(err => {
            throw new Error('Button Install-app is not enabled! ' + err);
        });
    }

    waitForStartButtonEnabled() {
        return this.waitForElementEnabled(XPATH.startButton, appConst.mediumTimeout).catch(err => {
            throw new Error(`Button Start-app is not enabled ` + err);
        });
    }

    waitForStartButtonDisabled() {
        return this.waitForElementDisabled(XPATH.startButton, appConst.mediumTimeout).catch(err => {
            throw new Error(`Button Start-app is not disabled ` + err);
        });
    }

    async waitForStopButtonEnabled() {
        try {
            return await this.waitForElementEnabled(XPATH.stopButton, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_stop_button_should_be_enabled');
            throw new Error(`Button Stop-app is not enabled! screenshot: ${screenshot} ` + err);
        }
    }

    async waitForStopButtonDisabled() {
        try {
            return await this.waitForElementDisabled(XPATH.stopButton, appConst.mediumTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_stop_button_should_be_enabled');
            throw new Error(`Button Stop-app is not disabled! ${screenshot} ` + err);
        }
    }

    async rightClickOnRowByDisplayName(name) {
        try {
            const nameXpath = XPATH.rowByDisplayName(name) + "//div[contains(@id,'ApplicationsListViewer')]";
            await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
            await this.doRightClick(nameXpath);
            return await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_context_menu');
            throw new Error(`Do right click on the row, screenshot: ${screenshot} ` + err);
        }
    }

    waitForUninstallButtonEnabled() {
        return this.waitForElementEnabled(XPATH.unInstallButton, appConst.mediumTimeout).catch(err => {
            throw new Error('Uninstall button ' + err);
        });
    }

    waitForUninstallButtonDisabled() {
        return this.waitForElementDisabled(XPATH.unInstallButton, appConst.mediumTimeout).catch(err => {
            throw new Error('Uninstall button is not disabled ' + err);
        });
    }

    isInstallButtonEnabled() {
        return this.isElementEnabled(XPATH.installButton);
    }

    isUnInstallButtonEnabled() {
        return this.isElementEnabled(XPATH.unInstallButton);
    }

    isStartButtonEnabled() {
        return this.isElementEnabled(XPATH.startButton);
    }

    isStopButtonEnabled() {
        return this.isElementEnabled(XPATH.stopButton);
    }

    isUninstallButtonEnabled() {
        return this.isElementEnabled(XPATH.unInstallButton);
    }

    //clicks on 'select all' checkbox
    async clickOnSelectAllCheckbox() {
        try {
            let checkboxXpath = XPATH.treeGridToolbarDiv + XPATH.selectAllCheckbox;
            await this.waitForElementDisplayed(checkboxXpath, appConst.mediumTimeout);
            await this.clickOnElement(checkboxXpath);
            return await this.pause(500);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_select_all_checkbox');
            throw new Error(`Select all checkbox was not found, screenshot: ${screenshot}  ` + err);
        }
    }

    async clickOnCheckboxAndSelectRowByDisplayName(displayName) {
        const displayNameXpath = XPATH.checkboxByDisplayName(displayName);
        try {
            await this.waitForElementDisplayed(displayNameXpath, appConst.mediumTimeout);
            await this.clickOnElement(displayNameXpath);
            return await this.pause(500);
        } catch (err) {
            throw new Error(`Row with the displayName ${displayName} was not found.` + err)
        }
    }

    async pressArrowDownKey() {
        try {
            await this.keys('Arrow_Down');
            return await this.pause(500);
        } catch (err) {
            throw new Error('Error when clicking on Arrow Down key')
        }
    }

    pressArrowUpKey() {
        return this.keys('Arrow_Up').then(() => {
            return this.pause(500);
        }).catch(err => {
            throw new Error('Error when clicking on Arrow Up key ' + err);
        });
    }

    pressEscKey() {
        return this.keys('Escape').then(() => {
            return this.pause(500);
        }).catch(err => {
            throw new Error('Error when clicking on Esc key ' + err);
        });
    }

    async waitForContextMenuNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(XPATH.contextMenu, appConst.shortTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_close_context_menu');
            throw new Error(`Browse context menu was not closed! screenshot:${screenshot}` + err)
        }
    }

    async waitForContextMenuDisplayed() {
        try {
            await this.waitForElementDisplayed(XPATH.contextMenu, appConst.shortTimeout)
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_open_context_menu');
            throw new Error('Context menu is not visible' + err);
        }
    }

    async isRowByIndexChecked(rowNumber) {
        let locator = `//li[contains(@class,'item-view-wrapper')]`;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        let listItems = await this.findElements(locator);
        let attr = await listItems[rowNumber].getAttribute('class');
        return attr.includes('checked');
    }

    //throw exception after the timeout
    waitForContextMenuItemDisabled(name) {
        let menuItemXpath = XPATH.contextMenuItemByName(name);
        return this.waitForElementDisplayed(menuItemXpath, 3000).catch(err => {
            throw Error('Failed to find context menu item ' + name);
        }).then(() => {
            return this.browser.waitUntil(() => {
                return this.getAttribute(menuItemXpath, 'class').then(result => {
                    return result.includes('disabled');
                })
            }, {timeout: appConst.mediumTimeout, timeoutMsg: 'context menu item is not disabled in 3000 ms'});
        })
    }


    async waitForContextMenuItemEnabled(menuItem) {
        try {
            let nameXpath = XPATH.enabledContextMenuButton(menuItem);
            await this.waitForElementDisplayed(nameXpath, appConst.shortTimeout)
        } catch (err) {
            throw new Error(`Menu item is not enabled! ` + menuItem)
        }
    }

    async getApplicationState(appName) {
        try {
            let stateXpath = XPATH.appStateByName(appName);
            await this.waitForElementDisplayed(stateXpath, appConst.mediumTimeout);
            return await this.getText(stateXpath);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_app_state');
            throw new Error(`App Browse panel, App-state screenshot: ${screenshot} ` + err);
        }
    }

    async getApplicationDisplayNames() {
        try {
            let displayNameXpath = XPATH.applicationsGridListUL + XPATH.GRID_LIST_ITEM + lib.H6_DISPLAY_NAME;
            return await this.getTextInDisplayedElements(displayNameXpath);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_app_display_names');
            throw new Error(`Error occurred in getApplicationDisplayNames, screenshot:${screenshot} ` + err);
        }
    }

    async doOpenLauncherPanel() {
        await this.waitForElementDisplayed(XPATH.launcherButton, appConst.shortTimeout);
        await this.clickOnElement(XPATH.launcherButton);
        let launcherPanel = new LauncherPanel();
        let isLoaded = await launcherPanel.waitForPanelDisplayed(appConst.shortTimeout);
        if (!isLoaded) {
            throw new Error('Launcher Panel was not loaded');
        }
    }

    //wait for the "Show Selection" circle appears in the toolbar
    async waitForSelectionTogglerVisible() {
        try {
            await this.waitForElementDisplayed(this.selectionPanelToggler, appConst.mediumTimeout);
            let attr = await this.getAttribute(this.selectionPanelToggler, 'class');
            return attr.includes('any-selected');
        } catch (err) {
            return false;
        }
    }

    async waitForSelectionTogglerNotVisible() {
        try {
            await this.waitForElementNotDisplayed(this.selectionPanelToggler, appConst.mediumTimeout);
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_selection_toggler_should_not_visible');
            throw new Error(`Selection toggle should not be visible, screenshot:${screenshot} ` + err);
        }
    }

    async waitForSelectionControllerPartial() {
        let selector = this.selectionControllerCheckBox + `//input[@type='checkbox']`;
        await this.getBrowser().waitUntil(async () => {
            let text = await this.getAttribute(selector, 'class');
            return text.includes('partial');
        }, {timeout: appConst.shortTimeout, timeoutMsg: "Selection Controller checkBox should displayed as partial"});
    }

    async isSelectionControllerPartial() {
        let selector = this.selectionControllerCheckBox + `//input[@type='checkbox']`;
        let text = await this.getAttribute(selector, 'class');
        return text.includes('partial');
    }

    // returns true if 'Selection Controller' checkbox is selected:
    isSelectionControllerSelected() {
        let selector = this.selectionControllerCheckBox + `//input[@type='checkbox']`;
        return this.isSelected(selector);
    }

    async isRowChecked(appDisplayName) {
        let checkBoxLocator = XPATH.rowByDisplayName(appDisplayName) + lib.DIV.CHECKBOX_DIV + lib.INPUTS.CHECKBOX_INPUT;
        let checkboxElements = await this.findElements(checkBoxLocator);
        if (checkboxElements === 0) {
            throw new Error('Checkbox was not found!');
        }
        return await checkboxElements[0].isSelected();
    }

    async isRowHighlighted(appDisplayName) {
        let locator = lib.TREE_GRID.rowByDisplayName(appDisplayName);
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        let attribute = await this.getAttribute(locator, 'class');
        return attribute.includes('selected') && !attribute.includes('checked');
    }

}

module.exports = AppBrowsePanel;
