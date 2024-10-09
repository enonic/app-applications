const LauncherPanel = require('../page_objects/launcher.panel');
const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const appConst = require("./app_const");
const BrowsePanel = require('../page_objects/applications/applications.browse.panel');
const fs = require('fs');
const path = require('path');
const webDriverHelper = require('./WebDriverHelper');

module.exports = {

    getBrowser() {
        if (typeof browser !== "undefined") {
            return browser;
        } else {
            return webDriverHelper.browser;
        }
    },
    async doCloseCurrentBrowserTab() {
        let title = await this.getBrowser().getTitle();
        if (title != 'Enonic XP Home') {
            await this.getBrowser().closeWindow();
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
            let screenshot = await this.saveScreenshotUniqueName('err_navigate_to_applications');
            throw new Error(`Error during navigate to Applications app, screenshot: ${screenshot} ` + err);
        }
    },
    async doSwitchToApplicationsBrowsePanel() {
        let browsePanel = new BrowsePanel();
        console.log('testUtils:switching to Applications app...');
        await this.getBrowser().switchWindow(appConst.APPLICATION_TITLE);
        console.log("switched to Applications app...");
        await browsePanel.waitForSpinnerNotVisible();
        return await browsePanel.waitForGridLoaded(appConst.mediumTimeout);
    },
    async doSwitchToHome() {
        console.log('testUtils:switching to Home page...');
        await this.getBrowser().switchWindow("Enonic XP Home");
        console.log("switched to Home Page...");
        let homePage = new HomePage();
        return await homePage.waitForLoaded(appConst.mediumTimeout);
    },
    async doSwitchToLoginPage() {
        console.log('testUtils:switching to Home page...');
        await this.getBrowser().switchWindow("Enonic XP - Login");
        console.log("switched to Login Page...");
        let loginPage = new LoginPage();
        return await loginPage.waitForPageLoaded(appConst.mediumTimeout);
    },
    switchAndCheckTitle: function (handle, reqTitle) {
        return this.getBrowser().switchWindow(handle).then(() => {
            return this.getBrowser().getTitle().then(title => {
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

    saveScreenshot(name, that) {
        let screenshotsDir = path.join(__dirname, '/../build/reports/screenshots/');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, {recursive: true});
        }
        return this.getBrowser().saveScreenshot(screenshotsDir + name + '.png').then(() => {
            return console.log('screenshot saved ' + name);
        }).catch(err => {
            return console.log('screenshot was not saved ' + screenshotsDir + 'utils  ' + err);
        })
    },
    async saveScreenshotUniqueName(namePart) {
        let screenshotName = appConst.generateRandomName(namePart);
        await this.saveScreenshot(screenshotName);
        return screenshotName;
    }
};
