const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const webDriverHelper = require('../libs/WebDriverHelper');
const appBrowsePanel = require('../page_objects/applications/applications.browse.panel');
const dialog = require('../page_objects/applications/install.app.dialog');
const studioUtils = require('../libs/studio.utils.js');
const appConst = require('../libs/app_const');


describe('Install app dialog, search input spec.', function () {
    this.timeout(appConst.SUITE_TIMEOUT);
    webDriverHelper.setupBrowser();
    const not_existing = 'http://test.com';

    const not_valid = "file:c:/";

    it(`GIVEN 'install app' dialog is opened  WHEN not existing URL has been typed THEN correct validation message should appear on the dialog`,
        () => {
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return dialog.waitForOpened();
            }).then(()=> {
                return dialog.typeSearchTextAndEnter(not_existing);
            }).then(()=> {
                return dialog.getErrorValidationMessage();
            }).then(message => {
                assert.isTrue(message.includes('Failed to process application from'), 'correct notification message should appear');
            });
        });

    it(`GIVEN 'install app' dialog is opened  WHEN not existing URL has been typed THEN correct validation message should appear on the dialog`,
        () => {
            return appBrowsePanel.clickOnInstallButton().then(() => {
                return dialog.waitForOpened();
            }).then(()=> {
                return dialog.typeSearchTextAndEnter(not_valid);
            }).then(()=> {
                return dialog.applicationNotFoundMessage();
            }).then(message => {
                assert.isTrue(message.includes('No applications found'), 'correct search-status message should appear');
            });
        });

    beforeEach(() => studioUtils.navigateToApplicationsApp());
    afterEach(() => studioUtils.doCloseCurrentBrowserTab());
});
