const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
chai.use(require('chai-as-promised'));
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const appConst = require('../libs/app_const');
const StatisticPanel = require('../page_objects/applications/application.item.statistic.panel');
const studioUtils = require('../libs/studio.utils.js');

describe('Application Browse Panel, multiple selection in grid', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN two started applications are checked WHEN Stop button has been pressed THEN Stop gets disabled AND Start gets enabled`,
        async () => {
            //preconditions:
            //await restartApps();
            let appBrowsePanel = new AppBrowsePanel();
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP)
            await appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);

            await appBrowsePanel.clickOnStopButton();
            await appBrowsePanel.waitForStartButtonEnabled();
            let result = await appBrowsePanel.isStopButtonEnabled();
            assert.isFalse(result, "`Stop` button should be disabled");

            let statisticPanel = new StatisticPanel();
            //Stopped status should be displayed on  Statistic Panel
            await statisticPanel.waitForApplicationStatus("Stopped");
        });

    it(`GIVEN two stopped applications are checked WHEN right click on selected apps THEN only Start menu item should be enabled in the opened context menu`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            }).then(() => {
                return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            }).then(() => {
                return appBrowsePanel.waitForContextMenuDisplayed();
            }).then(() => {
                //'Start menu item should be enabled'
                return appBrowsePanel.waitForContextMenuItemEnabled('Start');
            }).then(() => {
                //'Stop menu item should be disabled'
                return appBrowsePanel.waitForContextMenuItemDisabled('Stop');
            }).then(() => {
                studioUtils.saveScreenshot("2apps_context_menu_1");
                let statisticPanel = new StatisticPanel();
                //Stopped status should be displayed on  Statistic Panel
                return statisticPanel.waitForApplicationStatus("Stopped");
            });
        });

    it('GIVEN two stopped applications are checked WHEN Start button has been pressed THEN Start gets disabled AND Stop gets enabled',
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            }).then(() => {
                return appBrowsePanel.clickOnStartButton();
            }).then(() => {
                return assert.eventually.isTrue(appBrowsePanel.waitForStartButtonDisabled(), "`Start` button should be disabled");
            }).then(() => {
                return assert.eventually.isTrue(appBrowsePanel.isStopButtonEnabled(), "`Stop` button should be enabled");
            }).then(() => {
                let statisticPanel = new StatisticPanel();
                //Started status should be displayed on  Statistic Panel
                return statisticPanel.waitForApplicationStatus("Started");
            });
        });

    it(`GIVEN one stopped and one started applications are checked WHEN right click on selected apps THEN Start and Stop menu item should be enabled in the opened context menu`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.clickOnStopButton();
            }).then(() => {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            }).then(() => {
                return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            }).then(() => {
                return appBrowsePanel.waitForContextMenuDisplayed();
            }).then(() => {
                studioUtils.saveScreenshot("2apps_context_menu");
                return appBrowsePanel.waitForContextMenuItemEnabled('Start');
            }).then(() => {
                //'Stop menu item should be enabled'
                return appBrowsePanel.waitForContextMenuItemEnabled('Stop');
            });
        });

    it('GIVEN at least one app is stopped AND `select all` checkbox is checked WHEN right click on selected apps THEN Start and Stop menu item should be enabled in the opened context menu',
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            return appBrowsePanel.clickOnSelectAll().then(() => {
                return appBrowsePanel.rightClickOnRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            }).then(() => {
                return appBrowsePanel.waitForContextMenuDisplayed();
            }).then(() => {
                studioUtils.saveScreenshot("all_apps_context_menu");
                return appBrowsePanel.waitForContextMenuItemEnabled('Start');
            }).then(() => {
                //'Stop menu item should be enabled'
                return appBrowsePanel.waitForContextMenuItemEnabled('Stop');
            });
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});

function restartApps() {
    let appBrowsePanel = new AppBrowsePanel();
    return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.THIRD_APP).then(result => {
        if (result === 'stopped') {
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.clickOnStartButton();
            })
        }
    }).then(() => {
        return appBrowsePanel.getApplicationState(appConst.TEST_APPLICATIONS.FIRST_APP).then(result => {
            if (result === 'stopped') {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP).then(() => {
                    return appBrowsePanel.clickOnStartButton();
                })
            }
        });
    }).then(()=>{
        //return appBrowsePanel.
    })
}





