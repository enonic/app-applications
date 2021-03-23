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
    async startSelectedApp(appName) {
        let appBrowsePanel = new BrowsePanel();
        let result = await appBrowsePanel.getApplicationState(appName);
        if (result === 'stopped') {
            await appBrowsePanel.clickOnStartButton();
        }
        return await appBrowsePanel.pause(1000);
    },
    async stopSelectedApp(appName) {
        let appBrowsePanel = new BrowsePanel();
        let result = await appBrowsePanel.getApplicationState(appName);
        if (result === 'started') {
            await appBrowsePanel.clickOnStopButton();
        }
        return await appBrowsePanel.pause(500);
    },
    async navigateToApplicationsApp(userName, password) {
        try {
            let launcherPanel = new LauncherPanel();
            let result = await launcherPanel.waitForPanelDisplayed(appConst.shortTimeout);
            if (result) {
                console.log("Launcher Panel is opened, click on the `Applications` link...");
                await launcherPanel.clickOnApplicationsLink();
            } else {
                console.log("Login Page is opened, type a password and name...");
                await this.doLoginAndClickOnApplicationsLink(userName, password);
            }
            return await this.doSwitchToApplicationsBrowsePanel();
        } catch (err) {
            console.log('tried to navigate to applications app, but: ' + err);
            this.saveScreenshot("err_navigate_to_applications");
            throw new Error('error when navigate to Applications app ' + err);
        }
    },
    async doSwitchToApplicationsBrowsePanel() {
        let browsePanel = new BrowsePanel();
        console.log('testUtils:switching to Applications app...');
        await webDriverHelper.browser.switchWindow(appConst.APPLICATION_TITLE);
        console.log("switched to Applications app...");
        await browsePanel.waitForSpinnerNotVisible();
        return await browsePanel.waitForGridLoaded(appConst.mediumTimeout);
    },
    doSwitchToHome() {
        console.log('testUtils:switching to Home page...');
        return webDriverHelper.browser.switchWindow("Enonic XP Home").then(() => {
            console.log("switched to Home Page...");
        }).then(() => {
            let homePage = new HomePage();
            return homePage.waitForLoaded(appConst.mediumTimeout);
        });
    },
    doSwitchToLoginPage() {
        console.log('testUtils:switching to Home page...');
        return webDriverHelper.browser.switchWindow("Enonic XP - Login").then(() => {
            console.log("switched to Login Page...");
        }).then(() => {
            let loginPage = new LoginPage();
            return loginPage.waitForPageLoaded(appConst.mediumTimeout);
        });
    },
    switchAndCheckTitle: function (handle, reqTitle) {
        return webDriverHelper.browser.switchWindow(handle).then(() => {
            return webDriverHelper.browser.getTitle().then(title => {
                return title == reqTitle;
            })
        });
    },

    async doLoginAndClickOnApplicationsLink(userName, password) {
        let loginPage = new LoginPage();
        await loginPage.doLogin(userName, password);
        let launcherPanel = new LauncherPanel();
        await launcherPanel.clickOnApplicationsLink();
        return await loginPage.pause(1500);
    },

    saveScreenshot(name) {
        let path = require('path');
        let screenshotsDir = path.join(__dirname, '/../build/screenshots/');
        return webDriverHelper.browser.saveScreenshot(screenshotsDir + name + '.png').then(() => {
            return console.log('screenshot saved ' + name);
        }).catch(err => {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    }
};
