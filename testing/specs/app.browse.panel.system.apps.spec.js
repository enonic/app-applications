const assert = require('node:assert');
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');

describe('Applications Browse panel - system apps spec', function () {
    this.timeout(appConst.SUITE_TIMEOUT);

    if (typeof browser === 'undefined') {
        webDriverHelper.setupBrowser();
    }

    it(`GIVEN apps grid is loaded THEN system apps should be hidden by default`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            const systemApps = await appBrowsePanel.getSystemAppDisplayNames();
            await studioUtils.saveScreenshot('system_apps_hidden_by_default');
            assert.ok(!systemApps || systemApps.length === 0,
                'system applications should be hidden by default');
            assert.equal(await appBrowsePanel.isHideSystemAppsToggleActive(), false,
                'hide-system-apps toggle should be inactive when system apps are hidden');
        });

    it(`GIVEN system apps are hidden WHEN the toggle is clicked THEN every shown system app row should carry the cog overlay`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            await appBrowsePanel.clickOnHideSystemAppsToggle();
            assert.equal(await appBrowsePanel.isHideSystemAppsToggleActive(), true,
                'hide-system-apps toggle should be active when system apps are shown');
            const systemApps = await appBrowsePanel.getSystemAppDisplayNames();
            assert.ok(systemApps.length > 0, 'expected at least one system app to verify');
            for (const name of systemApps) {
                const hasCog = await appBrowsePanel.hasCogOverlayForSystemApp(name);
                assert.ok(hasCog, `system app '${name}' should have the cog overlay class`);
            }
            await appBrowsePanel.clickOnHideSystemAppsToggle();
        });

    it(`GIVEN system apps are hidden WHEN the toggle is clicked THEN system apps should appear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            await appBrowsePanel.clickOnHideSystemAppsToggle();
            await studioUtils.saveScreenshot('system_apps_shown');
            assert.ok(await appBrowsePanel.isHideSystemAppsToggleActive(),
                'hide-system-apps toggle should be active when system apps are shown');
            const shown = await appBrowsePanel.getSystemAppDisplayNames();
            assert.ok(shown.length > 0, 'system apps should be visible after toggling');
            // restore default state
            await appBrowsePanel.clickOnHideSystemAppsToggle();
        });

    it(`GIVEN a system app is selected THEN Stop and Uninstall actions should be disabled`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            await appBrowsePanel.clickOnHideSystemAppsToggle();
            const systemApps = await appBrowsePanel.getSystemAppDisplayNames();
            assert.ok(systemApps.length > 0, 'expected at least one system app to select');
            const target = systemApps[0];
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(target);
            await studioUtils.saveScreenshot('system_app_selected');
            const stopEnabled = await appBrowsePanel.isStopButtonEnabled();
            const uninstallEnabled = await appBrowsePanel.isUninstallButtonEnabled();
            assert.equal(stopEnabled, false, `Stop should be disabled for system app '${target}'`);
            assert.equal(uninstallEnabled, false, `Uninstall should be disabled for system app '${target}'`);
            // deselect
            await appBrowsePanel.clickOnCheckboxAndSelectRowByDisplayName(target);
            await appBrowsePanel.clickOnHideSystemAppsToggle();
        });

    it(`GIVEN system apps are hidden WHEN the toggle is clicked THEN 'Standard ID Provider' should appear in the list`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            // 1. 'Standard ID Provider' is a system app, so it should not be in the list by default:
            assert.ok(await appBrowsePanel.waitForAppByDisplayNameNotDisplayed(appConst.TEST_APPS_NAME.STANDARD_ID_PROVIDER_APP),
                `'Standard ID Provider' should not be in the list by default`);
            // 2. Show system apps:
            await appBrowsePanel.clickOnHideSystemAppsToggle();
            await studioUtils.saveScreenshot('standard_id_provider_shown');
            // 3. 'Standard ID Provider' should now be displayed in the list:
            await appBrowsePanel.waitForAppByDisplayNameDisplayed(appConst.TEST_APPS_NAME.STANDARD_ID_PROVIDER_APP);
            assert.ok(await appBrowsePanel.isSystemAppRowDisplayed(appConst.TEST_APPS_NAME.STANDARD_ID_PROVIDER_APP),
                `'Standard ID Provider' should appear after toggling system apps on`);
            // restore default state
            await appBrowsePanel.clickOnHideSystemAppsToggle();
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.goToHomePage());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
