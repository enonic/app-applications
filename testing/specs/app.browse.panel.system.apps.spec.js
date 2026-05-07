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

    it(`GIVEN apps grid is loaded THEN at least one system app should be shown by default`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            const systemApps = await appBrowsePanel.getSystemAppDisplayNames();
            await studioUtils.saveScreenshot('system_apps_visible_by_default');
            assert.ok(systemApps && systemApps.length > 0,
                'at least one system application should be displayed by default');
        });

    it(`GIVEN apps grid is loaded THEN every system app row should carry the cog overlay`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            const systemApps = await appBrowsePanel.getSystemAppDisplayNames();
            assert.ok(systemApps.length > 0, 'expected at least one system app to verify');
            for (const name of systemApps) {
                const hasCog = await appBrowsePanel.hasCogOverlayForSystemApp(name);
                assert.ok(hasCog, `system app '${name}' should have the cog overlay class`);
            }
        });

    it(`GIVEN system apps are visible WHEN the 'Hide system apps' toggle is clicked THEN system apps should disappear`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
            const before = await appBrowsePanel.getSystemAppDisplayNames();
            assert.ok(before.length > 0, 'system apps should be visible before toggling');
            await appBrowsePanel.clickOnHideSystemAppsToggle();
            await studioUtils.saveScreenshot('system_apps_hidden');
            assert.ok(await appBrowsePanel.isHideSystemAppsToggleActive(),
                'hide-system-apps toggle should be active');
            for (const name of before) {
                const stillShown = await appBrowsePanel.isSystemAppRowDisplayed(name);
                assert.ok(!stillShown, `system app '${name}' should be hidden after toggling`);
            }
            // restore default state
            await appBrowsePanel.clickOnHideSystemAppsToggle();
        });

    it(`GIVEN a system app is selected THEN Stop and Uninstall actions should be disabled`,
        async () => {
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.waitForGridLoaded();
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
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.goToHomePage());
    before(() => {
        return console.log('specification is starting: ' + this.title);
    });
});
