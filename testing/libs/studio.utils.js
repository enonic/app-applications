const HomePage = require('../page_objects/home.page');
const LoginPage = require('../page_objects/login.page');
const appConst = require("./app_const");
const BrowsePanel = require('../page_objects/applications/applications.browse.panel');
const fs = require('fs');
const path = require('path');
const webDriverHelper = require('./WebDriverHelper');

module.exports = {

    getBrowser() {
        if (typeof browser !== 'undefined') {
            return browser;
        } else {
            return webDriverHelper.browser;
        }
    },
    async goToHomePage() {
        await this.getBrowser().url('http://localhost:8080/admin');
        let homePage = new HomePage();
        await homePage.waitForDashboardLinkDisplayed();
        await homePage.pause(1000);
    },
    async doLogout() {
        let homePage = new HomePage();
        await homePage.clickOnAvatarButton();
        await homePage.clickOnLogoutDropdownMenuItem();
        await homePage.pause(1000);
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
            await this.doLogin(userName, password);
            let homePage = new HomePage();
            await homePage.clickOnApplicationsLink();
            await this.waitForAppsBrowsePanelLoaded();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_navigate_to_applications');
            throw new Error(`Error during navigate to Applications app, screenshot: ${screenshot} ` + err);
        }
    },
    async waitForAppsBrowsePanelLoaded() {
        let browsePanel = new BrowsePanel();
        console.log('testUtils:switching to Applications app...');
        await browsePanel.waitForSpinnerNotVisible();
        return await browsePanel.waitForGridLoaded(appConst.mediumTimeout);
    },
    async switchToTab(title) {
        let handles = await this.getBrowser().getWindowHandles();
        for (const handle of handles) {
            await this.getBrowser().switchToWindow(handle);
            let currentTitle = await this.getBrowser().getTitle();
            if (currentTitle === title) {
                return handle;
            }
        }
        throw new Error('Browser tab with title ' + title + ' was not found');
    },

    async doSwitchToHome() {
        console.log('testUtils:switching to Home page...');
        let homePage = new HomePage();
        await this.switchToTab(appConst.BROWSER_TITLES.XP_HOME);
        console.log("switched to Home Page...");
        return await homePage.waitForLoaded(appConst.mediumTimeout);

    },
    async doSwitchToLoginPage() {
        console.log('testUtils:switching to Home page...');
        await this.getBrowser().switchWindow("Enonic XP - Login");
        console.log("switched to Login Page...");
        let loginPage = new LoginPage();
        return await loginPage.waitForPageLoaded(appConst.mediumTimeout);
    },

    async doLoginAndClickOnApplicationsLink(userName, password) {
        let loginPage = new LoginPage();
        let homePage = new HomePage();
        await loginPage.doLogin(userName, password);
        await homePage.clickOnApplicationsLink();
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
    },
    async doLogin(userName, password) {
        try {
            let loginPage = new LoginPage();
            let result = await loginPage.isLoaded();
            if (result) {
                await loginPage.doLogin(userName, password);
            }
            let homePage = new HomePage();
            await homePage.waitForUsersLinkDisplayed();
        } catch (err) {
            let screenshot = await this.saveScreenshotUniqueName('err_login');
            throw new Error(`Login page error,  screenshot:${screenshot}  ` + err);
        }
    },
};
