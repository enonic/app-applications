const LauncherPanel = require('../page_objects/launcher.panel');
const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const appConst = require("./app_const");
const webDriverHelper = require("./WebDriverHelper");
const BrowsePanel = require('../page_objects/applications/applications.browse.panel');

module.exports = {

    async doCloseCurrentBrowserTab() {
        let title = await webDriverHelper.browser.getTitle();
        if (title != 'Enonic XP Home') {
            await webDriverHelper.browser.closeWindow();
            return await this.doSwitchToHome();
        }
    },
    async doLogout() {
        let launcherPanel = new LauncherPanel();
        let appBrowsePanel = new BrowsePanel();
        await appBrowsePanel.doOpenLauncherPanel();
        await launcherPanel.clickOnLogoutLink();
        await launcherPanel.pause(1000);
        return await this.doSwitchToLoginPage();

    },
    startSelectedApp(appName) {
        let appBrowsePanel = new BrowsePanel();
        return appBrowsePanel.getApplicationState(appName).then(result => {
            if (result === 'stopped') {
                return appBrowsePanel.clickOnStartButton();
            }
        }).then(() => {
            return appBrowsePanel.pause(500);
        });
    },
    stopSelectedApp(appName) {
        let appBrowsePanel = new BrowsePanel();
        return appBrowsePanel.getApplicationState(appName).then(result => {
            if (result === 'started') {
                return appBrowsePanel.clickOnStopButton();
            }
        }).then(() => {
            return appBrowsePanel.pause(700);
        });
    },
    navigateToApplicationsApp: function (userName, password) {
        let launcherPanel = new LauncherPanel();
        return launcherPanel.waitForPanelDisplayed(appConst.TIMEOUT_7).then(result => {
            if (result) {
                console.log("Launcher Panel is opened, click on the `Applications` link...");
                return launcherPanel.clickOnApplicationsLink();
            } else {
                console.log("Login Page is opened, type a password and name...");
                return this.doLoginAndClickOnApplicationsLink(userName, password);
            }
        }).then(() => {
            return this.doSwitchToApplicationsBrowsePanel();
        }).catch(err => {
            console.log('tried to navigate to applications app, but: ' + err);
            this.saveScreenshot("err_navigate_to_applications");
            throw new Error('error when navigate to Applications app ' + err);
        });
    },

    doSwitchToApplicationsBrowsePanel: function () {
        let browsePanel = new BrowsePanel();
        console.log('testUtils:switching to Applications app...');
        return webDriverHelper.browser.switchWindow("Applications - Enonic XP Admin").then(() => {
            console.log("switched to Applications app...");
            return browsePanel.waitForSpinnerNotVisible();
        }).then(() => {
            return browsePanel.waitForGridLoaded(appConst.TIMEOUT_3);
        })
    },

    doSwitchToHome: function () {
        console.log('testUtils:switching to Home page...');
        return webDriverHelper.browser.switchWindow("Enonic XP Home").then(() => {
            console.log("switched to Home Page...");
        }).then(() => {
            let homePage = new HomePage();
            return homePage.waitForLoaded(appConst.TIMEOUT_3);
        });
    },
    doSwitchToLoginPage: function () {
        console.log('testUtils:switching to Home page...');
        return webDriverHelper.browser.switchWindow("Enonic XP - Login").then(() => {
            console.log("switched to Login Page...");
        }).then(() => {
            let loginPage = new LoginPage();
            return loginPage.waitForPageLoaded(appConst.TIMEOUT_3);
        });
    },
    switchAndCheckTitle: function (handle, reqTitle) {
        return webDriverHelper.browser.switchWindow(handle).then(() => {
            return webDriverHelper.browser.getTitle().then(title => {
                return title == reqTitle;
            })
        });
    },

    doLoginAndClickOnApplicationsLink: function (userName, password) {
        let loginPage = new LoginPage();
        return loginPage.doLogin(userName, password).then(() => {
            let launcherPanel = new LauncherPanel();
            return launcherPanel.clickOnApplicationsLink();
        }).then(() => {
            return loginPage.pause(1500);
        })
    },

    saveScreenshot: function (name) {
        let path = require('path');
        let screenshotsDir = path.join(__dirname, '/../build/screenshots/');
        return webDriverHelper.browser.saveScreenshot(screenshotsDir + name + '.png').then(() => {
            return console.log('screenshot saved ' + name);
        }).catch(err => {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    }
};
