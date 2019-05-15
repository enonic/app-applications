const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
chai.use(require('chai-as-promised'));
const webDriverHelper = require('../libs/WebDriverHelper');
const AppBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const appConst = require('../libs/app_const');
const UninstallAppDialog = require('../page_objects/applications/uninstall.app.dialog');
const StatisticPanel = require('../page_objects/applications/application.item.statistic.panel');
const studioUtils = require('../libs/studio.utils.js');

describe('Application Browse Panel, multiple selection in grid', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();

    it(`GIVEN two started applications are checked WHEN Stop button has been pressed THEN Stop gets disabled AND Start gets enabled`,
        () => {
            let appBrowsePanel = new AppBrowsePanel();
            return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.THIRD_APP).then(() => {
                return appBrowsePanel.clickCheckboxAndSelectRowByDisplayName(appConst.TEST_APPLICATIONS.FIRST_APP);
            }).then(() => {
                return appBrowsePanel.clickOnStopButton();
            }).then(() => {
                return assert.eventually.isTrue(appBrowsePanel.waitForStartButtonEnabled(), "`Start` button should be enabled");
            }).then(() => {
                return assert.eventually.isFalse(appBrowsePanel.isStopButtonEnabled(), "`Stop` button should be disabled");
            }).then(() => {
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
                return statisticPanel.waitForApplicationStatus("Started")
            });
        });


    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
    before(() => {
        return studioUtils.navigateToApplicationsApp().then(() => {
            return restartApps();
        }).then(() => {
            return studioUtils.doLogout();
        }).then(() => {
            return console.log('specification is starting: ' + this.title);
        })
    });
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
    });
}





