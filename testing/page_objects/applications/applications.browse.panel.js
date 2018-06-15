const page = require('../page');
const elements = require('../../libs/elements');
const appConst = require('../../libs/app_const');

const XPath = {
    container: `//div[contains(@id,'ApplicationBrowsePanel')]`,
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
    selectedRows: `//div[@class='slick-viewport']//div[contains(@class,'slick-row') and child::div[contains(@class,'selected')]]`,
    selectionControllerCheckBox: `//div[contains(@id,'SelectionController')]`,
    selectionPanelToggler: `//button[contains(@id,'SelectionPanelToggler')]`,
    numberInToggler: `//button[contains(@id,'SelectionPanelToggler')]/span`,
    appStateByName: displayName => `${elements.slickRowByDisplayName(XPath.appGrid, displayName)}${XPath.appState}`,
    enabledContextMenuButton: function (name) {
        return `${XPath.contextMenu}/li[contains(@id,'MenuItem') and not(contains(@class,'disabled')) and contains(.,'${name}')]`;
    },
    contextMenuButton: function (name, state) {
        return `${XPath.contextMenu}/li[contains(@id,'MenuItem') and contains(@class,'${state}') and contains(.,'${name}')]`;
    },
    rowByName: name => `//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'${name}')]]`,
    rowByDisplayName:
        displayName => `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`,
    checkboxByDisplayName: displayName => `${elements.itemByDisplayName(
        displayName)}/ancestor::div[contains(@class,'slick-row')]/div[contains(@class,'slick-cell-checkboxsel')]/label`,
    selectedApplicationByName: function (displayName) {
        return `${elements.slickRowSelectedByDisplayName(XPath.appGrid, displayName)}`;
    }
};

