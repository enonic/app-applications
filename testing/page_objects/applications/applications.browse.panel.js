const Page = require('../page');
const lib = require('../../libs/elements');
const appConst = require('../../libs/app_const');
const LauncherPanel = require('../launcher.panel');

const XPATH = {
    container: `//div[contains(@id,'ApplicationBrowsePanel')]`,
    launcherButton: "//button[contains(@class,'launcher-button')]",
    appGrid: `//div[contains(@class, 'application-grid')]`,
    toolbar: `//div[contains(@id,'ApplicationBrowseToolbar')]`,
    contextMenu: `//ul[contains(@id,'TreeGridContextMenu')]`,
    treeGridToolbar: `//div[contains(@id,'api.ui.treegrid.TreeGridToolbar')]`,
    installButton: `//div[contains(@id,'ApplicationBrowseToolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Install')]]`,
    unInstallButton: `//div[contains(@id,'ApplicationBrowseToolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Uninstall')]]`,
    stopButton: `//div[contains(@id,'ApplicationBrowseToolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Stop')]]`,
    startButton: `//div[contains(@id,'ApplicationBrowseToolbar')]/button[contains(@id, 'ActionButton') and child::span[contains(.,'Start')]]`,
    selectAllCheckbox: `//div[@id='api.ui.treegrid.actions.SelectionController']`,
    checkboxes: `(//div[contains(@class,'slick-cell-checkboxsel')])`,
    appState: "//div[contains(@class,'state')]",
    selectedRows: `//div[contains(@class,'slick-viewport')]//div[contains(@class,'slick-row') and child::div[contains(@class,'selected')]]`,
    selectionControllerCheckBox: `//div[contains(@id,'SelectionController')]`,
    selectionPanelToggler: `//button[contains(@id,'SelectionPanelToggler')]`,
    numberInToggler: `//button[contains(@id,'SelectionPanelToggler')]/span`,
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
            return this.waitForSpinnerNotVisible(appConst.TIMEOUT_3);
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

    clickOnRowByName(name) {
        const nameXpath = XPATH.rowByName(name);
        return this.waitForElementDisplayed(nameXpath, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(nameXpath);
        }).catch(() => {
            this.saveScreenshot("err_find_item");
            throw Error(`Row with the name ${name} was not found.`)
        })
    }

    clickOnRowByDisplayName(displayName) {
        let nameXpath = XPATH.rowByDisplayName(displayName);
        return this.waitForElementDisplayed(nameXpath, 3000).then(() => {
            return this.clickOnElement(nameXpath);
        }).then(() => {
            return this.pause(500);
        }).catch(err => {
            this.saveScreenshot('err_click_on_app');
            throw Error('Error when clicking on the row with the name ' + displayName + '  ' + err);
        })
    }

    waitForSelectionTogglerVisible() {
        return this.waitForElementDisplayed(this.selectionPanelToggler, appConst.TIMEOUT_2).then(() => {
            return this.getAttribute(this.selectionPanelToggler, 'class');
        }).then(result => {
            return result.includes('any-selected');
        }).catch(err => {
            console.log(`error when check the 'Selection toogler'` + err);
            return false;
        });
    }

    getNumberInSelectionToggler() {
        return this.waitForElementDisplayed(this.numberInToggler, appConst.TIMEOUT_2).then(() => {
            return this.getText(this.numberInToggler);
        }).catch(err => {
            this.saveScreenshot('err_number_selection_toggler');
            throw new Error(`error when getting number in 'Selection toogler'` + err)
        });
    }

    clickOnSelectionToggler() {
        return this.clickOnElement(this.selectionPanelToggler).catch(err => {
            throw new Error(`Error when clicking 'Selection toogler' ` + err);
        });
    }

    isItemDisplayed(itemName) {
        return this.waitForElementDisplayed(XPATH.rowByName(itemName), appConst.TIMEOUT_2).catch(() => {
            console.log("item is not displayed:" + itemName);
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

    isAppByDisplayNameDisplayed(appName) {
        return this.waitForElementDisplayed(XPATH.rowByDisplayName(appName), 1000).catch(() => {
            this.saveScreenshot(`err_find_${appName}`);
            throw new Error(`Item was not found! ${appName}`);
        });
    }

    waitForRowByNameVisible(name) {
        const nameXpath = XPATH.rowByName(name);
        return this.waitForElementDisplayed(nameXpath, appConst.TIMEOUT_3).catch(() => {
            throw Error(`Row with the name ${name} is not visible in 3000ms.`)
        })
    }

    clickOnSelectionControllerCheckbox() {
        return this.waitForElementDisplayed(this.selectionControllerCheckBox, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(this.selectionControllerCheckBox)
        }).then(() => {
            return this.pause(700);
        }).catch(() => {
            this.saveScreenshot('err_click_on_selection_controller');
            throw new Error(`Error when clicking on Selection controller`);
        });
    }

    waitForAppNotDisplayed(itemName) {
        return this.waitForElementNotDisplayed(XPATH.rowByName(itemName), appConst.TIMEOUT_2).catch(err => {
            console.log("item is still displayed:" + itemName + " " + err);
            return false;
        });
    }

    clickOnInstallButton() {
        return this.waitForElementEnabled(XPATH.installButton, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(XPATH.installButton);
        }).catch(err => {
            throw new Error(`Install button is not enabled! ${err}`);
        })
    }

    clickOnUninstallButton() {
        return this.waitForElementEnabled(XPATH.unInstallButton, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(XPATH.unInstallButton);
        }).catch(err => {
            throw new Error(`Uninstall button is not enabled  ! ${err}`);
        })
    }

    clickOnStartButton() {
        return this.waitForElementEnabled(XPATH.startButton, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(XPATH.startButton);
        }).then(() => {
            return this.pause(1500);
        }).catch(() => {
            this.saveScreenshot('err_browsepanel_start');
            throw new Error(`Start button is disabled!`);
        });
    }

    clickOnStopButton() {
        return this.waitForElementEnabled(XPATH.stopButton, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(XPATH.stopButton);
        }).then(() => {
            return this.pause(1500);
        }).catch(err => {
            this.saveScreenshot('err_browsepanel_stop');
            throw new Error(`Stop button is disabled!` + err);
        });
    }

    waitForInstallButtonEnabled() {
        return this.waitForElementEnabled(XPATH.installButton, appConst.TIMEOUT_2).catch(err => {
            throw new Error("Button Install-app is not enabled! " + err);
        });
    }

    waitForStartButtonEnabled() {
        return this.waitForElementEnabled(XPATH.startButton, appConst.TIMEOUT_2).catch(err => {
            throw new Error("Button Start-app is not enabled " + err);
        });
    }

    waitForStartButtonDisabled() {
        return this.waitForElementDisabled(XPATH.startButton, appConst.TIMEOUT_3).catch(err => {
            throw new Error("Button Start-app is not disabled " + err);
        });
    }

    waitForStopButtonEnabled() {
        return this.waitForElementEnabled(XPATH.stopButton, appConst.TIMEOUT_2).catch(err => {
            throw new Error("Button Stop-app is not enabled " + err);
        });
    }

    waitForStopButtonDisabled() {
        return this.waitForElementDisabled(XPATH.stopButton, appConst.TIMEOUT_2).catch(err => {
            throw new Error('Button Stop-app is not disabled! ' + err);
        });
    }

    rightClickOnRowByDisplayName(name) {
        const nameXpath = XPATH.rowByDisplayName(name);
        return this.waitForElementDisplayed(nameXpath, appConst.TIMEOUT_3).then(() => {
            return this.doRightClick(nameXpath);
        }).catch(() => {
            this.saveScreenshot(`err_find_${name}`);
            throw Error(`Row with the name ${name} was not found`);
        })
    }

    waitForUninstallButtonEnabled() {
        return this.waitForElementEnabled(XPATH.unInstallButton, appConst.TIMEOUT_3).catch(err => {
            throw new Error('Uninstall button ' + err);
        });
    }

    waitForUninstallButtonDisabled() {
        return this.waitForElementDisabled(XPATH.unInstallButton, appConst.TIMEOUT_3).catch(err => {
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
    clickOnSelectAll() {
        let checkboxXpath = XPATH.treeGridToolbar + XPATH.selectAllCheckbox;
        return this.waitForElementDisplayed(checkboxXpath, appConst.TIMEOUT_3).then(() => {
            return this.clickOnElement(checkboxXpath);
        }).then(() => {
            return this.pause(700);
        }).catch(err => {
            this.saveScreenshot('err_selecta_ll_checkbox');
            throw Error('Select all checkbox was not found')
        })
    }

    clickCheckboxAndSelectRowByDisplayName(displayName) {
        const displayNameXpath = XPATH.checkboxByDisplayName(displayName);
        return this.waitForElementDisplayed(displayNameXpath, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(displayNameXpath);
        }).then(() => {
            return this.pause(500);
        }).catch(() => {
            throw Error(`Row with the displayName ${displayName} was not found.`)
        })
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
        return this.waitForElementNotDisplayed(XPATH.contextMenu, appConst.TIMEOUT_2).catch(err => {
            this.saveScreenshot('err_close_context_menu');
            throw new Error("Browse context menu is not closed!");
        });
    }

    waitForContextMenuDisplayed() {
        return this.waitForElementDisplayed(XPATH.contextMenu, appConst.TIMEOUT_2).catch(err => {
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
        return this.waitForElementDisplayed(menuItemXpath, 1000).catch(err => {
            throw Error('Failed to find context menu item ' + name);
        }).then(() => {
            return this.browser.waitUntil(() => {
                return this.getAttribute(menuItemXpath, "class").then(result => {
                    return result.includes("disabled");
                })
            }, appConst.TIMEOUT_3, "context menu item is not disabled in 3000 ms");
        }).catch(err => {
            this.saveScreenshot("err_context_menu");
            throw new Error(err);
        })
    }

    waitForContextMenuItemEnabled(menuItem) {
        let nameXpath = XPATH.enabledContextMenuButton(menuItem);
        return this.waitForElementDisplayed(nameXpath, appConst.TIMEOUT_2).catch(err => {
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

    doOpenLauncherPanel() {
        return this.waitForElementDisplayed(XPATH.launcherButton, appConst.TIMEOUT_2).then(() => {
            return this.clickOnElement(XPATH.launcherButton);
        }).then(() => {
            let launcherPanel = new LauncherPanel();
            return launcherPanel.waitForPanelDisplayed(appConst.TIMEOUT_2);
        }).then(result => {
            if (!result) {
                throw new Error("Launcher Panel was not loaded");
            }
        })
    }
};
module.exports = AppBrowsePanel;
