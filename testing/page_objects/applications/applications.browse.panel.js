const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LauncherPanel = require('../launcher.panel');

const XPATH = {
    container: "//div[contains(@id,'ApplicationBrowsePanel')]",
    launcherButton: "//button[contains(@class,'launcher-button')]",
    appGrid: "//div[contains(@class, 'application-grid')]",
    toolbar: "//div[contains(@id,'Toolbar')]",
    contextMenu: "//ul[contains(@id,'TreeGridContextMenu')]",
    treeGridToolbar: `//div[contains(@id,'TreeGridToolbar')]`,
    installButton: `//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Install')]]`,
    unInstallButton: `//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Uninstall')]]`,
    stopButton: "//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Stop')]]",
    startButton: `//div[contains(@id,'Toolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Start')]]`,
    selectAllCheckbox: "//div[@id='SelectionController']",
    checkboxes: `(//div[contains(@class,'slick-cell-checkboxsel')])`,
    appState: "//div[contains(@class,'state')]",
    selectedRows: `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and child::div[contains(@class,'selected')]]`,
    selectionControllerCheckBox: `//div[contains(@id,'SelectionController')]`,
    selectionPanelToggler: "//button[contains(@id,'SelectionPanelToggler')]",
    numberInToggler: "//button[contains(@id,'SelectionPanelToggler')]/span",
    appStateByName: displayName => `${lib.slickRowByDisplayName(XPATH.appGrid, displayName)}${XPATH.appState}`,
    enabledContextMenuButton: name => {
        return `${XPATH.contextMenu}/li[contains(@id,'MenuItem') and not(contains(@class,'disabled')) and contains(.,'${name}')]`;
    },
    contextMenuItemByName: (name) => {
        return `${XPATH.contextMenu}/li[contains(@id,'MenuItem') and contains(.,'${name}')]`;
    },
    rowByName: name => `//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'${name}')]]`,
    rowByDisplayName:
        displayName => `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`,
    checkboxByDisplayName: displayName => `${lib.itemByDisplayName(
        displayName)}/ancestor::div[contains(@class,'slick-row')]/div[contains(@class,'slick-cell-checkboxsel')]/label`,
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

    waitForGridLoaded(ms) {
        return this.waitForElementDisplayed(XPATH.container + lib.GRID_CANVAS, ms).then(() => {
            return this.waitForSpinnerNotVisible(appConst.mediumTimeout);
        }).then(() => {
            return console.log('applications browse panel is loaded')
        }).catch(err => {
            throw new Error(`applications browse panel is not loaded in ${ms}`);
        });
    }

    waitForPanelDisplayed(ms) {
        return this.waitForElementDisplayed(XPATH.toolbar, ms).catch(() => {
            throw new Error(`Content browse panel was not loaded in  ${ms}`);
        });
    }

    async clickOnRowByDescription(name) {
        try {
            const nameXpath = XPATH.rowByName(name);
            await this.waitForElementDisplayed(nameXpath, appConst.shortTimeout);
            await this.clickOnElement(nameXpath);
            return await this.pause(500);
        } catch (err) {
            this.saveScreenshot("err_find_item");
            throw Error(`Row with the name ${name} was not found.`)
        }
    }

    async clickOnRowByDisplayName(displayName) {
        try {
            let nameXpath = XPATH.rowByDisplayName(displayName);
            await this.waitForElementDisplayed(nameXpath, 3000);
            await this.clickOnElement(nameXpath);
            return await this.pause(500);
        } catch (err) {
            this.saveScreenshot('err_click_on_app');
            throw Error('Error when clicking on the row with the name ' + displayName + '  ' + err);
        }
    }

    getNumberInSelectionToggler() {
        return this.waitForElementDisplayed(this.numberInToggler, appConst.shortTimeout).then(() => {
            return this.getText(this.numberInToggler);
        }).catch(err => {
            this.saveScreenshot('err_number_selection_toggler');
            throw new Error(`error when getting number in 'Selection toogler'` + err)
        });
    }

    //Click on Show Selection/Hide Selection
    clickOnSelectionToggler() {
        return this.clickOnElement(this.selectionPanelToggler).catch(err => {
            throw new Error(`Error when clicking 'Selection toogler' ` + err);
        });
    }

    isAppByDescriptionDisplayed(descritption) {
        return this.waitForElementDisplayed(XPATH.rowByName(descritption), appConst.shortTimeout).catch(() => {
            console.log("item is not displayed:" + descritption);
            return false;
        });
    }

    getNumberOfSelectedRows() {
        return this.findElements(XPATH.selectedRows).then(result => {
            return result.length;
        }).catch(err => {
            throw new Error(`Error when getting selected rows ` + err);
        });
    }

    waitForAppByDisplayNameDisplayed(appName) {
        return this.waitForElementDisplayed(XPATH.rowByDisplayName(appName), 1000).catch(() => {
            this.saveScreenshot(`err_find_${appName}`);
            throw new Error(`Item was not found! ${appName}`);
        });
    }

    waitForRowByNameVisible(name) {
        const nameXpath = XPATH.rowByName(name);
        return this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout).catch(() => {
            throw Error(`Row with the name ${name} is not visible in 3000ms.`)
        })
    }

    async clickOnSelectionControllerCheckbox() {
        try {
            await this.waitForElementDisplayed(this.selectionControllerCheckBox, appConst.mediumTimeout);
            await this.clickOnElement(this.selectionControllerCheckBox);
            return await this.pause(700);
        } catch (err) {
            this.saveScreenshot('err_click_on_selection_controller');
            throw new Error(`Error when clicking on Selection controller ` + err);
        }
    }

    //Wait for application with the description is not displayed in app-grid:
    waitForAppNotDisplayed(description) {
        return this.waitForElementNotDisplayed(XPATH.rowByName(description), appConst.shortTimeout).catch(err => {
            console.log("item is still displayed:" + description + " " + err);
            return false;
        });
    }

    //Wait for application with the displayName is not displayed in app-grid:
    waitForAppByDisplayNameNotDisplayed(displayName) {
        return this.waitForElementNotDisplayed(XPATH.rowByDisplayName(displayName), appConst.shortTimeout).catch(err => {
            console.log("Application is still displayed:" + itemName + " " + err);
            return false;
        });
    }

    clickOnInstallButton() {
        return this.waitForElementEnabled(XPATH.installButton, appConst.mediumTimeout).then(() => {
            return this.clickOnElement(XPATH.installButton);
        }).catch(err => {
            throw new Error(`Install button is not enabled! ${err}`);
        })
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
            this.saveScreenshot('err_browsepanel_start');
            throw new Error(`Start button is disabled! ` + err);
        }
    }

    async clickOnStopButton() {
        try {
            await this.waitForElementEnabled(XPATH.stopButton, appConst.mediumTimeout);
            await this.clickOnElement(XPATH.stopButton);
            return await this.pause(1500);
        } catch (err) {
            this.saveScreenshot('err_browsepanel_stop');
            throw new Error(`Stop button is disabled!` + err);
        }
    }

    waitForInstallButtonEnabled() {
        return this.waitForElementEnabled(XPATH.installButton, appConst.mediumTimeout).catch(err => {
            throw new Error("Button Install-app is not enabled! " + err);
        });
    }

    waitForStartButtonEnabled() {
        return this.waitForElementEnabled(XPATH.startButton, appConst.mediumTimeout).catch(err => {
            throw new Error("Button Start-app is not enabled " + err);
        });
    }

    waitForStartButtonDisabled() {
        return this.waitForElementDisabled(XPATH.startButton, appConst.mediumTimeout).catch(err => {
            throw new Error("Button Start-app is not disabled " + err);
        });
    }

    waitForStopButtonEnabled() {
        return this.waitForElementEnabled(XPATH.stopButton, appConst.mediumTimeout).catch(err => {
            throw new Error("Button Stop-app is not enabled " + err);
        });
    }

    waitForStopButtonDisabled() {
        return this.waitForElementDisabled(XPATH.stopButton, appConst.mediumTimeout).catch(err => {
            throw new Error('Button Stop-app is not disabled! ' + err);
        });
    }

    async rightClickOnRowByDisplayName(name) {
        try {
            const nameXpath = XPATH.rowByDisplayName(name);
            await this.waitForElementDisplayed(nameXpath, appConst.mediumTimeout);
            await this.doRightClick(nameXpath);
            return await this.pause(500);
        } catch (err) {
            this.saveScreenshot('err_open_context_menu');
            throw Error("Error when do right click on the row:" + err);
        }
    }

    waitForUninstallButtonEnabled() {
        return this.waitForElementEnabled(XPATH.unInstallButton, appConst.mediumTimeout).catch(err => {
            throw new Error('Uninstall button ' + err);
        });
    }

    waitForUninstallButtonDisabled() {
        return this.waitForElementDisabled(XPATH.unInstallButton, appConst.mediumTimeout).catch(err => {
            throw new Error("Uninstall button is not disabled " + err);
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
    async clickOnSelectAll() {
        try {
            let checkboxXpath = XPATH.treeGridToolbar + XPATH.selectAllCheckbox;
            await this.waitForElementDisplayed(checkboxXpath, appConst.mediumTimeout);
            await this.clickOnElement(checkboxXpath);
            return await this.pause(500);
        } catch (err) {
            this.saveScreenshot('err_selecta_ll_checkbox');
            throw Error('Select all checkbox was not found')
        }
    }

    async clickOnCheckboxAndSelectRowByDisplayName(displayName) {
        const displayNameXpath = XPATH.checkboxByDisplayName(displayName);
        try {
            await this.waitForElementDisplayed(displayNameXpath, appConst.mediumTimeout);
            await this.clickOnElement(displayNameXpath);
            return await this.pause(500);
        } catch (err) {
            throw Error(`Row with the displayName ${displayName} was not found.` + err)
        }
    }

    pressArrowDownKey() {
        return this.keys('Arrow_Down').then(() => {
            return this.pause(500);
        }).catch(err => {
            throw new Error('Error when clicking on Arrow Down key')
        });
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

    waitForContextMenuNotDisplayed() {
        return this.waitForElementNotDisplayed(XPATH.contextMenu, appConst.shortTimeout).catch(err => {
            this.saveScreenshot('err_close_context_menu');
            throw new Error("Browse context menu is not closed!");
        });
    }

    waitForContextMenuDisplayed() {
        return this.waitForElementDisplayed(XPATH.contextMenu, appConst.shortTimeout).catch(err => {
            this.saveScreenshot('err_open_context_menu');
            throw Error('Context menu is not visible' + err);
        });
    }

    isRowByIndexSelected(rowNumber) {
        return this.getAttribute(XPATH.checkboxes + '[' + (rowNumber + 1) + ']', 'class').then(classAttributeValue => {
            return classAttributeValue.indexOf('selected') !== -1;
        });
    }

    //throw exception after the timeout
    waitForContextMenuItemDisabled(name) {
        let menuItemXpath = XPATH.contextMenuItemByName(name);
        return this.waitForElementDisplayed(menuItemXpath, 3000).catch(err => {
            throw Error('Failed to find context menu item ' + name);
        }).then(() => {
            return this.browser.waitUntil(() => {
                return this.getAttribute(menuItemXpath, "class").then(result => {
                    return result.includes("disabled");
                })
            }, {timeout: appConst.mediumTimeout, timeoutMsg: "context menu item is not disabled in 3000 ms"});
        })
    }


    waitForContextMenuItemEnabled(menuItem) {
        let nameXpath = XPATH.enabledContextMenuButton(menuItem);
        return this.waitForElementDisplayed(nameXpath, appConst.shortTimeout).catch(err => {
            throw new Error("Menu item is not enabled! " + menuItem)
        });
    }

    getApplicationState(appName) {
        let stateXpath = XPATH.appStateByName(appName);
        return this.getText(stateXpath).catch(err => {
            console.log("Failed to get app-state " + appName + '  ' + err);
            throw new Error('App-state was not found' + err);
        });
    }

    getApplicationDisplayNames() {
        let displayNameXpath = lib.SLICK_ROW + lib.H6_DISPLAY_NAME;
        return this.getTextInDisplayedElements(displayNameXpath).catch(err => {
            throw new Error('Error when get App-display names')
        });
    }

    async doOpenLauncherPanel() {
        await this.waitForElementDisplayed(XPATH.launcherButton, appConst.shortTimeout);
        await this.clickOnElement(XPATH.launcherButton);
        let launcherPanel = new LauncherPanel();
        let isLoaded = await launcherPanel.waitForPanelDisplayed(appConst.shortTimeout);
        if (!isLoaded) {
            throw new Error("Launcher Panel was not loaded");
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
            this.saveScreenshot("err_selection_toggler_should_not_visible");
            throw new Error("Selection toggler should not be visible")
        }
    }

    async waitForSelectionControllerPartial() {
        let selector = this.selectionControllerCheckBox + "//input[@type='checkbox']";
        await this.getBrowser().waitUntil(async () => {
            let text = await this.getAttribute(selector, "class");
            return text.includes('partial');
        }, {timeout: appConst.shortTimeout, timeoutMsg: "Selection Controller checkBox should displayed as partial"});
    }

    async isSelectionControllerPartial() {
        let selector = this.selectionControllerCheckBox + "//input[@type='checkbox']";
        let text = await this.getAttribute(selector, "class");
        return text.includes('partial');
    }

    // returns true if 'Selection Controller' checkbox is selected:
    isSelectionControllerSelected() {
        let selector = this.selectionControllerCheckBox + "//input[@type='checkbox']";
        return this.isSelected(selector);
    }
}

module.exports = AppBrowsePanel;
