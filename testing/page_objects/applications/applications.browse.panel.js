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
            await this.handleError('Applications browse panel was not loaded', 'err_browse_panel', err);
        }
    }

    async clickOnRowByDescription(description) {
        try {
            const nameXpath = XPATH.rowByDescription(description);
            await this.waitForElementDisplayed(nameXpath, appConst.shortTimeout);
            await this.clickOnElement(nameXpath);
            return await this.pause(500);
        } catch (err) {
            await this.handleError(`Row with the app ${description} was not found`, 'err_row_by_description', err);
        }
    }

    async clickOnRowByDisplayName(displayName) {
        try {
            let nameXpath = XPATH.rowByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath, 3000);
            await this.clickOnElement(nameXpath);
            return await this.pause(500);
        } catch (err) {
            await this.handleError(`Row with the app ${displayName} was not found`, 'err_row_by_display_name', err);
        }
    }

    async getNumberInSelectionToggler() {
        try {
            await this.waitForElementDisplayed(this.numberInToggler, appConst.shortTimeout);
            return await this.getText(this.numberInToggler);
        } catch (err) {
            await this.handleError('Number in Selection toggle', 'err_number_selection_toggle', err);
        }
    }

    // Click on Show Selection/Hide Selection
    async clickOnSelectionToggler() {
        try {
            await this.clickOnElement(this.selectionPanelToggler);
        } catch (err) {
            await this.handleError("Click on Selection toggle", 'err_click_selection_toggle', err);
        }
    }

    async isAppByDescriptionDisplayed(description) {
        try {
            return await this.isElementDisplayed(XPATH.rowByDescription(description));
        } catch (err) {
            await this.handleError(`Application with the description ${description} should be is displayed in the app-grid`,
                `err_app_in_grid`, err);
        }
    }

    async waitForAppByDescriptionDisplayed(description) {
        try {
            return await this.waitForElementDisplayed(XPATH.rowByDescription(description), appConst.shortTimeout)
        } catch (err) {
            await this.handleError(`Application with the description ${description} should be displayed in the app-grid`, `err_app`, err);
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
            await this.handleError(`Application with the name ${appName} should be displayed in the app-grid`, `err_app`, err);
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
            await this.handleError('Clicked on Selection controller checkbox', 'err_click_selection_controller', err);
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
            await this.handleError('Clicked on Install button', 'err_click_install_button', err);
        }
    }

    async clickOnUninstallButton() {
        try {
            await this.waitForElementEnabled(XPATH.unInstallButton, appConst.mediumTimeout);
            await this.clickOnElement(XPATH.unInstallButton);
        } catch (err) {
            await this.handleError('Clicked on Uninstall button', 'err_click_uninstall_button', err);
        }
    }

    async clickOnStartButton() {
        try {
            await this.waitForElementEnabled(XPATH.startButton, appConst.mediumTimeout);
            await this.clickOnElement(XPATH.startButton);
            return await this.pause(1500);
        } catch (err) {
            await this.handleError('Clicked on Start button', 'err_click_start_button', err);
        }
    }

    async clickOnStopButton() {
        try {
            await this.waitForElementEnabled(XPATH.stopButton, appConst.mediumTimeout);
            await this.clickOnElement(XPATH.stopButton);
            return await this.pause(1500);
        } catch (err) {
            await this.handleError('Clicked on Stop button', 'err_click_stop_button', err);
        }
    }

    waitForInstallButtonEnabled() {
        return this.waitForElementEnabled(XPATH.installButton, appConst.mediumTimeout).catch(err => {
            throw new Error('Button Install-app is not enabled! ' + err);
        });
    }

    async waitForStartButtonEnabled() {
        try {
            await this.waitForElementEnabled(XPATH.startButton, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError('Button Start-app is not enabled', 'err_start_button_enabled', err);
        }
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
            await this.handleError('Button Stop-app is not enabled', 'err_stop_button_enabled', err);
        }
    }

    async waitForStopButtonDisabled() {
        try {
            return await this.waitForElementDisabled(XPATH.stopButton, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError('Button Stop-app is not disabled', 'err_stop_button_disabled', err);
        }
    }

    async rightClickOnRowByDisplayName(name) {
        try {
            const nameXpath = XPATH.rowByDisplayName(name) + "//div[contains(@id,'ApplicationsListViewer')]";
            await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
            await this.doRightClick(nameXpath);
            return await this.pause(500);
        } catch (err) {
            await this.handleError(`Right click on the row ${name}`, 'err_right_click_row', err);
        }
    }

    async waitForUninstallButtonEnabled() {
        try {
            await this.waitForElementEnabled(XPATH.unInstallButton, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError('Button Uninstall-app is not enabled', 'err_uninstall_button_enabled', err);
        }
    }

    async waitForUninstallButtonDisabled() {
        try {
            await this.waitForElementDisabled(XPATH.unInstallButton, appConst.mediumTimeout)
        } catch (err) {
            await this.handleError('Button Uninstall-app is not disabled', 'err_uninstall_button_disabled', err);
        }
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
            await this.handleError('Clicked on Select All checkbox', 'err_click_select_all_checkbox', err);
        }
    }

    async clickOnCheckboxAndSelectRowByDisplayName(displayName) {
        const displayNameXpath = XPATH.checkboxByDisplayName(displayName);
        try {
            await this.waitForElementDisplayed(displayNameXpath, appConst.mediumTimeout);
            await this.clickOnElement(displayNameXpath);
            return await this.pause(500);
        } catch (err) {
            await this.handleError(`Clicked on checkbox for the row ${displayName}`, 'err_click_checkbox_row', err);
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

    async pressArrowUpKey() {
        await this.keys('Arrow_Up');
        return await this.pause(400);
    }

    async pressEscKey() {
        await this.keys('Escape');
        return await this.pause(500);
    }

    async waitForContextMenuNotDisplayed() {
        try {
            return await this.waitForElementNotDisplayed(XPATH.contextMenu, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Browse context menu was not closed', 'err_close_context_menu', err);
        }
    }

    async waitForContextMenuDisplayed() {
        try {
            await this.waitForElementDisplayed(XPATH.contextMenu, appConst.shortTimeout)
        } catch (err) {
            await this.handleError('Browse context menu was not opened', 'err_open_context_menu', err);
        }
    }

    async isRowByIndexChecked(rowNumber) {
        let locator = `//li[contains(@class,'item-view-wrapper')]`;
        await this.waitForElementDisplayed(locator, appConst.mediumTimeout);
        let listItems = await this.findElements(locator);
        let attr = await listItems[rowNumber].getAttribute('class');
        return attr.includes('checked');
    }

    // throw exception after the timeout
    async waitForContextMenuItemDisabled(name) {
        try {
            let menuItemLocator = XPATH.contextMenuItemByName(name);
            await this.getBrowser().waitUntil(async () => {
                let atr = await this.getAttribute(menuItemLocator, 'class');
                return atr.includes('disabled');
            }, {timeout: appConst.mediumTimeout, timeoutMsg: 'The context menu item is not disabled!'});
        } catch (err) {
            await this.handleError(`Context menu item ${name} should be disabled`, 'err_context_menu_item_disabled', err);
        }
    }


    async waitForContextMenuItemEnabled(menuItem) {
        try {
            let nameXpath = XPATH.enabledContextMenuButton(menuItem);
            await this.waitForElementDisplayed(nameXpath, appConst.shortTimeout)
        } catch (err) {
            await this.handleError(`Context menu item ${menuItem} should be enabled`, 'err_context_menu_item_enabled', err);
        }
    }

    async getApplicationState(appName) {
        try {
            let stateXpath = XPATH.appStateByName(appName);
            await this.waitForElementDisplayed(stateXpath, appConst.mediumTimeout);
            return await this.getText(stateXpath);
        } catch (err) {
            await this.handleError(`Getting application state for ${appName}`, 'err_get_app_state', err);
        }
    }

    async getApplicationDisplayNames() {
        try {
            let displayNameXpath = XPATH.applicationsGridListUL + XPATH.GRID_LIST_ITEM + lib.H6_DISPLAY_NAME;
            return await this.getTextInDisplayedElements(displayNameXpath);
        } catch (err) {
            await this.handleError('Getting application display names', 'err_get_app_display_names', err);
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
            await this.handleError('Selection toggle should not be visible', 'err_selection_toggler_should_not_visible', err);
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