module.exports = Object.create(page, {

    selectionControllerCheckBox: {
        get: function () {
            return `${XPath.container}${XPath.selectionControllerCheckBox}`;
        }
    },
    numberInToggler: {
        get: function () {
            return `${XPath.container}${XPath.numberInToggler}`;
        }
    },
    selectionPanelToggler: {
        get: function () {
            return `${XPath.container}${XPath.selectionPanelToggler}`;
        }
    },
    waitForPanelVisible: {
        value: function (ms) {
            return this.waitForVisible(XPath.toolbar, ms).catch(() => {
                throw new Error(`Content browse panel was not loaded in  ${ms}`);
            });
        }
    },
    waitForSelectionTogglerVisible: {
        value: function () {
            return this.waitForVisible(this.selectionPanelToggler, appConst.TIMEOUT_2).then(() => {
                return this.getAttribute(this.selectionPanelToggler, 'class');
            }).then(result=> {
                return result.includes('any-selected');
            }).catch(err => {
                console.log(`error when check the 'Selection toogler'` + err);
                return false;
            });
        }
    },
    getNumberInSelectionToggler: {
        value: function () {
            return this.waitForVisible(this.numberInToggler, appConst.TIMEOUT_2).then(()=> {
                return this.getText(this.numberInToggler);
            }).catch(err => {
                this.saveScreenshot('err_number_selection_toggler');
                throw new Error(`error when getting number in 'Selection toogler'` + err)
            });
        }
    },
    clickOnSelectionToggler: {
        value: function () {
            return this.doClick(this.selectionPanelToggler).catch(err => {
                throw new Error(`Error when clicking 'Selection toogler' ` + err);
            });
        }
    },
    getNumberOfSelectedRows: {
        value: function () {
            return this.elements(XPath.selectedRows).then((result)=> {
                return result.value.length;
            }).catch(err => {
                throw new Error(`Error when getting selected rows ` + err);
            });
        }
    },
    isItemByDisplayNameDisplayed: {
        value: function (itemName) {
            return this.waitForVisible(`${XPath.rowByDisplayName(itemName)}`, 1000).catch(() => {
                this.saveScreenshot(`err_find_${itemName}`);
                throw new Error(`Item was not found! ${itemName}`);
            });
        }
    },
    isSelectionControllerCheckboxDisplayed: {
        value: function () {
            return this.waitForVisible(this.selectionControllerCheckBox, 1000).catch(() => {
                this.saveScreenshot('err_selection_controller');
                throw new Error(`Selection controller was not found!`);
            });
        }
    },
    isItemDisplayed: {
        value: function (itemName) {
            return this.waitForVisible(XPath.rowByName(itemName), 1000).catch(() => {
                console.log("item is not displayed:" + itemName);
                return false;
            });
        }
    },
    waitForItemNotDisplayed: {
        value: function (itemName) {
            return this.waitForNotVisible(XPath.rowByName(itemName), 1000).catch(() => {
                console.log("item is still displayed:" + itemName);
                return false;
            });
        }
    },
    waitForGridLoaded: {
        value: function (ms) {
            return this.waitForVisible(`${elements.GRID_CANVAS}`, ms).then(() => {
                return this.waitForSpinnerNotVisible(appConst.TIMEOUT_3);
            }).then(() => {
                return console.log('applications browse panel is loaded')
            }).catch(err => {
                throw new Error(`applications browse panel not loaded in ${ms}`);
            });
        }
    },

    clickOnInstallButton: {
        value: function () {
            return this.waitForEnabled(XPath.installButton, 1000).then(() => {
                return this.doClick(XPath.installButton);
            }).catch((err) => {
                throw new Error(`Install button is not enabled! ${err}`);
            })
        }
    },
    clickOnSelectionControllerCheckbox: {
        value: function () {
            return this.doClick(this.selectionControllerCheckBox).catch(() => {
                this.saveScreenshot('err_click_on_selection_controller');
                throw new Error(`Error when clicking on Selection controller`);
            });
        }
    },
    clickOnUninstallButton: {
        value: function () {
            return this.waitForEnabled(XPath.installButton, 1000).then(() => {
                return this.doClick(XPath.unInstallButton);
            }).catch((err) => {
                throw new Error(`Uninstall button is not enabled! ${err}`);
            })
        }
    },
    clickOnStartButton: {
        value: function () {
            return this.waitForEnabled(XPath.startButton, 1000)
                .then(enabled => enabled ? this.doClick(XPath.startButton) : Promise.reject(''))
                .catch(() => {
                    this.saveScreenshot('err_browsepanel_start');
                    throw new Error(`Start button is disabled!`);
                });
        }
    },
    clickOnStopButton: {
        value: function () {
            return this.waitForEnabled(XPath.stopButton, 1000).then(()=> {
                return this.doClick(XPath.stopButton);
            }).pause(1000).catch(() => {
                this.saveScreenshot('err_browsepanel_stop');
                throw new Error(`Stop button is disabled!`);
            });
        }
    },
    waitForInstallButtonEnabled: {
        value: function () {
            return this.waitForEnabled(XPath.installButton, 3000).catch(err=> {
                return this.doCatch('err_install_button_state', 'Button Install-app should be enabled ' + err);
            });
        }
    },
    waitForStartButtonEnabled: {
        value: function () {
            return this.waitForEnabled(XPath.startButton, 2000).catch(err=> {
                return this.doCatch('err_start_button_state', 'Button Start-app should be enabled ' + err);
            });
        }
    },
    waitForStartButtonDisabled: {
        value: function () {
            return this.waitForEnabled(XPath.startButton, 3000, true).catch(err=> {
                return this.doCatch('err_start_button', 'Button Start-app should be disabled ' + err);
            });
        }
    },
    waitForStopButtonEnabled: {
        value: function () {
            return this.waitForEnabled(XPath.stopButton, 2000).catch(err=> {
                return this.doCatch('err_stop_button', 'Button Stop-app should be enabled ' + err);
            });
        }
    },
    waitForStopButtonDisabled: {
        value: function () {
            return this.waitForEnabled(XPath.stopButton, 2000, true).catch(err=> {
                return this.doCatch('err_stop_button', 'Button Stop-app should be disabled');
            });
        }
    },
    waitForUninstallButtonEnabled: {
        value: function () {
            return this.waitForEnabled(XPath.unInstallButton, 3000).catch(err=> {
                return this.doCatch('err_uninstall_button', err);
            });
        }
    },
    waitForUninstallButtonDisabled: {
        value: function () {
            return this.waitForEnabled(XPath.unInstallButton, 3000, true).catch(err=> {
                return this.doCatch('err_uninstall_button', 'Uninstall button should be disabled ' + err);
            });
        }
    },

    isInstallButtonEnabled: {
        value: function () {
            return this.isEnabled(XPath.installButton);
        }
    },
    isUnInstallButtonEnabled: {
        value: function () {
            return this.isEnabled(XPath.unInstallButton);
        }
    },
    isStartButtonEnabled: {
        value: function () {
            return this.isEnabled(XPath.startButton);
        }
    },
    isStopButtonEnabled: {
        value: function () {
            return this.isEnabled(XPath.stopButton);
        }
    },
    isUninstallButtonEnabled: {
        value: function () {
            return this.isEnabled(XPath.unInstallButton);
        }
    },
    clickOnSelectAll: {
        value: function () {
            var checkboxXpath = `${XPath.treeGridToolbar}` + `${XPath.selectAllCheckbox}`;
            return this.waitForVisible(checkboxXpath, 3000).then(() => {
                return this.doClick(checkboxXpath);
            }).pause(400).catch((err) => {
                this.saveScreenshot('err_find_selectall_checkbox');
                throw Error('Select all checkbox was not found')
            })
        }
    },
    clickOnRowByName: {
        value: function (name) {
            const nameXpath = XPath.rowByName(name);
            return this.waitForVisible(nameXpath, 2000).then(() => {
                return this.doClick(nameXpath);
            }).pause(400).catch(() => {
                this.saveScreenshot(`err_find_${name}`);
                throw Error(`Row with the name ${name} was not found.`)
            })
        }
    },
    clickOnRowByDisplayName: {
        value: function (name) {
            var nameXpath = XPath.rowByDisplayName(name);
            return this.waitForVisible(nameXpath, 3000).then(() => {
                return this.doClick(nameXpath);
            }).pause(400).catch((err) => {
                this.saveScreenshot('err_find_' + name);
                throw Error('Row with the name ' + name + ' was not found')
            })
        }
    },
    rightClickOnRowByDisplayName: {
        value: function (name) {
            const nameXpath = XPath.rowByDisplayName(name);
            return this.waitForVisible(nameXpath, 3000).then(() => {
                return this.doRightClick(nameXpath);
            }).pause(400).catch(() => {
                this.saveScreenshot(`err_find_${name}`);
                throw Error(`Row with the name ${name} was not found`);
            })
        }
    },
    clickOnRowByDisplayName: {
        value: function (displayName) {
            const displaNameXPath = XPath.rowByDisplayName(displayName);
            return this.waitForVisible(displaNameXPath, 2000)
                .then(() => this.doClick(displaNameXPath))
                .pause(400)
                .catch(() => {
                    this.saveScreenshot(`err_find_${displayName}`);
                    throw Error(`Row with the name ${displayName} was not found.`);
                });
        }
    },
    waitForRowByNameVisible: {
        value: function (name) {
            const nameXpath = XPath.rowByName(name);
            return this.waitForVisible(nameXpath, 3000)
                .catch(() => {
                    this.saveScreenshot(`err_find_${name}`);
                    throw Error(`Row with the name ${name} is not visible in 3000ms.`)
                })
        }
    },
    waitForRowByIndexSelected: {
        value: function (index, reverse) {
            return this.getAttribute(XPath.checkboxes + '[' + (index + 1) + ']', 'class').then((classAttributeValue) => {
                if (!reverse && classAttributeValue.indexOf('selected') === -1) {
                    this.saveScreenshot('err_checkbox_selected');
                    throw Error('Row was not selected');
                } else if (reverse && classAttributeValue.indexOf('selected') !== -1) {
                    this.saveScreenshot('err_checkbox_selected');
                    throw Error('Row was selected');
                }
            });
        }
    },
    clickCheckboxAndSelectRowByDisplayName: {
        value: function (displayName) {
            const displayNameXpath = XPath.checkboxByDisplayName(displayName);
            return this.waitForVisible(displayNameXpath, 2000).then(() => {
                return this.doClick(displayNameXpath);
            }).catch(() => {
                this.saveScreenshot('err_find_item');
                throw Error(`Row with the displayName ${displayName} was not found.`)
            })
        }
    },
    isAppByDisplayNameInstalled: {
        value: function (displayName) {
            const displayNameXPath = XPath.rowByDisplayName(displayName);
            return this.element(displayNameXPath).then(el => (el.value != null));
        }
    },

    getSelectedRowByDisplayName: {
        value: function (displayName) {
            var displayNameXpath = XPath.selectedApplicationByName(displayName);
            return this.waitForVisible(displayNameXpath, 2000)
                .catch((err) => {
                    throw Error('Row with the displayName ' + displayName + ' was not found')
                })
        }
    },

    waitForContextMenuNotDisplayed: {
        value: function () {
            return this.waitForNotVisible(`${XPath.contextMenu}`, 1000).catch((err) => {
                console.log("Context menu is still displayed");
                return this.isVisible(`${XPath.contextMenu}`).then(result=> {
                    return false;
                })
            });
        }
    },

    waitForContextMenuDisplayed: {
        value: function (name) {
            return this.waitForVisible(`${XPath.contextMenu}`, 2000).catch((err) => {
                this.saveScreenshot('err_open_context_menu');
                throw Error('Context menu is not visible' + err);
            });
        }
    },

    waitForContextButtonVisible: {
        value: function (name, state) {
            var nameXpath = XPath.contextMenuButton(name, state || '');
            return this.waitForVisible(nameXpath, 1000).catch((err) => {
                throw Error('Failed to find context menu button ' + name);
            });
        }
    },

    waitForContextButtonEnabled: {
        value: function (name) {
            var nameXpath = XPath.enabledContextMenuButton(name);
            return this.waitForVisible(nameXpath, 1000).catch((err) => {
                console.log("Failed to find context menu button" + err);
                return false;
            });
        }
    },

    getApplicationState: {
        value: function (appDisplayName) {
            var stateXpath = XPath.appStateByName(appDisplayName);
            return this.getText(stateXpath).catch((err) => {
                console.log("Failed to get app-state " + appDisplayName + '  ' + err);
                throw new Error('App-state was not found')
            });
        }
    },
    getApplicationDisplayNames: {
        value: function () {
            var displayNameXpath = elements.SLICK_ROW + elements.H6_DISPLAY_NAME;
            return this.getText(displayNameXpath).catch((err) => {
                throw new Error('Error when get App-display names')
            });
        }
    },
    pressArrowDownKey: {
        value: function () {
            return this.keys('Arrow_Down').pause(1000).catch((err) => {
                throw new Error('Error when clicking on Arrow Down key')
            });
        }
    },
    pressArrowUpKey: {
        value: function () {
            return this.keys('Arrow_Up').pause(1000).catch((err) => {
                throw new Error('Error when clicking on Arrow Up key')
            });
        }
    }
});
