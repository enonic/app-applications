const launcherPanel = require('../page_objects/launcher.panel');
const homePage = require('../page_objects/home.page');
const loginPage = require('../page_objects/login.page');
const appConst = require("./app_const");
const webDriverHelper = require("./WebDriverHelper");
const browsePanel = require('../page_objects/applications/applications.browse.panel');


module.exports = {
    xpTabs: {},

    doCloseCurrentBrowserTab: function () {
        return webDriverHelper.browser.getTitle().then(title=> {
            if (title != 'Enonic XP Home') {
                return webDriverHelper.browser.close();
            }
        })
    },
    findAndSelectItem: function (name) {
        return browsePanel.waitForRowByNameVisible(name).then(()=> {
            return browsePanel.clickOnRowByName(name);
        }).catch(err=> {
            throw new Error('Application with the name:' + ' not found')
        })
    },

    navigateToApplicationsApp: function (browser) {
        return launcherPanel.waitForPanelVisible(appConst.TIMEOUT_1).then((result)=> {
            if (result) {
                console.log("Launcher Panel is opened, click on the `Applications` link...");
                return launcherPanel.clickOnApplicationsLink();
            } else {
                console.log("Login Page is opened, type a password and name...");
                return this.doLoginAndClickOnApplicationsLink(browser);
            }
        }).then(()=> {
            return this.doSwitchToApplicationsBrowsePanel(browser);
        }).catch((err)=> {
            console.log('tried to navigate to applications, but: ' + err);
            this.saveScreenshot(browser, "err_navigate_to_applications");
        })
    },
    doSwitchToApplicationsBrowsePanel: function (browser) {
        console.log('testUtils:switching to Applications app...');
        return browser.getTitle().then(title=> {
            if (title != "Applications - Enonic XP Admin") {
                return this.switchToApplicationsTabWindow(browser);
            }
        })
    },

    doSwitchToHome: function (browser) {
        console.log('testUtils:switching to Home page...');
        return browser.getTabIds().then(tabs => {
            let prevPromise = Promise.resolve(false);
            tabs.some((tabId)=> {
                prevPromise = prevPromise.then((isHome) => {
                    if (!isHome) {
                        return this.switchAndCheckTitle(browser, tabId, "Enonic XP Home");
                    }
                    return false;
                });
            });
            return prevPromise;
        }).then(()=> {
            return homePage.waitForLoaded(appConst.TIMEOUT_3);
        });
    },

    switchAndCheckTitle: function (browser, tabId, reqTitle) {
        return browser.switchTab(tabId).then(()=> {
            return browser.getTitle().then(title=> {
                return title == reqTitle;

            })
        });
    },
    doLoginAndSwitchToApplications: function (browser) {
        return loginPage.doLogin().pause(1500).then(()=> {
            return homePage.waitForXpTourVisible(appConst.TIMEOUT_3);
        }).then((result)=> {
            if (result) {
                return homePage.doCloseXpTourDialog();
            }
        }).then(()=> {
            return launcherPanel.clickOnApplicationsLink().pause(1000);
        }).then(()=> {
            return this.doSwitchToApplicationsBrowsePanel(browser);
        }).catch((err)=> {
            throw new Error(err);
        })
    },
    doLoginAndClickOnApplicationsLink: function (browser) {
        return loginPage.doLogin().pause(1500).then(()=> {
            return homePage.waitForXpTourVisible(appConst.TIMEOUT_3);
        }).then((result)=> {
            if (result) {
                return homePage.doCloseXpTourDialog();
            }
        }).then(()=> {
            return launcherPanel.clickOnApplicationsLink().pause(1000);
        })
    },

    switchToApplicationsTabWindow: function (browser) {
        return browser.getTabIds().then(tabs => {
            let prevPromise = Promise.resolve(false);
            tabs.some((tabId)=> {
                prevPromise = prevPromise.then((isStudio) => {
                    if (!isStudio) {
                        return this.switchAndCheckTitle(browser, tabId, "Applications - Enonic XP Admin");
                    }
                    return false;
                });
            });
            return prevPromise;
        }).then(()=> {
            return browsePanel.waitForGridLoaded(appConst.TIMEOUT_3);
        });
    },

    saveScreenshot: function (browser, name) {
        var path = require('path')
        var screenshotsDir = path.join(__dirname, '/../build/screenshots/');
        return browser.saveScreenshot(screenshotsDir + name + '.png').then(()=> {
            return console.log('screenshot saved ' + name);
        }).catch(err=> {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    }
};
